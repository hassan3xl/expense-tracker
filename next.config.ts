import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // claoudflare cloud tunnel
  output: "standalone",
  allowedDevOrigins: [
    "api.qstack.com.ng",
    "dev.qstack.com.ng",
    "testing.qstack.com.ng",
  ],
};

export default nextConfig;
