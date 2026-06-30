import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about PhotoKingShot, the Atlanta photography brand of GKC Productions for portraits, events, graduations, birthdays, and private galleries.",
  alternates: {
    canonical: "/about"
  },
  openGraph: {
    title: "About PhotoKingShot",
    description: "PhotoKingShot is the Atlanta-based photography brand of GKC Productions.",
    url: "https://photokingshot.com/about"
  }
};

export default function AboutPage() {
  return (
    <section className="section-shell grid gap-10 py-16 md:grid-cols-[1fr_0.9fr] md:py-24">
      <div>
        <SectionHeading eyebrow="About" title={`${site.name} is the photography brand of ${site.parent}.`} body="Built in Atlanta with a focus on polished images, honest direction, clean editing, and final galleries people are proud to share." />
        <p className="muted-copy mt-6 text-lg leading-8">The work sits between polished production and personal presence: graduation portraits that carry the weight of the milestone, birthday photos that feel celebratory, event coverage that respects the room, and family or couple sessions that keep real connection at the center.</p>
        <p className="muted-copy mt-5 leading-7">Every session is handled with clear communication before the shoot, calm direction during it, and a private gallery delivery process built for easy viewing and downloading.</p>
        <p className="muted-copy mt-5 leading-7">
          For booking questions, collaborations, or admin contact, email{" "}
          <a href={`mailto:${site.contactEmail}`} className="font-semibold text-[var(--gold)] hover:text-[var(--foreground)]">{site.contactEmail}</a>.
        </p>
        <Button href="/booking" className="mt-8">Book a Session</Button>
      </div>
      <div className="photo-sheen min-h-[420px] rounded-sm border border-[var(--border)] p-7">
        <p className="eyebrow">Atlanta-based</p>
        <h2 className="mt-3 text-3xl font-black">Modern images with a thoughtful production mindset.</h2>
      </div>
    </section>
  );
}
