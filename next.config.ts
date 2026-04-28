import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Enable server actions for better performance
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
};

export default nextConfig;