"use client";

import { startTransition, useActionState, useState } from "react";
import { requestBooking, type BookingState } from "@/app/[locale]/tours/[slug]/actions";
import { fill, type Dictionary } from "@/i18n";
import { formatPrice } from "@/lib/format";
import type { Locale } from "@/i18n/config";

type Question = { id: string; inputType: string; required: boolean; question: string; answer: string };

type Payment = { priceEur: number; depositPercent: number; currency: string; eurToTnd: number };

/** Days before departure when the balance is due (matches the "How booking works" text). */
const BALANCE_DAYS = 60;

type Props = {
  t: Dictionary["tour"];
  tp: Dictionary["pay"];
  /** null when Konnect keys are not configured: the form sends a request without payment. */
  payment: Payment | null;
  locale: Locale;
  slug: string;
  maxTravelers: number;
  questions: Question[];
};

export default function BookingForm({ t, tp, payment, locale, slug, maxTravelers, questions }: Props) {
  const [state, action, pending] = useActionState<BookingState, FormData>(requestBooking, {});
  const [travelers, setTravelers] = useState(Math.min(2, Math.max(1, maxTravelers)));
  const [plan, setPlan] = useState<"deposit" | "full">("deposit");

  const total = payment ? payment.priceEur * Math.max(1, travelers || 1) : 0;
  const deposit = payment ? Math.round((total * payment.depositPercent) / 100) : 0;
  const dueNow = plan === "deposit" ? deposit : total;
  const money = (eur: number) => formatPrice(eur, locale);
  const tnd = (eur: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "TND", maximumFractionDigits: 0 }).format(eur * (payment?.eurToTnd ?? 0));

  return (
    <form
      action={action}
      className="booking-form"
      onSubmit={(e) => {
        // Submit through a transition instead of the form action so React does not
        // clear what the traveller typed when the server returns a validation error.
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => action(data));
      }}
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slug" value={slug} />

      {state.error && (
        <p className="form-error" role="alert">
          {state.error === "full" ? t.errorFull : state.error === "payment" ? tp.unavailable : t.errorRequired}
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
          <input
            name="travelers"
            type="number"
            min={1}
            max={Math.max(1, maxTravelers)}
            value={travelers || ""}
            onChange={(e) => setTravelers(Number(e.target.value))}
            required
          />
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

      {payment && (
        <fieldset className="pay-plan">
          <legend>{tp.title}</legend>
          <p className="pay-total">{fill(tp.total, { n: Math.max(1, travelers || 1), amount: money(total) })}</p>
          <label className="pay-option">
            <input type="radio" name="payPlan" value="deposit" checked={plan === "deposit"} onChange={() => setPlan("deposit")} />
            <span>
              <b>{fill(tp.deposit, { p: payment.depositPercent })}</b>
              <small>{fill(tp.depositHint, { amount: money(deposit), days: BALANCE_DAYS })}</small>
            </span>
          </label>
          <label className="pay-option">
            <input type="radio" name="payPlan" value="full" checked={plan === "full"} onChange={() => setPlan("full")} />
            <span>
              <b>{tp.full}</b>
              <small>{fill(tp.fullHint, { amount: money(total) })}</small>
            </span>
          </label>
          {payment.currency === "TND" && <p className="pay-small">{fill(tp.charged, { amount: tnd(dueNow) })}</p>}
          <p className="pay-small">{tp.methods}</p>
        </fieldset>
      )}

      <button className="button" type="submit" disabled={pending}>
        {payment ? `${tp.submit} (${money(dueNow)})` : t.submit}
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
