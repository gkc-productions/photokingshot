"use server";

import { BlogStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { clearAdminSession, setAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { site } from "@/lib/site";

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

  // Future: if SMTP_HOST/SMTP_USER/SMTP_PASS are present, send an inquiry notification to site.contactEmail.
  // The current official admin/contact inbox is configured as admin@photokingshot.com.
  void site.contactEmail;
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
