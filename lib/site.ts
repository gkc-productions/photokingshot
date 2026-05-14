export const site = {
  name: "PhotoKingShot",
  parent: "GKC Productions",
  fullName: "PhotoKingShot by GKC Productions",
  domain: "photokingshot.com",
  galleryDomain: "gallery.photokingshot.com",
  email: "admin@photokingshot.com",
  contactEmail: process.env.ADMIN_EMAIL || "admin@photokingshot.com",
  city: "Atlanta",
  logo: {
    fullDark: "/brand/photokingshot-logo-full-dark.svg",
    fullLight: "/brand/photokingshot-logo-full-light.svg",
    markGold: "/brand/photokingshot-mark-gold.svg",
    markWhite: "/brand/photokingshot-mark-white.svg",
    wordmarkDark: "/brand/photokingshot-wordmark-dark.svg",
    wordmarkLight: "/brand/photokingshot-wordmark-light.svg",
    favicon: "/favicon.svg"
  }
};

export const serviceOptions = [
  "Portrait photography",
  "Event photography",
  "Graduation shoots",
  "Church/community events",
  "Creative/editorial shoots"
];

export const placeholderPortfolio = [
  {
    title: "Westside Portrait Session",
    category: "Portraits",
    imageUrl: "visual:portraits",
    description: "Confident portraits with clean direction, rich contrast, and an Atlanta city feel."
  },
  {
    title: "Community Celebration Coverage",
    category: "Events",
    imageUrl: "visual:events",
    description: "Candid coverage that catches arrivals, atmosphere, details, and the moments people talk about later."
  },
  {
    title: "Graduation Milestone Shoot",
    category: "Graduation",
    imageUrl: "visual:graduation",
    description: "Polished cap-and-gown images built for family, announcements, and a proud next chapter."
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
