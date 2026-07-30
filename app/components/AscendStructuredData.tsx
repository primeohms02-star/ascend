const siteUrl = "https://ascendai.space";

const structuredData = {
  "@context": "https://schema.org",

  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,

      name: "ASCEND",

      url: siteUrl,

      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/icon.png`,
      },

      description:
        "ASCEND is an Operating System for Human Potential.",

      sameAs: [
        "https://x.com/Ascendai_space",
      ],
    },

    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,

      name: "ASCEND",

      url: siteUrl,

      description:
        "An Operating System for Human Potential.",

      publisher: {
        "@id": `${siteUrl}/#organization`,
      },

      inLanguage: "en",
    },

    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,

      name: "ASCEND",

      url: siteUrl,

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
        "@id": `${siteUrl}/#organization`,
      },

      image: `${siteUrl}/icon.png`,

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