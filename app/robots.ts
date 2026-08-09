import type {
  MetadataRoute,
} from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",

        allow: "/",

        disallow: [
          "/api/",
          "/dashboard",
          "/onboarding",
          "/compass",
          "/atlas$",
          "/atlas/",
          "/mission-control",
          "/music",
          "/support/admin",
          "/support/cases/",
          "/sign-in",
          "/sign-up",
          "/welcome",
          "/opportunities/",
        ],
      },
    ],

    sitemap:
      `${SITE_URL}/sitemap.xml`,

    host: SITE_URL,
  };
}
