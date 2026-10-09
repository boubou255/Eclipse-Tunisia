import { db } from "./db";
import { defaultLocale, type Locale } from "@/i18n/config";

type WithLocale = { locale: string };

/** Pick the requested language, falling back to English, then to whatever exists. */
export function pick<T extends WithLocale>(rows: T[], locale: Locale): T | undefined {
  return rows.find((r) => r.locale === locale) ?? rows.find((r) => r.locale === defaultLocale) ?? rows[0];
}

/** Places still free: capacity minus travellers on bookings that are not cancelled. */
async function bookedCounts() {
  const rows = await db.booking.groupBy({
    by: ["tourId"],
    where: { status: { not: "cancelled" } },
    _sum: { travelers: true },
  });
  return new Map(rows.map((r) => [r.tourId, r._sum.travelers ?? 0]));
}

export async function listPublishedTours(locale: Locale) {
  const [tours, booked] = await Promise.all([
    db.tour.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { startDate: "asc" }],
      include: { translations: true },
    }),
    bookedCounts(),
  ]);
  return tours.map((t) => {
    const tr = pick(t.translations, locale);
    return {
      ...t,
      title: tr?.title ?? t.slug,
      summary: tr?.summary ?? "",
      spotsLeft: Math.max(0, t.capacity - (booked.get(t.id) ?? 0)),
    };
  });
}

export type ItineraryDay = { title: string; body: string };

export function parseItinerary(text: string): ItineraryDay[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [title, ...rest] = block.split("\n");
      return { title: title.trim(), body: rest.join("\n").trim() };
    });
}

export function parseLines(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export async function getPublishedTour(slug: string, locale: Locale) {
  const tour = await db.tour.findFirst({
    where: { slug, published: true },
    include: {
      translations: true,
      questions: { orderBy: { sortOrder: "asc" }, include: { translations: true } },
    },
  });
  if (!tour) return null;

  const booked = await db.booking.aggregate({
    where: { tourId: tour.id, status: { not: "cancelled" } },
    _sum: { travelers: true },
  });
  const tr = pick(tour.translations, locale);
  const questions = tour.questions
    .map((q) => {
      const qt = pick(q.translations, locale);
      return qt ? { id: q.id, kind: q.kind, inputType: q.inputType, required: q.required, question: qt.question, answer: qt.answer } : null;
    })
    .filter((q) => q !== null);

  return {
    ...tour,
    title: tr?.title ?? tour.slug,
    summary: tr?.summary ?? "",
    description: tr?.description ?? "",
    itinerary: parseItinerary(tr?.itinerary ?? ""),
    included: parseLines(tr?.included ?? ""),
    faqs: questions.filter((q) => q.kind === "faq"),
    bookingQuestions: questions.filter((q) => q.kind === "booking"),
    spotsLeft: Math.max(0, tour.capacity - (booked._sum.travelers ?? 0)),
  };
}
