/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  transpilePackages: ["@sanity/ui", "@sanity/icons", "@sanity/vision", "sanity"],
};

module.exports = nextConfig;
