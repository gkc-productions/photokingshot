import { Button } from "@/components/Button";
import { PortfolioCard } from "@/components/PortfolioCard";
import { SectionHeading } from "@/components/SectionHeading";
import { prisma } from "@/lib/prisma";
import { placeholderPortfolio, site } from "@/lib/site";

export const dynamic = "force-dynamic";

const services = ["Portraits", "Events", "Graduation", "Church + Community", "Creative Editorial"];

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
              <Button href="/book">Book a Shoot</Button>
              <Button href="/portfolio" variant="secondary">View Portfolio</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-20">
        <SectionHeading eyebrow="Featured services" title="Clean direction, bold images, reliable delivery." />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {services.map((service) => (
            <div key={service} className="rounded-sm border border-white/10 bg-white/[0.04] p-5">
              <p className="text-lg font-black">{service}</p>
              <p className="mt-3 text-sm leading-6 text-white/62">Premium coverage tailored to your story, space, and final use.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.03] py-20">
        <div className="section-shell">
          <SectionHeading eyebrow="Portfolio preview" title="A sharp first look at the PhotoKingShot style." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {portfolio.map((item) => <PortfolioCard key={item.title} {...item} />)}
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-5 py-20 md:grid-cols-3">
        {[
          ["Client Galleries", "Secure online delivery for edited galleries.", "/galleries"],
          ["Gear + Blog", "Photography tools, behind-the-scenes notes, and affiliate gear picks.", "/gear"],
          ["Ready to Shoot?", "Tell us what you are planning and we will shape the session.", "/book"]
        ].map(([title, body, href]) => (
          <div key={title} className="photo-sheen rounded-sm border border-white/10 p-7">
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="mt-3 min-h-14 text-white/68">{body}</p>
            <Button href={href} className="mt-6">Open</Button>
          </div>
        ))}
      </section>
    </>
  );
}
