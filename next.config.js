/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
    domains: ["cdn.sanity.io"],
  },
  transpilePackages: ["@sanity/ui", "@sanity/icons", "@sanity/vision", "sanity"],
  sitemap: {
    hostname: "https://olgishcakes.com", // Replace with your actual domain
    generateRobotsTxt: true,
    robotsTxtOptions: {
      policies: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/studio", "/api"],
        },
      ],
    },
  },
};

module.exports = nextConfig;
