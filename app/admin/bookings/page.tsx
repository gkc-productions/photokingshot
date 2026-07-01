import { updateBookingInquiryStatus } from "@/app/actions";
import { DbNotice } from "@/components/DbNotice";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statuses = [
  ["NEW", "New"],
  ["CONTACTED", "Contacted"],
  ["BOOKED", "Booked"],
  ["COMPLETED", "Completed"],
  ["ARCHIVED", "Archived"]
] as const;

function displayStatus(status: string) {
  return statuses.find(([value]) => value === status)?.[1] || status;
}

function normalizeStatus(value?: string) {
  const upper = value?.trim().toUpperCase();
  return statuses.some(([status]) => status === upper) ? upper : "";
}

function normalizeSort(value?: string) {
  return value === "oldest" ? "oldest" : "newest";
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

function dateInputToUtcDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export default async function AdminBookingsPage({
  searchParams
}: {
  searchParams: Promise<{ search?: string; status?: string; sort?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const search = query.search?.trim() || "";
  const status = normalizeStatus(query.status);
  const sort = normalizeSort(query.sort);
  const hasFilters = Boolean(search || status || sort !== "newest");
  const result = await prisma.bookingInquiry.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { phone: { contains: search, mode: "insensitive" as const } },
              { shootType: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: sort === "oldest" ? "asc" : "desc" }
  })
    .then((inquiries) => ({ inquiries, hasDb: true }))
    .catch(() => ({ inquiries: [], hasDb: false }));

  const preferredDateKeys = Array.from(new Set(
    result.inquiries
      .map((inquiry) => inquiry.preferredDate ? dateKey(inquiry.preferredDate) : "")
      .filter(Boolean)
  ));
  const availabilityBlocks = result.hasDb && preferredDateKeys.length
    ? await prisma.bookingAvailabilityBlock.findMany({
        where: { date: { in: preferredDateKeys.map(dateInputToUtcDate) } },
        select: { date: true, title: true }
      }).catch(() => [])
    : [];
  const blockedDateMap = new Map(availabilityBlocks.map((block) => [dateKey(block.date), block]));

  return (
    <section className="section-shell py-10">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 text-4xl font-black">Booking inquiries</h1>
      <p className="muted-copy mt-3 max-w-2xl">Track every inquiry without deleting history by default. Update status as each client moves through the booking workflow.</p>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="booking inquiry admin" /></div> : null}

      <form action="/admin/bookings" className="surface-card mt-8 grid gap-4 rounded-sm p-4 md:grid-cols-[1fr_180px_160px_auto_auto] md:items-end">
        <label className="text-sm font-semibold text-[var(--muted)]">
          Search
          <input
            name="search"
            defaultValue={search}
            placeholder="Name, email, phone, or session type"
            className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3"
          />
        </label>
        <label className="text-sm font-semibold text-[var(--muted)]">
          Status
          <select name="status" defaultValue={status} className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3">
            <option value="">All statuses</option>
            {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-[var(--muted)]">
          Sort
          <select name="sort" defaultValue={sort} className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <button className="gold-button min-h-12 rounded-sm px-4 py-3 text-sm font-black uppercase tracking-wide">Apply</button>
        <a href="/admin/bookings" className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[var(--border)] px-4 py-3 text-sm font-black uppercase tracking-wide hover:border-[var(--gold)] hover:text-[var(--gold)]">Clear</a>
      </form>

      <div className="mt-8 grid gap-4">
        {result.inquiries.map((inquiry) => {
          const blockedDate = inquiry.preferredDate ? blockedDateMap.get(dateKey(inquiry.preferredDate)) : null;

          return (
          <article key={inquiry.id} className="surface-card rounded-sm p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-black">{inquiry.fullName}</h2>
                  <span className="rounded-sm border border-[var(--border)] px-2 py-1 text-xs font-black uppercase text-[var(--gold)]">{displayStatus(inquiry.status)}</span>
                  {blockedDate ? <span className="rounded-sm border border-red-400/40 bg-red-500/10 px-2 py-1 text-xs font-black uppercase text-red-700 dark:text-red-200">Blocked date</span> : null}
                </div>
                <p className="muted-copy mt-2 text-sm">
                  Created {inquiry.createdAt.toLocaleString()} / Shoot type: {inquiry.shootType}
                </p>
                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <dt className="font-bold text-[var(--foreground)]">Email</dt>
                    <dd><a href={`mailto:${inquiry.email}`} className="break-all text-[var(--gold)]">{inquiry.email}</a></dd>
                  </div>
                  <div>
                    <dt className="font-bold text-[var(--foreground)]">Phone</dt>
                    <dd className="muted-copy">{inquiry.phone}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-[var(--foreground)]">Preferred date</dt>
                    <dd className="muted-copy">{inquiry.preferredDate?.toLocaleDateString() || "Flexible"}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-[var(--foreground)]">Location</dt>
                    <dd className="muted-copy">{inquiry.location}</dd>
                  </div>
                </dl>
                <div className="mt-4 rounded-sm border border-[var(--border)] p-4">
                  <p className="text-sm font-bold text-[var(--foreground)]">Message</p>
                  <p className="muted-copy mt-2 whitespace-pre-wrap text-sm">{inquiry.message}</p>
                </div>
              </div>

              <form action={updateBookingInquiryStatus} className="rounded-sm border border-[var(--border)] p-4">
                <input type="hidden" name="id" value={inquiry.id} />
                <label className="text-sm font-semibold text-[var(--muted)]">
                  Status
                  <select name="status" defaultValue={inquiry.status} className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3">
                    {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <button className="gold-button mt-3 w-full rounded-sm px-4 py-3 text-sm font-black">Update status</button>
                <a href={`mailto:${inquiry.email}`} className="mt-3 block rounded-sm border border-[var(--border)] px-4 py-3 text-center text-sm font-black hover:border-[var(--gold)] hover:text-[var(--gold)]">Reply by email</a>
              </form>
            </div>
          </article>
          );
        })}
      </div>
      {result.hasDb && !result.inquiries.length ? (
        <p className="muted-copy mt-8 rounded-sm border border-[var(--border)] p-6">
          {hasFilters ? "No booking inquiries match these filters." : "No booking inquiries yet."}
        </p>
      ) : null}
    </section>
  );
}
