import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gear",
  description: "Amazon affiliate photography gear recommendations from GKC Productions / PhotoKingShot.",
  alternates: {
    canonical: "/gear"
  },
  openGraph: {
    title: "Gear | PhotoKingShot",
    description: "Affiliate-compliant photography gear recommendations from GKC Productions / PhotoKingShot.",
    url: "https://photokingshot.com/gear"
  }
};

const fallbackProducts = [
  {
    title: "Fast Prime Lens Placeholder",
    category: "Lens",
    bestFor: "Portraits and low-light event moments",
    description: "A manually maintained affiliate recommendation slot for a fast prime lens once Amazon Associates links are approved.",
    affiliateUrl: "https://www.amazon.com/",
    isActive: true
  },
  {
    title: "Portable Light Placeholder",
    category: "Lighting",
    bestFor: "On-location portraits and creative setups",
    description: "A placeholder for a compact lighting tool. Add the final product and approved affiliate URL in admin.",
    affiliateUrl: "https://www.amazon.com/",
    isActive: true
  }
];

export default async function GearPage() {
  const products = await prisma.affiliateProduct.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  }).catch(() => []);
  const items = products.length ? products : fallbackProducts;

  return (
    <section className="section-shell py-16 md:py-24">
      <SectionHeading eyebrow="Gear" title="Recommended tools for sharper shoots and smoother prep." body="Product links are manually added or pulled from an approved Amazon Associates method later. No fake reviews, no fake prices, and no Amazon scraping." />
      <p className="gold-notice mt-6 rounded-sm p-4 text-sm">As an Amazon Associate, GKC Productions / PhotoKingShot earns from qualifying purchases.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <article key={product.title} className="surface-card rounded-sm p-6">
            <p className="eyebrow">{product.category}</p>
            <h2 className="mt-3 text-2xl font-black">{product.title}</h2>
            <p className="mt-3 text-sm font-bold text-[var(--gold)]">Best for: {product.bestFor}</p>
            <p className="muted-copy mt-3 leading-7">{product.description}</p>
            <a href={product.affiliateUrl} rel="nofollow sponsored noopener noreferrer" target="_blank" className="gold-button mt-6 inline-flex min-h-11 items-center rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide">
              View Product
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
