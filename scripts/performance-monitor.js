#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Performance Monitoring Script for Olgish Cakes
console.log("🚀 Starting Performance Monitor for Olgish Cakes...\n");

const performanceIssues = [];
const warnings = [];
const successes = [];

// Check for performance optimizations
function checkPerformanceOptimizations() {
  console.log("📊 Checking Performance Optimizations...\n");

  // Check Next.js config
  const nextConfigPath = "next.config.js";
  if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, "utf8");

    if (nextConfig.includes("compress: true")) {
      successes.push("✅ Compression enabled in Next.js config");
    } else {
      warnings.push("⚠️ Consider enabling compression in Next.js config");
    }

    if (nextConfig.includes("formats: ['image/webp', 'image/avif']")) {
      successes.push("✅ WebP/AVIF image formats enabled");
    } else {
      warnings.push("⚠️ Consider enabling WebP/AVIF image formats");
    }

    if (nextConfig.includes("poweredByHeader: false")) {
      successes.push("✅ Powered by header disabled");
    } else {
      warnings.push("⚠️ Consider disabling powered by header");
    }
  }

  // Check for image optimization
  const imageComponents = [
    "app/components/CakeCard.tsx",
    "app/components/CakeImageGallery.tsx",
    "app/components/PlaceholderImage.tsx",
  ];

  imageComponents.forEach(component => {
    if (fs.existsSync(component)) {
      const content = fs.readFileSync(component, "utf8");

      if (content.includes('placeholder="blur"')) {
        successes.push(`✅ Blur placeholder enabled in ${component}`);
      } else {
        warnings.push(`⚠️ Consider adding blur placeholder to ${component}`);
      }

      if (content.includes("sizes=")) {
        successes.push(`✅ Responsive sizes configured in ${component}`);
      } else {
        warnings.push(`⚠️ Consider adding responsive sizes to ${component}`);
      }

      if (content.includes("alt=") && !content.includes('alt=""')) {
        successes.push(`✅ Alt text configured in ${component}`);
      } else {
        performanceIssues.push(`❌ Missing or empty alt text in ${component}`);
      }
    }
  });

  // Check for lazy loading
  const pages = fs.readdirSync("app").filter(item => {
    const stat = fs.statSync(path.join("app", item));
    return stat.isDirectory() && fs.existsSync(path.join("app", item, "page.tsx"));
  });

  pages.forEach(page => {
    const pagePath = path.join("app", page, "page.tsx");
    const content = fs.readFileSync(pagePath, "utf8");

    if (content.includes("priority=")) {
      successes.push(`✅ Priority loading configured for ${page}`);
    } else if (page === "page.tsx") {
      warnings.push(`⚠️ Consider adding priority loading to homepage`);
    }
  });
}

// Check for SEO optimizations
function checkSEOOptimizations() {
  console.log("🔍 Checking SEO Optimizations...\n");

  // Check metadata
  const pages = fs.readdirSync("app").filter(item => {
    const stat = fs.statSync(path.join("app", item));
    return stat.isDirectory() && fs.existsSync(path.join("app", item, "page.tsx"));
  });

  pages.forEach(page => {
    const pagePath = path.join("app", page, "page.tsx");
    const content = fs.readFileSync(pagePath, "utf8");

    if (content.includes("export const metadata")) {
      successes.push(`✅ Metadata configured for ${page}`);
    } else {
      performanceIssues.push(`❌ Missing metadata export for ${page}`);
    }

    if (content.includes("canonical")) {
      successes.push(`✅ Canonical URL configured for ${page}`);
    } else {
      warnings.push(`⚠️ Consider adding canonical URL to ${page}`);
    }

    if (content.includes("openGraph")) {
      successes.push(`✅ Open Graph configured for ${page}`);
    } else {
      warnings.push(`⚠️ Consider adding Open Graph to ${page}`);
    }
  });

  // Check structured data
  const structuredDataFiles = [
    "app/components/StructuredData.tsx",
    "app/page.tsx",
    "app/faq/page.tsx",
  ];

  structuredDataFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");

      if (content.includes("application/ld+json")) {
        successes.push(`✅ Structured data found in ${file}`);
      } else {
        warnings.push(`⚠️ Consider adding structured data to ${file}`);
      }
    }
  });
}

