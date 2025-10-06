import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    NEXT_PUBLIC_ONLYOFFICE_SERVER_URL: process.env.NEXT_PUBLIC_ONLYOFFICE_SERVER_URL || 'https://onlyofficedocumentserverlatest-production.up.railway.app:8000',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
