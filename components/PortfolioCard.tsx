"use client";

import { useState } from "react";
import { clsx } from "clsx";

type PortfolioCardProps = {
  title: string;
  category: string;
  imageUrl?: string;
  description: string;
};

const tones: Record<string, string> = {
  Portraits: "from-[#d6a83f]/45 via-[#2b2b2b] to-black",
  Events: "from-[#8f6a1f]/50 via-[#181818] to-[#030303]",
  Graduation: "from-white/20 via-[#d6a83f]/35 to-black",
  "Church/Community": "from-[#d6a83f]/35 via-[#302814] to-[#050505]",
  Creative: "from-[#f0d174]/35 via-[#121212] to-[#3b2b05]"
};

function VisualFallback({ title, category }: { title: string; category: string }) {
  return (
    <div className={clsx("relative flex h-full w-full items-end overflow-hidden bg-gradient-to-br", tones[category] || tones.Creative)}>
      <div className="absolute left-5 top-5 h-24 w-16 border border-white/30" />
      <div className="absolute right-6 top-10 h-20 w-20 rounded-full border border-[#d6a83f]/40" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/45 to-transparent" />
      <div className="relative p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f4d98d]">{category}</p>
        <p className="mt-2 max-w-[12rem] text-2xl font-black leading-none text-white">{title}</p>
      </div>
    </div>
  );
}

export function PortfolioCard({ title, category, imageUrl, description }: PortfolioCardProps) {
  const [failed, setFailed] = useState(false);
  const canUseImage = Boolean(imageUrl && !imageUrl.startsWith("visual:") && !failed);

  return (
    <article className="surface-card group overflow-hidden rounded-sm">
      <div className="aspect-[4/5] overflow-hidden bg-neutral-900">
        {canUseImage ? (
          <img
            src={imageUrl}
            alt={title}
            onError={() => setFailed(true)}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <VisualFallback title={title} category={category} />
        )}
      </div>
      <div className="p-4">
        <p className="eyebrow">{category}</p>
        <h3 className="mt-2 text-xl font-black">{title}</h3>
        <p className="muted-copy mt-2 text-sm leading-6">{description}</p>
      </div>
    </article>
  );
}
