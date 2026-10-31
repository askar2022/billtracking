"use client";

import { useActionState } from "react";
import { updateSettings, type SettingsState } from "@/actions/settings";

const empty: SettingsState = {};

export function SettingsForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateSettings, empty);

  return (
    <form action={action} className="card max-w-xl space-y-4 p-5">
      {state.error ? <p className="help">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-700">{state.success}</p> : null}
      <div className="field">
        <label htmlFor="name">Name</label>
        <input id="name" name="name" className="input" defaultValue={name} required />
        {state.fieldErrors?.name ? <p className="help">{state.fieldErrors.name}</p> : null}
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" className="input" defaultValue={email} required />
        {state.fieldErrors?.email ? <p className="help">{state.fieldErrors.email}</p> : null}
      </div>
      <div className="field">
        <label htmlFor="currentPassword">Current password</label>
        <input id="currentPassword" name="currentPassword" type="password" className="input" />
        {state.fieldErrors?.currentPassword ? (
          <p className="help">{state.fieldErrors.currentPassword}</p>
        ) : null}
      </div>
      <div className="field">
        <label htmlFor="newPassword">New password</label>
        <input id="newPassword" name="newPassword" type="password" className="input" />
        {state.fieldErrors?.newPassword ? (
          <p className="help">{state.fieldErrors.newPassword}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
