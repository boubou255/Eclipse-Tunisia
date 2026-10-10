"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isLocale } from "@/i18n/config";
import { getPublishedTour, holdsPlaces } from "@/lib/tours";
import { createPayment, paymentsEnabled } from "@/lib/konnect";

export type BookingState = { error?: "required" | "full" | "payment" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  const locale = String(form.get("locale") ?? "en");
  const slug = String(form.get("slug") ?? "");
  if (!isLocale(locale)) return { error: "required" };
  const tour = await getPublishedTour(slug, locale);
  if (!tour) return { error: "required" };

  const name = String(form.get("name") ?? "").trim().slice(0, 200);
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const travelers = Math.max(1, Math.min(50, Number(form.get("travelers")) || 1));

  const answers = tour.bookingQuestions.map((q) => ({
    question: q.question,
    answer: String(form.get(`q_${q.id}`) ?? "").trim().slice(0, 2000),
    required: q.required,
  }));

  if (!name || !EMAIL.test(email) || answers.some((a) => a.required && !a.answer)) {
    return { error: "required" };
  }
  if (travelers > tour.spotsLeft) return { error: "full" };

  const plan = String(form.get("payPlan") ?? "");
  const payPlan = paymentsEnabled() && (plan === "deposit" || plan === "full") ? plan : "none";

  const booking = await db.booking.create({
    data: {
      payPlan,
      totalEur: travelers * tour.priceEur,
      tourId: tour.id,
      name,
      email,
      phone: String(form.get("phone") ?? "").trim().slice(0, 60),
      country: String(form.get("country") ?? "").trim().slice(0, 100),
      message: String(form.get("message") ?? "").trim().slice(0, 4000),
      travelers,
      locale,
      answers: JSON.stringify(answers.map(({ question, answer }) => ({ question, answer }))),
    },
  });

  if (payPlan === "none") {
    redirect(`/${locale}/tours/${slug}?booked=${encodeURIComponent(email)}#book`);
  }

  let payUrl: string;
  try {
    payUrl = await createPayment(booking.id, payPlan);
  } catch (e) {
    console.error(e);
    // No checkout was created, so drop the booking instead of holding places for nothing.
    await db.booking.delete({ where: { id: booking.id } });
    return { error: "payment" };
  }
  redirect(payUrl);
}

/** Starts a new checkout for a booking whose earlier payment failed or expired. */
export async function retryPayment(form: FormData) {
  const id = String(form.get("booking") ?? "");
  const booking = await db.booking.findUnique({ where: { id }, include: { tour: true } });
  if (!booking || booking.status === "cancelled" || booking.payPlan === "none") return;
  if (booking.paidEur >= booking.totalEur) return;
  const back = `/${booking.locale}/tours/${booking.tour.slug}/payment?booking=${booking.id}`;
  if (booking.paidEur === 0 && isLocale(booking.locale)) {
    // The hold may have expired and the places been taken by someone else.
    const tour = await getPublishedTour(booking.tour.slug, booking.locale);
    const stillHeld = await db.booking.count({ where: { id: booking.id, ...holdsPlaces() } });
    if (!tour || (!stillHeld && booking.travelers > tour.spotsLeft)) redirect(`${back}&error=full`);
  }
  const kind = booking.paidEur > 0 ? "balance" : booking.payPlan === "full" ? "full" : "deposit";
  let payUrl: string;
  try {
    payUrl = await createPayment(booking.id, kind);
  } catch (e) {
    console.error(e);
    redirect(`${back}&error=payment`);
  }
  redirect(payUrl);
}
