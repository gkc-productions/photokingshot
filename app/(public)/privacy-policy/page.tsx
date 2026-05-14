import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for PhotoKingShot by GKC Productions."
};

export default function PrivacyPolicyPage() {
  return (
    <section className="section-shell max-w-3xl py-16 md:py-24">
      <p className="eyebrow">Policy</p>
      <h1 className="mt-4 text-4xl font-black">Privacy Policy</h1>
      <div className="muted-copy mt-8 space-y-5 leading-8">
        <p>PhotoKingShot by GKC Productions collects information submitted through booking forms, including name, email, phone, shoot type, preferred date, location, and message.</p>
        <p>This information is used to respond to inquiries, plan sessions, manage client communication, and improve services. Booking data is stored in the website database and is not sold.</p>
        <p>Affiliate links may direct visitors to third-party websites such as Amazon. Those sites operate under their own privacy policies.</p>
        <p>
          To request an update or deletion of submitted information, contact GKC Productions at{" "}
          <a href={`mailto:${site.contactEmail}`} className="font-semibold text-[var(--gold)] hover:text-[var(--foreground)]">{site.contactEmail}</a>.
        </p>
      </div>
    </section>
  );
}
