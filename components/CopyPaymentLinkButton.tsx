"use client";

import { useState } from "react";

export function CopyPaymentLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
      className="rounded-sm border border-[var(--border)] px-4 py-3 text-sm font-black hover:border-[var(--gold)] hover:text-[var(--gold)]"
    >
      {copied ? "Copied" : "Copy Payment Link"}
    </button>
  );
}
