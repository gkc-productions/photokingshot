import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Services",
  description: "Atlanta graduation portraits, birthday photos, church and event coverage, family and couple portraits, and creative photography by PhotoKingShot.",
  alternates: {
    canonical: "/services"
  },
  openGraph: {
    title: "Photography Services | PhotoKingShot",
    description: "Professional Atlanta photography for milestones, events, portraits, and private gallery delivery.",
    url: "https://photokingshot.com/services"
  }
};

const services = [
  ["Graduation portraits", "Campus, studio, cap-and-gown, family, and announcement-ready images for a milestone that deserves more than quick snapshots.", "Starting at $275"],
  ["Birthday photos", "Coverage for birthday dinners, parties, studio portraits, and milestone celebrations with clean edits and a polished final gallery.", "Starting at $400"],
  ["Church/community events", "Respectful coverage for services, anniversaries, outreach, ministry milestones, and community days.", "Starting at $350"],
  ["Family and couple portraits", "Warm, directed sessions for families, couples, lifestyle portraits, and personal keepsakes across Atlanta.", "Starting at $250"],
  ["Creative/editorial shoots", "Concept-driven images for artists, entrepreneurs, campaigns, and visual storytelling that needs a sharper point of view.", "Starting at $500"]
];

export default function ServicesPage() {
  return (
    <section className="section-shell py-16 md:py-24">
      <SectionHeading eyebrow="Services" title="Photography packages shaped for real people, real rooms, and real moments." body="Use these starting points to plan your session, then share your date, location, occasion, and creative direction for a tailored quote." />
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {services.map(([title, body, price]) => (
          <article key={title} className="surface-card rounded-sm p-6">
            <p className="eyebrow">{price}</p>
            <h2 className="mt-3 text-2xl font-black">{title}</h2>
            <p className="muted-copy mt-3 leading-7">{body}</p>
          </article>
        ))}
      </div>
      <Button href="/booking" className="mt-10">Book a Session</Button>
    </section>
  );
}
