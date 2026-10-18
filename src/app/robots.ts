import type { MetadataRoute } from "next";
import { site } from "@/content/landing";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
