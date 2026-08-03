import type {
  MetadataRoute,
} from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    "https://ascendai.space";

  return {
    rules: [
      {
        userAgent: "*",

        allow: [
          "/",
          "/support",
          "/opportunities",
        ],

        disallow: [
          "/api/",
          "/dashboard",
          "/onboarding",
          "/compass",
          "/atlas",
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
      `${siteUrl}/sitemap.xml`,

    host: siteUrl,
  };
}
