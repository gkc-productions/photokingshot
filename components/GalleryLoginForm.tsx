"use client";

import { useActionState } from "react";
import { loginClientGallery } from "@/app/actions";

const initialState = { ok: false, message: "" };

export function GalleryLoginForm() {
  const [state, formAction, pending] = useActionState(loginClientGallery, initialState);

  return (
    <form action={formAction} className="surface-card grid gap-4 rounded-sm p-6">
      <label className="text-sm font-semibold text-[var(--muted)]">
        Gallery Code
        <input name="accessCode" required autoComplete="off" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3 uppercase" />
      </label>
      <label className="text-sm font-semibold text-[var(--muted)]">
        Password
        <input name="password" type="password" required autoComplete="current-password" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
      </label>
      {state.message ? <p className="rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 dark:text-red-100">{state.message}</p> : null}
      <button className="gold-button min-h-12 rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide" disabled={pending}>
        {pending ? "Checking..." : "View Gallery"}
      </button>
    </form>
  );
}
