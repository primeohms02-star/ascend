import type { Metadata } from "next";

import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Authenticated account and product support for ASCEND users.",
  alternates: {
    canonical: `${SITE_URL}/support`,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    },
  },
};

export default function SupportLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
