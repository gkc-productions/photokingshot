import Link from "next/link";
import { toggleClientGalleryPublished } from "@/app/actions";
import { DbNotice } from "@/components/DbNotice";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function galleryType(gallery: { selectionMode: boolean; _count: { images: number } }) {
  if (!gallery._count.images) return "Empty/Draft";
  return gallery.selectionMode ? "Proofing Gallery" : "Final Gallery";
}

const galleryStates = [
  ["published", "Published"],
  ["unpublished", "Unpublished"],
  ["proofing", "Proofing"],
  ["final", "Final Gallery"],
  ["empty", "Empty/Draft"]
] as const;

function normalizeState(value?: string) {
  return galleryStates.some(([state]) => state === value) ? value : "";
}

function normalizeSort(value?: string) {
  return value === "oldest" || value === "client-az" ? value : "newest";
}

export default async function AdminGalleriesPage({
  searchParams
}: {
  searchParams: Promise<{ deleted?: string; delete?: string; search?: string; state?: string; sort?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const search = query.search?.trim() || "";
  const state = normalizeState(query.state);
  const sort = normalizeSort(query.sort);
  const hasFilters = Boolean(search || state || sort !== "newest");
  const result = await prisma.clientGallery.findMany({
    where: {
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { clientName: { contains: search, mode: "insensitive" as const } },
              { slug: { contains: search, mode: "insensitive" as const } },
              { accessCode: { contains: search, mode: "insensitive" as const } }
            ]
          }
        : {}),
      ...(state === "published" ? { isPublished: true } : {}),
      ...(state === "unpublished" ? { isPublished: false } : {}),
      ...(state === "proofing" ? { selectionMode: true } : {}),
      ...(state === "final" ? { selectionMode: false, images: { some: {} } } : {}),
      ...(state === "empty" ? { images: { none: {} } } : {})
    },
    orderBy: sort === "oldest" ? { updatedAt: "asc" } : sort === "client-az" ? { clientName: "asc" } : { updatedAt: "desc" },
    include: { _count: { select: { images: true, selections: true } } }
  })
    .then((galleries) => ({ galleries, hasDb: true }))
    .catch(() => ({ galleries: [], hasDb: false }));

  return (
    <section className="section-shell py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 text-4xl font-black">Client galleries</h1>
          <p className="muted-copy mt-3 max-w-2xl">Publish galleries, review proofing selections, reset access, and keep image upload instructions close to each client record.</p>
        </div>
        <Link href="/admin/galleries/new" className="gold-button rounded-sm px-4 py-3 text-sm font-black">New Gallery</Link>
      </div>
      {!result.hasDb ? <div className="mt-6"><DbNotice area="client gallery admin" /></div> : null}
      {query.deleted ? (
        <p className="gold-notice mt-6 rounded-sm p-4 text-sm">
          Deleted gallery <span className="font-mono font-bold">{query.deleted}</span> and its scoped gallery storage.
        </p>
      ) : null}
      {query.delete === "not-found" ? (
        <p className="mt-6 rounded-sm border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-100">
          That gallery could not be found. Nothing was deleted.
        </p>
      ) : null}

      <form action="/admin/galleries" className="surface-card mt-8 grid gap-4 rounded-sm p-4 md:grid-cols-[1fr_180px_180px_auto_auto] md:items-end">
        <label className="text-sm font-semibold text-[var(--muted)]">
          Search
          <input
            name="search"
            defaultValue={search}
            placeholder="Title, client, slug, or access code"
            className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3"
          />
        </label>
        <label className="text-sm font-semibold text-[var(--muted)]">
          Gallery state
          <select name="state" defaultValue={state} className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3">
            <option value="">All galleries</option>
            {galleryStates.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-[var(--muted)]">
          Sort
          <select name="sort" defaultValue={sort} className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="client-az">Client name A-Z</option>
          </select>
        </label>
        <button className="gold-button min-h-12 rounded-sm px-4 py-3 text-sm font-black uppercase tracking-wide">Apply</button>
        <a href="/admin/galleries" className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[var(--border)] px-4 py-3 text-sm font-black uppercase tracking-wide hover:border-[var(--gold)] hover:text-[var(--gold)]">Clear</a>
      </form>

      <div className="mt-8 overflow-x-auto rounded-sm border border-[var(--border)]">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-[var(--card-strong)] text-[var(--foreground)]">
            <tr>
              {["Gallery", "Client", "Slug", "Access", "Images", "Status", "Downloads", "Proofing", "Actions"].map((head) => <th key={head} className="p-3">{head}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-[var(--muted)]">
            {result.galleries.map((gallery) => (
              <tr key={gallery.id} className="align-top">
                <td className="p-3">
                  <p className="font-black text-[var(--foreground)]">{gallery.title}</p>
                  <p className="mt-1 rounded-sm border border-[var(--border)] px-2 py-1 text-xs font-black uppercase text-[var(--gold)]">{galleryType(gallery)}</p>
                </td>
                <td className="p-3">{gallery.clientName}</td>
                <td className="p-3 font-mono text-xs">{gallery.slug}</td>
                <td className="p-3 font-mono text-xs">{gallery.accessCode}</td>
                <td className="p-3">{gallery._count.images}</td>
                <td className="p-3">{gallery.isPublished ? "Published" : "Unpublished"}</td>
                <td className="p-3">{gallery.allowDownloads ? "Allowed" : "Off"}</td>
                <td className="p-3">
                  {gallery.selectionMode ? `${gallery._count.selections} selected${gallery.selectionSubmittedAt ? " / submitted" : ""}` : "Off"}
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-3 font-bold">
                    <Link href={`/galleries/${gallery.slug}`} className="text-[var(--gold)]">View</Link>
                    <Link href={`/admin/galleries/${gallery.id}/edit`} className="text-[var(--gold)]">Edit</Link>
                    <Link href={`/admin/galleries/${gallery.id}/images`} className="text-[var(--gold)]">Images</Link>
                    <Link href={`/admin/galleries/${gallery.id}/selections`} className="text-[var(--gold)]">Selections</Link>
                    <form action={toggleClientGalleryPublished}>
                      <input type="hidden" name="id" value={gallery.id} />
                      <button className="text-[var(--gold)]">{gallery.isPublished ? "Unpublish" : "Publish"}</button>
                    </form>
                    <Link href={`/admin/galleries/${gallery.id}/edit#reset-password`} className="text-[var(--gold)]">Reset Password</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {result.hasDb && !result.galleries.length ? (
        <p className="muted-copy mt-8 rounded-sm border border-[var(--border)] p-6">
          {hasFilters ? "No client galleries match these filters." : "No client galleries yet."}
        </p>
      ) : null}
    </section>
  );
}
