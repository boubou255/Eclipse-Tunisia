"use client";

import { useActionState } from "react";
import { requestBooking, type BookingState } from "@/app/[locale]/tours/[slug]/actions";
import type { Dictionary } from "@/i18n";

type Question = { id: string; inputType: string; required: boolean; question: string; answer: string };

type Props = {
  t: Dictionary["tour"];
  locale: string;
  slug: string;
  maxTravelers: number;
  questions: Question[];
};

export default function BookingForm({ t, locale, slug, maxTravelers, questions }: Props) {
  const [state, action, pending] = useActionState<BookingState, FormData>(requestBooking, {});

  return (
    <form action={action} className="booking-form" noValidate={false}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slug" value={slug} />

      {state.error && (
        <p className="form-error" role="alert">
          {state.error === "full" ? t.errorFull : t.errorRequired}
        </p>
      )}

      <label>
        <span>{t.name}</span>
        <input name="name" required autoComplete="name" />
      </label>
      <label>
        <span>{t.email}</span>
        <input name="email" type="email" required autoComplete="email" dir="ltr" />
      </label>
      <div className="form-pair">
        <label>
          <span>{t.phone}</span>
          <input name="phone" type="tel" autoComplete="tel" dir="ltr" />
        </label>
        <label>
          <span>{t.travelers}</span>
          <input name="travelers" type="number" min={1} max={Math.max(1, maxTravelers)} defaultValue={Math.min(2, Math.max(1, maxTravelers))} required />
        </label>
      </div>
      <label>
        <span>{t.country}</span>
        <input name="country" autoComplete="country-name" />
      </label>

      {questions.map((q) => (
        <Field key={q.id} q={q} t={t} />
      ))}

      <label>
        <span>{t.message}</span>
        <textarea name="message" rows={3} />
      </label>

      <button className="button" type="submit" disabled={pending}>
        {t.submit}
      </button>
    </form>
  );
}

function Field({ q, t }: { q: Question; t: Props["t"] }) {
  const name = `q_${q.id}`;
  const label = (
    <span>
      {q.question}
      {q.required && <em className="req"> ({t.required})</em>}
    </span>
  );

  if (q.inputType === "boolean") {
    return (
      <fieldset className="choice">
        <legend>{label}</legend>
        <label><input type="radio" name={name} value={t.yes} required={q.required} /> {t.yes}</label>
        <label><input type="radio" name={name} value={t.no} /> {t.no}</label>
      </fieldset>
    );
  }
  if (q.inputType === "select") {
    const options = q.answer.split(",").map((o) => o.trim()).filter(Boolean);
    return (
      <label>
        {label}
        <select name={name} required={q.required} defaultValue="">
          <option value="" disabled>{t.choose}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </label>
    );
  }
  if (q.inputType === "textarea") {
    return (
      <label>
        {label}
        <textarea name={name} rows={3} required={q.required} />
      </label>
    );
  }
  return (
    <label>
      {label}
      <input name={name} required={q.required} />
    </label>
  );
}
