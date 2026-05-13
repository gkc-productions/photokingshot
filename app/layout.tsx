import type { Metadata } from "next";
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
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
