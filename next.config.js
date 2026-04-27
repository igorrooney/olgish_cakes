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
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
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
    optimizePackageImports: ["framer-motion"],
    // Enable new performance optimizations
    optimizeServerReact: true,
    // Enable modern JavaScript features
    esmExternals: true,
    // Performance optimizations
    webVitalsAttribution: ["CLS", "LCP", "FCP", "FID", "TTFB"],
  },
  // Server external packages (moved from experimental in Next.js 16)
  // Removed @sanity/client to avoid version mismatch warnings in Studio
  serverExternalPackages: [],
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.sanity.io https://cdn.kiprotect.com https://*.googletagmanager.com https://*.google-analytics.com https://vercel.live https://va.vercel-scripts.com https://*.clarity.ms",
              // unsafe-inline required for Google Fonts and Sanity Studio styles
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.kiprotect.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://cdn.sanity.io https://*.sanity.io wss://*.sanity.io wss://*.api.sanity.io https://*.google-analytics.com https://*.googletagmanager.com https://vercel.live wss://vercel.live https://va.vercel-scripts.com https://*.clarity.ms https://c.bing.com",
              "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://*.googletagmanager.com https://vercel.live",
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
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
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
      // Catalog API payloads remain cacheable but should never be indexed
      {
        source: "/api/catalog/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      // Non-cacheable API routes
      {
        source: "/api/admin/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/orders/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/revalidate",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/merchant-center/revalidate",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/merchant-center/test",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/merchant-center/validate",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/backup-(.*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/contact",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/quote",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/custom-cake-enquiry",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/test-sanity-write",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/test-email",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/csrf-token",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/api/search",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
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
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      config.optimization.mergeDuplicateChunks = true;
      config.optimization.removeAvailableModules = true;
      config.optimization.removeEmptyChunks = true;
      config.optimization.providedExports = true;

      config.resolve.symlinks = false;
      config.resolve.cacheWithContext = false;
    }

    // Optimize CSS
    if (!dev) {
      config.optimization.minimize = true;
    }

    return config;
  },
  // Enhanced redirects for SEO
  async redirects() {
    const createRedirects = (sources, destination) =>
      sources.map((source) => ({
        source,
        destination,
        permanent: true,
      }));

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
        destination: "/get-custom-quote",
        permanent: true,
      },
      {
        source: "/gift-hampers/:slug",
        destination: "/cakes-by-post/:slug",
        permanent: true,
      },
      {
        source: "/honey-cake",
        destination: "/cakes/honey-cake",
        permanent: true,
      },
      {
        source: "/honey-cake-near-me",
        destination: "/blog/medovik-honey-cake-near-me-guide",
        permanent: true,
      },
      {
        source: "/ukrainian-cake",
        destination: "/blog/ukrainian-cakes-guide",
        permanent: true,
      },
      {
        source: "/cake-delivery-leeds",
        destination: "/blog/cake-delivery-leeds-guide",
        permanent: true,
      },
      {
        source: "/nut-free-cakes-leeds",
        destination: "/blog/nut-free-cakes-leeds-guide",
        permanent: true,
      },
      {
        source: "/cake-preservation",
        destination: "/blog/cake-storage-and-preservation-guide",
        permanent: true,
      },
      {
        source: "/cake-size-guide",
        destination: "/blog/cake-size-and-portions-guide",
        permanent: true,
      },
      {
        source: "/custom-cake-enquiry",
        destination: "/get-custom-quote",
        permanent: true,
      },
      {
        source: "/learn/articles",
        destination: "/blog",
        permanent: true,
      },
      ...createRedirects(
        [
          "/market-schedule",
          "/reviews-awards",
          "/about",
          "/accessibility",
          "/customer-stories"
        ],
        "/"
      ),
      ...createRedirects(["/allergen-information"], "/allergens"),
      ...createRedirects(["/faq"], "/faqs"),
      ...createRedirects(["/custom-cake-design"], "/custom-cakes"),
      ...createRedirects(["/delivery-areas", "/return-policy"], "/delivery"),
      ...createRedirects(
        [
          "/buy-cake",
          "/cake-gallery",
          "/cake-in-leeds",
          "/cake-photography",
          "/cakes-bradford",
          "/cakes-halifax",
          "/cakes-huddersfield",
          "/cakes-ilkley",
          "/cakes-leeds",
          "/cakes-otley",
          "/cakes-pudsey",
          "/cakes-skipton",
          "/cakes-wakefield",
          "/cakes-york",
          "/gift-cards",
          "/seasonal-cakes",
          "/cake-delivery",
          "/cake-tasting-sessions",
          "/charity-events",
          "/christmas-cakes-leeds",
          "/dairy-free-cakes-leeds",
          "/easter-cakes-leeds",
          "/egg-free-cakes-leeds",
          "/father-day-cakes-leeds",
          "/gluten-friendly-ukrainian-cakes",
          "/gluten-friendly-wedding-cakes-leeds",
          "/graduation-cakes-leeds",
            "/halloween-cakes-leeds",
            "/mother-day-cakes-leeds",
            "/retirement-cakes-leeds",
            "/celebration-cakes",
            "/search",
            "/valentines-cakes-leeds",
            "/vegan-cakes-leeds",
            "/vegan-wedding-cakes-leeds",
          "/wakefield-wedding-cakes",
          "/wedding-cake-gallery",
        ],
        "/cakes"
      ),
      ...createRedirects(["/order", "/order/leeds", "/cake-pricing"], "/get-custom-quote"),
      {
        source: "/gift-hampers/:slug",
        destination: "/cakes-by-post/:slug",
        permanent: true,
      },
      ...createRedirects(
        ["/gift-hampers", "/cake-by-post-service", "/cake-postal-delivery"],
        "/cakes-by-post"
      ),
      ...createRedirects(
        [
          "/best-cakes-for-birthdays",
          "/best-cakes-for-weddings",
          "/best-cakes-leeds",
          "/birthday-cake-gallery",
          "/cake-care-storage",
          "/cake-decorating-services",
          "/cake-flavor-guide",
          "/cake-flavors",
          "/cake-shipping",
          "/cake-sizes-guide",
          "/honey-cake-history",
          "/honey-cake-vs-kyiv-cake",
          "/how-to-make-honey-cake",
          "/how-to-order",
          "/leeds-bakery",
          "/testimonials",
          "/ukrainian-bakery-leeds",
          "/ukrainian-baking-classes",
          "/ukrainian-baking-traditions",
          "/ukrainian-cake-recipes",
          "/ukrainian-cake-vs-british-cake",
          "/ukrainian-celebrations",
          "/ukrainian-christmas-traditions",
          "/ukrainian-community-leeds",
          "/ukrainian-culture-baking",
          "/ukrainian-wedding-traditions",
          "/ultimate-ukrainian-cake-guide",
        ],
        "/blog"
      ),
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

