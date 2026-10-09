"use client";

import { useActionState, useState } from "react";
import { saveQuestion, type FormState } from "@/app/admin/(panel)/tours/actions";
import LocaleTabs from "./LocaleTabs";

export type QuestionValues = {
  id?: string;
  kind: string;
  inputType: string;
  required: boolean;
  sortOrder: number;
  translations: Record<string, { question: string; answer: string }>;
};

export default function QuestionForm({ tourId, values }: { tourId: string; values: QuestionValues }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveQuestion, {});
  const [kind, setKind] = useState(values.kind);
  const [inputType, setInputType] = useState(values.inputType);
  const tr = (l: string) => values.translations[l] ?? { question: "", answer: "" };
  const prefix = `q-${values.id ?? "new"}`;

  const answerLabel =
    kind === "faq" ? "Answer" : inputType === "select" ? "Choices, separated by commas" : null;

  return (
    <form action={action} className="stack">
      <input type="hidden" name="tourId" value={tourId} />
      {values.id && <input type="hidden" name="id" value={values.id} />}
      {state.error && <p className="alert" role="alert">{state.error}</p>}
      {state.saved && <p className="ok" role="status">Question saved.</p>}

      <div className="row">
        <label className="field field-inline">
          <span>Type</span>
          <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="faq">FAQ shown on the tour page</option>
            <option value="booking">Question in the booking form</option>
          </select>
        </label>
        {kind === "booking" && (
          <>
            <label className="field field-inline">
              <span>Answer format</span>
              <select name="inputType" value={inputType} onChange={(e) => setInputType(e.target.value)}>
                <option value="text">Short text</option>
                <option value="textarea">Long text</option>
                <option value="select">Choose from a list</option>
                <option value="boolean">Yes / No</option>
              </select>
            </label>
            <label className="check">
              <input type="checkbox" name="required" defaultChecked={values.required} />
              <span>Required</span>
            </label>
          </>
        )}
        <label className="field field-inline">
          <span>Order</span>
          <input type="number" name="sortOrder" defaultValue={values.sortOrder} className="w-num" />
        </label>
      </div>

      <LocaleTabs idPrefix={prefix} filled={Object.entries(values.translations).filter(([, v]) => v.question).map(([l]) => l)}>
        {(l) => (
          <div className="stack">
            <label className="field">
              <span>Question{l === "en" && " (required)"}</span>
              <input name={`${l}_question`} defaultValue={tr(l).question} />
            </label>
            {answerLabel ? (
              <label className="field">
                <span>{answerLabel}</span>
                {kind === "faq" ? (
                  <textarea name={`${l}_answer`} rows={3} defaultValue={tr(l).answer} />
                ) : (
                  <input name={`${l}_answer`} defaultValue={tr(l).answer} placeholder="Double room, Twin room, Single room" />
                )}
              </label>
            ) : (
              <input type="hidden" name={`${l}_answer`} value="" />
            )}
          </div>
        )}
      </LocaleTabs>

      <div>
        <button className="btn btn-quiet" disabled={pending}>{values.id ? "Save question" : "Add question"}</button>
      </div>
    </form>
  );
}
