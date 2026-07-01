import { BookingForm } from "@/components/BookingForm";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";
import { createSeoMetadata, site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata = createSeoMetadata({
  title: "Book a Session",
  description: "Submit a PhotoKingShot booking inquiry for Atlanta graduation portraits, birthday photos, church and event coverage, family sessions, and creative shoots.",
  path: "/booking"
});

function startOfToday() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

function dateKey(value: Date) {
  return value.toISOString().slice(0, 10);
}

export default async function BookingPage() {
  const availabilityBlocks = await prisma.bookingAvailabilityBlock.findMany({
    where: { date: { gte: startOfToday() } },
    select: { date: true, title: true, isFullDay: true, startTime: true, endTime: true },
    orderBy: { date: "asc" }
  })
    .then((blocks) => blocks.map((block) => ({
      ...block,
      date: dateKey(block.date)
    })))
    .catch(() => []);

  return (
    <section className="section-shell grid gap-10 py-16 md:grid-cols-[0.9fr_1.1fr] md:py-24">
      <div>
        <SectionHeading eyebrow="Booking" title="Tell us what you want photographed." body="Share the occasion, date, location, and the look you have in mind. PhotoKingShot will follow up with availability, next steps, and the best fit for your session." />
        <p className="muted-copy mt-6 leading-7">
          Planning a graduation shoot, birthday celebration, church event, family session, or private gallery delivery? Start here, or email{" "}
          <a href={`mailto:${site.contactEmail}`} className="font-semibold text-[var(--gold)] hover:text-[var(--foreground)]">{site.contactEmail}</a>.
        </p>
      </div>
      <BookingForm availabilityBlocks={availabilityBlocks} />
    </section>
  );
}
