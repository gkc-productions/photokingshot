export const expiredGalleryMessage = "This gallery is no longer available. Please contact PhotoKingShot if you need access restored.";

export function isGalleryExpired(gallery: { expiresAt?: Date | null }, now = new Date()) {
  return Boolean(gallery.expiresAt && gallery.expiresAt.getTime() < now.getTime());
}

export function formatGalleryExpiration(value?: Date | null) {
  if (!value) return "No expiration";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "America/New_York"
  }).format(value);
}

export function dateInputToExpiration(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? new Date(`${trimmed}T23:59:59.999Z`) : null;
}
