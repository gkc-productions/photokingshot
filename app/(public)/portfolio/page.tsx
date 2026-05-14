import type { Metadata } from "next";
import { PortfolioCard } from "@/components/PortfolioCard";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";
import { placeholderPortfolio } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Portfolio",
  description: "Explore PhotoKingShot portfolio categories for portraits, events, graduation, church/community, and creative photography.",
  alternates: {
    canonical: "/portfolio"
  },
  openGraph: {
    title: "Portfolio | PhotoKingShot",
    description: "Premium Atlanta photography portfolio organized by shoot type.",
    url: "https://photokingshot.com/portfolio"
  }
};

const categoryOrder = ["Portraits", "Events", "Graduation", "Church/Community", "Creative"];

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const items = await prisma.portfolioItem.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  const source = items.length ? items : placeholderPortfolio;
  const categories = ["All", ...categoryOrder];
  const selected = params.category || "All";
  const filtered = selected === "All" ? source : source.filter((item) => item.category === selected);

  return (
    <section className="section-shell py-16 md:py-24">
      <SectionHeading eyebrow="Portfolio" title="A polished gallery structure for PhotoKingShot work." body="Browse by shoot type. The placeholders are designed to stay visually clean until real client-approved images are uploaded from admin." />
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <a key={category} href={category === "All" ? "/portfolio" : `/portfolio?category=${encodeURIComponent(category)}`} className={`rounded-sm border px-4 py-2 text-sm font-bold ${selected === category ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--gold-foreground)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--gold)] hover:text-[var(--gold)]"}`}>
            {category}
          </a>
        ))}
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => <PortfolioCard key={item.title} {...item} />)}
      </div>
      {!filtered.length ? <p className="muted-copy mt-10">No items in this category yet. Add portfolio work from admin when client-approved images are ready.</p> : null}
    </section>
  );
}
