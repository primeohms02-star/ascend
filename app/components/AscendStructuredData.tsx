import {
  ASCEND_CONTACT_EMAIL,
  ASCEND_INSTAGRAM_URL,
  ASCEND_LINKEDIN_URL,
  ASCEND_TIKTOK_URL,
  ASCEND_X_URL,
  ASCEND_YOUTUBE_URL,
  FOUNDER_ID,
  FOUNDER_LINKEDIN_URL,
  FOUNDER_NAME,
  FOUNDER_URL,
  LOGO_PATH,
  ORGANIZATION_ID,
  SITE_URL,
  SOFTWARE_ID,
  WEBSITE_ID,
} from "@/lib/seo";

const structuredData = {
  "@context":
    "https://schema.org",

  "@graph": [
    {
      "@type":
        "Organization",

      "@id":
        ORGANIZATION_ID,

      name:
        "ASCEND",

      alternateName:
        "ASCEND AI",

      url:
        SITE_URL,

      foundingDate:
        "2026-06",

      email:
        ASCEND_CONTACT_EMAIL,

      logo: {
        "@type":
          "ImageObject",

        "@id":
          `${SITE_URL}/#logo`,

        url:
          `${SITE_URL}${LOGO_PATH}`,

        contentUrl:
          `${SITE_URL}${LOGO_PATH}`,

        width:
          256,

        height:
          256,

        caption:
          "ASCEND",
      },

      image: {
        "@id":
          `${SITE_URL}/#logo`,
      },

      description:
        "ASCEND is an operating system for human potential that connects purpose, direction, strategic intelligence, meaningful action, opportunity discovery and evidence of growth.",

      founder: {
        "@id":
          FOUNDER_ID,
      },

      contactPoint: {
        "@type":
          "ContactPoint",

        contactType:
          "customer support",

        url:
          `${SITE_URL}/contact`,

        email:
          ASCEND_CONTACT_EMAIL,

        availableLanguage:
          "English",
      },

      knowsAbout: [
        "Purpose discovery",
        "Personal development",
        "Strategic decision support",
        "Career direction",
        "Opportunity discovery",
        "Goal setting",
        "Human potential",
        "Personal growth",
        "Artificial intelligence",
      ],

      sameAs: [
        ASCEND_LINKEDIN_URL,
        ASCEND_X_URL,
        ASCEND_INSTAGRAM_URL,
        ASCEND_TIKTOK_URL,
        ASCEND_YOUTUBE_URL,
      ],
    },

    {
      "@type":
        "Person",

      "@id":
        FOUNDER_ID,

      name:
        FOUNDER_NAME,

      givenName:
        "Chukwudumebi",

      familyName:
        "Orakwue",

      url:
        FOUNDER_URL,

      jobTitle:
        "Founder & Chief Executive Officer",

      description:
        "Chukwudumebi Orakwue is the Founder and Chief Executive Officer of ASCEND, an operating system for human potential.",

      worksFor: {
        "@id":
          ORGANIZATION_ID,
      },

      sameAs: [
        FOUNDER_LINKEDIN_URL,
      ],

      mainEntityOfPage: {
        "@id":
          `${FOUNDER_URL}#profile-page`,
      },
    },

    {
      "@type":
        "WebSite",

      "@id":
        WEBSITE_ID,

      name:
        "ASCEND",

      alternateName:
        "ascendai.space",

      url:
        SITE_URL,

      description:
        "ASCEND is an operating system for human potential that helps people turn uncertainty into direction, strategic action and meaningful growth.",

      publisher: {
        "@id":
          ORGANIZATION_ID,
      },

      inLanguage:
        "en",

      potentialAction: {
        "@type":
          "RegisterAction",

        name:
          "Create an ASCEND account",

        target:
          `${SITE_URL}/sign-up`,
      },
    },

    {
      "@type":
        "WebApplication",

      "@id":
        SOFTWARE_ID,

      name:
        "ASCEND",

      url:
        SITE_URL,

      applicationCategory:
        "LifestyleApplication",

      applicationSubCategory:
        "Personal Development and Strategic Guidance",

      operatingSystem:
        "Web",

      browserRequirements:
        "Requires a modern web browser and internet connection.",

      description:
        "ASCEND helps people discover their purpose, define their North Star, receive strategic missions, evaluate relevant opportunities and build meaningful momentum toward their highest potential.",

      featureList: [
        "Purpose and identity discovery",
        "North Star direction setting",
        "Strategic missions",
        "Atlas strategic intelligence",
        "Personalized opportunity discovery",
        "Atlas Decision support",
        "Progress and momentum tracking",
        "Reflection and long-term memory",
        "ASCEND Music",
        "Support AI",
      ],

      publisher: {
        "@id":
          ORGANIZATION_ID,
      },

      provider: {
        "@id":
          ORGANIZATION_ID,
      },

      image:
        `${SITE_URL}/ascend-opengraph.png`,

      isPartOf: {
        "@id":
          WEBSITE_ID,
      },

      inLanguage:
        "en",
    },
  ],
};

export default function AscendStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html:
          JSON.stringify(
            structuredData
          ).replace(
            /</g,
            "\\u003c"
          ),
      }}
    />
  );
}