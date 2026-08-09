import { SITE_URL } from "@/lib/seo";

const structuredData = {
  "@context": "https://schema.org",

  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,

      name: "ASCEND",
      alternateName: "ASCEND AI",

      url: SITE_URL,
      foundingDate: "2026-06",
      email: "ascendaispace@gmail.com",

      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/ascend-navbar-logo.png`,
        contentUrl: `${SITE_URL}/ascend-navbar-logo.png`,
        width: 256,
        height: 256,
        caption: "ASCEND",
      },

      image: {
        "@id": `${SITE_URL}/#logo`,
      },

      description:
        "ASCEND is an operating system for human potential that turns identity, goals and challenges into direction, strategic action and evidence of growth.",

      founder: {
        "@id": `${SITE_URL}/#founder`,
      },

      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        url: `${SITE_URL}/contact`,
        email: "ascendaispace@gmail.com",
        availableLanguage: "English",
      },

      knowsAbout: [
        "Purpose discovery",
        "Personal development",
        "Strategic decision support",
        "Career direction",
        "Opportunity discovery",
        "Goal setting",
      ],

      sameAs: [
        "https://x.com/Ascendai_space",
      ],
    },

    {
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,

      name: "Chukwudumebi Orakwue",

      url: `${SITE_URL}/about#leadership`,

      jobTitle: "Founder & CEO",

      worksFor: {
        "@id": `${SITE_URL}/#organization`,
      },

      sameAs: [
        "https://www.linkedin.com/in/chukwudumebi-orakwue-198230419/",
      ],
    },

    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,

      name: "ASCEND",
      alternateName: "ASCEND AI",

      url: SITE_URL,

      description:
        "ASCEND is an operating system for human potential that helps people turn uncertainty into direction, action and meaningful growth.",

      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },

      inLanguage: "en",

      potentialAction: {
        "@type": "RegisterAction",
        name: "Create an ASCEND account",
        target: `${SITE_URL}/sign-up`,
      },
    },

    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#software`,

      name: "ASCEND",

      url: SITE_URL,

      applicationCategory:
        "LifestyleApplication",

      applicationSubCategory:
        "Personal Development and Strategic Guidance",

      operatingSystem: "Web",

      browserRequirements:
        "Requires a modern web browser and internet connection.",

      description:
        "ASCEND helps people discover their purpose, define their North Star, receive strategic missions, evaluate relevant opportunities and build meaningful momentum toward their highest potential.",

      featureList: [
        "Purpose and identity discovery",
        "North Star direction setting",
        "Strategic daily missions",
        "Atlas decision intelligence",
        "Personalized opportunity discovery",
        "Progress and momentum tracking",
        "Reflection and long-term memory",
        "Support AI",
      ],

      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },

      image: `${SITE_URL}/ascend-opengraph.png`,

      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },

      inLanguage: "en",
    },
  ],
};

export default function AscendStructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(
          structuredData
        ).replace(/</g, "\\u003c"),
      }}
    />
  );
}
