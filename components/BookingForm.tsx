"use client";

import { useActionState } from "react";
import { createBookingInquiry } from "@/app/actions";
import { serviceOptions } from "@/lib/site";

const initialState = { ok: false, message: "" };

export function BookingForm() {
  const [state, formAction, pending] = useActionState(createBookingInquiry, initialState);

  return (
    <form action={formAction} className="grid gap-4 rounded-sm border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xl shadow-black/20 md:grid-cols-2">
      {state.message ? (
        <div className={`md:col-span-2 rounded-sm border p-3 text-sm ${state.ok ? "border-[#d6a83f]/40 bg-[#d6a83f]/10 text-[#f4d98d]" : "border-red-400/40 bg-red-500/10 text-red-200"}`}>
          {state.message}
        </div>
      ) : null}
      <label className="text-sm font-semibold text-[var(--muted)]">
        Full name
        <input name="fullName" required autoComplete="name" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
      </label>
      <label className="text-sm font-semibold text-[var(--muted)]">
        Email
        <input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
      </label>
      <label className="text-sm font-semibold text-[var(--muted)]">
        Phone
        <input name="phone" required autoComplete="tel" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
      </label>
      <label className="text-sm font-semibold text-[var(--muted)]">
        Shoot type
        <select name="shootType" required className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3">
          {serviceOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-semibold text-[var(--muted)]">
        Preferred date
        <input name="preferredDate" type="date" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
      </label>
      <label className="text-sm font-semibold text-[var(--muted)]">
        Location
        <input name="location" required placeholder="Atlanta, venue, studio, or preferred area" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
      </label>
      <label className="text-sm font-semibold text-[var(--muted)] md:col-span-2">
        Message
        <textarea name="message" required rows={5} placeholder="Tell us the occasion, timing, look, and any must-have images." className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
      </label>
      <button disabled={pending} className="min-h-12 rounded-sm bg-[#d6a83f] px-5 py-3 text-sm font-black uppercase tracking-wide text-black hover:bg-white disabled:opacity-60 md:col-span-2">
        {pending ? "Sending..." : "Submit Booking Inquiry"}
      </button>
    </form>
  );
}
