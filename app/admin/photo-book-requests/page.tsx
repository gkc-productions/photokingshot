import Link from "next/link";
import { createPhotoBookRequest } from "@/app/actions";
import { CopyPaymentLinkButton } from "@/components/CopyPaymentLinkButton";
import { DbNotice } from "@/components/DbNotice";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatMoney(amountCents?: number | null, currency = "usd") {
  if (!amountCents) return "Not set";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amountCents / 100);
}

function statusClass(status: string) {
  if (status === "Paid") return "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-100";
  if (["Failed", "Expired"].includes(status)) return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-100";
  if (status === "CheckoutCreated") return "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--foreground)]";
  return "border-[var(--border)] text-[var(--gold)]";
}

export default async function AdminPhotoBookRequestsPage({
  searchParams
}: {
  searchParams: Promise<{ created?: string; checkout?: string; error?: string }>;
}) {
  await requireAdmin();
  const query = await searchParams;
  const [requestsResult, galleriesResult] = await Promise.all([
    prisma.photoBookRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: { gallery: { select: { title: true, slug: true } } }
    })
      .then((requests) => ({ requests, hasDb: true }))
      .catch(() => ({ requests: [], hasDb: false })),
    prisma.clientGallery.findMany({
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, clientName: true }
    }).catch(() => [])
  ]);

  const message = query.created
    ? "Photo book request created."
    : query.checkout === "created"
      ? "Stripe Checkout payment link created."
      : query.checkout === "existing"
        ? "An active unpaid Checkout link already exists for that request."
        : query.error === "stripe-not-configured"
          ? "Stripe is not configured. Add STRIPE_SECRET_KEY before creating payment links."
          : query.error === "invalid-amount"
            ? "Enter a payment amount greater than $0."
            : query.error === "missing-email"
              ? "A client email is required before creating a payment link."
              : query.error === "paid"
                ? "This request is already paid."
                : query.error
                  ? "The payment link could not be created."
                  : "";

  return (
    <section className="section-shell py-10">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-3 text-4xl font-black">Photo book requests</h1>
      <p className="muted-copy mt-3 max-w-2xl">Create and manage payment links for Printique photo book and album requests. Stripe handles payment only; PhotoKingShot designs and orders manually after payment.</p>
      {!requestsResult.hasDb ? <div className="mt-6"><DbNotice area="photo book request admin" /></div> : null}
      {message ? <p className="gold-notice mt-6 rounded-sm p-4 text-sm">{message}</p> : null}

      <form action={createPhotoBookRequest} className="surface-card mt-8 grid gap-4 rounded-sm p-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-black">Add request</h2>
          <p className="muted-copy mt-2 text-sm">Use this when a client wants a PhotoKingShot photo book or album quote/payment link.</p>
        </div>
        <label className="text-sm font-semibold text-[var(--muted)]">Client name<input name="clientName" required className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" /></label>
        <label className="text-sm font-semibold text-[var(--muted)]">Client email<input name="clientEmail" type="email" required className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" /></label>
        <label className="text-sm font-semibold text-[var(--muted)]">Phone<input name="phone" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" /></label>
        <label className="text-sm font-semibold text-[var(--muted)]">Package type<input name="packageType" required placeholder="Photo Book / Album" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" /></label>
        <label className="text-sm font-semibold text-[var(--muted)]">Photo count range<input name="photoCountRange" placeholder="20-40 images" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" /></label>
        <label className="text-sm font-semibold text-[var(--muted)]">
          Related gallery
          <select name="galleryId" className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3">
            <option value="">No gallery selected</option>
            {galleriesResult.map((gallery) => <option key={gallery.id} value={gallery.id}>{gallery.title} / {gallery.clientName}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-[var(--muted)] md:col-span-2">Message<textarea name="message" rows={3} className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3" /></label>
        <button className="gold-button min-h-12 rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide md:col-span-2">Add Photo Book Request</button>
      </form>

      <div className="mt-8 grid gap-4">
        {requestsResult.requests.map((request) => {
          const paid = request.paymentStatus === "Paid";
          const hasCheckout = Boolean(request.stripeCheckoutSessionId && request.stripeCheckoutUrl && request.paymentStatus === "CheckoutCreated");

          return (
            <article key={request.id} className="surface-card rounded-sm p-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black">{request.clientName}</h2>
                    <span className={`rounded-sm border px-2 py-1 text-xs font-black uppercase ${statusClass(request.paymentStatus)}`}>{request.paymentStatus}</span>
                  </div>
                  <dl className="muted-copy mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <div><dt className="font-bold text-[var(--foreground)]">Email</dt><dd><a href={`mailto:${request.clientEmail}`} className="break-all text-[var(--gold)]">{request.clientEmail}</a></dd></div>
                    <div><dt className="font-bold text-[var(--foreground)]">Phone</dt><dd>{request.phone || "Not provided"}</dd></div>
                    <div><dt className="font-bold text-[var(--foreground)]">Package</dt><dd>{request.packageType}</dd></div>
                    <div><dt className="font-bold text-[var(--foreground)]">Photo count</dt><dd>{request.photoCountRange || "Not provided"}</dd></div>
                    <div><dt className="font-bold text-[var(--foreground)]">Amount</dt><dd>{formatMoney(request.amountCents, request.currency)}</dd></div>
                    <div><dt className="font-bold text-[var(--foreground)]">Status</dt><dd>{request.status}</dd></div>
                    <div><dt className="font-bold text-[var(--foreground)]">Gallery</dt><dd>{request.gallery ? <Link href={`/admin/galleries/${request.galleryId}/edit`} className="text-[var(--gold)]">{request.gallery.title}</Link> : "Not linked"}</dd></div>
                    <div><dt className="font-bold text-[var(--foreground)]">Created</dt><dd>{request.createdAt.toLocaleString()}</dd></div>
                  </dl>
                  {request.message ? <p className="muted-copy mt-4 whitespace-pre-wrap rounded-sm border border-[var(--border)] p-4 text-sm">{request.message}</p> : null}
                </div>
                <div className="grid content-start gap-3 rounded-sm border border-[var(--border)] p-4">
                  <form method="post" action={`/api/admin/photo-book-requests/${request.id}/create-checkout`} className="grid gap-3">
                    <label className="text-sm font-semibold text-[var(--muted)]">Amount in dollars<input name="amount" type="number" min="1" step="0.01" defaultValue={request.amountCents ? (request.amountCents / 100).toFixed(2) : ""} disabled={paid} className="mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3 disabled:opacity-60" /></label>
                    {hasCheckout && !paid ? (
                      <label className="flex items-center gap-3 text-sm font-semibold text-[var(--muted)]">
                        <input type="checkbox" name="forceNew" value="true" className="h-4 w-4 accent-[var(--gold)]" />
                        Create a new Checkout session anyway
                      </label>
                    ) : null}
                    <button disabled={paid} className="gold-button min-h-11 rounded-sm px-4 py-3 text-sm font-black uppercase tracking-wide disabled:opacity-60">{hasCheckout ? "Create New Link" : "Create Payment Link"}</button>
                  </form>
                  {request.stripeCheckoutUrl && !paid ? <a href={request.stripeCheckoutUrl} target="_blank" rel="noreferrer" className="rounded-sm border border-[var(--border)] px-4 py-3 text-center text-sm font-black hover:border-[var(--gold)] hover:text-[var(--gold)]">Open Payment Link</a> : null}
                  {request.stripeCheckoutUrl && !paid ? <CopyPaymentLinkButton url={request.stripeCheckoutUrl} /> : null}
                  {request.stripeCheckoutUrl && !paid ? <input readOnly value={request.stripeCheckoutUrl} className="w-full rounded-sm border border-[var(--border)] bg-[var(--background)] px-3 py-3 text-xs text-[var(--muted)]" aria-label="Payment link" /> : null}
                  {paid ? <p className="rounded-sm border border-green-500/30 bg-green-500/10 p-3 text-sm font-bold text-green-700 dark:text-green-100">Paid {request.paidAt ? request.paidAt.toLocaleString() : ""}</p> : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {requestsResult.hasDb && !requestsResult.requests.length ? <p className="muted-copy mt-8 rounded-sm border border-[var(--border)] p-6">No photo book requests yet.</p> : null}
    </section>
  );
}
