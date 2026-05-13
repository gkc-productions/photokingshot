import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gear",
  description: "Amazon affiliate photography gear recommendations from GKC Productions / PhotoKingShot."
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
      <p className="mt-6 rounded-sm border border-[#d6a83f]/30 bg-[#d6a83f]/10 p-4 text-sm text-[#f4d98d]">As an Amazon Associate, GKC Productions / PhotoKingShot earns from qualifying purchases.</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <article key={product.title} className="rounded-sm border border-white/10 bg-white/[0.04] p-6">
            <p className="eyebrow">{product.category}</p>
            <h2 className="mt-3 text-2xl font-black">{product.title}</h2>
            <p className="mt-3 text-sm font-bold text-[#d6a83f]">Best for: {product.bestFor}</p>
            <p className="mt-3 leading-7 text-white/68">{product.description}</p>
            <a href={product.affiliateUrl} rel="nofollow sponsored noopener noreferrer" target="_blank" className="mt-6 inline-flex min-h-11 items-center rounded-sm bg-[#d6a83f] px-5 py-3 text-sm font-black uppercase tracking-wide text-black hover:bg-white">
              View Product
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
