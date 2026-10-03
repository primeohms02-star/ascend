import type {
  NextConfig,
} from "next";

const privateRoutes = [
  "/api/:path*",
  "/dashboard/:path*",
  "/projects/:path*",
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
  async headers() {
    return [{source:"/projects/share/:path*",headers:[{key:"Cache-Control",value:"private, no-store, max-age=0"},{key:"Referrer-Policy",value:"no-referrer"}]}, ...privateRoutes.map(
      (source) => ({
        source,
        headers:
          privateSearchHeaders,
      })
    )];
  },
};

export default nextConfig;
