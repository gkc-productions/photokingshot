import Link from "next/link";
import { clsx } from "clsx";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function Button({ href, children, variant = "primary", className }: ButtonProps) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex min-h-11 items-center justify-center rounded-sm px-5 py-3 text-center text-sm font-bold uppercase tracking-wide transition",
        variant === "primary"
          ? "gold-button"
          : "border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--gold)] hover:text-[var(--gold)]",
        className
      )}
    >
      {children}
    </Link>
  );
}
