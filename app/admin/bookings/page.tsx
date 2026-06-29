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

export default async function AdminBookingsPage() {
  await requireAdmin();
  const result = await prisma.bookingInquiry.findMany({ orderBy: { createdAt: "desc" } })
    .then((inquiries) => ({ inquiries, hasDb: true }))
    .catch(() => ({ inquiries: [], hasDb: false }));

  return (
    <section className="section-shell py-10">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 text-4xl font-black">Booking inquiries</h1>
      <p className="muted-copy mt-3 max-w-2xl">Track every inquiry without deleting history by default. Update status as each client moves through the booking workflow.</p>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="booking inquiry admin" /></div> : null}

      <div className="mt-8 grid gap-4">
        {result.inquiries.map((inquiry) => (
          <article key={inquiry.id} className="surface-card rounded-sm p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-black">{inquiry.fullName}</h2>
                  <span className="rounded-sm border border-[var(--border)] px-2 py-1 text-xs font-black uppercase text-[var(--gold)]">{displayStatus(inquiry.status)}</span>
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
        ))}
      </div>
      {result.hasDb && !result.inquiries.length ? <p className="muted-copy mt-8">No booking inquiries yet.</p> : null}
    </section>
  );
}
