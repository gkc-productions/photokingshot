import type { Metadata } from "next";

export const site = {
  name: "PhotoKingShot",
  parent: "GKC Productions",
  fullName: "PhotoKingShot by GKC Productions",
  domain: "photokingshot.com",
  url: "https://photokingshot.com",
  galleryDomain: "gallery.photokingshot.com",
  email: "admin@photokingshot.com",
  contactEmail: process.env.ADMIN_EMAIL || "admin@photokingshot.com",
  city: "Atlanta",
  logo: {
    fullDark: "/brand/photokingshot-logo-full-dark.png",
    fullLight: "/brand/photokingshot-logo-full-light-v2.png",
    markGold: "/brand/photokingshot-mark-gold.png",
    markWhite: "/brand/photokingshot-mark-white.png",
    wordmarkDark: "/brand/photokingshot-wordmark-dark.png",
    wordmarkLight: "/brand/photokingshot-wordmark-light-v2.png",
    favicon: "/favicon.png"
  }
};

export const seoImage = {
  url: "/brand/photokingshot-logo-full-dark.png",
  alt: "PhotoKingShot by GKC Productions"
};

type SeoMetadataInput = {
  title: string;
  description: string;
  path?: string;
};

export function createSeoMetadata({ title, description, path = "/" }: SeoMetadataInput): Metadata {
  const url = new URL(path, site.url).toString();

  return {
    title: title === site.fullName ? { absolute: title } : title,
    description,
    alternates: {
      canonical: path
    },
    openGraph: {
      title: title === site.fullName ? title : `${title} | ${site.name}`,
      description,
      url,
      siteName: site.fullName,
      images: [seoImage],
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title: title === site.fullName ? title : `${title} | ${site.name}`,
      description,
      images: [seoImage.url]
    }
  };
}

export const serviceOptions = [
  "Graduation shoots",
  "Birthday photos",
  "Church/community events",
  "Family/couple portraits",
  "Event photography",
  "Creative/editorial shoots"
];

export const fallbackPortfolio = [
  {
    title: "Atlanta Graduation Portraits",
    category: "Graduation",
    imageUrl: "visual:portraits",
    description: "Cap-and-gown portraits with confident direction, clean editing, and room for family moments."
  },
  {
    title: "Birthday Celebration Coverage",
    category: "Events",
    imageUrl: "visual:events",
    description: "Candid and posed coverage for milestone birthdays, dinner parties, and celebration details."
  },
  {
    title: "Family Portrait Session",
    category: "Portraits",
    imageUrl: "visual:graduation",
    description: "Warm portraits with natural connection, thoughtful posing, and polished final delivery."
  },
  {
    title: "Church Anniversary Moments",
    category: "Church/Community",
    imageUrl: "visual:community",
    description: "Respectful storytelling for worship, outreach, ministry milestones, and community gatherings."
  },
  {
    title: "Editorial Brand Set",
    category: "Creative",
    imageUrl: "visual:creative",
    description: "Bold creative sets for artists, entrepreneurs, and campaigns that need a sharper visual voice."
  }
];
