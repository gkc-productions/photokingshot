import { Button } from "@/components/Button";
import { PortfolioCard } from "@/components/PortfolioCard";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";
import { placeholderPortfolio, site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Atlanta Photography",
  description: "PhotoKingShot by GKC Productions creates premium Atlanta portraits, events, graduations, church/community coverage, and creative editorial photography.",
  openGraph: {
    title: "PhotoKingShot by GKC Productions",
    description: "Premium Atlanta photography with bold direction, clean production, and polished online delivery.",
    url: "https://photokingshot.com"
  }
};

const services = [
  ["Portraits", "Personal branding, lifestyle images, and confident individual sessions with strong direction."],
  ["Events", "Coverage for celebrations, launches, conferences, and private gatherings with clean story flow."],
  ["Graduation", "Milestone portraits made for family, announcements, social, and the next chapter."],
  ["Church + Community", "Respectful coverage for ministry moments, outreach, anniversaries, and community days."],
  ["Creative Editorial", "Concept-driven visuals for artists, entrepreneurs, campaigns, and bold personal projects."]
];

const reasons = [
  ["Atlanta aware", "Sessions shaped around the pace, neighborhoods, light, and energy of the city."],
  ["Directed but natural", "Clear posing and production help without making people feel overworked."],
  ["Delivery-minded", "Galleries are organized for sharing, downloading, and real client use."]
];

export default async function HomePage() {
  const featured = await prisma.portfolioItem.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 4
  }).catch(() => []);
  const portfolio = featured.length ? featured : placeholderPortfolio;

  return (
    <>
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1800&q=80" alt="Professional camera on a dark set" className="h-full w-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/78 to-black/20" />
        </div>
        <div className="section-shell relative flex min-h-[calc(100vh-64px)] items-center py-20">
          <div className="max-w-4xl">
            <p className="eyebrow">{site.fullName}</p>
            <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">Atlanta photography with presence, polish, and power.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/72">Portraits, events, graduations, church moments, and creative shoots built with a premium eye and a grounded production process.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/booking">Book a Shoot</Button>
              <Button href="/portfolio" variant="secondary">View Portfolio</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <SectionHeading eyebrow="Featured services" title="Clean direction, bold images, reliable delivery." body="PhotoKingShot keeps the experience focused: strong planning, calm direction on set, and final images with enough polish to represent you well." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {services.map(([service, body]) => (
            <div key={service} className="rounded-sm border border-white/10 bg-white/[0.04] p-5 transition hover:border-[#d6a83f]/60 hover:bg-white/[0.07]">
              <p className="text-lg font-black">{service}</p>
              <p className="mt-3 text-sm leading-6 text-white/62">{body}</p>
            </div>
          ))}
        </div>
        <Button href="/services" variant="secondary" className="mt-8">Explore Services</Button>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] py-20">
        <div className="section-shell">
          <SectionHeading eyebrow="Portfolio preview" title="A sharper visual structure for real work as it is uploaded." body="The portfolio is organized by shoot type now, with clean placeholders that can be replaced through admin as final galleries are added." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {portfolio.slice(0, 4).map((item) => <PortfolioCard key={item.title} {...item} />)}
          </div>
          <Button href="/portfolio" className="mt-8">View Portfolio</Button>
        </div>
      </section>

      <section className="section-shell py-20">
        <SectionHeading eyebrow="Why PhotoKingShot" title="Premium does not have to feel distant." body="The work is polished, but the process stays personal. You get thoughtful planning, clear communication, and a photographer who knows how to move between portraits, moments, and the room around them." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reasons.map(([title, body]) => (
            <div key={title} className="rounded-sm border border-white/10 bg-black p-6">
              <p className="text-4xl font-black text-[#d6a83f]">0{reasons.findIndex(([item]) => item === title) + 1}</p>
              <h2 className="mt-5 text-2xl font-black">{title}</h2>
              <p className="mt-3 leading-7 text-white/65">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell grid gap-5 pb-20 md:grid-cols-3">
        {[
          ["Client Galleries", "Edited galleries are delivered securely online with a clean path for clients to view and download.", "/galleries", "Gallery Delivery"],
          ["Gear + Blog", "Photography tools, session prep notes, and affiliate-compliant gear recommendations.", "/gear", "Resources"],
          ["Ready to Shoot?", "Tell us the date, location, and creative direction. PhotoKingShot will help shape the session.", "/booking", "Booking"]
        ].map(([title, body, href]) => (
          <div key={title} className="photo-sheen rounded-sm border border-white/10 p-7">
            <p className="eyebrow">{href === "/booking" ? "Booking" : title}</p>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="mt-3 min-h-14 text-white/68">{body}</p>
            <Button href={href} className="mt-6">{href === "/booking" ? "Book a Shoot" : "Open"}</Button>
          </div>
        ))}
      </section>
    </>
  );
}
