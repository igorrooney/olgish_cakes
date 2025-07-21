#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// SEO Audit Script for Olgish Cakes
console.log("🔍 Starting SEO Audit for Olgish Cakes...\n");

const issues = [];
const warnings = [];
const successes = [];

// Check for required files
const requiredFiles = [
  "app/robots.ts",
  "app/sitemap.ts",
  "app/layout.tsx",
  "public/robots.txt",
  "public/sitemap.xml",
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    successes.push(`✅ ${file} exists`);
  } else {
    issues.push(`❌ Missing: ${file}`);
  }
});

// Check for metadata in pages
const pagesDir = "app";
const pageFiles = [];

function findPageFiles(dir) {
  const items = fs.readdirSync(dir);
  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (
      stat.isDirectory() &&
      !item.startsWith(".") &&
      item !== "components" &&
      item !== "utils" &&
      item !== "types"
    ) {
      findPageFiles(fullPath);
    } else if (item === "page.tsx") {
      pageFiles.push(fullPath);
    }
  });
}

findPageFiles(pagesDir);

pageFiles.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  const relativePath = file.replace("app/", "").replace("/page.tsx", "");

  // Check for metadata export
  if (content.includes("export const metadata")) {
    successes.push(`✅ ${relativePath} has metadata`);
  } else {
    issues.push(`❌ ${relativePath} missing metadata export`);
  }

  // Check for canonical URLs
  if (content.includes("canonical")) {
    successes.push(`✅ ${relativePath} has canonical URL`);
  } else {
    warnings.push(`⚠️ ${relativePath} missing canonical URL`);
  }

  // Check for structured data
  if (content.includes("application/ld+json") || content.includes("StructuredData")) {
    successes.push(`✅ ${relativePath} has structured data`);
  } else {
    warnings.push(`⚠️ ${relativePath} missing structured data`);
  }

  // Check for Open Graph
  if (content.includes("openGraph")) {
    successes.push(`✅ ${relativePath} has Open Graph`);
  } else {
    warnings.push(`⚠️ ${relativePath} missing Open Graph`);
  }
});

// Check for domain consistency
const allFiles = fs
  .readdirSync("app", { recursive: true })
  .filter(file => file.endsWith(".tsx") || file.endsWith(".ts"))
  .map(file => path.join("app", file));

const domainIssues = [];
allFiles.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  const domains = content.match(/https:\/\/[^\s"']+/g) || [];
  domains.forEach(domain => {
    if (!domain.includes("olgishcakes.co.uk") && domain.includes("olgish")) {
      domainIssues.push(`${file}: ${domain}`);
    }
  });
});

if (domainIssues.length > 0) {
  issues.push(`❌ Domain inconsistency found in ${domainIssues.length} files`);
  domainIssues.forEach(issue => warnings.push(`⚠️ ${issue}`));
} else {
  successes.push("✅ Domain consistency verified");
}

// Check for image optimization
const imageIssues = [];
allFiles.forEach(file => {
  const content = fs.readFileSync(file, "utf8");
  if (content.includes("img") || content.includes("Image")) {
    if (!content.includes("alt=") && !content.includes("alt =")) {
      imageIssues.push(`${file}: Missing alt attributes`);
    }
  }
});

if (imageIssues.length > 0) {
  warnings.push(`⚠️ ${imageIssues.length} files may have missing alt attributes`);
  imageIssues.forEach(issue => warnings.push(`⚠️ ${issue}`));
} else {
  successes.push("✅ Image alt attributes verified");
}

// Generate report
console.log("📊 SEO Audit Results:\n");

console.log("✅ SUCCESSES:");
successes.forEach(success => console.log(success));

if (warnings.length > 0) {
  console.log("\n⚠️ WARNINGS:");
  warnings.forEach(warning => console.log(warning));
}

if (issues.length > 0) {
  console.log("\n❌ ISSUES:");
  issues.forEach(issue => console.log(issue));
}

console.log(`\n📈 Summary:`);
console.log(`✅ Successes: ${successes.length}`);
console.log(`⚠️ Warnings: ${warnings.length}`);
console.log(`❌ Issues: ${issues.length}`);

if (issues.length === 0) {
  console.log("\n🎉 Great job! No critical SEO issues found.");
} else {
  console.log("\n🔧 Please fix the issues above to improve SEO.");
}

console.log("\n💡 Recommendations:");
console.log("1. Ensure all pages have unique titles and descriptions");
console.log("2. Add structured data to all product and service pages");
console.log("3. Optimize images with WebP format and proper alt text");
console.log("4. Implement breadcrumbs for better navigation");
console.log("5. Add FAQ schema markup for FAQ pages");
console.log("6. Consider implementing AMP for better mobile performance");
console.log("7. Add hreflang tags if targeting multiple regions");
console.log("8. Implement proper 404 page with helpful navigation");
