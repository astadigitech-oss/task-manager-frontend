import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
};

export default nextConfig;
