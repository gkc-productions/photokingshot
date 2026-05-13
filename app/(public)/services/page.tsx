import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Services",
  description: "Portrait, event, graduation, church, community, and creative photography services in Atlanta."
};

const services = [
  ["Portrait photography", "Personal branding, lifestyle portraits, artist images, and polished individual sessions.", "Starting at $250"],
  ["Event photography", "Clean coverage for celebrations, launches, gatherings, and special moments.", "Starting at $400"],
  ["Graduation shoots", "Campus, studio, family, and announcement-ready graduation images.", "Starting at $275"],
  ["Church/community events", "Respectful coverage for services, outreach, ministry milestones, and community days.", "Starting at $350"],
  ["Creative/editorial shoots", "Concept-driven images for campaigns, artists, creatives, and visual storytelling.", "Starting at $500"]
];

export default function ServicesPage() {
  return (
    <section className="section-shell py-16 md:py-24">
      <SectionHeading eyebrow="Services" title="Photography packages shaped for real people, real rooms, and real moments." body="Starting prices are placeholders for the first version and can be updated in admin or page copy as packages are finalized." />
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {services.map(([title, body, price]) => (
          <article key={title} className="rounded-sm border border-white/10 bg-white/[0.04] p-6">
            <p className="eyebrow">{price}</p>
            <h2 className="mt-3 text-2xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-white/68">{body}</p>
          </article>
        ))}
      </div>
      <Button href="/book" className="mt-10">Book a Shoot</Button>
    </section>
  );
}
