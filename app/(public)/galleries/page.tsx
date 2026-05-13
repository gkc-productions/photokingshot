import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Client Galleries",
  description: "Secure online client gallery delivery for PhotoKingShot sessions."
};

export default function GalleriesPage() {
  return (
    <section className="section-shell py-16 md:py-24">
      <SectionHeading eyebrow="Client galleries" title="Edited galleries delivered securely online." body={`PhotoKingShot is preparing ${site.galleryDomain} for future hosted galleries and delivery workflows.`} />
      <div className="mt-10 rounded-sm border border-white/10 bg-white/[0.04] p-7">
        <p className="text-xl font-black">Your gallery link will be sent after your session is edited.</p>
        <p className="mt-3 max-w-2xl leading-7 text-white/68">Future Evoto or Instant Gallery links can be connected here once the final gallery workflow is selected.</p>
        <Button href="/book" className="mt-7">Request Gallery Link</Button>
      </div>
    </section>
  );
}
