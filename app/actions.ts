"use server";

import { BlogStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAdminSession, setAdminSession } from "@/lib/admin-auth";
import { setGalleryAccessCookie } from "@/lib/gallery-auth";
import { sendBookingNotification } from "@/lib/mail";
import { prisma } from "@/lib/prisma";

const requiredString = z.string().trim().min(1);
const formBoolean = z.preprocess((value) => value === "true" || value === "on", z.boolean());
const bookingStatuses = ["NEW", "CONTACTED", "BOOKED", "COMPLETED", "ARCHIVED"] as const;

const bookingSchema = z.object({
  fullName: requiredString,
  email: z.string().trim().email(),
  phone: requiredString,
  shootType: requiredString,
  preferredDate: z.string().optional(),
  location: requiredString,
  message: requiredString
});

export async function createBookingInquiry(_: unknown, formData: FormData) {
  const parsed = bookingSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Please complete every required field with valid contact details." };
  }

  try {
    await prisma.bookingInquiry.create({
      data: {
        ...parsed.data,
        preferredDate: parsed.data.preferredDate ? new Date(parsed.data.preferredDate) : null
      }
    });
  } catch {
    return {
      ok: false,
      message: "The booking form is ready, but the database is not reachable yet. Please try again after production migrations are run."
    };
  }

  try {
    await sendBookingNotification(parsed.data);
  } catch (error) {
    console.error("Booking inquiry was stored, but SMTP notification failed.", error instanceof Error ? error.message : "Unknown SMTP error");
  }

  revalidatePath("/admin");
  return { ok: true, message: "Your inquiry was received. PhotoKingShot will follow up soon." };
}

