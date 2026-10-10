"use client";

import { useActionState, useState } from "react";
import { createBalanceLink } from "@/app/admin/(panel)/bookings/actions";

export default function BalanceLink({ id, label }: { id: string; label: string }) {
  const [state, action, pending] = useActionState(createBalanceLink, {});
  const [copied, setCopied] = useState(false);
  return (
    <form action={action} className="stack-sm">
      <input type="hidden" name="id" value={id} />
      <button className="btn btn-quiet" disabled={pending}>{label}</button>
      {state.error && <p className="alert">{state.error}</p>}
      {state.url && (
        <div className="paylink">
          <input readOnly value={state.url} onFocus={(e) => e.currentTarget.select()} aria-label="Payment link" />
          <button
            type="button"
            className="linkish"
            onClick={() => navigator.clipboard?.writeText(state.url!).then(() => setCopied(true)).catch(() => {})}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <p className="hint">Send this link to the traveller. It is valid for 30 minutes; create a new one if it expires.</p>
        </div>
      )}
    </form>
  );
}
