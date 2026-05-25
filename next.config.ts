import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Strict Mode runs extra checks in development.
  // It highlights potential problems early — like double-invoking
  // functions to detect side effects. Only active during development.
  reactStrictMode: true,

  // Image optimization settings.
  // By default, Next.js blocks external images for security.
  // This allows images from any HTTPS source.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // ** means 'any hostname'
      },
    ],
  },
};

export default nextConfig;
