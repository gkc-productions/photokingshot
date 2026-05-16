import type { Metadata } from "next";
import Link from "next/link";
import { GalleryLoginForm } from "@/components/GalleryLoginForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Client Galleries",
  description: "Private PhotoKingShot client gallery login for edited session images.",
  alternates: {
    canonical: "/galleries"
  },
  openGraph: {
    title: "Client Galleries | PhotoKingShot",
    description: "Private PhotoKingShot client gallery login for edited session images.",
    url: "https://photokingshot.com/galleries"
  }
};

export default async function GalleriesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const accessMessage = params.error === "login-required"
    ? "Please enter your gallery code and password before viewing that gallery."
    : params.error === "not-found"
      ? "That gallery is not available yet. Check your link or contact PhotoKingShot."
      : "";

  return (
    <section className="section-shell grid gap-10 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
      <div className="flex flex-col justify-center">
        <p className="eyebrow">Private client galleries</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-[var(--foreground)] md:text-6xl">View your edited PhotoKingShot images.</h1>
        <p className="muted-copy mt-5 max-w-2xl text-lg leading-8">
          Client galleries are private. Enter the gallery code and password provided by PhotoKingShot to view your edited images.
        </p>
        <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
          If you do not have your gallery login, contact{" "}
          <a href={`mailto:${site.contactEmail}`} className="font-bold text-[var(--gold)] hover:text-[var(--foreground)]">{site.contactEmail}</a>{" "}
          with your full name and session date.
        </p>
        <div className="mt-8">
          <Link href="/booking" className="inline-flex min-h-11 items-center justify-center rounded-sm border border-[var(--border)] px-5 py-3 text-sm font-bold uppercase tracking-wide text-[var(--foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)]">
            Book a New Shoot
          </Link>
        </div>
      </div>
      <div>
        {accessMessage ? <p className="mb-4 rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 dark:text-red-100">{accessMessage}</p> : null}
        <GalleryLoginForm />
        <p className="gold-notice mt-5 rounded-sm p-4 text-sm">Your gallery link will be sent after your session is edited.</p>
      </div>
    </section>
  );
}
