#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.join(__dirname, "..");
const APP_DIR = path.join(BASE_DIR, "app");

console.log("🔍 Starting Improved SEO Audit for Olgish Cakes...\n");

// Helper functions
function checkFileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFileContent(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    return "";
  }
}

function hasMetadata(content) {
  return content.includes("export const metadata") || content.includes("generateMetadata");
}

function hasCanonical(content) {
  return content.includes("canonical") || content.includes("alternates");
}

function hasStructuredData(content) {
  return content.includes("application/ld+json") || content.includes("structuredData");
}

function hasOpenGraph(content) {
  return content.includes("openGraph") || content.includes("og:");
}

function hasAltAttributes(content) {
  // More sophisticated alt attribute checking
  const imgRegex = /<img[^>]*>/g;
  const nextImageRegex = /<Image[^>]*?\/?>/g;
  const images = [...content.matchAll(imgRegex), ...content.matchAll(nextImageRegex)];

  if (images.length === 0) return true; // No images means no alt attribute issues

  // Also check for Image components that might span multiple lines
  const hasImageComponents = content.includes("<Image");
  if (hasImageComponents) {
    // Check if there are any Image components without alt attributes
    const imageLines = content.split("\n").filter(line => line.includes("<Image"));
    for (const line of imageLines) {
      // Skip Material-UI components that don't need alt attributes
      if (line.includes("ImageList") || line.includes("ImageListItem")) {
        continue;
      }

      if (
        line.includes("<Image") &&
        !line.includes("alt=") &&
        !line.includes("alt =") &&
        !line.includes("alt={")
      ) {
        // Check if this line is part of a multi-line Image component
        const lineIndex = content.split("\n").indexOf(line);
        const surroundingContent = content
          .split("\n")
          .slice(Math.max(0, lineIndex - 2), lineIndex + 3)
          .join("\n");
        if (
          !surroundingContent.includes("alt=") &&
          !surroundingContent.includes("alt =") &&
          !surroundingContent.includes("alt={")
        ) {
          return false;
        }
      }
    }
  }

  for (const match of images) {
    const imgTag = match[0];
    // Skip Material-UI components that don't need alt attributes
    if (imgTag.includes("ImageList") || imgTag.includes("ImageListItem")) {
      continue;
    }
    // Check for alt attribute in various formats: alt="", alt={}, alt=, alt =
    if (!imgTag.includes("alt=") && !imgTag.includes("alt =") && !imgTag.includes("alt={")) {
      return false;
    }
  }
  return true;
}

