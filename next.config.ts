import type {
  NextConfig,
} from "next";

const privateRoutes = [
  "/api/:path*",
  "/dashboard/:path*",
  "/onboarding/:path*",
  "/compass/:path*",
  "/atlas/:path*",
  "/mission-control/:path*",
  "/music/pathway/:path*",
  "/opportunities/:path*",
  "/support",
  "/support/admin/:path*",
  "/support/cases/:path*",
  "/sign-in/:path*",
  "/sign-up/:path*",
  "/welcome/:path*",
];

const privateSearchHeaders = [
  {
    key: "X-Robots-Tag",
    value:
      "noindex, nofollow, noarchive, nosnippet",
  },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/work/:path*",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/ascend-work",
        destination: "/roadmap",
        permanent: false,
      },
      {
        source: "/for-organisations",
        destination: "/contact",
        permanent: false,
      },
    ];
  },
  async headers() {
    return privateRoutes.map(
      (source) => ({
        source,
        headers:
          privateSearchHeaders,
      })
    );
  },
};

export default nextConfig;
