import type { ClientGallery, GalleryImage } from "@prisma/client";
import { upsertClientGallery, upsertGalleryImage } from "@/app/actions";

const input = "mt-2 w-full rounded-sm border border-[var(--border)] px-3 py-3";
const label = "text-sm font-semibold text-[var(--muted)]";

export function ClientGalleryForm({ gallery }: { gallery?: ClientGallery }) {
  return (
    <form action={upsertClientGallery} className="grid gap-4 rounded-sm border border-[var(--border)] bg-[var(--card)] p-5">
      <input type="hidden" name="id" value={gallery?.id || ""} />
      <label className={label}>Gallery title<input name="title" required defaultValue={gallery?.title} className={input} /></label>
      <label className={label}>Slug<input name="slug" defaultValue={gallery?.slug} className={input} /></label>
      <label className={label}>Client/session name<input name="clientName" required defaultValue={gallery?.clientName} className={input} /></label>
      <label className={label}>Client email<input name="clientEmail" type="email" defaultValue={gallery?.clientEmail || ""} className={input} /></label>
      <label className={label}>Session date<input name="sessionDate" type="date" defaultValue={gallery?.sessionDate ? gallery.sessionDate.toISOString().slice(0, 10) : ""} className={input} /></label>
      <label className={label}>Description<textarea name="description" rows={4} defaultValue={gallery?.description || ""} className={input} /></label>
      <label className={label}>Access code<input name="accessCode" required defaultValue={gallery?.accessCode} className={`${input} uppercase`} /></label>
      <label className={label}>
        {gallery ? "New password (leave blank to keep current password)" : "Gallery password"}
        <input name="password" type="password" required={!gallery} className={input} />
      </label>
      <p className="gold-notice rounded-sm p-3 text-sm">Copy and share this password with the client now. It cannot be viewed later.</p>
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
      <button className="gold-button min-h-12 rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide">Save Gallery</button>
    </form>
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
