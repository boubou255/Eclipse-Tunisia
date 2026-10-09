"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isLocale } from "@/i18n/config";
import { getPublishedTour } from "@/lib/tours";

export type BookingState = { error?: "required" | "full" };

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

  await db.booking.create({
    data: {
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

  redirect(`/${locale}/tours/${slug}?booked=${encodeURIComponent(email)}#book`);
}
