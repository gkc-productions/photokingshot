import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { seoImage, site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.fullName,
    template: "%s | PhotoKingShot"
  },
  description: "Atlanta photographer for graduation photography, birthday photography, event photography, family portraits, and private client galleries.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: site.fullName,
    description: "Atlanta photographer for graduations, birthdays, events, portraits, and private online gallery delivery.",
    url: site.url,
    siteName: site.fullName,
    images: [seoImage],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: site.fullName,
    description: "Atlanta photography with clean editing, confident direction, and private client galleries.",
    images: [seoImage.url]
  },
  icons: {
    icon: site.logo.favicon,
    shortcut: site.logo.favicon,
    apple: "/apple-touch-icon.png"
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