// Check for accessibility
function checkAccessibility() {
  console.log("♿ Checking Accessibility...\n");

  const components = [
    "app/components/Header.tsx",
    "app/components/Footer.tsx",
    "app/components/CakeCard.tsx",
    "app/components/ContactForm.tsx",
  ];

  components.forEach(component => {
    if (fs.existsSync(component)) {
      const content = fs.readFileSync(component, "utf8");

      if (content.includes("aria-label=") || content.includes("aria-labelledby=")) {
        successes.push(`✅ ARIA labels found in ${component}`);
      } else {
        warnings.push(`⚠️ Consider adding ARIA labels to ${component}`);
      }

      if (content.includes("role=")) {
        successes.push(`✅ ARIA roles found in ${component}`);
      } else {
        warnings.push(`⚠️ Consider adding ARIA roles to ${component}`);
      }
    }
  });
}

// Check for security
function checkSecurity() {
  console.log("🔒 Checking Security...\n");

  // Check for security headers
  const nextConfigPath = "next.config.js";
  if (fs.existsSync(nextConfigPath)) {
    const nextConfig = fs.readFileSync(nextConfigPath, "utf8");

    if (nextConfig.includes("poweredByHeader: false")) {
      successes.push("✅ Powered by header disabled for security");
    } else {
      warnings.push("⚠️ Consider disabling powered by header");
    }
  }

  // Check for environment variables
  const envFiles = [".env.local", ".env.production"];
  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      successes.push(`✅ Environment file found: ${envFile}`);
    } else {
      warnings.push(`⚠️ Consider creating ${envFile} for sensitive data`);
    }
  });
}

// Generate performance report
function generateReport() {
  console.log("📈 Performance Report\n");
  console.log("=".repeat(50));

  if (successes.length > 0) {
    console.log("\n✅ SUCCESSES:");
    successes.forEach(success => console.log(success));
  }

  if (warnings.length > 0) {
    console.log("\n⚠️ WARNINGS:");
    warnings.forEach(warning => console.log(warning));
  }

  if (performanceIssues.length > 0) {
    console.log("\n❌ ISSUES:");
    performanceIssues.forEach(issue => console.log(issue));
  }

  console.log("\n" + "=".repeat(50));
  console.log(`📊 Summary:`);
  console.log(`✅ Successes: ${successes.length}`);
  console.log(`⚠️ Warnings: ${warnings.length}`);
  console.log(`❌ Issues: ${performanceIssues.length}`);

  // Calculate performance score
  const totalChecks = successes.length + warnings.length + performanceIssues.length;
  const score = totalChecks > 0 ? Math.round((successes.length / totalChecks) * 100) : 0;

  console.log(`\n🎯 Performance Score: ${score}%`);

  if (score >= 90) {
    console.log("🌟 Excellent performance!");
  } else if (score >= 70) {
    console.log("👍 Good performance with room for improvement");
  } else if (score >= 50) {
    console.log("⚠️ Moderate performance - needs attention");
  } else {
    console.log("🚨 Poor performance - immediate action required");
  }

  // Recommendations
  if (performanceIssues.length > 0 || warnings.length > 0) {
    console.log("\n💡 Recommendations:");

    if (performanceIssues.length > 0) {
      console.log("1. Fix critical issues first (❌ items above)");
    }

    if (warnings.length > 0) {
      console.log("2. Address warnings to improve performance");
    }

    console.log("3. Monitor Core Web Vitals in Google Search Console");
    console.log("4. Run regular performance audits");
    console.log("5. Optimize images and implement lazy loading");
  }
}

// Run all checks
function runPerformanceAudit() {
  checkPerformanceOptimizations();
  checkSEOOptimizations();
  checkAccessibility();
  checkSecurity();
  generateReport();
}

// Execute the audit
runPerformanceAudit();
