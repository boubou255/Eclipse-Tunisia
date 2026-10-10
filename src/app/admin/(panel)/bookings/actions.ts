"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function setStatus(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id"));
  const status = String(form.get("status"));
  if (!["new", "confirmed", "cancelled"].includes(status)) return;
  await db.booking.update({ where: { id }, data: { status } });
  revalidatePath("/", "layout");
}

export async function deleteBooking(form: FormData) {
  await requireAdmin();
  await db.booking.delete({ where: { id: String(form.get("id")) } });
  revalidatePath("/", "layout");
  redirect("/admin/bookings");
}

/** Creates a Konnect checkout for what is still owed and returns its link for the agency to send. */
export async function createBalanceLink(_prev: { url?: string; error?: string }, form: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const { createPayment, paymentsEnabled } = await import("@/lib/konnect");
  if (!paymentsEnabled()) return { error: "Add your Konnect keys to .env first." };
  const id = String(form.get("id"));
  const b = await db.booking.findUnique({ where: { id } });
  if (!b) return { error: "Booking not found." };
  if (b.totalEur === 0) {
    const tour = await db.tour.findUniqueOrThrow({ where: { id: b.tourId } });
    await db.booking.update({ where: { id }, data: { totalEur: b.travelers * tour.priceEur } });
  }
  try {
    const kind = b.paidEur > 0 ? "balance" : "full";
    const url = await createPayment(id, kind);
    revalidatePath("/admin", "layout");
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Konnect did not accept the request." };
  }
}

/** Asks Konnect again for the status of every unfinished payment on a booking. */
export async function refreshPayments(form: FormData) {
  await requireAdmin();
  const { syncPayment } = await import("@/lib/konnect");
  const payments = await db.payment.findMany({ where: { bookingId: String(form.get("id")), status: { not: "completed" } } });
  for (const p of payments) {
    try {
      await syncPayment(p.ref);
    } catch (e) {
      console.error(e);
    }
  }
  revalidatePath("/", "layout");
}
