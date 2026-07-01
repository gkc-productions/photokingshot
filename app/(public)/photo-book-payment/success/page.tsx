import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { createSeoMetadata, site } from "@/lib/site";

export const metadata = createSeoMetadata({
  title: "Photo Book Payment Received",
  description: "PhotoKingShot photo book and album payment confirmation.",
  path: "/photo-book-payment/success"
});

export default function PhotoBookPaymentSuccessPage() {
  return (
    <section className="section-shell py-16 md:py-24">
      <div className="max-w-3xl">
        <SectionHeading eyebrow="Payment received" title="Thank you. Your photo book payment was received." body="PhotoKingShot will follow up with design, proofing, and order details for your photo book or album." />
        <p className="muted-copy mt-6 leading-7">
          Payment confirmation is handled securely by Stripe. If you have questions about your album design, reply to your PhotoKingShot email or contact{" "}
          <a href={`mailto:${site.contactEmail}`} className="font-bold text-[var(--gold)] hover:text-[var(--foreground)]">{site.contactEmail}</a>.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/galleries">Access Client Gallery</Button>
          <Button href="/" variant="secondary">Return Home</Button>
        </div>
      </div>
    </section>
  );
}
