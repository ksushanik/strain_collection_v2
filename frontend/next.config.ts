import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.imagekit.io' },
      { protocol: 'https', hostname: 'ik.imagekit.io' },
    ],
  },
};

export default withNextIntl(nextConfig);
