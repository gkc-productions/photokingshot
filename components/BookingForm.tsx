"use client";

import { useActionState, useState } from "react";
import { createBookingInquiry } from "@/app/actions";
import { serviceOptions } from "@/lib/site";

const initialState = { ok: false, message: "" };

type AvailabilityBlock = {
  date: string;
  title: string;
  isFullDay: boolean;
  startTime?: string | null;
  endTime?: string | null;
};

function blockTimeLabel(block: AvailabilityBlock) {
  if (block.isFullDay) return "full day";
  if (block.startTime && block.endTime) return `${block.startTime} - ${block.endTime}`;
  return block.startTime || block.endTime || "part of the day";
}

export function BookingForm({ availabilityBlocks = [] }: { availabilityBlocks?: AvailabilityBlock[] }) {
  const [state, formAction, pending] = useActionState(createBookingInquiry, initialState);
  const [preferredDate, setPreferredDate] = useState("");
  const selectedBlock = availabilityBlocks.find((block) => block.date === preferredDate);

  return (
    <form action={formAction} className="grid gap-4 rounded-sm border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xl shadow-black/20 md:grid-cols-2">
      {state.message ? (
        <div className={`md:col-span-2 rounded-sm border p-3 text-sm ${state.ok ? "gold-notice" : "border-red-400/40 bg-red-500/10 text-red-700 dark:text-red-200"}`}>
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
        Session type
        <select name="shootType" required className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3">
          {serviceOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      <div className="text-sm font-semibold text-[var(--muted)]">
        <label htmlFor="preferredDate">Preferred date</label>
        <input
          id="preferredDate"
          name="preferredDate"
          type="date"
          value={preferredDate}
          onChange={(event) => setPreferredDate(event.target.value)}
          aria-describedby="availability-note"
          className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3"
        />
        <p id="availability-note" className="muted-copy mt-2 text-xs leading-5">
          Dates listed as unavailable may require a different time. Final availability is confirmed after we review your inquiry.
        </p>
        {selectedBlock ? (
          <p className="mt-2 rounded-sm border border-[var(--gold)] bg-[var(--gold)]/10 p-3 text-xs leading-5 text-[var(--foreground)]">
            This date may already be unavailable: {selectedBlock.title} ({blockTimeLabel(selectedBlock)}). You can still submit your inquiry, and we will follow up with alternatives.
          </p>
        ) : null}
      </div>
      <label className="text-sm font-semibold text-[var(--muted)]">
        Location
        <input name="location" required placeholder="Atlanta venue, campus, church, studio, or neighborhood" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
      </label>
      <label className="text-sm font-semibold text-[var(--muted)] md:col-span-2">
        Message
        <textarea name="message" required rows={5} placeholder="Tell us the occasion, timing, preferred look, group size, and any must-have images." className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
      </label>
      <button disabled={pending} className="gold-button min-h-12 rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide disabled:opacity-60 md:col-span-2">
        {pending ? "Sending..." : "Submit Session Inquiry"}
      </button>
    </form>
  );
}
