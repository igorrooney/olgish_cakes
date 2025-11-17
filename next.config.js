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
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enhanced performance settings
    // Disable optimization in development to bypass private IP check
    unoptimized: process.env.NODE_ENV === "development",
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Enhanced performance optimizations
  trailingSlash: false,
  // Empty turbopack config to acknowledge webpack config migration in progress
  turbopack: {},
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["@mui/material", "@mui/icons-material", "framer-motion"],
    // Enable new performance optimizations
    optimizeServerReact: true,
    // Enable modern JavaScript features
    esmExternals: true,
    // Performance optimizations
    webVitalsAttribution: ["CLS", "LCP", "FCP", "FID", "TTFB"],
  },
  // Modularize imports for better tree-shaking and HMR support
  modularizeImports: {
    "@mui/icons-material": {
      transform: "@mui/icons-material/{{member}}",
    },
  },
  // Server external packages (moved from experimental in Next.js 16)
  serverExternalPackages: ["@sanity/client"],
  // Enhanced performance settings
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
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // unsafe-eval required for Sanity Studio, unsafe-inline for Google Analytics
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.sanity.io https://*.googletagmanager.com https://*.google-analytics.com https://vercel.live",
              // unsafe-inline required for Google Fonts and Sanity Studio styles
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://cdn.sanity.io https://*.sanity.io https://*.google-analytics.com https://*.googletagmanager.com https://vercel.live wss://vercel.live",
              "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://*.googletagmanager.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          },
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
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
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
          {
            key: "Vary",
            value: "Accept-Encoding",
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
      // API routes caching - reduced for better data freshness
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      // Static assets caching
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
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

      // Enhanced performance optimizations
      config.optimization.mergeDuplicateChunks = true;
      config.optimization.removeAvailableModules = true;
      config.optimization.removeEmptyChunks = true;
      config.optimization.providedExports = true;

      // Optimize module resolution
      config.resolve.symlinks = false;
      config.resolve.cacheWithContext = false;
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
        source: "/medovik",
        destination: "/cakes/honey-cake-medovik",
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
