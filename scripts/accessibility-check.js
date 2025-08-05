#!/usr/bin/env node

/**
 * Accessibility Check Script
 *
 * This script helps identify potential accessibility issues in the codebase.
 * Run with: node scripts/accessibility-check.js
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

// Accessibility check for development
function checkAccessibility() {
  console.log("🔍 Running accessibility check...\n");

  const issues = [];
  const tsxFiles = glob.sync("app/**/*.tsx");

  tsxFiles.forEach(file => {
    const content = fs.readFileSync(file, "utf8");

    // Check for common accessibility issues
    checkFileAccessibility(file, content, issues);
  });

  return issues;
}

function checkFileAccessibility(file, content, issues) {
  // Check for missing alt text on images
  const imageRegex = /<Image[^>]*src=[^>]*>(?![\s\S]*?alt=)[\s\S]*?<\/Image>/g;
  let match;
  while ((match = imageRegex.exec(content)) !== null) {
    const imageContent = match[0];
    if (!imageContent.includes("alt=")) {
      const lineNumber = content.substring(0, match.index).split("\n").length;
      issues.push({
        file,
        line: lineNumber,
        type: "Image missing alt text",
        severity: "high",
        suggestion: "Add descriptive alt text to the Image component",
      });
    }
  }

  // Check for buttons without accessible names
  const buttonRegex = /<Button[^>]*>(?![\s\S]*?aria-label)[\s\S]*?<\/Button>/g;
  while ((match = buttonRegex.exec(content)) !== null) {
    const buttonContent = match[0];
    if (!buttonContent.includes("aria-label") && !buttonContent.match(/>[^<]{3,}</)) {
      const lineNumber = content.substring(0, match.index).split("\n").length;
      issues.push({
        file,
        line: lineNumber,
        type: "Button without accessible name",
        severity: "high",
        suggestion: "Add aria-label or descriptive text to the Button component",
      });
    }
  }

  // Check for form fields without labels
  const formFieldRegex = /<TextField[^>]*>(?![\s\S]*?label=)[\s\S]*?<\/TextField>/g;
  while ((match = formFieldRegex.exec(content)) !== null) {
    const fieldContent = match[0];
    if (!fieldContent.includes("label=") && !fieldContent.includes("aria-label=")) {
      const lineNumber = content.substring(0, match.index).split("\n").length;
      issues.push({
        file,
        line: lineNumber,
        type: "Form field without label",
        severity: "high",
        suggestion: "Add label or aria-label to the TextField component",
      });
    }
  }

  // Check for heading hierarchy issues
  const headings = content.match(/<h[1-6][^>]*>/g) || [];
  const headingLevels = headings.map(h => parseInt(h.match(/<h([1-6])/)[1]));

  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] - headingLevels[i - 1] > 1) {
      issues.push({
        file,
        line: "Multiple",
        type: "Skipped heading level",
        severity: "medium",
        suggestion: "Ensure heading hierarchy is logical (h1 → h2 → h3, etc.)",
      });
      break;
    }
  }

  // Check for color-only information
  const colorOnlyRegex = /color:\s*#[0-9a-fA-F]{6}/g;
  const colorMatches = content.match(colorOnlyRegex) || [];
  if (colorMatches.length > 0) {
    issues.push({
      file,
      line: "Multiple",
      type: "Color-only information",
      severity: "medium",
      suggestion: "Ensure information is not conveyed by color alone",
    });
  }
}

function generateAccessibilityReport(issues) {
  console.log(`📊 Accessibility Check Report\n`);
  console.log(`Found ${issues.length} potential accessibility issues:\n`);

  if (issues.length === 0) {
    console.log("✅ No accessibility issues found!");
    return;
  }

  const highSeverity = issues.filter(issue => issue.severity === "high");
  const mediumSeverity = issues.filter(issue => issue.severity === "medium");

  console.log(`🔴 High severity issues: ${highSeverity.length}`);
  console.log(`🟡 Medium severity issues: ${mediumSeverity.length}\n`);

  // Group by type
  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.type]) {
      acc[issue.type] = [];
    }
    acc[issue.type].push(issue);
    return acc;
  }, {});

  Object.entries(groupedIssues).forEach(([type, typeIssues]) => {
    console.log(`📋 ${type} (${typeIssues.length} issues):`);
    typeIssues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue.file}:${issue.line}`);
      console.log(`      Suggestion: ${issue.suggestion}`);
    });
    console.log("");
  });

  console.log("💡 Quick Fixes:");
  console.log("1. Add alt text to all images");
  console.log("2. Add aria-label to buttons without text");
  console.log("3. Add labels to form fields");
  console.log("4. Check heading hierarchy");
  console.log("5. Ensure color is not the only way to convey information");
}

// Main execution
try {
  const issues = checkAccessibility();
  generateAccessibilityReport(issues);

  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    totalIssues: issues.length,
    issues: issues,
    summary: {
      highSeverity: issues.filter(issue => issue.severity === "high").length,
      mediumSeverity: issues.filter(issue => issue.severity === "medium").length,
    },
  };

  // Ensure reports directory exists
  if (!fs.existsSync("reports")) {
    fs.mkdirSync("reports");
  }

  fs.writeFileSync("reports/accessibility-check-report.json", JSON.stringify(report, null, 2));

  console.log("📄 Report saved to reports/accessibility-check-report.json");

  // Exit with error code if there are high severity issues
  const highSeverityCount = issues.filter(issue => issue.severity === "high").length;
  if (highSeverityCount > 0) {
    console.log(
      `\n⚠️  Found ${highSeverityCount} high severity issues. Please fix these before proceeding.`
    );
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Error during accessibility check:", error);
  process.exit(1);
}
