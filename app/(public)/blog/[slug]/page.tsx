import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } }).catch(() => null);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findFirst({ where: { slug, status: "PUBLISHED" } }).catch(() => null);
  if (!post) notFound();

  return (
    <article className="section-shell max-w-3xl py-16 md:py-24">
      <p className="eyebrow">{post.category}</p>
      <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">{post.title}</h1>
      <p className="mt-5 text-lg leading-8 text-white/68">{post.excerpt}</p>
      {post.hasAffiliateLinks ? <p className="mt-5 rounded-sm border border-[#d6a83f]/30 bg-[#d6a83f]/10 p-3 text-sm text-[#f4d98d]">This post may contain affiliate links.</p> : null}
      <div className="mt-10 whitespace-pre-wrap text-lg leading-9 text-white/82">{post.content}</div>
    </article>
  );
}
