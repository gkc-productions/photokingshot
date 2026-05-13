import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [inquiries, blogCount, productCount, portfolioCount] = await Promise.all([
    prisma.bookingInquiry.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.blogPost.count(),
    prisma.affiliateProduct.count(),
    prisma.portfolioItem.count()
  ]);

  return (
    <section className="section-shell py-10">
      <p className="eyebrow">Dashboard</p>
      <h1 className="mt-3 text-4xl font-black">Booking inquiries</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-sm border border-white/10 bg-white/[0.04] p-5"><p className="text-3xl font-black">{blogCount}</p><p className="text-white/60">Blog posts</p></div>
        <div className="rounded-sm border border-white/10 bg-white/[0.04] p-5"><p className="text-3xl font-black">{productCount}</p><p className="text-white/60">Affiliate products</p></div>
        <div className="rounded-sm border border-white/10 bg-white/[0.04] p-5"><p className="text-3xl font-black">{portfolioCount}</p><p className="text-white/60">Portfolio items</p></div>
      </div>
      <div className="mt-8 overflow-x-auto rounded-sm border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-white/[0.06] text-white">
            <tr>
              {["Name", "Contact", "Shoot", "Date", "Location", "Status", "Message"].map((head) => <th key={head} className="p-3">{head}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-white/72">
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id}>
                <td className="p-3 font-semibold text-white">{inquiry.fullName}</td>
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
      {!inquiries.length ? <p className="mt-6 text-white/60">No inquiries yet.</p> : null}
    </section>
  );
}
