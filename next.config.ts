import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // DB drivers must not be bundled (PGlite ships WASM; pg is native-ish)
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
};

export default nextConfig;
