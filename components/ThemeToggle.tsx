"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

const options = [
  ["light", "Light"],
  ["dark", "Dark"],
  ["system", "Auto"]
] as const;

function ThemeIcon({ value }: { value: string }) {
  if (value === "light") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }

  if (value === "dark") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a7 7 0 1 0 11 11Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <path d="M8 21h8M12 16v5" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!mounted) {
    return (
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-[var(--border)] bg-[var(--card)] text-[var(--muted)]" aria-label="Theme mode loading">
        <ThemeIcon value="system" />
      </div>
    );
  }

  const currentTheme = theme || "system";
  const currentLabel = options.find(([value]) => value === currentTheme)?.[1] || "Auto";

  return (
    <div ref={menuRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
        aria-label={`Change color theme. Current: ${currentLabel}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <ThemeIcon value={currentTheme} />
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-36 rounded-sm border border-[var(--border)] bg-[var(--card)] p-1 text-sm shadow-2xl shadow-black/20" role="menu" aria-label="Color theme">
          {options.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setTheme(value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left font-bold transition ${
                currentTheme === value ? "bg-[var(--gold)] text-[var(--gold-foreground)]" : "text-[var(--muted)] hover:bg-[var(--card-strong)] hover:text-[var(--foreground)]"
              }`}
              role="menuitem"
            >
              <ThemeIcon value={value} />
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
