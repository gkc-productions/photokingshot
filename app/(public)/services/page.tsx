import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Services",
  description: "Portrait, event, graduation, church/community, and creative editorial photography services in Atlanta.",
  alternates: {
    canonical: "/services"
  },
  openGraph: {
    title: "Photography Services | PhotoKingShot",
    description: "Premium Atlanta photography services by PhotoKingShot and GKC Productions.",
    url: "https://photokingshot.com/services"
  }
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
          <article key={title} className="surface-card rounded-sm p-6">
            <p className="eyebrow">{price}</p>
            <h2 className="mt-3 text-2xl font-black">{title}</h2>
            <p className="muted-copy mt-3 leading-7">{body}</p>
          </article>
        ))}
      </div>
      <Button href="/booking" className="mt-10">Book a Shoot</Button>
    </section>
  );
}
