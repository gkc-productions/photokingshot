import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "Affiliate disclosure for PhotoKingShot by GKC Productions."
};

export default function AffiliateDisclosurePage() {
  return (
    <section className="section-shell max-w-3xl py-16 md:py-24">
      <p className="eyebrow">Disclosure</p>
      <h1 className="mt-4 text-4xl font-black">Affiliate Disclosure</h1>
      <div className="muted-copy mt-8 space-y-5 leading-8">
        <p>As an Amazon Associate, GKC Productions / PhotoKingShot earns from qualifying purchases.</p>
        <p>Gear recommendations are manually selected and affiliate links should be added through approved Amazon Associates methods. PhotoKingShot does not show fake reviews, fake Amazon prices, or scraped Amazon data.</p>
        <p>Affiliate earnings may support the operation of the website and photography content without changing the price paid by visitors.</p>
      </div>
    </section>
  );
}
