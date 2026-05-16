"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { clsx } from "clsx";

export type GalleryLightboxImage = {
  id: string;
  imageUrl: string;
  title: string | null;
  caption: string | null;
  canDownload: boolean;
};

type GalleryLightboxProps = {
  images: GalleryLightboxImage[];
  galleryTitle: string;
  downloadAllUrl?: string;
  audioUrl?: string;
};

export function GalleryLightbox({ images, galleryTitle, downloadAllUrl, audioUrl }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideshow, setSlideshow] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const activePosition = activeIndex ?? 0;

  const downloadableCount = useMemo(() => images.filter((image) => image.canDownload).length, [images]);

  function open(index: number) {
    setActiveIndex(index);
  }

  function close() {
    setActiveIndex(null);
    setSlideshow(false);
  }

  function previous() {
    setActiveIndex((current) => current === null ? current : (current - 1 + images.length) % images.length);
  }

  function next() {
    setActiveIndex((current) => current === null ? current : (current + 1) % images.length);
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
      return;
    }
    try {
      await audio.play();
      setMusicPlaying(true);
    } catch {
      setMusicPlaying(false);
    }
  }

  useEffect(() => {
    if (activeIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, images.length]);

  useEffect(() => {
    if (!slideshow || activeIndex === null || images.length < 2) return;
    const timer = window.setInterval(next, 4000);
    return () => window.clearInterval(timer);
  }, [slideshow, activeIndex, images.length]);

  useEffect(() => {
    document.body.style.overflow = activeIndex === null ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeIndex]);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {downloadAllUrl && downloadableCount ? (
          <a href={downloadAllUrl} className="gold-button inline-flex min-h-11 items-center rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide">
            Download All
          </a>
        ) : null}
        {audioUrl ? (
          <>
            {/* Use only music you own or royalty-free/licensed music. */}
            <button type="button" onClick={toggleMusic} className="rounded-sm border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)]">
              {musicPlaying ? "Pause Music" : "Play Music"}
            </button>
            <audio ref={audioRef} src={audioUrl} loop preload="none" onEnded={() => setMusicPlaying(false)} />
          </>
        ) : null}
      </div>

      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((image, index) => (
          <figure key={image.id} className="group relative mb-4 break-inside-avoid overflow-hidden rounded-sm bg-black">
            <button type="button" onClick={() => open(index)} className="block w-full text-left" aria-label={`Open ${image.title || galleryTitle}`}>
              <img src={image.imageUrl} alt={image.title || image.caption || galleryTitle} loading="lazy" className="h-auto w-full bg-black object-cover transition duration-500 group-hover:scale-[1.025] group-hover:opacity-90" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                <span className="block text-sm font-black text-white">{image.title || "View image"}</span>
                {image.caption ? <span className="mt-1 block text-xs text-white/70">{image.caption}</span> : null}
              </span>
            </button>
          </figure>
        ))}
      </div>

      {activeImage ? (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/96 text-white"
          role="dialog"
          aria-modal="true"
          aria-label={`${galleryTitle} image preview`}
          onTouchStart={(event) => {
            touchStartX.current = event.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            if (touchStartX.current === null) return;
            const delta = event.changedTouches[0].clientX - touchStartX.current;
            touchStartX.current = null;
            if (Math.abs(delta) < 50) return;
            if (delta > 0) previous();
            else next();
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#d9a93b]">{activePosition + 1} / {images.length}</p>
              <p className="text-sm font-bold text-white/75">{galleryTitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSlideshow((value) => !value)} className={clsx("rounded-sm border px-3 py-2 text-xs font-black uppercase tracking-wide", slideshow ? "border-[#d9a93b] bg-[#d9a93b] text-black" : "border-white/20 text-white hover:border-[#d9a93b] hover:text-[#d9a93b]")}>
                {slideshow ? "Pause" : "Slideshow"}
              </button>
              {activeImage.canDownload ? (
                <a href={activeImage.imageUrl} download className="rounded-sm border border-white/20 px-3 py-2 text-xs font-black uppercase tracking-wide text-white hover:border-[#d9a93b] hover:text-[#d9a93b]">
                  Download
                </a>
              ) : null}
              <button type="button" onClick={close} className="rounded-sm border border-white/20 px-3 py-2 text-xs font-black uppercase tracking-wide text-white hover:border-[#d9a93b] hover:text-[#d9a93b]">
                Close
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 py-4 md:px-16">
            {images.length > 1 ? (
              <>
                <button type="button" onClick={previous} className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-2xl text-white hover:border-[#d9a93b] hover:text-[#d9a93b] md:flex" aria-label="Previous image">
                  ‹
                </button>
                <button type="button" onClick={next} className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-2xl text-white hover:border-[#d9a93b] hover:text-[#d9a93b] md:flex" aria-label="Next image">
                  ›
                </button>
              </>
            ) : null}
            <img src={activeImage.imageUrl} alt={activeImage.title || activeImage.caption || galleryTitle} className="max-h-full max-w-full object-contain shadow-2xl shadow-black" />
          </div>

          <div className="border-t border-white/10 px-4 py-4">
            <div className="mx-auto max-w-5xl">
              {activeImage.title ? <h2 className="text-lg font-black">{activeImage.title}</h2> : null}
              {activeImage.caption ? <p className="mt-1 text-sm text-white/70">{activeImage.caption}</p> : null}
              <div className="mt-3 flex justify-center gap-3 md:hidden">
                <button type="button" onClick={previous} className="rounded-sm border border-white/20 px-4 py-2 text-sm font-bold text-white">Previous</button>
                <button type="button" onClick={next} className="rounded-sm border border-white/20 px-4 py-2 text-sm font-bold text-white">Next</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
