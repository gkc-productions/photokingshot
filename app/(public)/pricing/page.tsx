import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Photography Packages",
  description: "Explore PhotoKingShot photography packages for Atlanta graduations, birthdays, church programs, events, family portraits, couples, and lifestyle sessions.",
  alternates: {
    canonical: "/pricing"
  },
  openGraph: {
    title: "Photography Packages | PhotoKingShot",
    description: "Request a quote for Atlanta photography packages with clean editing and private online gallery delivery.",
    url: "https://photokingshot.com/pricing"
  }
};

const packages = [
  {
    title: "Graduation Portraits",
    summary: "Polished cap-and-gown portraits for graduates, families, announcements, and the next chapter.",
    details: ["Solo graduation session", "Outfit/location guidance", "Edited digital images", "Private online gallery"]
  },
  {
    title: "Birthday Sessions",
    summary: "Portraits or event coverage for birthday dinners, milestone parties, studio looks, and celebration details.",
    details: ["Birthday portraits or event coverage", "Edited digital images", "Private online gallery", "Download access"]
  },
  {
    title: "Events & Church Programs",
    summary: "Respectful coverage for church events, celebrations, programs, banquets, and community gatherings.",
    details: ["Coverage for church events, celebrations, programs, and community gatherings", "Edited highlights", "Private gallery delivery"]
  },
  {
    title: "Family, Couples & Lifestyle",
    summary: "Warm portrait sessions with clear direction, natural connection, and clean final edits.",
    details: ["Outdoor or indoor portrait session", "Guided posing", "Edited digital images"]
  }
];

export default function PricingPage() {
  return (
    <>
      <section className="section-shell py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-[1fr_0.75fr] md:items-end">
          <SectionHeading
            eyebrow="Pricing"
            title="Photography Packages"
            body="Every session is shaped around the occasion, location, timing, and delivery needs. Review the starting package types below, then send an inquiry for accurate pricing and availability."
          />
          <div className="surface-card rounded-sm p-6">
            <p className="eyebrow">Starting rates</p>
            <h2 className="mt-3 text-2xl font-black">Available upon request.</h2>
            <p className="muted-copy mt-3 leading-7">PhotoKingShot keeps quotes tailored so you are not boxed into a package that does not fit the day.</p>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {packages.map((item) => (
            <article key={item.title} className="surface-card flex flex-col rounded-sm p-6">
              <p className="eyebrow">Request a quote</p>
              <h2 className="mt-3 text-2xl font-black">{item.title}</h2>
              <p className="muted-copy mt-3 leading-7">{item.summary}</p>
              <ul className="mt-6 grid gap-3 text-sm leading-6 text-[var(--foreground)]">
                {item.details.map((detail) => (
                  <li key={detail} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--gold)]" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-6">
                <Button href="/booking" variant="secondary">Request a Quote</Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="theme-band border-y py-16">
        <div className="section-shell grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="eyebrow">Ready when you are</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">Tell PhotoKingShot what you need photographed.</h2>
            <p className="muted-copy mt-4 max-w-3xl leading-7">Share the date, location, occasion, group size, and delivery needs. You will get a clear follow-up with the best fit for your session or event.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <Button href="/booking">Book a Session</Button>
            <Button href={`mailto:${site.contactEmail}`} variant="secondary">Contact PhotoKingShot</Button>
          </div>
        </div>
      </section>
    </>
  );
}
