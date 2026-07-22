import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.licdn.com' },
      { protocol: 'https', hostname: 'www.dice.com' },
      { protocol: 'https', hostname: 'www.upwork.com' },
    ],
  },
};

export default nextConfig;
