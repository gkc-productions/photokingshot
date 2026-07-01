import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { createSeoMetadata, site } from "@/lib/site";

export const metadata = createSeoMetadata({
  title: "Photo Book Payment Not Completed",
  description: "PhotoKingShot photo book and album payment cancellation page.",
  path: "/photo-book-payment/cancel"
});

export default function PhotoBookPaymentCancelPage() {
  return (
    <section className="section-shell py-16 md:py-24">
      <div className="max-w-3xl">
        <SectionHeading eyebrow="Payment not completed" title="Your photo book payment was not completed." body="No worries. You can contact PhotoKingShot or use a fresh payment link when you are ready to continue." />
        <p className="muted-copy mt-6 leading-7">
          For help with your photo book or album request, email{" "}
          <a href={`mailto:${site.contactEmail}`} className="font-bold text-[var(--gold)] hover:text-[var(--foreground)]">{site.contactEmail}</a>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="mailto:admin@photokingshot.com">Contact PhotoKingShot</Button>
          <Button href="/" variant="secondary">Return Home</Button>
        </div>
      </div>
    </section>
  );
}
