import type { ClientGallery, GalleryImage } from "@prisma/client";
import { deleteClientGallery, resetClientGalleryPassword, upsertClientGallery, upsertGalleryImage } from "@/app/actions";
import { formatGalleryExpiration, isGalleryExpired } from "@/lib/gallery-availability";

const input = "mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3";
const label = "text-sm font-semibold text-[var(--muted)]";
const deliveryStatuses = ["Draft", "Proofing", "Final", "Delivered", "Expired"] as const;

function dateInputValue(value?: Date | null) {
  return value ? value.toISOString().slice(0, 10) : "";
}

export function ClientGalleryForm({ gallery }: { gallery?: ClientGallery }) {
  return (
    <form action={upsertClientGallery} className="grid gap-4 rounded-sm border border-[var(--border)] bg-[var(--card)] p-5">
      <input type="hidden" name="id" value={gallery?.id || ""} />
      <label className={label}>Client name<input name="clientName" required defaultValue={gallery?.clientName} className={input} /></label>
      <label className={label}>Gallery title<input name="title" required defaultValue={gallery?.title} className={input} /></label>
      <label className={label}>Slug<input name="slug" defaultValue={gallery?.slug} className={input} /></label>
      <label className={label}>Client email<input name="clientEmail" type="email" defaultValue={gallery?.clientEmail || ""} className={input} /></label>
      <label className={label}>Session date<input name="sessionDate" type="date" defaultValue={dateInputValue(gallery?.sessionDate)} className={input} /></label>
      <label className={label}>Expiration date<input name="expiresAt" type="date" defaultValue={dateInputValue(gallery?.expiresAt)} className={input} /></label>
      <p className="muted-copy rounded-sm border border-[var(--border)] p-3 text-sm">Expired galleries will no longer be accessible to clients, but files remain stored until you delete the gallery.</p>
      <label className={label}>
        Delivery status
        <select name="deliveryStatus" defaultValue={gallery?.deliveryStatus || "Draft"} className={input}>
          {deliveryStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
      </label>
      <label className={label}>Access code<input name="accessCode" required defaultValue={gallery?.accessCode} className={`${input} uppercase`} /></label>
      <label className={label}>
        {gallery ? "New password (leave blank to keep current password)" : "Gallery password"}
        <input name="password" type="password" required={!gallery} className={input} />
      </label>
      <p className="gold-notice rounded-sm p-3 text-sm">Copy this password now. It cannot be viewed later.</p>
      <label className={label}>Description<textarea name="description" rows={4} defaultValue={gallery?.description || ""} className={input} /></label>
      <label className={label}>Share/client note<textarea name="shareNote" rows={4} defaultValue={gallery?.shareNote || ""} placeholder="Optional instructions shown inside the client gallery." className={input} /></label>
      <label className="flex items-center gap-3 text-sm font-semibold text-[var(--muted)]">
        <input type="hidden" name="isPublished" value="false" />
        <input type="checkbox" name="isPublished" value="true" defaultChecked={gallery?.isPublished ?? false} className="h-4 w-4" />
        Published for client login
      </label>
      <label className="flex items-center gap-3 text-sm font-semibold text-[var(--muted)]">
        <input type="hidden" name="allowDownloads" value="false" />
        <input type="checkbox" name="allowDownloads" value="true" defaultChecked={gallery?.allowDownloads ?? true} className="h-4 w-4" />
        Allow image downloads
      </label>
      <label className="flex items-center gap-3 text-sm font-semibold text-[var(--muted)]">
        <input type="hidden" name="selectionMode" value="false" />
        <input type="checkbox" name="selectionMode" value="true" defaultChecked={gallery?.selectionMode ?? false} className="h-4 w-4" />
        Proofing selection mode
      </label>
      <label className={label}>Max selections<input name="maxSelections" type="number" min="1" defaultValue={gallery?.maxSelections || ""} placeholder="20" className={input} /></label>
      <button className="gold-button min-h-12 rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide">Save Gallery</button>
    </form>
  );
}

export function GalleryPasswordResetForm({ galleryId }: { galleryId: string }) {
  return (
    <form id="reset-password" action={resetClientGalleryPassword} className="grid gap-4 rounded-sm border border-[var(--border)] bg-[var(--card)] p-5">
      <input type="hidden" name="id" value={galleryId} />
      <div>
        <h2 className="text-2xl font-black">Reset password</h2>
        <p className="muted-copy mt-2 text-sm">Enter a new client password, copy it before saving, then share it with the client. Existing passwords cannot be viewed.</p>
      </div>
      <label className={label}>New password<input name="password" type="password" required className={input} /></label>
      <p className="gold-notice rounded-sm p-3 text-sm">Copy this password now. It cannot be viewed later.</p>
      <button className="gold-button min-h-12 rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide">Reset Password</button>
    </form>
  );
}

export function DeleteClientGalleryForm({ gallery }: { gallery: Pick<ClientGallery, "id" | "slug" | "title"> }) {
  return (
    <form action={deleteClientGallery} className="grid gap-4 rounded-sm border border-red-500/40 bg-red-500/10 p-5">
      <input type="hidden" name="id" value={gallery.id} />
      <div>
        <h2 className="text-2xl font-black text-red-200">Delete gallery</h2>
        <p className="mt-2 text-sm leading-6 text-red-100">
          This permanently deletes the gallery, image records, selections, and R2 files for this gallery only.
        </p>
      </div>
      <div className="rounded-sm border border-red-400/30 bg-black/20 p-3 text-sm text-red-100">
        Type <span className="font-mono font-black">{gallery.slug}</span> exactly to confirm deletion of <span className="font-bold">{gallery.title}</span>.
      </div>
      <label className="text-sm font-semibold text-red-100">
        Confirm gallery slug
        <input name="confirmSlug" required autoComplete="off" className="mt-2 w-full rounded-sm border border-red-400/40 bg-[var(--input)] px-3 py-3 text-[var(--input-foreground)]" />
      </label>
      <button className="min-h-12 rounded-sm border border-red-400/60 px-5 py-3 text-sm font-black uppercase tracking-wide text-red-100 hover:bg-red-500/20">
        Permanently Delete Gallery
      </button>
    </form>
  );
}

export function GalleryClientInstructions({ gallery }: { gallery: ClientGallery }) {
  const galleryUrl = `https://photokingshot.com/galleries/${gallery.slug}`;
  const purpose = gallery.selectionMode ? "Proofing gallery" : "Final gallery";
  const instruction = gallery.selectionMode
    ? `Proofing instruction: Select up to ${gallery.maxSelections || 20} favorites and submit your choices. Downloads will be available after final edits are delivered.`
    : gallery.allowDownloads
      ? "Download instruction: Your final edited images are ready to view and download."
      : "Download instruction: Your gallery is ready to view. Downloads are currently turned off.";
  const expiration = gallery.expiresAt ? `
Expiration: ${formatGalleryExpiration(gallery.expiresAt)}` : "";
  const shareNote = gallery.shareNote ? `
Client note: ${gallery.shareNote}` : "";
  const expired = isGalleryExpired(gallery);

  return (
    <section className="rounded-sm border border-[var(--border)] bg-[var(--card)] p-5">
      <h2 className="text-2xl font-black">Client message</h2>
      <p className="muted-copy mt-2 text-sm">Copy-ready message for this {purpose.toLowerCase()}.</p>
      {expired ? <p className="mt-3 rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-100">This gallery is expired. Restore access by updating the expiration date before sending this message.</p> : null}
      <div className="mt-4 whitespace-pre-wrap rounded-sm border border-[var(--border)] bg-[var(--background)] p-4 text-sm text-[var(--foreground)]">
        {`Your PhotoKingShot gallery is ready:

Gallery URL: ${galleryUrl}
Gallery code: ${gallery.accessCode}
Password: Use the password I created for you.${expiration}

${instruction}${shareNote}`}
      </div>
    </section>
  );
}

export function GalleryImageForm({ galleryId, image }: { galleryId: string; image?: GalleryImage }) {
  return (
    <form action={upsertGalleryImage} className="grid gap-4 rounded-sm border border-[var(--border)] bg-[var(--card)] p-5">
      <input type="hidden" name="id" value={image?.id || ""} />
      <input type="hidden" name="galleryId" value={galleryId} />
      <label className={label}>
        Image URL
        <input name="imageUrl" required defaultValue={image?.imageUrl || ""} placeholder="/images/galleries/client-001.jpg" className={input} />
      </label>
      <label className={label}>Title<input name="title" defaultValue={image?.title || ""} className={input} /></label>
      <label className={label}>Caption<textarea name="caption" rows={3} defaultValue={image?.caption || ""} className={input} /></label>
      <label className={label}>Sort order<input name="sortOrder" type="number" defaultValue={image?.sortOrder ?? 0} className={input} /></label>
      <label className="flex items-center gap-3 text-sm font-semibold text-[var(--muted)]">
        <input type="hidden" name="isDownloadable" value="false" />
        <input type="checkbox" name="isDownloadable" value="true" defaultChecked={image?.isDownloadable ?? true} className="h-4 w-4" />
        Downloadable when gallery downloads are enabled
      </label>
      <p className="muted-copy text-sm">Future upgrade: Cloudflare R2/S3 upload support.</p>
      <button className="gold-button min-h-12 rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide">{image ? "Save Image" : "Add Image"}</button>
    </form>
  );
}
