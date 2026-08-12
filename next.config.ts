import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/local',
        destination: '/explore?nearby=1',
        permanent: false,
      },
      {
        source: '/agent/apply',
        destination: '/register',
        permanent: false,
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
