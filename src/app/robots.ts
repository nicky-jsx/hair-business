import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Private, token-bearing or account pages should never be indexed.
        disallow: ["/api/", "/booking/", "/stylist/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
