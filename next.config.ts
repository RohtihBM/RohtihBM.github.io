import type { NextConfig } from "next";
import path from "node:path";

// Static export so GitHub Pages can serve it. The site lives at the root of
// <user>.github.io, so no basePath is needed.
const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
