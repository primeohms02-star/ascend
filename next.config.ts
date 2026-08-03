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
  "/music/:path*",
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
