import fs from "fs";
import path from "path";
import { glob } from "glob";

// Accessibility audit for links
function auditLinks() {
  console.log("🔍 Starting accessibility audit for links...\n");

  const issues = [];
  const tsxFiles = glob.sync("app/**/*.tsx");

  tsxFiles.forEach(file => {
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split("\n");

    // Check for Link components without aria-label (improved regex)
    const linkRegex = /<Link[^>]*href=[^>]*>(?![\s\S]*?aria-label)[\s\S]*?<\/Link>/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      const linkContent = match[0];
      // Skip if it actually has aria-label
      if (linkContent.includes("aria-label")) {
        continue;
      }
      const lineNumber = content.substring(0, match.index).split("\n").length;
      issues.push({
        file,
        line: lineNumber,
        type: "Link without aria-label",
        code: match[0].trim().substring(0, 100) + "...",
        severity: "high",
      });
    }

    // Check for anchor tags without aria-label (improved regex)
    const anchorRegex = /<a[^>]*href=[^>]*>(?![\s\S]*?aria-label)[\s\S]*?<\/a>/g;
    while ((match = anchorRegex.exec(content)) !== null) {
      const anchorContent = match[0];
      // Skip if it actually has aria-label
      if (anchorContent.includes("aria-label")) {
        continue;
      }
      const lineNumber = content.substring(0, match.index).split("\n").length;
      issues.push({
        file,
        line: lineNumber,
        type: "Anchor tag without aria-label",
        code: match[0].trim().substring(0, 100) + "...",
        severity: "high",
      });
    }

    // Check for generic link text
    const genericTextRegex =
      /<Link[^>]*href=[^>]*>\s*(click here|read more|learn more|here|more)\s*<\/Link>/gi;
    while ((match = genericTextRegex.exec(content)) !== null) {
      const lineNumber = content.substring(0, match.index).split("\n").length;
      issues.push({
        file,
        line: lineNumber,
        type: "Generic link text",
        code: match[0].trim(),
        severity: "medium",
      });
    }

    // Check for links with insufficient text
    const insufficientTextRegex = /<Link[^>]*href=[^>]*>\s*([^<]{0,10})\s*<\/Link>/g;
    while ((match = insufficientTextRegex.exec(content)) !== null) {
      const text = match[1].trim();
      if (text.length < 3 && !text.match(/[A-Za-z]/)) {
        const lineNumber = content.substring(0, match.index).split("\n").length;
        issues.push({
          file,
          line: lineNumber,
          type: "Link with insufficient text",
          code: match[0].trim(),
          severity: "high",
        });
      }
    }
  });

  return issues;
}

// Generate accessibility report
function generateReport(issues) {
  console.log(`📊 Accessibility Audit Report\n`);
  console.log(`Found ${issues.length} accessibility issues:\n`);

  if (issues.length === 0) {
    console.log("✅ No accessibility issues found! Your links are well-structured.");
    return;
  }

  const highSeverity = issues.filter(issue => issue.severity === "high");
  const mediumSeverity = issues.filter(issue => issue.severity === "medium");

  console.log(`🔴 High severity issues: ${highSeverity.length}`);
  console.log(`🟡 Medium severity issues: ${mediumSeverity.length}\n`);

  issues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.type} (${issue.severity.toUpperCase()})`);
    console.log(`   File: ${issue.file}:${issue.line}`);
    console.log(`   Code: ${issue.code}`);
    console.log("");
  });

  // Generate recommendations
  console.log("💡 Recommendations:");
  console.log("1. Add descriptive aria-label attributes to all links");
  console.log('2. Use descriptive link text instead of generic terms like "click here"');
  console.log("3. Ensure link text is at least 3 characters long");
  console.log("4. Make link text unique and descriptive of the destination");
  console.log("5. For external links, indicate they open in a new tab");
}

// Main execution
try {
  const issues = auditLinks();
  generateReport(issues);

  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    totalIssues: issues.length,
    issues: issues,
    recommendations: [
      "Add descriptive aria-label attributes to all links",
      'Use descriptive link text instead of generic terms like "click here"',
      "Ensure link text is at least 3 characters long",
      "Make link text unique and descriptive of the destination",
      "For external links, indicate they open in a new tab",
    ],
  };

  // Ensure reports directory exists
  if (!fs.existsSync("reports")) {
    fs.mkdirSync("reports");
  }

  fs.writeFileSync("reports/accessibility-audit-report.json", JSON.stringify(report, null, 2));

  console.log("📄 Report saved to reports/accessibility-audit-report.json");
} catch (error) {
  console.error("❌ Error during accessibility audit:", error);
  process.exit(1);
}
