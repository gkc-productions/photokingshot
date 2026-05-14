import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Blog",
  description: "Published PhotoKingShot posts about Atlanta photography, session preparation, galleries, and gear.",
  alternates: {
    canonical: "/blog"
  },
  openGraph: {
    title: "Blog | PhotoKingShot",
    description: "Photography notes, session prep, and gear thinking from PhotoKingShot.",
    url: "https://photokingshot.com/blog"
  }
};

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" }
  }).catch(() => []);
  const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category)))];
  const selected = params.category || "All";
  const filtered = selected === "All" ? posts : posts.filter((post) => post.category === selected);

  return (
    <section className="section-shell py-16 md:py-24">
      <SectionHeading eyebrow="Blog" title="Photography notes, session prep, and gear thinking." body="Only published posts appear on the public site. Drafts stay in admin until they are ready." />
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <a key={category} href={category === "All" ? "/blog" : `/blog?category=${encodeURIComponent(category)}`} className={`rounded-sm border px-4 py-2 text-sm font-bold ${selected === category ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--gold-foreground)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"}`}>
            {category}
          </a>
        ))}
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {filtered.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="surface-card rounded-sm p-6 transition hover:border-[var(--gold)]">
            <p className="eyebrow">{post.category}</p>
            <h2 className="mt-3 text-2xl font-black">{post.title}</h2>
            <p className="muted-copy mt-3 leading-7">{post.excerpt}</p>
          </Link>
        ))}
      </div>
      {!filtered.length ? <p className="muted-copy mt-10">No published posts yet.</p> : null}
    </section>
  );
}
