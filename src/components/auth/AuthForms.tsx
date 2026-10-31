"use client";

import { useActionState } from "react";
import { login, setupOwner, type ActionState } from "@/actions/auth";

const empty: ActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(login, empty);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <p className="help">{state.error}</p> : null}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" required />
        {state.fieldErrors?.email ? <p className="help">{state.fieldErrors.email}</p> : null}
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" className="input" required />
        {state.fieldErrors?.password ? <p className="help">{state.fieldErrors.password}</p> : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export function SetupForm() {
  const [state, action, pending] = useActionState(setupOwner, empty);
  return (
    <form action={action} className="space-y-4">
      {state.error ? <p className="help">{state.error}</p> : null}
      <div className="field">
        <label htmlFor="name">Your name</label>
        <input id="name" name="name" className="input" required />
        {state.fieldErrors?.name ? <p className="help">{state.fieldErrors.name}</p> : null}
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" required />
        {state.fieldErrors?.email ? <p className="help">{state.fieldErrors.email}</p> : null}
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          minLength={8}
          required
        />
        {state.fieldErrors?.password ? <p className="help">{state.fieldErrors.password}</p> : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create owner account"}
      </button>
    </form>
  );
}
