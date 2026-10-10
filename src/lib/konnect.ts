import "server-only";
import { db } from "./db";

/**
 * Konnect payment gateway (https://konnect.network).
 * All keys come from environment variables; see .env.example.
 */
const config = () => {
  const mode = process.env.KONNECT_MODE === "production" ? "production" : "sandbox";
  const currency = (process.env.KONNECT_CURRENCY || "TND").toUpperCase();
  return {
    apiKey: process.env.KONNECT_API_KEY || "",
    walletId: process.env.KONNECT_WALLET_ID || "",
    mode,
    baseUrl:
      process.env.KONNECT_API_URL ||
      (mode === "production" ? "https://api.konnect.network/api/v2" : "https://api.preprod.konnect.network/api/v2"),
    currency,
    eurToTnd: Number(process.env.EUR_TO_TND_RATE || "3.4"),
    depositPercent: Math.min(100, Math.max(1, Number(process.env.DEPOSIT_PERCENT || "30"))),
    siteUrl: (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  };
};

/** Online payment is switched on only when both keys are set. */
export function paymentsEnabled() {
  const c = config();
  return Boolean(c.apiKey && c.walletId);
}

export function paymentSettings() {
  const c = config();
  return { currency: c.currency, eurToTnd: c.eurToTnd, depositPercent: c.depositPercent, mode: c.mode };
}

export function depositFor(totalEur: number) {
  return Math.round((totalEur * config().depositPercent) / 100);
}

/** Converts euros to the amount Konnect expects: millimes for TND, cents for EUR and USD. */
export function toKonnectAmount(eur: number) {
  const c = config();
  if (c.currency === "TND") return Math.round(eur * c.eurToTnd * 1000);
  return Math.round(eur * 100);
}

export class KonnectError extends Error {}

async function call<T>(method: "GET" | "POST", path: string, body?: unknown): Promise<T> {
  const c = config();
  const res = await fetch(`${c.baseUrl}${path}`, {
    method,
    headers: { "x-api-key": c.apiKey, ...(body ? { "content-type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Konnect error", res.status, JSON.stringify(data));
    throw new KonnectError(`Konnect ${method} ${path} failed with ${res.status}`);
  }
  return data as T;
}

type Kind = "deposit" | "full" | "balance";

/** Creates a Konnect checkout for a booking and records it. Returns the URL to send the traveller to. */
export async function createPayment(bookingId: string, kind: Kind) {
  const c = config();
  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId }, include: { tour: true } });

  const amountEur =
    kind === "deposit" ? depositFor(booking.totalEur) : kind === "full" ? booking.totalEur : booking.totalEur - booking.paidEur;
  if (amountEur <= 0) throw new KonnectError("Nothing left to pay on this booking.");

  const [firstName, ...rest] = booking.name.split(" ");
  const back = `${c.siteUrl}/${booking.locale}/tours/${booking.tour.slug}/payment?booking=${booking.id}`;

  const res = await call<{ payUrl: string; paymentRef: string }>("POST", "/payments/init-payment", {
    receiverWalletId: c.walletId,
    token: c.currency,
    amount: toKonnectAmount(amountEur),
    type: "immediate",
    description: `${booking.tour.slug} (${kind}) booking ${booking.id}`.slice(0, 280),
    acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR"],
    lifespan: 30,
    checkoutForm: false,
    addPaymentFeesToAmount: false,
    firstName: firstName || booking.name,
    lastName: rest.join(" ") || firstName || booking.name,
    phoneNumber: booking.phone.replace(/[^\d]/g, "").slice(-8) || undefined,
    email: booking.email,
    orderId: booking.id,
    webhook: `${c.siteUrl}/api/konnect/webhook`,
    silentWebhook: true,
    successUrl: back,
    failUrl: back,
    theme: "light",
  });

  await db.payment.create({
    data: {
      bookingId: booking.id,
      ref: res.paymentRef,
      kind,
      amountEur,
      currency: c.currency,
      amount: toKonnectAmount(amountEur),
      payUrl: res.payUrl,
    },
  });
  if (booking.paymentStatus === "unpaid") {
    await db.booking.update({ where: { id: booking.id }, data: { paymentStatus: "pending" } });
  }
  return res.payUrl;
}

type KonnectPayment = { payment?: { status?: string; transactions?: { status?: string }[] } };

/**
 * Asks Konnect for the real status of a payment and updates the database.
 * Redirects and webhooks only tell us *which* payment to check; this call is the source of truth.
 */
export async function syncPayment(ref: string) {
  const payment = await db.payment.findUnique({ where: { ref } });
  if (!payment) return null;
  if (payment.status === "completed") return payment;

  const data = await call<KonnectPayment>("GET", `/payments/${encodeURIComponent(ref)}`);
  const remote = data.payment?.status;
  const failed = data.payment?.transactions?.some((t) => t.status === "failed_payment") ?? false;
  const status = remote === "completed" ? "completed" : failed ? "failed" : "pending";
  if (status === payment.status) return payment;

  const updated = await db.payment.update({ where: { id: payment.id }, data: { status } });
  if (status === "completed") await recomputeBooking(payment.bookingId);
  return updated;
}

/** Recalculates what has been paid on a booking from its completed payments. */
export async function recomputeBooking(bookingId: string) {
  const booking = await db.booking.findUniqueOrThrow({ where: { id: bookingId }, include: { payments: true } });
  const paidEur = booking.payments.filter((p) => p.status === "completed").reduce((s, p) => s + p.amountEur, 0);
  const paymentStatus =
    paidEur >= booking.totalEur && booking.totalEur > 0 ? "paid" : paidEur > 0 ? "deposit_paid" : booking.payments.length ? "pending" : "unpaid";
  await db.booking.update({
    where: { id: bookingId },
    data: {
      paidEur,
      paymentStatus,
      // A received payment confirms the booking, unless the agency cancelled it.
      ...(paidEur > 0 && booking.status === "new" ? { status: "confirmed" } : {}),
    },
  });
}
