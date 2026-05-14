import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://photokingshot.com"),
  title: {
    default: "PhotoKingShot by GKC Productions",
    template: "%s | PhotoKingShot"
  },
  description: "Premium Atlanta-based portrait, event, graduation, church, community, and creative photography by GKC Productions.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "PhotoKingShot by GKC Productions",
    description: "Premium Atlanta-based photography with a bold, modern eye.",
    url: "https://photokingshot.com",
    siteName: "PhotoKingShot",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "PhotoKingShot by GKC Productions",
    description: "Premium Atlanta-based photography with a bold, modern eye."
  },
  icons: {
    icon: site.logo.favicon,
    shortcut: site.logo.favicon,
    apple: "/apple-touch-icon.svg"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
