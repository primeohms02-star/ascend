import type { Metadata } from "next";

export const SITE_NAME = "ASCEND";
export const SITE_URL = "https://ascendai.space";

export const SOCIAL_IMAGE_PATH =
  "/ascend-opengraph.png";

export const LOGO_PATH =
  "/ascend-navbar-logo.png";

export const ASCEND_CONTACT_EMAIL =
  "ascendaispace@gmail.com";

export const FOUNDER_NAME =
  "Chukwudumebi Orakwue";

export const FOUNDER_PATH =
  "/founder";

export const FOUNDER_URL =
  `${SITE_URL}${FOUNDER_PATH}`;

export const FOUNDER_LINKEDIN_URL =
  "https://www.linkedin.com/in/chukwudumebi-orakwue-198230419/";

export const ASCEND_LINKEDIN_URL =
  "https://www.linkedin.com/company/ascend-ai-space/";

export const ASCEND_X_URL =
  "https://x.com/Ascendai_space";

export const ASCEND_INSTAGRAM_URL =
  "https://www.instagram.com/ascendai_space/";

export const ASCEND_TIKTOK_URL =
  "https://www.tiktok.com/@ascendai_space";

export const ASCEND_YOUTUBE_URL =
  "https://youtube.com/@ascendai_space";

export const ORGANIZATION_ID =
  `${SITE_URL}/#organization`;

export const WEBSITE_ID =
  `${SITE_URL}/#website`;

export const SOFTWARE_ID =
  `${SITE_URL}/#software`;

export const FOUNDER_ID =
  `${FOUNDER_URL}#person`;

type PublicPageMetadataOptions = {
  title: string;
  description: string;
  path: `/${string}`;
};

export function createPublicPageMetadata({
  title,
  description,
  path,
}: PublicPageMetadataOptions): Metadata {
  const canonical = new URL(
    path,
    SITE_URL
  ).toString();

  const socialTitle =
    `${title} | ${SITE_NAME}`;

  return {
    title,
    description,

    alternates: {
      canonical,
    },

    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title: socialTitle,
      description,

      images: [
        {
          url: SOCIAL_IMAGE_PATH,
          width: 1200,
          height: 630,
          alt:
            "ASCEND — An Operating System for Human Potential",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [
        SOCIAL_IMAGE_PATH,
      ],
      creator:
        "@Ascendai_space",
    },
  };
}