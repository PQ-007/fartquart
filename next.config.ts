import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["shiki"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
    ],
  },
};

export default nextConfig;
