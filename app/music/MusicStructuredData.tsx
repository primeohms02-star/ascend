import {
  ORGANIZATION_ID,
  SITE_URL,
  SOFTWARE_ID,
  WEBSITE_ID,
} from "@/lib/seo";

import {
  MUSIC_PAGE_DESCRIPTION,
  MUSIC_PAGE_PATH,
  MUSIC_PAGE_TITLE,
} from "./musicSeo";

const musicUrl =
  `${SITE_URL}${MUSIC_PAGE_PATH}`;

const musicStructuredData = {
  "@context":
    "https://schema.org",

  "@graph": [
    {
      "@type":
        "WebPage",

      "@id":
        `${musicUrl}#webpage`,

      url:
        musicUrl,

      name:
        `${MUSIC_PAGE_TITLE} | ASCEND`,

      description:
        MUSIC_PAGE_DESCRIPTION,

      isPartOf: {
        "@id":
          WEBSITE_ID,
      },

      about: {
        "@id":
          SOFTWARE_ID,
      },

      mainEntity: {
        "@id":
          `${musicUrl}#pathway`,
      },

      publisher: {
        "@id":
          ORGANIZATION_ID,
      },

      breadcrumb: {
        "@id":
          `${musicUrl}#breadcrumb`,
      },

      audience: {
        "@type":
          "Audience",

        audienceType:
          "Artists, producers, songwriters, DJs, managers, engineers, music entrepreneurs and music industry professionals",
      },

      inLanguage:
        "en",
    },

    {
      "@type":
        "Service",

      "@id":
        `${musicUrl}#pathway`,

      name:
        "ASCEND Music",

      alternateName:
        "ASCEND Music Pathway",

      url:
        musicUrl,

      serviceType:
        "Music career direction and opportunity discovery",

      description:
        MUSIC_PAGE_DESCRIPTION,

      provider: {
        "@id":
          ORGANIZATION_ID,
      },

      isRelatedTo: {
        "@id":
          SOFTWARE_ID,
      },

      areaServed: [
        {
          "@type":
            "Country",

          name:
            "Nigeria",
        },
        {
          "@type":
            "Place",

          name:
            "Africa",
        },
        {
          "@type":
            "Place",

          name:
            "Worldwide",
        },
      ],

      audience: {
        "@type":
          "Audience",

        audienceType:
          "Artists and music professionals",
      },
    },

    {
      "@type":
        "BreadcrumbList",

      "@id":
        `${musicUrl}#breadcrumb`,

      itemListElement: [
        {
          "@type":
            "ListItem",

          position:
            1,

          name:
            "ASCEND",

          item:
            SITE_URL,
        },
        {
          "@type":
            "ListItem",

          position:
            2,

          name:
            "ASCEND Music",

          item:
            musicUrl,
        },
      ],
    },
  ],
};

export default function MusicStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html:
          JSON.stringify(
            musicStructuredData
          ).replace(
            /</g,
            "\\u003c"
          ),
      }}
    />
  );
}
