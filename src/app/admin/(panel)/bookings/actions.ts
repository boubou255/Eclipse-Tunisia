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
