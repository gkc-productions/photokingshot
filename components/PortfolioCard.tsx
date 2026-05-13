type PortfolioCardProps = {
  title: string;
  category: string;
  imageUrl: string;
  description: string;
};

export function PortfolioCard({ title, category, imageUrl, description }: PortfolioCardProps) {
  return (
    <article className="group overflow-hidden rounded-sm border border-white/10 bg-white/[0.04]">
      <div className="aspect-[4/5] overflow-hidden bg-neutral-900">
        <img src={imageUrl} alt={title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="p-4">
        <p className="eyebrow">{category}</p>
        <h3 className="mt-2 text-xl font-black">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-white/68">{description}</p>
      </div>
    </article>
  );
}
