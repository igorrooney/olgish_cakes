#!/usr/bin/env node

/**
 * Enhanced SEO Audit Script for Olgish Cakes
 * Analyzes the website for SEO best practices and provides recommendations
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
  baseUrl: "https://olgishcakes.co.uk",
  pages: [
    "/",
    "/cakes",
    "/about",
    "/contact",
    "/wedding-cakes",
    "/birthday-cakes",
    "/traditional-ukrainian-cakes",
    "/honey-cake-history",
    "/how-to-order",
    "/cake-delivery",
    "/cake-pricing",
    "/cake-sizes-guide",
    "/cake-flavors",
    "/cake-gallery",
    "/testimonials",
    "/faq",
    "/privacy",
    "/terms",
    "/cookies",
  ],
  criticalKeywords: [
    "Ukrainian honey cake",
    "Medovik",
    "Leeds cake",
    "traditional Ukrainian cake",
    "honey cake Leeds",
    "Ukrainian bakery Leeds",
    "custom cake Leeds",
    "wedding cake Leeds",
    "birthday cake Leeds",
    "cake delivery Leeds",
    "Yorkshire cake",
    "UK cake delivery",
  ],
  competitors: [
    "https://www.cakebakeandroll.co.uk",
    "https://www.cakesbykate.co.uk",
    "https://www.leedsbakery.com",
  ],
};

// SEO Audit Results
const auditResults = {
  timestamp: new Date().toISOString(),
  overallScore: 0,
  sections: {},
  recommendations: [],
  errors: [],
  warnings: [],
  passed: [],
};

// Utility functions
function log(message, type = "info") {
  const timestamp = new Date().toISOString();
  const prefix =
    type === "error" ? "❌" : type === "warning" ? "⚠️" : type === "success" ? "✅" : "ℹ️";
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), "utf8");
  } catch (error) {
    return null;
  }
}

function writeFile(filePath, content) {
  fs.writeFileSync(path.join(process.cwd(), filePath), JSON.stringify(content, null, 2));
}

// SEO Checks
function checkMetaTags() {
  log("Checking meta tags...");
  const results = {
    title: { passed: 0, failed: 0, issues: [] },
    description: { passed: 0, failed: 0, issues: [] },
    keywords: { passed: 0, failed: 0, issues: [] },
    ogTags: { passed: 0, failed: 0, issues: [] },
    twitterTags: { passed: 0, failed: 0, issues: [] },
  };

  // Check layout.tsx for meta tag implementation
  const layoutFile = readFile("app/layout.tsx");
  if (layoutFile) {
    if (layoutFile.includes("metadata")) {
      results.title.passed++;
      log("Metadata generation found in layout", "success");
    } else {
      results.title.failed++;
      results.title.issues.push("No metadata generation found in layout.tsx");
      log("No metadata generation found in layout.tsx", "warning");
    }

    if (layoutFile.includes("viewport")) {
      results.ogTags.passed++;
      log("Viewport meta tag found", "success");
    } else {
      results.ogTags.failed++;
      results.ogTags.issues.push("No viewport meta tag found");
      log("No viewport meta tag found", "warning");
    }
  }

  auditResults.sections.metaTags = results;
  return results;
}

function checkStructuredData() {
  log("Checking structured data...");
  const results = {
    organization: false,
    breadcrumbs: false,
    product: false,
    faq: false,
    localBusiness: false,
  };

  // Check for structured data components
  if (checkFileExists("app/components/StructuredData.tsx")) {
    results.organization = true;
    log("StructuredData component found", "success");
  }

  if (checkFileExists("app/components/CakeStructuredData.tsx")) {
    results.product = true;
    log("CakeStructuredData component found", "success");
  }

  // Check cake pages for structured data
  const cakePage = readFile("app/cakes/[slug]/page.tsx");
  if (cakePage && cakePage.includes("application/ld+json")) {
    results.product = true;
    results.breadcrumbs = true;
    results.faq = true;
    log("Structured data found in cake pages", "success");
  }

  auditResults.sections.structuredData = results;
  return results;
}

function checkPerformance() {
  log("Checking performance optimizations...");
  const results = {
    imageOptimization: false,
    lazyLoading: false,
    compression: false,
    caching: false,
    bundleOptimization: false,
  };

  // Check next.config.js for optimizations
  const nextConfig = readFile("next.config.js");
  if (nextConfig) {
    if (nextConfig.includes("images")) {
      results.imageOptimization = true;
      log("Image optimization configured", "success");
    }

    if (nextConfig.includes("compress")) {
      results.compression = true;
      log("Compression enabled", "success");
    }
  }

  // Check for lazy loading in components
  const richTextRenderer = readFile("app/components/RichTextRenderer.tsx");
  if (richTextRenderer && richTextRenderer.includes('loading="lazy"')) {
    results.lazyLoading = true;
    log("Lazy loading found in RichTextRenderer", "success");
  }

  // Check for caching headers
  const middleware = readFile("middleware.ts");
  if (middleware && middleware.includes("cache")) {
    results.caching = true;
    log("Caching middleware found", "success");
  }

  auditResults.sections.performance = results;
  return results;
}

function checkAccessibility() {
  log("Checking accessibility...");
  const results = {
    altText: false,
    semanticHTML: false,
    focusStates: false,
    skipLinks: false,
    ariaLabels: false,
  };

  // Check global CSS for accessibility features
  const globalCSS = readFile("app/globals.css");
  if (globalCSS) {
    if (globalCSS.includes("focus")) {
      results.focusStates = true;
      log("Focus states found in CSS", "success");
    }

    if (globalCSS.includes("skip-link")) {
      results.skipLinks = true;
      log("Skip links found in CSS", "success");
    }

    if (globalCSS.includes("prefers-reduced-motion")) {
      log("Reduced motion support found", "success");
    }
  }

  // Check RichTextRenderer for semantic HTML
  const richTextRenderer = readFile("app/components/RichTextRenderer.tsx");
  if (richTextRenderer) {
    if (
      richTextRenderer.includes('component="h1"') ||
      richTextRenderer.includes('component="h2"')
    ) {
      results.semanticHTML = true;
      log("Semantic HTML found in RichTextRenderer", "success");
    }

    if (richTextRenderer.includes("alt=")) {
      results.altText = true;
      log("Alt text support found", "success");
    }

    if (richTextRenderer.includes("aria-label")) {
      results.ariaLabels = true;
      log("ARIA labels found", "success");
    }
  }

  auditResults.sections.accessibility = results;
  return results;
}

function checkContentOptimization() {
  log("Checking content optimization...");
  const results = {
    keywordOptimization: false,
    internalLinking: false,
    contentLength: false,
    headingStructure: false,
    imageOptimization: false,
  };

  // Check for keyword usage in content
  const cakeSchema = readFile("sanity/schemas/cake.ts");
  if (cakeSchema && cakeSchema.includes("seo")) {
    results.keywordOptimization = true;
    log("SEO fields found in cake schema", "success");
  }

  // Check for internal linking in components
  const breadcrumbs = readFile("app/components/Breadcrumbs.tsx");
  if (breadcrumbs && breadcrumbs.includes("href")) {
    results.internalLinking = true;
    log("Internal linking found in breadcrumbs", "success");
  }

  // Check for heading structure in RichTextRenderer
  const richTextRenderer = readFile("app/components/RichTextRenderer.tsx");
  if (richTextRenderer && richTextRenderer.includes("h1") && richTextRenderer.includes("h2")) {
    results.headingStructure = true;
    log("Heading structure found in RichTextRenderer", "success");
  }

  auditResults.sections.contentOptimization = results;
  return results;
}

function checkTechnicalSEO() {
  log("Checking technical SEO...");
  const results = {
    sitemap: false,
    robots: false,
    canonical: false,
    ssl: false,
    mobileFriendly: false,
  };

  // Check for sitemap
  if (checkFileExists("app/sitemap.ts")) {
    results.sitemap = true;
    log("Sitemap generation found", "success");
  }

  // Check for robots.txt
  if (checkFileExists("public/robots.txt")) {
    results.robots = true;
    log("Robots.txt found", "success");
  }

  // Check for canonical URLs
  const cakePage = readFile("app/cakes/[slug]/page.tsx");
  if (cakePage && cakePage.includes("canonical")) {
    results.canonical = true;
    log("Canonical URLs found", "success");
  }

  // Check for mobile-friendly CSS
  const globalCSS = readFile("app/globals.css");
  if (globalCSS && globalCSS.includes("@media")) {
    results.mobileFriendly = true;
    log("Mobile-friendly CSS found", "success");
  }

  auditResults.sections.technicalSEO = results;
  return results;
}

function generateRecommendations() {
  const recommendations = [];

  // Meta tags recommendations
  if (auditResults.sections.metaTags?.title.failed > 0) {
    recommendations.push({
      priority: "high",
      category: "meta-tags",
      title: "Implement dynamic meta tags",
      description: "Add dynamic meta tag generation for all pages to improve SEO",
      action: "Update page components to include generateMetadata function",
    });
  }

  // Structured data recommendations
  if (!auditResults.sections.structuredData?.organization) {
    recommendations.push({
      priority: "high",
      category: "structured-data",
      title: "Add Organization Schema",
      description: "Implement organization structured data for better brand recognition",
      action: "Create OrganizationSchema component and add to layout",
    });
  }

  // Performance recommendations
  if (!auditResults.sections.performance?.imageOptimization) {
    recommendations.push({
      priority: "medium",
      category: "performance",
      title: "Optimize images",
      description: "Implement image optimization for better page load times",
      action: "Configure Next.js image optimization and use next/image component",
    });
  }

  // Accessibility recommendations
  if (!auditResults.sections.accessibility?.altText) {
    recommendations.push({
      priority: "high",
      category: "accessibility",
      title: "Add alt text to all images",
      description: "Ensure all images have descriptive alt text for accessibility",
      action: "Update image components to include alt text",
    });
  }

  // Content recommendations
  if (!auditResults.sections.contentOptimization?.keywordOptimization) {
    recommendations.push({
      priority: "medium",
      category: "content",
      title: "Optimize content for target keywords",
      description: 'Ensure content is optimized for target keywords like "Ukrainian honey cake"',
      action: "Review and update content to include target keywords naturally",
    });
  }

  auditResults.recommendations = recommendations;
  return recommendations;
}

function calculateScore() {
  let totalChecks = 0;
  let passedChecks = 0;

  // Calculate scores for each section
  Object.values(auditResults.sections).forEach(section => {
    if (typeof section === "object") {
      Object.values(section).forEach(check => {
        if (typeof check === "boolean") {
          totalChecks++;
          if (check) passedChecks++;
        } else if (typeof check === "object" && check.passed !== undefined) {
          totalChecks += check.passed + check.failed;
          passedChecks += check.passed;
        }
      });
    }
  });

  auditResults.overallScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;
  return auditResults.overallScore;
}

function generateReport() {
  const report = {
    summary: {
      overallScore: auditResults.overallScore,
      timestamp: auditResults.timestamp,
      totalRecommendations: auditResults.recommendations.length,
      criticalIssues: auditResults.recommendations.filter(r => r.priority === "high").length,
    },
    sections: auditResults.sections,
    recommendations: auditResults.recommendations,
    nextSteps: [
      "Address high-priority recommendations first",
      "Implement structured data for better search visibility",
      "Optimize images and improve page load times",
      "Ensure all pages have proper meta tags",
      "Add alt text to all images for accessibility",
      "Monitor Core Web Vitals in Google Search Console",
    ],
  };

  return report;
}

// Main audit function
function runSEOAudit() {
  log("Starting SEO audit for Olgish Cakes...", "info");

  try {
    // Run all checks
    checkMetaTags();
    checkStructuredData();
    checkPerformance();
    checkAccessibility();
    checkContentOptimization();
    checkTechnicalSEO();

    // Generate recommendations and score
    generateRecommendations();
    const score = calculateScore();

    // Generate final report
    const report = generateReport();

    // Save report
    writeFile("reports/seo-audit-enhanced.json", report);

    // Print summary
    log(`SEO Audit Complete!`, "success");
    log(`Overall Score: ${score}/100`, score >= 80 ? "success" : score >= 60 ? "warning" : "error");
    log(`Total Recommendations: ${report.summary.totalRecommendations}`, "info");
    log(
      `Critical Issues: ${report.summary.criticalIssues}`,
      report.summary.criticalIssues > 0 ? "error" : "success"
    );
    log(`Report saved to: reports/seo-audit-enhanced.json`, "info");

    // Print top recommendations
    if (report.recommendations.length > 0) {
      log("\nTop Recommendations:", "info");
      report.recommendations
        .filter(r => r.priority === "high")
        .slice(0, 3)
        .forEach((rec, index) => {
          log(`${index + 1}. ${rec.title}`, "warning");
          log(`   ${rec.description}`, "info");
        });
    }
  } catch (error) {
    log(`Error during SEO audit: ${error.message}`, "error");
    process.exit(1);
  }
}

// Run the audit if this script is executed directly
runSEOAudit();
