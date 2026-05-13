import { notFound } from "next/navigation";
import { BlogPostForm } from "@/components/AdminForms";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();
  return <section className="section-shell max-w-3xl py-10"><p className="eyebrow">Admin</p><h1 className="mt-3 mb-8 text-4xl font-black">Edit blog post</h1><BlogPostForm post={post} /></section>;
}
