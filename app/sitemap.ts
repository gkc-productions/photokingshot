import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

const publicRoutes = [
  "/",
  "/services",
  "/portfolio",
  "/booking",
  "/book",
  "/galleries",
  "/about",
  "/pricing",
  "/privacy-policy",
  "/affiliate-disclosure"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: new URL(route, site.url).toString(),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : route === "/booking" ? 0.9 : 0.7
  }));
}
