"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { clsx } from "clsx";
import { submitGallerySelections } from "@/app/actions";

export type GalleryLightboxImage = {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  previewUrl: string;
  downloadUrl: string;
  title: string | null;
  caption: string | null;
  canDownload: boolean;
};

type GalleryLightboxProps = {
  images: GalleryLightboxImage[];
  galleryTitle: string;
  galleryId: string;
  downloadAllUrl?: string;
  audioUrl?: string;
  proofing?: {
    enabled: boolean;
    maxSelections: number;
    submittedAt: string | null;
    selectedImageIds: string[];
  };
};

export function GalleryLightbox({ images, galleryTitle, galleryId, downloadAllUrl, audioUrl, proofing }: GalleryLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [slideshow, setSlideshow] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [selectionState, selectionAction, selectionPending] = useActionState(submitGallerySelections, { ok: false, message: "" });
  const [selectedIds, setSelectedIds] = useState(() => new Set(proofing?.selectedImageIds || []));
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const activeImage = activeIndex === null ? null : images[activeIndex];
  const activePosition = activeIndex ?? 0;

  const downloadableCount = useMemo(() => images.filter((image) => image.canDownload).length, [images]);
  const selectionMode = Boolean(proofing?.enabled);
  const submitted = Boolean(proofing?.submittedAt || selectionState.ok);
  const maxSelections = proofing?.maxSelections || 20;
  const selectedCount = selectedIds.size;
  const selectedValue = useMemo(() => Array.from(selectedIds).join(","), [selectedIds]);

  function toggleSelection(imageId: string) {
    if (!selectionMode || submitted) return;
    setSelectedIds((current) => {
      const nextSet = new Set(current);
      if (nextSet.has(imageId)) {
        nextSet.delete(imageId);
        return nextSet;
      }
      if (nextSet.size >= maxSelections) return nextSet;
      nextSet.add(imageId);
      return nextSet;
    });
  }

  function open(index: number) {
    setActiveIndex(index);
  }

  const close = useCallback(() => {
    setActiveIndex(null);
    setSlideshow(false);
  }, []);

  const previous = useCallback(() => {
    setActiveIndex((current) => current === null ? current : (current - 1 + images.length) % images.length);
  }, [images.length]);

  const next = useCallback(() => {
    setActiveIndex((current) => current === null ? current : (current + 1) % images.length);
  }, [images.length]);

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
  }, [activeIndex, close, next, previous]);

  useEffect(() => {
    if (!slideshow || activeIndex === null || images.length < 2) return;
    const timer = window.setInterval(next, 4000);
    return () => window.clearInterval(timer);
  }, [slideshow, activeIndex, images.length, next]);

  useEffect(() => {
    document.body.style.overflow = activeIndex === null ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeIndex]);

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        {selectionMode ? (
          <form action={selectionAction} className="w-full rounded-sm border border-[var(--border)] bg-[var(--card)] p-4">
            <input type="hidden" name="galleryId" value={galleryId} />
            <input type="hidden" name="imageIds" value={selectedValue} />
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-wide text-[var(--gold)]">Select up to {maxSelections} images for editing.</p>
                <p className="muted-copy mt-1 text-sm">{selectedCount} of {maxSelections} selected</p>
                {selectedCount >= maxSelections && !submitted ? <p className="mt-2 text-sm font-semibold text-[var(--gold)]">You can select up to {maxSelections} images for this gallery.</p> : null}
                {submitted ? <p className="mt-2 text-sm font-semibold text-[var(--gold)]">Your selections have been submitted. PhotoKingShot will begin editing your chosen images.</p> : null}
                {selectionState.message && !selectionState.ok ? <p className="mt-2 text-sm font-semibold text-red-300">{selectionState.message}</p> : null}
              </div>
              {!submitted ? (
                <button
                  className="gold-button min-h-11 rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide disabled:opacity-50"
                  disabled={selectionPending || selectedCount === 0}
                  onClick={(event) => {
                    if (!window.confirm("Submit these selections to PhotoKingShot? You will need admin help to change them later.")) {
                      event.preventDefault();
                    }
                  }}
                >
                  {selectionPending ? "Submitting..." : "Submit Selections"}
                </button>
              ) : null}
            </div>
          </form>
        ) : null}
        {downloadAllUrl && downloadableCount ? (
          <div className="flex flex-col gap-2">
            <a href={downloadAllUrl} className="gold-button inline-flex min-h-11 items-center rounded-sm px-5 py-3 text-sm font-black uppercase tracking-wide">
              Download All
            </a>
            <p className="text-xs font-semibold text-[var(--muted)]">Download All may take a moment for large galleries.</p>
          </div>
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

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <figure key={image.id} className={clsx("group relative overflow-hidden rounded-sm bg-black shadow-xl shadow-black/10", selectedIds.has(image.id) && "ring-4 ring-[#d9a93b]")}>
            <button type="button" onClick={() => open(index)} className="relative block aspect-[4/5] w-full text-left" aria-label={`Open ${image.title || galleryTitle}`}>
              <Image src={image.thumbnailUrl} alt={image.title || image.caption || galleryTitle} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" unoptimized className="bg-black object-cover transition duration-500 group-hover:scale-[1.025] group-hover:opacity-90" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                <span className="block text-sm font-black text-white">{image.title || "View image"}</span>
                {image.caption ? <span className="mt-1 block text-xs text-white/70">{image.caption}</span> : null}
              </span>
            </button>
            {selectionMode ? (
              <button type="button" disabled={submitted} onClick={() => toggleSelection(image.id)} className={clsx("absolute right-3 top-3 rounded-sm border px-3 py-2 text-xs font-black uppercase tracking-wide", selectedIds.has(image.id) ? "border-[#d9a93b] bg-[#d9a93b] text-black" : "border-white/30 bg-black/65 text-white hover:border-[#d9a93b]")}>
                {selectedIds.has(image.id) ? "Selected" : "Select"}
              </button>
            ) : null}
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
                <a href={activeImage.downloadUrl} download className="rounded-sm border border-white/20 px-3 py-2 text-xs font-black uppercase tracking-wide text-white hover:border-[#d9a93b] hover:text-[#d9a93b]">
                  Download
                </a>
              ) : null}
              {selectionMode ? (
                <button type="button" disabled={submitted} onClick={() => toggleSelection(activeImage.id)} className={clsx("rounded-sm border px-3 py-2 text-xs font-black uppercase tracking-wide", selectedIds.has(activeImage.id) ? "border-[#d9a93b] bg-[#d9a93b] text-black" : "border-white/20 text-white hover:border-[#d9a93b] hover:text-[#d9a93b]")}>
                  {selectedIds.has(activeImage.id) ? "Deselect" : "Select"}
                </button>
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
            <Image src={activeImage.previewUrl} alt={activeImage.title || activeImage.caption || galleryTitle} fill sizes="100vw" unoptimized className="object-contain shadow-2xl shadow-black" />
          </div>

          <div className="border-t border-white/10 px-4 py-4">
            <div className="mx-auto max-w-5xl">
              {activeImage.title ? <h2 className="text-lg font-black">{activeImage.title}</h2> : null}
              {activeImage.caption ? <p className="mt-1 text-sm text-white/70">{activeImage.caption}</p> : null}
              {selectionMode ? <p className="mt-2 text-sm font-bold text-[#d9a93b]">{selectedCount} of {maxSelections} selected</p> : null}
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
