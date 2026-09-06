import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/dashboard/site", destination: "/dashboard/settings", permanent: false },
      { source: "/dashboard/navigation", destination: "/dashboard/navbar", permanent: false },
      { source: "/dashboard/blog", destination: "/dashboard/blogs", permanent: false },
      { source: "/dashboard/social", destination: "/dashboard/social-links", permanent: false },
    ];
  },
};

export default nextConfig;
