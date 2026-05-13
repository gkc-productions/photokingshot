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
          ? "bg-[#d6a83f] text-black hover:bg-white"
          : "border border-white/25 text-white hover:border-[#d6a83f] hover:text-[#d6a83f]",
        className
      )}
    >
      {children}
    </Link>
  );
}
