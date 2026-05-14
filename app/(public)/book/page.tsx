import type { Metadata } from "next";
import { BookingForm } from "@/components/BookingForm";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Shoot",
  description: "Submit a PhotoKingShot booking inquiry for Atlanta portraits, events, graduations, church/community events, and creative shoots.",
  alternates: {
    canonical: "/booking"
  },
  openGraph: {
    title: "Book a Shoot | PhotoKingShot",
    description: "Send a booking inquiry to PhotoKingShot by GKC Productions.",
    url: "https://photokingshot.com/booking"
  }
};

export default function BookingPage() {
  return (
    <section className="section-shell grid gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
      <div>
        <SectionHeading eyebrow="Booking" title="Tell us what you are creating." body="Share the essentials and the team will follow up with next steps. Your inquiry is stored for admin review; email notifications can be added after SMTP is configured." />
        <p className="muted-copy mt-6 leading-7">
          Prefer email? Reach PhotoKingShot at{" "}
          <a href={`mailto:${site.contactEmail}`} className="font-semibold text-[var(--gold)] hover:text-[var(--foreground)]">{site.contactEmail}</a>.
        </p>
      </div>
      <BookingForm />
    </section>
  );
}
