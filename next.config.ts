import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["shiki"],
  // The vault's media is served as static assets from public/, never from the
  // server functions. Keep the 195MB+ out of the function bundles (content.ts's
  // dynamic fs reads otherwise cause the whole project to be traced in).
  outputFileTracingExcludes: {
    "/**": ["content/resources/**", "public/resources/**"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
    ],
  },
};

export default nextConfig;
