import { Button } from "@/components/Button";
import { PortfolioCard } from "@/components/PortfolioCard";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";
import { createSeoMetadata, fallbackPortfolio, site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = createSeoMetadata({
  title: site.fullName,
  description: "Atlanta photographer for graduation photography, birthday photography, church and event coverage, family portraits, and private client galleries.",
  path: "/"
});

const services = [
  ["Graduation portraits", "Cap-and-gown sessions, campus portraits, family keepsakes, and announcement-ready images."],
  ["Birthday photos", "Clean, celebratory coverage for birthday dinners, parties, studio looks, and milestone moments."],
  ["Church + events", "Respectful coverage for services, anniversaries, outreach, banquets, and community gatherings."],
  ["Family + couples", "Warm portraits with clear direction, natural connection, and polished final edits."],
  ["Creative portraits", "Editorial-style images for artists, entrepreneurs, brands, and personal projects."]
];

const reasons = [
  ["Atlanta aware", "Sessions are shaped around local venues, campuses, neighborhoods, light, and the pace of the day."],
  ["Directed but natural", "You get posing help and production guidance without losing the personality of the moment."],
  ["Fast, clean delivery", "Edited galleries are organized for easy viewing, sharing, downloading, and client use."]
];

export default async function HomePage() {
  const featured = await prisma.portfolioItem.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 4
  }).catch(() => []);
  const portfolio = featured.length ? featured : fallbackPortfolio;

  return (
    <>
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden text-white">
        <div className="absolute inset-0 bg-[#050505]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(217,169,59,0.22),transparent_30%),linear-gradient(110deg,#050505_0%,#050505_48%,rgba(217,169,59,0.18)_100%)]" />
          <div className="absolute right-[-7rem] top-20 hidden aspect-square w-[42rem] rounded-full border border-[#d6a83f]/20 md:block" />
          <div className="absolute right-16 top-1/2 hidden h-64 w-96 -translate-y-1/2 rounded-sm border border-white/10 bg-white/[0.03] shadow-2xl shadow-black/50 lg:block">
            <img src={site.logo.markGold} alt="" className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 opacity-80" />
            <div className="absolute left-8 top-8 h-20 w-14 border border-white/25" />
            <div className="absolute bottom-8 right-8 h-20 w-20 rounded-full border border-[#d6a83f]/35" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/82 to-black/30" />
        </div>
        <div className="section-shell relative flex min-h-[calc(100vh-64px)] items-center py-20">
          <div className="max-w-4xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">{site.fullName}</p>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight text-white md:text-8xl">Atlanta photography with presence, polish, and purpose.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">Graduation portraits, birthday photos, church events, family sessions, and private galleries delivered with clean editing and confident direction.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/booking">Book a Session</Button>
              <Button href="/portfolio" variant="heroOutline">View Portfolio</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <SectionHeading eyebrow="Featured services" title="Clean direction, bold images, reliable delivery." body="PhotoKingShot keeps sessions focused and easy to move through: thoughtful planning, calm direction, clean edits, and galleries ready to share." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {services.map(([service, body]) => (
            <div key={service} className="surface-card rounded-sm p-5 transition hover:border-[var(--gold)]">
              <p className="text-lg font-black">{service}</p>
              <p className="muted-copy mt-3 text-sm leading-6">{body}</p>
            </div>
          ))}
        </div>
        <Button href="/services" variant="secondary" className="mt-8">Explore Services</Button>
      </section>

      <section className="theme-band border-y py-20">
        <div className="section-shell">
          <SectionHeading eyebrow="Portfolio preview" title="Recent work organized by session type." body="Browse graduation portraits, event coverage, family and couple sessions, church moments, and creative portraits in one clean portfolio." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {portfolio.slice(0, 4).map((item) => <PortfolioCard key={item.title} {...item} />)}
          </div>
          <Button href="/portfolio" className="mt-8">View Portfolio</Button>
        </div>
      </section>

      <section className="section-shell py-20">
        <SectionHeading eyebrow="Why PhotoKingShot" title="Professional work that still feels personal." body="The images are polished, but the process stays warm and straightforward. You get clear communication, practical planning, and a photographer who knows how to move between portraits, details, and the room around them." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reasons.map(([title, body]) => (
            <div key={title} className="surface-card rounded-sm p-6">
              <p className="text-4xl font-black text-[var(--gold)]">0{reasons.findIndex(([item]) => item === title) + 1}</p>
              <h2 className="mt-5 text-2xl font-black">{title}</h2>
              <p className="muted-copy mt-3 leading-7">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell grid gap-5 pb-20 md:grid-cols-3">
        {[
          ["Client Galleries", "Private galleries make it easy to view, download, and share your edited images after delivery.", "/galleries", "Access Client Gallery"],
          ["View Portfolio", "See the range of PhotoKingShot work across graduations, portraits, events, and creative sessions.", "/portfolio", "View Portfolio"],
          ["Ready to Book?", "Tell us the date, location, and occasion. PhotoKingShot will help shape the session from there.", "/booking", "Book a Session"]
        ].map(([title, body, href, cta]) => (
          <div key={title} className="photo-sheen rounded-sm border border-[var(--border)] p-7">
            <p className="eyebrow">{href === "/booking" ? "Booking" : title}</p>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="muted-copy mt-3 min-h-14">{body}</p>
            <Button href={href} className="mt-6">{cta}</Button>
          </div>
        ))}
      </section>
    </>
  );
}
