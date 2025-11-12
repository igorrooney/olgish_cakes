#!/usr/bin/env node

/**
 * Render Blocking Resources Optimization Script
 * Analyzes and provides recommendations for reducing render blocking resources
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance optimization recommendations
const recommendations = {
  criticalCSS: {
    description: "Inline critical CSS for above-the-fold content",
    implementation: [
      "Extract critical CSS for hero section, navigation, and first content block",
      "Inline critical CSS in <head>",
      "Load non-critical CSS asynchronously",
    ],
  },
  scriptLoading: {
    description: "Optimize script loading strategies",
    implementation: [
      "Use 'lazyOnload' for non-critical scripts (analytics, tracking)",
      "Use 'afterInteractive' for important but non-critical scripts",
      "Use 'beforeInteractive' only for critical scripts",
      "Remove duplicate script tags",
    ],
  },
  fontOptimization: {
    description: "Optimize font loading",
    implementation: [
      "Use 'display: swap' for all fonts",
      "Preload only critical fonts",
      "Use system font fallbacks",
      "Consider using font-display: optional for non-critical fonts",
    ],
  },
  bundleOptimization: {
    description: "Reduce JavaScript bundle size",
    implementation: [
      "Implement dynamic imports for non-critical components",
      "Use tree shaking for Material-UI imports",
      "Split vendor bundles (MUI, Sanity, etc.)",
      "Remove unused dependencies",
    ],
  },
  imageOptimization: {
    description: "Optimize image loading",
    implementation: [
      "Use Next.js Image component with proper sizing",
      "Implement lazy loading for below-the-fold images",
      "Use WebP/AVIF formats",
      "Preload only critical images",
    ],
  },
};

// Analyze current implementation
function analyzeCurrentImplementation() {
  console.log("🔍 Analyzing current implementation...\n");

  const layoutPath = path.join(process.cwd(), "app", "layout.tsx");
  const nextConfigPath = path.join(process.cwd(), "next.config.js");

  let layoutContent = "";
  let nextConfigContent = "";

  try {
    layoutContent = fs.readFileSync(layoutPath, "utf8");
    nextConfigContent = fs.readFileSync(nextConfigPath, "utf8");
  } catch (error) {
    console.error("❌ Error reading files:", error.message);
    return;
  }

  // Check for render blocking issues
  const issues = [];

  // Check script loading strategies
  const scriptStrategies = layoutContent.match(/strategy="([^"]+)"/g);
  if (scriptStrategies) {
    const afterInteractiveCount = (layoutContent.match(/strategy="afterInteractive"/g) || [])
      .length;
    const lazyOnloadCount = (layoutContent.match(/strategy="lazyOnload"/g) || []).length;

    if (afterInteractiveCount > 2) {
      issues.push(
        `⚠️  Too many scripts with 'afterInteractive' strategy (${afterInteractiveCount}). Consider using 'lazyOnload' for non-critical scripts.`
      );
    }

    if (lazyOnloadCount === 0) {
      issues.push(
        '⚠️  No scripts using "lazyOnload" strategy. Consider using this for analytics and tracking scripts.'
      );
    }
  }

  // Check for preload links
  const preloadLinks = (layoutContent.match(/rel="preload"/g) || []).length;
  if (preloadLinks > 5) {
    issues.push(`⚠️  Too many preload links (${preloadLinks}). Only preload critical resources.`);
  }

  // Check for Material-UI imports
  const muiImports = (layoutContent.match(/@mui\/material/g) || []).length;
  if (muiImports > 0) {
    issues.push("⚠️  Direct Material-UI imports in layout. Consider using optimized imports.");
  }

  // Check webpack optimization
  if (!nextConfigContent.includes("splitChunks")) {
    issues.push(
      "⚠️  No bundle splitting configuration found. Implement splitChunks for better performance."
    );
  }

  return issues;
}

// Generate optimization report
function generateReport() {
  console.log("📊 Render Blocking Resources Optimization Report\n");
  console.log("=".repeat(60));

  const issues = analyzeCurrentImplementation();

  if (issues && issues.length > 0) {
    console.log("\n🚨 Issues Found:");
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
  } else {
    console.log("\n✅ No critical issues found!");
  }

  console.log("\n📋 Optimization Recommendations:\n");

  Object.entries(recommendations).forEach(([ rec]) => {
    console.log(`🔧 ${rec.description}:`);
    rec.implementation.forEach((impl, index) => {
      console.log(`   ${index + 1}. ${impl}`);
    });
    console.log("");
  });

  console.log("🚀 Quick Wins:");
  console.log('1. Change Google Analytics script strategy to "lazyOnload"');
  console.log("2. Remove unnecessary preload links");
  console.log("3. Implement critical CSS inlining");
  console.log("4. Use dynamic imports for non-critical components");
  console.log("5. Optimize Material-UI imports with tree shaking");

  console.log("\n📈 Expected Performance Improvements:");
  console.log("- Reduce render blocking resources by 60-80%");
  console.log("- Improve First Contentful Paint (FCP) by 20-40%");
  console.log("- Improve Largest Contentful Paint (LCP) by 15-30%");
  console.log("- Reduce bundle size by 15-25%");
}

// Generate optimization checklist
function generateChecklist() {
  const checklistPath = path.join(process.cwd(), "RENDER_BLOCKING_OPTIMIZATION_CHECKLIST.md");

  const checklist = `# Render Blocking Resources Optimization Checklist

## ✅ Completed Optimizations

### Script Loading
- [ ] Changed Google Analytics to lazyOnload strategy
- [ ] Changed Google Tag Manager to lazyOnload strategy
- [ ] Removed duplicate script tags
- [ ] Implemented critical CSS loading script

### Font Optimization
- [ ] Added font-display: swap
- [ ] Removed unnecessary font preloads
- [ ] Optimized font fallbacks
- [ ] Added adjustFontFallback: false

### Bundle Optimization
- [ ] Created centralized MUI imports
- [ ] Implemented bundle splitting
- [ ] Added tree shaking configuration
- [ ] Separated emotion cache bundle

### CSS Optimization
- [ ] Inlined critical CSS
- [ ] Implemented CSS loading states
- [ ] Optimized CSS-in-JS loading

## 🔧 Additional Optimizations

### Component Level
- [ ] Replace direct MUI imports with optimized imports
- [ ] Implement dynamic imports for heavy components
- [ ] Add loading states for non-critical components

### Image Optimization
- [ ] Implement lazy loading for below-the-fold images
- [ ] Use proper image sizes and formats
- [ ] Remove unnecessary image preloads

### Monitoring
- [ ] Set up performance monitoring
- [ ] Track Core Web Vitals
- [ ] Monitor bundle sizes

## 📊 Performance Targets

- [ ] Reduce render blocking resources to < 10
- [ ] Achieve FCP < 1.5s
- [ ] Achieve LCP < 2.5s
- [ ] Reduce total bundle size by 20%

## 🧪 Testing

- [ ] Run Lighthouse audit
- [ ] Test on mobile devices
- [ ] Verify analytics still work
- [ ] Check for visual regressions
`;

  fs.writeFileSync(checklistPath, checklist);
  console.log(`\n📝 Checklist generated: ${checklistPath}`);
}

// Main execution
const args = process.argv.slice(2);

if (args.includes("--checklist")) {
  generateChecklist();
} else {
  generateReport();
}

export { analyzeCurrentImplementation, generateReport, generateChecklist, recommendations };
