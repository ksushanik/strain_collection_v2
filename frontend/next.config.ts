import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.imagekit.io' },
      { protocol: 'https', hostname: 'ik.imagekit.io' },
    ],
  },
};

export default nextConfig;
