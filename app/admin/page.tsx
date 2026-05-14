import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { DbNotice } from "@/components/DbNotice";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const data = await Promise.all([
    prisma.bookingInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.blogPost.count(),
    prisma.affiliateProduct.count(),
    prisma.portfolioItem.count()
  ])
    .then(([inquiries, blogCount, productCount, portfolioCount]) => ({ inquiries, blogCount, productCount, portfolioCount, hasDb: true }))
    .catch(() => ({ inquiries: [], blogCount: 0, productCount: 0, portfolioCount: 0, hasDb: false }));
  const { inquiries, blogCount, productCount, portfolioCount, hasDb } = data;

  return (
    <section className="section-shell py-10">
      <p className="eyebrow">Dashboard</p>
      <h1 className="mt-3 text-4xl font-black">Booking inquiries</h1>
      {!hasDb ? <div className="mt-6"><DbNotice area="admin dashboard" /></div> : null}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="surface-card rounded-sm p-5"><p className="text-3xl font-black">{blogCount}</p><p className="muted-copy">Blog posts</p></div>
        <div className="surface-card rounded-sm p-5"><p className="text-3xl font-black">{productCount}</p><p className="muted-copy">Affiliate products</p></div>
        <div className="surface-card rounded-sm p-5"><p className="text-3xl font-black">{portfolioCount}</p><p className="muted-copy">Portfolio items</p></div>
      </div>
      <div className="mt-8 overflow-x-auto rounded-sm border border-[var(--border)]">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[var(--card-strong)] text-[var(--foreground)]">
            <tr>
              {["Name", "Contact", "Shoot", "Date", "Location", "Status", "Message"].map((head) => <th key={head} className="p-3">{head}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-[var(--muted)]">
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td className="p-3 font-semibold text-[var(--foreground)]">{inquiry.fullName}</td>
                <td className="p-3">{inquiry.email}<br />{inquiry.phone}</td>
                <td className="p-3">{inquiry.shootType}</td>
                <td className="p-3">{inquiry.preferredDate?.toLocaleDateString() || "Flexible"}</td>
                <td className="p-3">{inquiry.location}</td>
                <td className="p-3">{inquiry.status}</td>
                <td className="p-3">{inquiry.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!inquiries.length ? <p className="muted-copy mt-6">No inquiries yet.</p> : null}
    </section>
  );
}
