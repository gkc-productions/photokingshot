import { createBookingAvailabilityBlock, deleteBookingAvailabilityBlock } from "@/app/actions";
import { DbNotice } from "@/components/DbNotice";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function startOfToday() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(value);
}

function formatBlockTime(block: { isFullDay: boolean; startTime: string | null; endTime: string | null }) {
  if (block.isFullDay) return "Full day";
  if (block.startTime && block.endTime) return `${block.startTime} - ${block.endTime}`;
  return block.startTime || block.endTime || "Partial day";
}

export default async function AdminAvailabilityPage({
  searchParams
}: {
  searchParams: Promise<{ created?: string; deleted?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const result = await prisma.bookingAvailabilityBlock.findMany({
    where: { date: { gte: startOfToday() } },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }]
  })
    .then((blocks) => ({ blocks, hasDb: true }))
    .catch(() => ({ blocks: [], hasDb: false }));

  return (
    <section className="section-shell py-10">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 text-4xl font-black">Availability</h1>
      <p className="muted-copy mt-3 max-w-2xl">Block dates or time windows when PhotoKingShot is already booked, traveling, editing, or unavailable. Booking inquiries can still come in, but blocked dates are flagged for review.</p>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="availability admin" /></div> : null}
      {query.created ? <p className="gold-notice mt-6 rounded-sm border p-3 text-sm">Availability block added.</p> : null}
      {query.deleted ? <p className="gold-notice mt-6 rounded-sm border p-3 text-sm">Availability block deleted.</p> : null}

      <form action={createBookingAvailabilityBlock} className="surface-card mt-8 grid gap-4 rounded-sm p-5 md:grid-cols-2">
        <label className="text-sm font-semibold text-[var(--muted)]">
          Title
          <select name="title" required defaultValue="Booked" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3">
            <option>Booked</option>
            <option>Unavailable</option>
            <option>Travel</option>
            <option>Editing Day</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-[var(--muted)]">
          Date
          <input name="date" type="date" required className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
        </label>
        <label className="flex items-center gap-3 rounded-sm border border-[var(--border)] px-3 py-3 text-sm font-semibold text-[var(--muted)]">
          <input name="isFullDay" type="checkbox" defaultChecked className="h-4 w-4 accent-[var(--gold)]" />
          Full-day block
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold text-[var(--muted)]">
            Start time
            <input name="startTime" type="time" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
          </label>
          <label className="text-sm font-semibold text-[var(--muted)]">
            End time
            <input name="endTime" type="time" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
          </label>
        </div>
        <label className="text-sm font-semibold text-[var(--muted)] md:col-span-2">
          Reason / notes
          <textarea name="reason" rows={3} placeholder="Optional internal note" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" />
        </label>
        <button className="gold-button min-h-12 rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide md:col-span-2">Add Availability Block</button>
      </form>

      <div className="mt-8 grid gap-4">
        {result.blocks.map((block) => (
          <article key={block.id} className="surface-card rounded-sm p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-black">{block.title}</h2>
                  <span className="rounded-sm border border-[var(--border)] px-2 py-1 text-xs font-black uppercase text-[var(--gold)]">{formatBlockTime(block)}</span>
                </div>
                <p className="muted-copy mt-2 text-sm">{formatDate(block.date)}</p>
                {block.reason ? <p className="muted-copy mt-4 whitespace-pre-wrap text-sm">{block.reason}</p> : null}
              </div>
              <form action={deleteBookingAvailabilityBlock}>
                <input type="hidden" name="id" value={block.id} />
                <button className="min-h-11 rounded-sm border border-red-400/40 px-4 py-3 text-sm font-black uppercase tracking-wide text-red-700 hover:bg-red-500/10 dark:text-red-200">Delete</button>
              </form>
            </div>
          </article>
        ))}
      </div>
      {result.hasDb && !result.blocks.length ? (
        <p className="muted-copy mt-8 rounded-sm border border-[var(--border)] p-6">No upcoming availability blocks yet.</p>
      ) : null}
    </section>
  );
}
