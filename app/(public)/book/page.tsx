import type { Metadata } from "next";
import { BookingForm } from "@/components/BookingForm";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Session",
  description: "Submit a PhotoKingShot booking inquiry for Atlanta graduation portraits, birthday photos, church and event coverage, family sessions, and creative shoots.",
  alternates: {
    canonical: "/booking"
  },
  openGraph: {
    title: "Book a Session | PhotoKingShot",
    description: "Send a booking inquiry for a polished Atlanta photography session with PhotoKingShot.",
    url: "https://photokingshot.com/booking"
  }
};

export default function BookingPage() {
  return (
    <section className="section-shell grid gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
      <div>
        <SectionHeading eyebrow="Booking" title="Tell us what you want photographed." body="Share the occasion, date, location, and the look you have in mind. PhotoKingShot will follow up with availability, next steps, and the best fit for your session." />
        <p className="muted-copy mt-6 leading-7">
          Planning a graduation shoot, birthday celebration, church event, family session, or private gallery delivery? Start here, or email{" "}
          <a href={`mailto:${site.contactEmail}`} className="font-semibold text-[var(--gold)] hover:text-[var(--foreground)]">{site.contactEmail}</a>.
        </p>
      </div>
      <BookingForm />
    </section>
  );
}
