import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This folder sits inside a larger git repo; pin the root so Next doesn't guess.
  turbopack: { root: process.cwd() },
};

export default nextConfig;
