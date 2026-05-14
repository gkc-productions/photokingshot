import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Gear",
  description: "Photography gear notes and equipment recommendations from GKC Productions / PhotoKingShot.",
  alternates: {
    canonical: "/gear"
  },
  openGraph: {
    title: "Gear | PhotoKingShot",
    description: "Photography gear notes and equipment recommendations from GKC Productions / PhotoKingShot.",
    url: "https://photokingshot.com/gear"
  }
};

const fallbackProducts = [
  {
    title: "Fast Prime Lens Placeholder",
    category: "Lens",
    bestFor: "Portraits and low-light event moments",
    description: "A fast prime lens slot for portraits, clean background separation, and stronger low-light coverage.",
    affiliateUrl: "",
    isActive: true
  },
  {
    title: "Portable Light Placeholder",
    category: "Lighting",
    bestFor: "On-location portraits and creative setups",
    description: "A compact lighting tool slot for controlled portraits, reception details, and creative setups.",
    affiliateUrl: "",
    isActive: true
  }
];

function publicGearDescription(description: string) {
  if (/amazon|affiliate|qualifying purchases|sponsored/i.test(description)) {
    return "A recommended equipment slot for PhotoKingShot shoot planning, production quality, and consistent client delivery.";
  }
  return description;
}

export default async function GearPage() {
  const products = await prisma.affiliateProduct.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  }).catch(() => []);
  const items = products.length ? products : fallbackProducts;

  return (
    <section className="section-shell py-16 md:py-24">
      <SectionHeading eyebrow="Gear" title="Photography gear for sharper shoots and smoother prep." body="A simple look at equipment categories PhotoKingShot uses or recommends for portraits, events, graduation sessions, and creative work. No fake prices, ratings, or reviews." />
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <article key={product.title} className="surface-card rounded-sm p-6">
            <p className="eyebrow">{product.category}</p>
            <h2 className="mt-3 text-2xl font-black">{product.title}</h2>
            <p className="mt-3 text-sm font-bold text-[var(--gold)]">Best for: {product.bestFor}</p>
            <p className="muted-copy mt-3 leading-7">{publicGearDescription(product.description)}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
