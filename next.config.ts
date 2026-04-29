import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['localhost:3000', '128.140.80.71'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '128.140.80.71'],
    },
  },
};

export default nextConfig;
