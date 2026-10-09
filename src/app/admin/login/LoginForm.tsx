"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="stack">
      {state.error && <p className="alert" role="alert">{state.error}</p>}
      <label className="field">
        <span>Password</span>
        <input type="password" name="password" required autoFocus autoComplete="current-password" />
      </label>
      <button className="btn" disabled={pending}>Sign in</button>
    </form>
  );
}
