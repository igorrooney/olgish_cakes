/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["cdn.sanity.io"],
  },
  transpilePackages: ["@sanity/ui", "@sanity/icons", "@sanity/vision", "sanity"],
  // Disable telemetry and tracing during build
  telemetry: false,
  experimental: {
    // Disable trace profiling which can cause permission issues
    profiling: false,
  },
};

module.exports = nextConfig;
