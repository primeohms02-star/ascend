import type { Metadata } from "next";

import { ClerkProvider } from "@clerk/nextjs";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import AscendStructuredData from "@/app/components/AscendStructuredData";
import { NotificationProvider } from "@/app/context/NotificationContext";

import "./globals.css";

const siteUrl = "https://ascendai.space";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:
      "ASCEND | An Operating System for Human Potential",
    template: "%s | ASCEND",
  },

  description:
    "ASCEND helps you discover your purpose, define your North Star, receive strategic missions, evaluate opportunities and build meaningful momentum toward your highest potential.",

  applicationName: "ASCEND",

  keywords: [
    "ASCEND",
    "ASCEND AI",
    "operating system for human potential",
    "personal development platform",
    "purpose discovery",
    "North Star",
    "strategic missions",
    "career direction",
    "career opportunities",
    "opportunity discovery",
    "decision intelligence",
    "personal growth",
    "goal setting",
    "Atlas AI",
    "AI career guidance",
    "scholarships",
    "internships",
    "fellowships",
    "grants",
    "jobs in Africa",
    "opportunities in Nigeria",
    "music opportunities in Africa",
    "music opportunities in Nigeria",
    "African music career development",
    "Afrobeats opportunities",
  ],

  creator: "ASCEND",
  publisher: "ASCEND",

  category: "Technology",

  alternates: {
    canonical: siteUrl,
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
      },
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],

    shortcut: "/favicon.ico",

    apple: [
      {
        url: "/icon.png",
        type: "image/png",
      },
    ],
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "ASCEND",

    title:
      "ASCEND | An Operating System for Human Potential",

    description:
      "Turn uncertainty into direction. ASCEND helps you define your North Star, take strategic action, discover relevant opportunities and build evidence of meaningful growth.",

    images: [
      {
        url: "/ascend-opengraph.png",
        width: 1200,
        height: 630,
        alt: "ASCEND — An Operating System for Human Potential",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title:
      "ASCEND | An Operating System for Human Potential",

    description:
      "Turn uncertainty into direction, strategic action and evidence of meaningful growth.",

    images: [
      "/ascend-opengraph.png",
    ],

    creator: "@Ascendai_space",
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  referrer: "origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <AscendStructuredData />

          <NotificationProvider>
            {children}
          </NotificationProvider>

          <Analytics />

          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
