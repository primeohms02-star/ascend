import type { Metadata } from "next";

export const SITE_NAME = "ASCEND";
export const SITE_URL = "https://ascendai.space";
export const SOCIAL_IMAGE_PATH = "/ascend-opengraph.png";

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
  const canonical = new URL(path, SITE_URL).toString();
  const socialTitle = `${title} | ${SITE_NAME}`;

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
          alt: "ASCEND — An Operating System for Human Potential",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [SOCIAL_IMAGE_PATH],
      creator: "@Ascendai_space",
    },
  };
}
