import type { Metadata } from "next";
import { PortfolioCard } from "@/components/PortfolioCard";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";
import { placeholderPortfolio } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Portfolio",
  description: "PhotoKingShot portfolio preview with portraits, events, graduations, and creative photography."
};

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const params = await searchParams;
  const items = await prisma.portfolioItem.findMany({ orderBy: { createdAt: "desc" } }).catch(() => []);
  const source = items.length ? items : placeholderPortfolio;
  const categories = ["All", ...Array.from(new Set(source.map((item) => item.category)))];
  const selected = params.category || "All";
  const filtered = selected === "All" ? source : source.filter((item) => item.category === selected);

  return (
    <section className="section-shell py-16 md:py-24">
      <SectionHeading eyebrow="Portfolio" title="A flexible gallery structure ready for future uploads." body="Filter by category now; later, uploaded work can be managed directly from the admin dashboard." />
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((category) => (
          <a key={category} href={category === "All" ? "/portfolio" : `/portfolio?category=${encodeURIComponent(category)}`} className={`rounded-sm border px-4 py-2 text-sm font-bold ${selected === category ? "border-[#d6a83f] bg-[#d6a83f] text-black" : "border-white/15 text-white/76 hover:border-[#d6a83f]"}`}>
            {category}
          </a>
        ))}
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => <PortfolioCard key={item.title} {...item} />)}
      </div>
    </section>
  );
}
