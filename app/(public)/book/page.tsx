import type { Metadata } from "next";
import { BookingForm } from "@/components/BookingForm";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "Book a Shoot",
  description: "Submit a PhotoKingShot booking inquiry for portraits, events, graduations, church events, and creative shoots."
};

export default function BookingPage() {
  return (
    <section className="section-shell grid gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
      <div>
        <SectionHeading eyebrow="Booking" title="Tell us what you are creating." body="Share the essentials and the team will follow up with next steps. No email is sent yet; the inquiry is stored securely in the database for admin review." />
      </div>
      <BookingForm />
    </section>
  );
}
