import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // DB drivers must not be bundled (PGlite ships WASM; pg is native-ish)
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  async redirects() {
    // old dog-walking page moved to the pets section (pets.floby.ru / /pets)
    return [{ source: "/dog-walking", destination: "/pets", permanent: true }];
  },
};

export default nextConfig;
