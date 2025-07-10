#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

    if (
      nextConfig.includes('formats: ["image/webp", "image/avif"]') ||
      nextConfig.includes("formats: ['image/webp', 'image/avif']")
    ) {
      successes.push("✅ WebP/AVIF image formats enabled");
    } else {
      warnings.push("⚠️ Consider enabling WebP/AVIF image formats");
    }

    if (nextConfig.includes("poweredByHeader: false")) {
      successes.push("✅ Powered by header disabled");
    } else {
      warnings.push("⚠️ Consider disabling powered by header");
    }

    if (nextConfig.includes("optimizePackageImports")) {
      successes.push("✅ Package import optimization enabled");
    } else {
      warnings.push("⚠️ Consider enabling package import optimization");
    }

    if (nextConfig.includes("headers:")) {
      successes.push("✅ Security headers configured");
    } else {
      warnings.push("⚠️ Consider adding security headers");
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

      if (content.includes("React.memo") || content.includes("memo(")) {
        successes.push(`✅ Component memoization in ${component}`);
      } else {
        warnings.push(`⚠️ Consider adding memoization to ${component}`);
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
  const templateFiles = ["env.production.template"];
  let productionEnvFound = false;
  let templateFound = false;

  envFiles.forEach(envFile => {
    if (fs.existsSync(envFile)) {
      if (envFile === ".env.production") {
        productionEnvFound = true;
        successes.push(`✅ Environment file found: ${envFile}`);
      } else {
        successes.push(`✅ Environment file found: ${envFile}`);
      }
    } else {
      if (envFile === ".env.production") {
        // Check if template exists instead
        if (fs.existsSync("env.production.template")) {
          templateFound = true;
          successes.push(
            `✅ Production environment template available - copy to .env.production for production deployment`
          );
        } else {
          warnings.push(`⚠️ Consider creating ${envFile} for production environment variables`);
        }
      } else {
        warnings.push(`⚠️ Consider creating ${envFile} for sensitive data`);
      }
    }
  });
}

// Generate performance report
function generateReport() {
  console.log("📋 Performance Report\n");
  console.log("=".repeat(50));

  if (successes.length > 0) {
    console.log("\n✅ Successes:");
    successes.forEach(success => console.log(`  ${success}`));
  }

  if (warnings.length > 0) {
    console.log("\n⚠️ Warnings:");
    warnings.forEach(warning => console.log(`  ${warning}`));
  }

  if (performanceIssues.length > 0) {
    console.log("\n❌ Issues:");
    performanceIssues.forEach(issue => console.log(`  ${issue}`));
  }

  const totalChecks = successes.length + warnings.length + performanceIssues.length;
  const successRate = totalChecks > 0 ? (successes.length / totalChecks) * 100 : 0;

  console.log("\n" + "=".repeat(50));
  console.log(`📊 Overall Score: ${successRate.toFixed(1)}%`);
  console.log(`✅ Successes: ${successes.length}`);
  console.log(`⚠️ Warnings: ${warnings.length}`);
  console.log(`❌ Issues: ${performanceIssues.length}`);
  console.log(`📝 Total Checks: ${totalChecks}`);

  if (successRate >= 80) {
    console.log("\n🎉 Excellent! Your site is well optimized for performance.");
  } else if (successRate >= 60) {
    console.log("\n👍 Good! Consider addressing the warnings to improve performance.");
  } else {
    console.log("\n⚠️ Needs improvement. Focus on fixing the issues first.");
  }
}

// Run performance audit
function runPerformanceAudit() {
  checkPerformanceOptimizations();
  checkSEOOptimizations();
  checkAccessibility();
  checkSecurity();
  generateReport();
}

// Run the audit
runPerformanceAudit();
