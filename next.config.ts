import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This folder sits inside a larger git repo; pin the root so Next doesn't guess.
  turbopack: { root: process.cwd() },
  experimental: {
    // Put the (small) stylesheet in the HTML instead of a separate
    // render-blocking request, so text can paint sooner on slow phones.
    inlineCss: true,
  },
};

export default nextConfig;
