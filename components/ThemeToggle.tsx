"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const options = [
  ["light", "Light"],
  ["dark", "Dark"],
  ["system", "Auto"]
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="inline-flex rounded-sm border border-[var(--border)] bg-[var(--card)] p-1" aria-label="Theme mode loading">
        <span className="min-h-8 rounded-sm bg-[var(--gold)] px-3 py-2 text-xs font-black uppercase tracking-wide text-[var(--gold-foreground)]">Auto</span>
      </div>
    );
  }

  return (
    <div className="inline-flex rounded-sm border border-[var(--border)] bg-[var(--card)] p-1" aria-label="Theme mode">
      {options.map(([value, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={`min-h-8 rounded-sm px-3 text-xs font-black uppercase tracking-wide transition ${
            (theme || "system") === value ? "bg-[var(--gold)] text-[var(--gold-foreground)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
