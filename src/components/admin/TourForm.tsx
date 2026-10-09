"use client";

import { useActionState } from "react";
import { saveTour, type FormState } from "@/app/admin/(panel)/tours/actions";
import LocaleTabs from "./LocaleTabs";

export type TourFormValues = {
  id?: string;
  slug: string;
  priceEur: number | "";
  durationDays: number | "";
  capacity: number | "";
  startDate: string;
  imageUrl: string;
  viewingSite: string;
  totality: string;
  sortOrder: number;
  published: boolean;
  translations: Record<string, { title: string; summary: string; description: string; itinerary: string; included: string }>;
};

export default function TourForm({ values }: { values: TourFormValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveTour, {});
  const tr = (l: string) => values.translations[l] ?? { title: "", summary: "", description: "", itinerary: "", included: "" };

  return (
    <form action={action} className="stack form">
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {state.error && <p className="alert" role="alert">{state.error}</p>}
      {state.saved && <p className="ok" role="status">Tour saved. Changes are live on the website.</p>}

      <fieldset className="card">
        <legend>Details</legend>
        <div className="grid-3">
          <label className="field">
            <span>Start date</span>
            <input type="date" name="startDate" defaultValue={values.startDate} required />
          </label>
          <label className="field">
            <span>Length in days</span>
            <input type="number" name="durationDays" min={1} defaultValue={values.durationDays} required />
          </label>
          <label className="field">
            <span>Price per person (EUR)</span>
            <input type="number" name="priceEur" min={0} step={10} defaultValue={values.priceEur} required />
          </label>
          <label className="field">
            <span>Places</span>
            <input type="number" name="capacity" min={1} defaultValue={values.capacity} required />
          </label>
          <label className="field">
            <span>Viewing site</span>
            <input name="viewingSite" defaultValue={values.viewingSite} placeholder="Sfax" required />
          </label>
          <label className="field">
            <span>Totality at the site</span>
            <input name="totality" defaultValue={values.totality} placeholder="≈ 5 min 40 s" required />
          </label>
        </div>
        <div className="grid-2">
          <label className="field">
            <span>Photo URL <small>(optional, shown behind the tour title)</small></span>
            <input type="url" name="imageUrl" defaultValue={values.imageUrl} placeholder="https://…" />
          </label>
          <label className="field">
            <span>Web address <small>(leave empty to make one from the title)</small></span>
            <input name="slug" defaultValue={values.slug} placeholder="sfax-centre-line" />
          </label>
        </div>
        <div className="row">
          <label className="field field-inline">
            <span>Order on the website</span>
            <input type="number" name="sortOrder" defaultValue={values.sortOrder} className="w-num" />
          </label>
          <label className="check">
            <input type="checkbox" name="published" defaultChecked={values.published} />
            <span>Published (visible on the website)</span>
          </label>
        </div>
      </fieldset>

      <fieldset className="card">
        <legend>Text in each language</legend>
        <LocaleTabs idPrefix="tour" filled={Object.entries(values.translations).filter(([, v]) => v.title).map(([l]) => l)}>
          {(l) => (
            <div className="stack">
              <label className="field">
                <span>Title{l === "en" && " (required)"}</span>
                <input name={`${l}_title`} defaultValue={tr(l).title} />
              </label>
              <label className="field">
                <span>Short summary <small>(one sentence, shown in the tour list)</small></span>
                <input name={`${l}_summary`} defaultValue={tr(l).summary} />
              </label>
              <label className="field">
                <span>Description <small>(separate paragraphs with an empty line)</small></span>
                <textarea name={`${l}_description`} rows={6} defaultValue={tr(l).description} />
              </label>
              <label className="field">
                <span>Day by day <small>(one block per day: first line is the title, then the details; empty line between days)</small></span>
                <textarea name={`${l}_itinerary`} rows={10} defaultValue={tr(l).itinerary} className="mono" />
              </label>
              <label className="field">
                <span>Included <small>(one item per line)</small></span>
                <textarea name={`${l}_included`} rows={5} defaultValue={tr(l).included} />
              </label>
            </div>
          )}
        </LocaleTabs>
      </fieldset>

      <div className="actions-bar">
        <button className="btn" disabled={pending}>{values.id ? "Save tour" : "Create tour"}</button>
      </div>
    </form>
  );
}
