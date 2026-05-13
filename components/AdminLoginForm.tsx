"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/app/actions";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, { ok: false, message: "" });

  return (
    <form action={formAction} className="mx-auto mt-8 grid max-w-md gap-4 rounded-sm border border-white/10 bg-white/[0.04] p-6">
      {state.message ? <p className="rounded-sm border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{state.message}</p> : null}
      <label className="text-sm font-semibold text-white/78">
        Admin password
        <input name="password" type="password" required className="mt-2 w-full rounded-sm border border-white/10 px-3 py-3" />
      </label>
      <button disabled={pending} className="min-h-12 rounded-sm bg-[#d6a83f] px-5 py-3 text-sm font-black uppercase tracking-wide text-black hover:bg-white disabled:opacity-60">
        {pending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