function checkDomainConsistency(content) {
  const urls = content.match(/https?:\/\/[^\s"']+/g) || [];
  const domains = urls.map(url => new URL(url).hostname);
  const uniqueDomains = [...new Set(domains)];

  // Filter out external domains that should be different
  const allowedExternalDomains = [
    "www.instagram.com",
    "www.facebook.com",
    "www.google.com",
    "www.googletagmanager.com",
    "www.googletagmanager.com",
    "vercel.com",
    "sanity.io",
    "schema.org",
    "wa.me",
    "www.trustpilot.com",
    "nextjs.org",
  ];

  const relevantDomains = uniqueDomains.filter(
    domain =>
      !allowedExternalDomains.includes(domain) &&
      !domain.includes("localhost") &&
      !domain.includes("127.0.0.1")
  );

  return relevantDomains.length <= 1;
}

// Main audit function
function auditSEO() {
  const results = {
    successes: [],
    warnings: [],
    issues: [],
  };

  // Check essential files
  const essentialFiles = [
    { path: "app/robots.ts", name: "robots.ts" },
    { path: "app/sitemap.ts", name: "sitemap.ts" },
    { path: "app/layout.tsx", name: "layout.tsx" },
    { path: "public/robots.txt", name: "robots.txt" },
    { path: "public/sitemap.xml", name: "sitemap.xml" },
    { path: "public/manifest.json", name: "manifest.json" },
    { path: "public/favicon.ico", name: "favicon.ico" },
  ];

  essentialFiles.forEach(file => {
    if (checkFileExists(path.join(BASE_DIR, file.path))) {
      results.successes.push(`✅ ${file.name} exists`);
    } else {
      results.issues.push(`❌ ${file.name} missing`);
    }
  });

  // Check layout.tsx for manifest and icons
  const layoutContent = readFileContent(path.join(APP_DIR, "layout.tsx"));
  if (layoutContent.includes('manifest: "/manifest.json"')) {
    results.successes.push("✅ Layout includes manifest link");
  } else {
    results.warnings.push("⚠️ Layout missing manifest link");
  }

  if (layoutContent.includes("icons: {")) {
    results.successes.push("✅ Layout includes favicon icons");
  } else {
    results.warnings.push("⚠️ Layout missing favicon icons");
  }

  // Audit all page files
  function auditPages(dir) {
    const files = fs.readdirSync(dir, { withFileTypes: true });

    for (const file of files) {
      const fullPath = path.join(dir, file.name);

      if (file.isDirectory()) {
        auditPages(fullPath);
      } else if (file.name === "page.tsx") {
        const content = readFileContent(fullPath);
        const relativePath = path.relative(APP_DIR, fullPath);

        // Check metadata
        if (hasMetadata(content)) {
          results.successes.push(`✅ ${relativePath} has metadata`);
        } else {
          results.issues.push(`❌ ${relativePath} missing metadata export`);
        }

        // Check canonical URLs
        if (hasCanonical(content)) {
          results.successes.push(`✅ ${relativePath} has canonical URL`);
        } else {
          results.warnings.push(`⚠️ ${relativePath} missing canonical URL`);
        }

        // Check structured data
        if (hasStructuredData(content)) {
          results.successes.push(`✅ ${relativePath} has structured data`);
        } else {
          results.warnings.push(`⚠️ ${relativePath} missing structured data`);
        }

        // Check Open Graph
        if (hasOpenGraph(content)) {
          results.successes.push(`✅ ${relativePath} has Open Graph`);
        } else {
          results.warnings.push(`⚠️ ${relativePath} missing Open Graph`);
        }

        // Check alt attributes (only for pages with images)
        if (content.includes("<img") || content.includes("<Image")) {
          if (hasAltAttributes(content)) {
            results.successes.push(`✅ ${relativePath} has proper alt attributes`);
          } else {
            results.warnings.push(`⚠️ ${relativePath} missing alt attributes`);
          }
        }

        // Check domain consistency
        if (!checkDomainConsistency(content)) {
          results.warnings.push(`⚠️ ${relativePath} has domain inconsistencies`);
        }
      }
    }
  }

  auditPages(APP_DIR);

  // Check components for alt attributes
  const componentsDir = path.join(APP_DIR, "components");
  if (checkFileExists(componentsDir)) {
    const componentFiles = fs.readdirSync(componentsDir, { withFileTypes: true });

    for (const file of componentFiles) {
      if (file.isFile() && file.name.endsWith(".tsx")) {
        const content = readFileContent(path.join(componentsDir, file.name));
        if (content.includes("<img") || content.includes("<Image")) {
          if (!hasAltAttributes(content)) {
            results.warnings.push(`⚠️ app/components/${file.name} missing alt attributes`);
          }
        }
      }
    }
  }

  // Display results
  console.log("📊 Improved SEO Audit Results:\n");

  console.log("✅ SUCCESSES:");
  results.successes.forEach(success => console.log(success));

  if (results.warnings.length > 0) {
    console.log("\n⚠️ WARNINGS:");
    results.warnings.forEach(warning => console.log(warning));
  }

  if (results.issues.length > 0) {
    console.log("\n❌ ISSUES:");
    results.issues.forEach(issue => console.log(issue));
  }

  console.log(`\n📈 Summary:`);
  console.log(`✅ Successes: ${results.successes.length}`);
  console.log(`⚠️ Warnings: ${results.warnings.length}`);
  console.log(`❌ Issues: ${results.issues.length}`);

  // Calculate score
  const totalChecks = results.successes.length + results.warnings.length + results.issues.length;
  const score = Math.round((results.successes.length / totalChecks) * 100);

  console.log(`\n🎯 Overall SEO Score: ${score}%`);

  if (score >= 90) {
    console.log("🌟 Excellent SEO implementation!");
  } else if (score >= 80) {
    console.log("👍 Good SEO implementation with room for improvement");
  } else if (score >= 70) {
    console.log("⚠️ SEO needs attention");
  } else {
    console.log("🚨 SEO requires immediate attention");
  }

  console.log("\n🔧 Recommendations:");
  if (results.issues.length > 0) {
    console.log("1. Fix all critical issues first");
  }
  if (results.warnings.length > 0) {
    console.log("2. Address warnings to improve SEO score");
  }
  console.log("3. Monitor Core Web Vitals regularly");
  console.log("4. Keep content fresh and relevant");
  console.log("5. Build quality backlinks");
}

// Run the audit
auditSEO();
