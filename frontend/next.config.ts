import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async rewrites() {
    // Proxy API calls in dev so the browser talks same-origin
    const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [{ source: "/api/backend/:path*", destination: `${api}/api/:path*` }];
  },
};

export default nextConfig;
