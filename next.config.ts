import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_ONLYOFFICE_SERVER_URL: process.env.NEXT_PUBLIC_ONLYOFFICE_SERVER_URL || 'http://localhost:8080',
  },
  /* config options here */
};

export default nextConfig;
