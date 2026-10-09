"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { locales } from "@/i18n/config";

export type FormState = { error?: string; saved?: boolean };

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

function slugify(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function saveTour(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const id = str(form, "id");
  const enTitle = str(form, "en_title");
  if (!enTitle) return { error: "The English title is required. It is used when a language has no translation." };

  const slug = slugify(str(form, "slug") || enTitle);
  const priceEur = Number(str(form, "priceEur"));
  const durationDays = Number(str(form, "durationDays"));
  const capacity = Number(str(form, "capacity"));
  const startDate = new Date(`${str(form, "startDate")}T00:00:00Z`);

  if (!slug) return { error: "Add a web address (slug) using letters and numbers." };
  if (!Number.isFinite(priceEur) || priceEur < 0) return { error: "Enter a price in euros." };
  if (!Number.isInteger(durationDays) || durationDays < 1) return { error: "Enter the number of days." };
  if (!Number.isInteger(capacity) || capacity < 1) return { error: "Enter how many places the tour has." };
  if (Number.isNaN(startDate.getTime())) return { error: "Choose a start date." };

  const clash = await db.tour.findFirst({ where: { slug, NOT: id ? { id } : undefined } });
  if (clash) return { error: `Another tour already uses the address “${slug}”. Choose a different one.` };

  const base = {
    slug,
    priceEur: Math.round(priceEur),
    durationDays,
    capacity,
    startDate,
    imageUrl: str(form, "imageUrl") || null,
    viewingSite: str(form, "viewingSite"),
    totality: str(form, "totality"),
    sortOrder: Number(str(form, "sortOrder")) || 0,
    published: form.get("published") === "on",
  };

  const tour = id ? await db.tour.update({ where: { id }, data: base }) : await db.tour.create({ data: base });

  for (const locale of locales) {
    const title = str(form, `${locale}_title`);
    const data = {
      title,
      summary: str(form, `${locale}_summary`),
      description: str(form, `${locale}_description`),
      itinerary: str(form, `${locale}_itinerary`),
      included: str(form, `${locale}_included`),
    };
    if (title) {
      await db.tourTranslation.upsert({
        where: { tourId_locale: { tourId: tour.id, locale } },
        create: { tourId: tour.id, locale, ...data },
        update: data,
      });
    } else {
      await db.tourTranslation.deleteMany({ where: { tourId: tour.id, locale } });
    }
  }

  revalidatePath("/", "layout");
  if (!id) redirect(`/admin/tours/${tour.id}?created=1`);
  return { saved: true };
}

export async function deleteTour(form: FormData) {
  await requireAdmin();
  await db.tour.delete({ where: { id: str(form, "id") } });
  revalidatePath("/", "layout");
  redirect("/admin/tours");
}

export async function saveQuestion(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const tourId = str(form, "tourId");
  const id = str(form, "id");
  const kind = str(form, "kind") === "booking" ? "booking" : "faq";
  const inputType = ["text", "textarea", "select", "boolean"].includes(str(form, "inputType")) ? str(form, "inputType") : "text";

  if (!str(form, "en_question")) return { error: "Write the question in English first." };
  if (kind === "booking" && inputType === "select" && !str(form, "en_answer")) {
    return { error: "List the choices, separated by commas." };
  }

  const base = {
    kind,
    inputType: kind === "faq" ? "text" : inputType,
    required: kind === "booking" && form.get("required") === "on",
    sortOrder: Number(str(form, "sortOrder")) || 0,
  };
  const q = id ? await db.tourQuestion.update({ where: { id }, data: base }) : await db.tourQuestion.create({ data: { ...base, tourId } });

  for (const locale of locales) {
    const question = str(form, `${locale}_question`);
    const answer = str(form, `${locale}_answer`);
    if (question) {
      await db.tourQuestionTranslation.upsert({
        where: { questionId_locale: { questionId: q.id, locale } },
        create: { questionId: q.id, locale, question, answer },
        update: { question, answer },
      });
    } else {
      await db.tourQuestionTranslation.deleteMany({ where: { questionId: q.id, locale } });
    }
  }

  revalidatePath("/", "layout");
  return { saved: true };
}

export async function deleteQuestion(form: FormData) {
  await requireAdmin();
  await db.tourQuestion.delete({ where: { id: str(form, "id") } });
  revalidatePath("/", "layout");
}
