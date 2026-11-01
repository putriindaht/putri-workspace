import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  devIndicators: false,
  // Opt in when preparing a GitHub Pages build; local preview stays at /.
  basePath: process.env.GITHUB_PAGES === "true" ? "/putri-workspace" : "",
};

export default nextConfig;
