"use client";

import { useActionState } from "react";
import { useState } from "react";
import { loginAdmin } from "@/app/actions";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, { ok: false, message: "" });
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="mx-auto mt-8 grid max-w-md gap-4 rounded-sm border border-[var(--border)] bg-[var(--card)] p-6">
      {state.message ? <p className="rounded-sm border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-200">{state.message}</p> : null}
      <label className="text-sm font-semibold text-[var(--muted)]">
        Admin password
        <input name="password" type={showPassword ? "text" : "password"} required className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
      </label>
      <label className="flex items-center gap-3 text-sm font-semibold text-[var(--muted)]">
        <input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} className="h-4 w-4" />
        Show password
      </label>
      <button disabled={pending} className="gold-button min-h-12 rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide disabled:opacity-60">
        {pending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
