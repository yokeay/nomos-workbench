import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['localhost:3000', '128.140.80.71', '49.12.243.33'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '128.140.80.71'],
    },
  },
  serverExternalPackages: ['better-sqlite3'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      const origExternals = config.externals;
      config.externals = [
        ...(Array.isArray(origExternals) ? origExternals : typeof origExternals === 'function' ? [origExternals] : []),
        'better-sqlite3',
      ];
    }
    return config;
  },
};

export default nextConfig;
