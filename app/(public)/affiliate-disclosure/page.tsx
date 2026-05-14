import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclosure",
  description: "Disclosure statement for PhotoKingShot by GKC Productions."
};

export default function AffiliateDisclosurePage() {
  return (
    <section className="section-shell max-w-3xl py-16 md:py-24">
      <p className="eyebrow">Disclosure</p>
      <h1 className="mt-4 text-4xl font-black">Disclosure</h1>
      <div className="muted-copy mt-8 space-y-5 leading-8">
        <p>PhotoKingShot by GKC Productions does not currently use paid product endorsements or commission-based product links on the public website.</p>
        <p>Any future sponsored placement, paid partnership, or product relationship will be clearly identified where it appears.</p>
        <p>Gear notes are provided as general photography resources and do not include prices, ratings, or review claims.</p>
      </div>
    </section>
  );
}
