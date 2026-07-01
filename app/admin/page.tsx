import Link from "next/link";
import { DbNotice } from "@/components/DbNotice";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statClass = "surface-card rounded-sm p-5";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const result = await Promise.all([
    prisma.bookingInquiry.count(),
    prisma.bookingInquiry.count({ where: { status: "NEW" } }),
    prisma.clientGallery.count(),
    prisma.clientGallery.count({ where: { isPublished: true } }),
    prisma.clientGallery.count({ where: { selectionMode: true } }),
    prisma.clientGallery.count({ where: { selectionMode: false } }),
    prisma.portfolioItem.count(),
    prisma.blogPost.count(),
    prisma.affiliateProduct.count(),
    prisma.photoBookRequest.count({ where: { paymentStatus: { not: "Paid" } } }),
    prisma.photoBookRequest.count({ where: { paymentStatus: "Paid" } })
  ])
    .then(([totalBookings, newBookings, totalGalleries, publishedGalleries, proofingGalleries, finalGalleries, portfolioItems, blogPosts, gearItems, unpaidPhotoBooks, paidPhotoBooks]) => ({
      stats: { totalBookings, newBookings, totalGalleries, publishedGalleries, proofingGalleries, finalGalleries, portfolioItems, blogPosts, gearItems, unpaidPhotoBooks, paidPhotoBooks },
      hasDb: true
    }))
    .catch(() => ({
      stats: { totalBookings: 0, newBookings: 0, totalGalleries: 0, publishedGalleries: 0, proofingGalleries: 0, finalGalleries: 0, portfolioItems: 0, blogPosts: 0, gearItems: 0, unpaidPhotoBooks: 0, paidPhotoBooks: 0 },
      hasDb: false
    }));

  const stats = [
    ["Total booking inquiries", result.stats.totalBookings],
    ["New booking inquiries", result.stats.newBookings],
    ["Total client galleries", result.stats.totalGalleries],
    ["Published galleries", result.stats.publishedGalleries],
    ["Proofing galleries", result.stats.proofingGalleries],
    ["Final galleries", result.stats.finalGalleries],
    ["Total portfolio items", result.stats.portfolioItems],
    ["Total blog posts", result.stats.blogPosts],
    ["Unpaid photo book requests", result.stats.unpaidPhotoBooks],
    ["Paid photo book requests", result.stats.paidPhotoBooks]
  ] as const;

  const actions = [
    ["New Gallery", "/admin/galleries/new"],
    ["View Bookings", "/admin/bookings"],
    ["Photo Book Requests", "/admin/photo-book-requests"],
    ["Add Portfolio Item", "/admin/portfolio/new"],
    ["Add Blog Post", "/admin/blog/new"],
    ...(result.stats.gearItems >= 0 ? ([["Add Gear Item", "/admin/gear/new"]] as const) : [])
  ] as const;

  return (
    <section className="section-shell py-10">
      <p className="eyebrow">Dashboard</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black">Admin overview</h1>
          <p className="muted-copy mt-3 max-w-2xl">Manage inquiries, private galleries, portfolio work, blog posts, and gear recommendations from one place.</p>
        </div>
      </div>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="admin dashboard" /></div> : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className={statClass}>
            <p className="text-3xl font-black">{value}</p>
            <p className="muted-copy mt-1 text-sm">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-sm border border-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-2xl font-black">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {actions.map(([label, href], index) => (
            <Link key={href} href={href} className={index === 0 ? "gold-button rounded-sm px-4 py-3 text-sm font-black" : "rounded-sm border border-[var(--border)] px-4 py-3 text-sm font-black text-[var(--foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)]"}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
