import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
  // Fix SSR hydration with framer-motion
  compiler: {
    styledComponents: false,
  },
};

export default nextConfig;
