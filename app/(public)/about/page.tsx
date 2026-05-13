import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about PhotoKingShot, the photography brand of GKC Productions in Atlanta."
};

export default function AboutPage() {
  return (
    <section className="section-shell grid gap-10 py-16 md:grid-cols-[1fr_0.9fr] md:py-24">
      <div>
        <SectionHeading eyebrow="About" title={`${site.name} is the photography brand of ${site.parent}.`} body="Built in Atlanta with a focus on premium images, honest direction, and a final gallery people are proud to share." />
        <p className="mt-6 text-lg leading-8 text-white/72">The work sits between polished production and personal presence: portraits that feel confident, event coverage that respects the room, graduation sessions that carry the weight of the milestone, and community photography that keeps people at the center.</p>
        <Button href="/book" className="mt-8">Start a Booking</Button>
      </div>
      <div className="photo-sheen min-h-[420px] rounded-sm border border-white/10 p-7">
        <p className="eyebrow">Atlanta-based</p>
        <h2 className="mt-3 text-3xl font-black">Modern images with a production mindset.</h2>
      </div>
    </section>
  );
}
