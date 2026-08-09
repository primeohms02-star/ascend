import type { Metadata } from "next";

import { SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "ASCEND's authenticated workspace for discovering and evaluating relevant opportunities.",
  alternates: {
    canonical: `${SITE_URL}/opportunities`,
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

export default function OpportunitiesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
