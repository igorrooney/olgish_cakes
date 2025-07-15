#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔍 Starting SEO Monitor for Olgish Cakes...\n");

const successes = [];
const warnings = [];
const errors = [];

// Check for SEO optimizations
function checkSEOOptimizations() {
  console.log("🔍 Checking SEO Optimizations...\n");

  // Check structured data
  const structuredDataFiles = [
    "app/components/StructuredData.tsx",
    "app/cakes/[slug]/page.tsx",
    "app/wedding-cakes/page.tsx",
    "app/birthday-cakes/page.tsx",
  ];

  structuredDataFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("@context") && content.includes("schema.org")) {
        successes.push(`✅ Structured data found in ${file}`);
      } else {
        warnings.push(`⚠️ Consider adding structured data to ${file}`);
      }

      if (content.includes("FAQPage")) {
        successes.push(`✅ FAQ schema found in ${file}`);
      }

      if (content.includes("aggregateRating")) {
        successes.push(`✅ Product ratings found in ${file}`);
      }
    }
  });

  // Check meta tags
  const pageFiles = ["app/cakes/[slug]/page.tsx", "app/page.tsx", "app/wedding-cakes/page.tsx"];

  pageFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("generateMetadata")) {
        successes.push(`✅ Metadata generation found in ${file}`);
      } else {
        warnings.push(`⚠️ Consider adding metadata generation to ${file}`);
      }

      if (content.includes("openGraph")) {
        successes.push(`✅ Open Graph tags found in ${file}`);
      }

      if (content.includes("canonical")) {
        successes.push(`✅ Canonical URLs found in ${file}`);
      }
    }
  });

  // Check image optimization
  const imageFiles = ["app/components/CakeImageGallery.tsx", "app/components/CakeCard.tsx"];

  imageFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("alt=")) {
        successes.push(`✅ Alt text found in ${file}`);
      } else {
        warnings.push(`⚠️ Consider adding alt text to images in ${file}`);
      }

      if (content.includes("sizes=")) {
        successes.push(`✅ Responsive sizes found in ${file}`);
      }

      if (content.includes("placeholder=")) {
        successes.push(`✅ Image placeholders found in ${file}`);
      }
    }
  });
}

// Check performance optimizations
function checkPerformanceOptimizations() {
  console.log("⚡ Checking Performance Optimizations...\n");

  // Check component optimization
  const componentFiles = [
    "app/components/CakeImageGallery.tsx",
    "app/components/CakeCard.tsx",
    "app/cakes/[slug]/CakePageClient.tsx",
  ];

  componentFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("memo(") || content.includes("React.memo")) {
        successes.push(`✅ Component memoization found in ${file}`);
      } else {
        warnings.push(`⚠️ Consider memoizing components in ${file}`);
      }

      if (content.includes("useCallback")) {
        successes.push(`✅ useCallback optimization found in ${file}`);
      }

      if (content.includes("useMemo")) {
        successes.push(`✅ useMemo optimization found in ${file}`);
      }
    }
  });

  // Check Next.js config
  if (fs.existsSync("next.config.js")) {
    const content = fs.readFileSync("next.config.js", "utf8");

    if (content.includes("experimental")) {
      successes.push("✅ Next.js experimental features enabled");
    }

    if (content.includes("optimizePackageImports")) {
      successes.push("✅ Package import optimization enabled");
    }

    if (content.includes("headers")) {
      successes.push("✅ Custom headers configured");
    }
  }
}

// Check accessibility
function checkAccessibility() {
  console.log("♿ Checking Accessibility...\n");

  const componentFiles = [
    "app/components/CakeImageGallery.tsx",
    "app/cakes/[slug]/CakePageClient.tsx",
    "app/components/Header.tsx",
  ];

  componentFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("aria-label=")) {
        successes.push(`✅ ARIA labels found in ${file}`);
      } else {
        warnings.push(`⚠️ Consider adding ARIA labels to ${file}`);
      }

      if (content.includes("role=")) {
        successes.push(`✅ ARIA roles found in ${file}`);
      }

      if (content.includes("alt=")) {
        successes.push(`✅ Alt text found in ${file}`);
      }
    }
  });
}

// Check border radius consistency
function checkBorderRadiusConsistency() {
  console.log("🎨 Checking Border Radius Consistency...\n");

  const files = [
    "app/cakes/[slug]/CakePageClient.tsx",
    "app/components/CakeImageGallery.tsx",
    "lib/theme.ts",
    "lib/ui-components.tsx",
  ];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("35px")) {
        successes.push(`✅ 35px border radius found in ${file}`);
      } else if (content.includes("borderRadius")) {
        warnings.push(`⚠️ Check border radius consistency in ${file}`);
      }
    }
  });
}

// Check analytics tracking
function checkAnalyticsTracking() {
  console.log("📊 Checking Analytics Tracking...\n");

  const files = ["app/cakes/[slug]/CakePageClient.tsx", "types/gtag.d.ts"];

  files.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("gtag")) {
        successes.push(`✅ Analytics tracking found in ${file}`);
      }

      if (content.includes("cake_name")) {
        successes.push(`✅ Product tracking found in ${file}`);
      }

      if (content.includes("load_time")) {
        successes.push(`✅ Performance tracking found in ${file}`);
      }
    }
  });
}

// Generate report
function generateReport() {
  console.log("📋 SEO Monitor Report");
  console.log("=" * 50);
  console.log("");

  if (successes.length > 0) {
    console.log("✅ Successes:");
    successes.forEach(success => console.log(`  ${success}`));
    console.log("");
  }

  if (warnings.length > 0) {
    console.log("⚠️ Warnings:");
    warnings.forEach(warning => console.log(`  ${warning}`));
    console.log("");
  }

  if (errors.length > 0) {
    console.log("❌ Errors:");
    errors.forEach(error => console.log(`  ${error}`));
    console.log("");
  }

  console.log(
    `📊 Summary: ${successes.length} successes, ${warnings.length} warnings, ${errors.length} errors`
  );

  // Calculate SEO score
  const totalChecks = successes.length + warnings.length + errors.length;
  const seoScore = totalChecks > 0 ? Math.round((successes.length / totalChecks) * 100) : 0;

  console.log(`🎯 SEO Score: ${seoScore}%`);

  if (seoScore >= 90) {
    console.log("🌟 Excellent SEO optimization!");
  } else if (seoScore >= 75) {
    console.log("👍 Good SEO optimization");
  } else if (seoScore >= 60) {
    console.log("⚠️ Moderate SEO optimization - consider improvements");
  } else {
    console.log("❌ Poor SEO optimization - immediate attention needed");
  }
}

// Run all checks
checkSEOOptimizations();
checkPerformanceOptimizations();
checkAccessibility();
checkBorderRadiusConsistency();
checkAnalyticsTracking();

// Generate final report
generateReport();
