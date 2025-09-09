/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Enhanced performance optimizations
  optimizeFonts: true,
  trailingSlash: false,
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@mui/material", "@mui/icons-material", "framer-motion"],
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
    // Enable new performance optimizations
    optimizeServerReact: true,
    serverComponentsExternalPackages: ["@sanity/client"],
    // Enable CSS optimization
    optimizePackageImports: ["@mui/material", "@mui/icons-material", "framer-motion"],
    // Enable modern JavaScript features
    esmExternals: true,
  },
  // Enhanced performance settings
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // SEO and performance headers
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // SEO headers
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
      // Sitemap and robots caching
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
          {
            key: "Content-Type",
            value: "application/xml",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
          {
            key: "Content-Type",
            value: "text/plain",
          },
        ],
      },
    ];
  },
  // Enhanced webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
            reuseExistingChunk: true,
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: "mui",
            chunks: "all",
            priority: 20,
            reuseExistingChunk: true,
          },
          sanity: {
            test: /[\\/]node_modules[\\/]@sanity[\\/]/,
            name: "sanity",
            chunks: "all",
            priority: 15,
            reuseExistingChunk: true,
          },
          icons: {
            test: /[\\/]node_modules[\\/]@mui[\\/]icons-material[\\/]/,
            name: "mui-icons",
            chunks: "all",
            priority: 25,
            reuseExistingChunk: true,
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 5,
            reuseExistingChunk: true,
          },
          // Separate emotion cache
          emotion: {
            test: /[\\/]node_modules[\\/]@emotion[\\/]/,
            name: "emotion",
            chunks: "all",
            priority: 15,
            reuseExistingChunk: true,
          },
        },
      };

      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    // Rely on Next.js built-in Image Optimization instead of custom loaders

    // Optimize CSS
    if (!dev) {
      config.optimization.minimize = true;
    }

    return config;
  },
  // Enhanced redirects for SEO
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/ukrainian-cakes",
        destination: "/cakes",
        permanent: true,
      },
      {
        source: "/honey-cake",
        destination: "/cakes",
        permanent: true,
      },
      {
        source: "/medovik",
        destination: "/cakes",
        permanent: true,
      },
      {
        source: "/order/amp",
        destination: "/order",
        permanent: true,
      },
    ];
  },
  // Note: rely on Next.js app/sitemap.ts for /sitemap.xml
  // Environment variables for SEO
  env: {
    SITE_URL: "https://olgishcakes.co.uk",
    SITE_NAME: "Olgish Cakes",
    SITE_DESCRIPTION: "Authentic Ukrainian honey cakes and traditional desserts in Leeds",
  },
};

export default nextConfig;
