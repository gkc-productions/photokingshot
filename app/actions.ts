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
  allowDownloads: formBoolean.default(false)
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