export async function updateBookingInquiryStatus(formData: FormData) {
  const parsed = z.object({
    id: requiredString,
    status: z.enum(bookingStatuses)
  }).parse(Object.fromEntries(formData));

  await prisma.bookingInquiry.update({
    where: { id: parsed.id },
    data: { status: parsed.status }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
}

export async function loginAdmin(_: unknown, formData: FormData) {
  const password = String(formData.get("password") || "");
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { ok: false, message: "Invalid admin password." };
  }

  await setAdminSession(password);
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const blogSchema = z.object({
  id: z.string().optional(),
  title: requiredString,
  slug: z.string().trim().optional(),
  excerpt: requiredString,
  content: requiredString,
  category: requiredString,
  status: z.nativeEnum(BlogStatus),
  hasAffiliateLinks: formBoolean.default(false)
});

export async function upsertBlogPost(formData: FormData) {
  const parsed = blogSchema.parse(Object.fromEntries(formData));
  const slug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.title);
  const data = {
    title: parsed.title,
    slug,
    excerpt: parsed.excerpt,
    content: parsed.content,
    category: parsed.category,
    status: parsed.status,
    hasAffiliateLinks: parsed.hasAffiliateLinks
  };

  if (parsed.id) {
    await prisma.blogPost.update({ where: { id: parsed.id }, data });
  } else {
    await prisma.blogPost.create({ data });
  }
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function deleteBlogPost(formData: FormData) {
  await prisma.blogPost.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/blog");
  redirect("/admin/blog");
}

const productSchema = z.object({
  id: z.string().optional(),
  title: requiredString,
  category: requiredString,
  bestFor: requiredString,
  description: requiredString,
  affiliateUrl: z.string().trim().url(),
  isActive: formBoolean.default(false)
});

export async function upsertAffiliateProduct(formData: FormData) {
  const parsed = productSchema.parse(Object.fromEntries(formData));
  const data = {
    title: parsed.title,
    category: parsed.category,
    bestFor: parsed.bestFor,
    description: parsed.description,
    affiliateUrl: parsed.affiliateUrl,
    isActive: parsed.isActive
  };

  if (parsed.id) {
    await prisma.affiliateProduct.update({ where: { id: parsed.id }, data });
  } else {
    await prisma.affiliateProduct.create({ data });
  }
  revalidatePath("/gear");
  redirect("/admin/gear");
}

export async function deleteAffiliateProduct(formData: FormData) {
  await prisma.affiliateProduct.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/gear");
  redirect("/admin/gear");
}

const portfolioSchema = z.object({
  id: z.string().optional(),
  title: requiredString,
  category: requiredString,
  imageUrl: z.string().trim().url(),
  description: requiredString,
  isFeatured: formBoolean.default(false)
});

export async function upsertPortfolioItem(formData: FormData) {
  const parsed = portfolioSchema.parse(Object.fromEntries(formData));
  const data = {
    title: parsed.title,
    category: parsed.category,
    imageUrl: parsed.imageUrl,
    description: parsed.description,
    isFeatured: parsed.isFeatured
  };

  if (parsed.id) {
    await prisma.portfolioItem.update({ where: { id: parsed.id }, data });
  } else {
    await prisma.portfolioItem.create({ data });
  }
  revalidatePath("/portfolio");
  redirect("/admin/portfolio");
}

export async function deletePortfolioItem(formData: FormData) {
  await prisma.portfolioItem.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/portfolio");
  redirect("/admin/portfolio");
}

const gallerySchema = z.object({
  id: z.string().optional(),
  title: requiredString,
  slug: z.string().trim().optional(),
  clientName: requiredString,
  clientEmail: z.string().trim().email().optional().or(z.literal("")),
  sessionDate: z.string().optional(),
  description: z.string().trim().optional(),
  accessCode: requiredString,
  password: z.string().optional(),
  isPublished: formBoolean.default(false),
  allowDownloads: formBoolean.default(false),
  selectionMode: formBoolean.default(false),
  maxSelections: z.coerce.number().int().positive().optional().or(z.literal(""))
});

export async function upsertClientGallery(formData: FormData) {
  const parsed = gallerySchema.parse(Object.fromEntries(formData));
  const slug = parsed.slug ? slugify(parsed.slug) : slugify(parsed.title);
  const password = parsed.password?.trim();
  if (!parsed.id && !password) {
    throw new Error("A gallery password is required when creating a new gallery.");
  }

  const data = {
    title: parsed.title,
    slug,
    clientName: parsed.clientName,
    clientEmail: parsed.clientEmail || null,
    sessionDate: parsed.sessionDate ? new Date(parsed.sessionDate) : null,
    description: parsed.description || null,
    accessCode: parsed.accessCode.trim(),
    isPublished: parsed.isPublished,
    allowDownloads: parsed.allowDownloads,
    selectionMode: parsed.selectionMode,
    maxSelections: parsed.maxSelections === "" ? null : parsed.maxSelections || null,
    ...(password ? { passwordHash: await bcrypt.hash(password, 12) } : {})
  };

  if (parsed.id) {
    await prisma.clientGallery.update({ where: { id: parsed.id }, data });
  } else {
    await prisma.clientGallery.create({ data: data as typeof data & { passwordHash: string } });
  }
  revalidatePath("/galleries");
  revalidatePath("/admin/galleries");
  redirect("/admin/galleries");
}

export async function toggleClientGalleryPublished(formData: FormData) {
  const id = String(formData.get("id") || "");
  const gallery = await prisma.clientGallery.findUnique({
    where: { id },
    select: { slug: true, isPublished: true }
  });
  if (!gallery) return;

  await prisma.clientGallery.update({
    where: { id },
    data: { isPublished: !gallery.isPublished }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/galleries");
  revalidatePath(`/galleries/${gallery.slug}`);
}

export async function resetClientGalleryPassword(formData: FormData) {
  const parsed = z.object({
    id: requiredString,
    password: z.string().trim().min(1)
  }).parse(Object.fromEntries(formData));

  const gallery = await prisma.clientGallery.update({
    where: { id: parsed.id },
    data: { passwordHash: await bcrypt.hash(parsed.password, 12) },
    select: { slug: true }
  });

  revalidatePath("/admin/galleries");
  revalidatePath(`/galleries/${gallery.slug}`);
  redirect(`/admin/galleries/${parsed.id}/edit`);
}

export async function deleteClientGallery(formData: FormData) {
  await prisma.clientGallery.delete({ where: { id: String(formData.get("id")) } });
  revalidatePath("/galleries");
  redirect("/admin/galleries");
}

const galleryImageSchema = z.object({
  id: z.string().optional(),
  galleryId: requiredString,
  imageUrl: requiredString,
  title: z.string().trim().optional(),
  caption: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isDownloadable: formBoolean.default(false)
});

export async function upsertGalleryImage(formData: FormData) {
  const parsed = galleryImageSchema.parse(Object.fromEntries(formData));
  const data = {
    galleryId: parsed.galleryId,
    imageUrl: parsed.imageUrl,
    title: parsed.title || null,
    caption: parsed.caption || null,
    sortOrder: parsed.sortOrder,
    isDownloadable: parsed.isDownloadable
  };

  if (parsed.id) {
    await prisma.galleryImage.update({ where: { id: parsed.id }, data });
  } else {
    await prisma.galleryImage.create({ data });
  }

  const gallery = await prisma.clientGallery.findUnique({ where: { id: parsed.galleryId }, select: { slug: true } });
  revalidatePath("/admin/galleries");
  if (gallery) revalidatePath(`/galleries/${gallery.slug}`);
  redirect(`/admin/galleries/${parsed.galleryId}/images`);
}

export async function deleteGalleryImage(formData: FormData) {
  const id = String(formData.get("id"));
  const galleryId = String(formData.get("galleryId"));
  await prisma.galleryImage.delete({ where: { id } });
  const gallery = await prisma.clientGallery.findUnique({ where: { id: galleryId }, select: { slug: true } });
  if (gallery) revalidatePath(`/galleries/${gallery.slug}`);
  redirect(`/admin/galleries/${galleryId}/images`);
}

const selectionSchema = z.object({
  galleryId: requiredString,
  imageIds: z.string().trim()
});

export async function submitGallerySelections(_: unknown, formData: FormData) {
  const parsed = selectionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Choose the images you want edited before submitting." };

  const gallery = await prisma.clientGallery.findUnique({
    where: { id: parsed.data.galleryId },
    include: { selections: true }
  }).catch(() => null);
  if (!gallery || !gallery.selectionMode || !gallery.isPublished) return { ok: false, message: "This proofing gallery is not available." };
  if (gallery.selectionSubmittedAt) return { ok: false, message: "Your selections have already been submitted." };

  const selectedIds = parsed.data.imageIds.split(",").map((id) => id.trim()).filter(Boolean);
  const uniqueIds = Array.from(new Set(selectedIds));
  const maxSelections = gallery.maxSelections || 20;
  if (!uniqueIds.length) return { ok: false, message: "Select at least one image before submitting." };
  if (uniqueIds.length > maxSelections) return { ok: false, message: `You can select up to ${maxSelections} images for this gallery.` };

  const validImages = await prisma.galleryImage.findMany({
    where: { galleryId: gallery.id, id: { in: uniqueIds } },
    select: { id: true }
  });
  if (validImages.length !== uniqueIds.length) return { ok: false, message: "One or more selected images are not part of this gallery." };

  await prisma.$transaction([
    prisma.gallerySelection.deleteMany({ where: { galleryId: gallery.id } }),
    prisma.gallerySelection.createMany({
      data: uniqueIds.map((imageId) => ({ galleryId: gallery.id, imageId })),
      skipDuplicates: true
    }),
    prisma.clientGallery.update({
      where: { id: gallery.id },
      data: { selectionSubmittedAt: new Date() }
    })
  ]);

  revalidatePath(`/galleries/${gallery.slug}`);
  revalidatePath("/admin/galleries");
  return { ok: true, message: "Your selections have been submitted. PhotoKingShot will begin editing your chosen images." };
}

export async function resetGallerySelections(formData: FormData) {
  const galleryId = String(formData.get("galleryId") || "");
  const gallery = await prisma.clientGallery.findUnique({ where: { id: galleryId }, select: { slug: true } });
  await prisma.$transaction([
    prisma.gallerySelection.deleteMany({ where: { galleryId } }),
    prisma.clientGallery.update({
      where: { id: galleryId },
      data: { selectionSubmittedAt: null, selectionNotes: null }
    })
  ]);
  if (gallery) revalidatePath(`/galleries/${gallery.slug}`);
  revalidatePath("/admin/galleries");
  redirect(`/admin/galleries/${galleryId}/selections`);
}

const galleryLoginSchema = z.object({
  accessCode: requiredString,
  password: requiredString
});

export async function loginClientGallery(_: unknown, formData: FormData) {
  const parsed = galleryLoginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: "Enter the gallery code and password provided by PhotoKingShot." };
  }

  const gallery = await prisma.clientGallery.findUnique({
    where: { accessCode: parsed.data.accessCode.trim() },
    select: { id: true, slug: true, passwordHash: true, isPublished: true }
  }).catch(() => null);

  if (!gallery || !gallery.isPublished) {
    return { ok: false, message: "Gallery not found. Check your code or contact PhotoKingShot for help." };
  }

  const valid = await bcrypt.compare(parsed.data.password, gallery.passwordHash);
  if (!valid) {
    return { ok: false, message: "That gallery code and password did not match." };
  }

  await setGalleryAccessCookie(gallery);
  redirect(`/galleries/${gallery.slug}`);
}
