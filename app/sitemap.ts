import type {
  MetadataRoute,
} from "next";

import {
  SITE_URL,
} from "@/lib/seo";

export default function sitemap():
  MetadataRoute.Sitemap {
  return [
    {
      url:
        SITE_URL,
      changeFrequency:
        "weekly",
      priority:
        1,
    },

    {
      url:
        `${SITE_URL}/about`,
      changeFrequency:
        "monthly",
      priority:
        0.8,
    },

    {
      url:
        `${SITE_URL}/founder`,
      changeFrequency:
        "monthly",
      priority:
        0.8,
    },

    {
      url:
        `${SITE_URL}/features`,
      changeFrequency:
        "monthly",
      priority:
        0.9,
    },

    {
      url:
        `${SITE_URL}/how-it-works`,
      changeFrequency:
        "monthly",
      priority:
        0.9,
    },

    {
      url:
        `${SITE_URL}/atlas-overview`,
      changeFrequency:
        "monthly",
      priority:
        0.8,
    },

    {
      url:
        `${SITE_URL}/music`,
      changeFrequency:
        "monthly",
      priority:
        0.8,
    },

    {
      url:
        `${SITE_URL}/roadmap`,
      changeFrequency:
        "monthly",
      priority:
        0.6,
    },

    {
      url:
        `${SITE_URL}/faq`,
      changeFrequency:
        "monthly",
      priority:
        0.7,
    },

    {
      url:
        `${SITE_URL}/contact`,
      changeFrequency:
        "monthly",
      priority:
        0.6,
    },

    {
      url:
        `${SITE_URL}/privacy`,
      changeFrequency:
        "yearly",
      priority:
        0.4,
    },

    {
      url:
        `${SITE_URL}/terms`,
      changeFrequency:
        "yearly",
      priority:
        0.4,
    },
  ];
}
