import fs from "fs";
import path from "path";

// Configuration
const WCAG_MIN_SIZE = 44; // Minimum touch target size in pixels
const WCAG_MIN_SPACING = 8; // Minimum spacing between touch targets in pixels
const IMPORTANT_ACTION_SIZE = 48; // Larger size for important actions

// Files to scan
const SCAN_PATHS = [
  "app/components",
  "lib",
  "app/cakes",
  "app/contact",
  "app/order",
  "app/testimonials",
  "app/faq",
  "app/get-custom-quote",
];

// File extensions to scan
const SCAN_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

// Patterns to identify potential touch target issues
const TOUCH_TARGET_PATTERNS = {
  // Small button sizes
  smallButtons: [
    /size="small"/g,
    /size='small'/g,
    /size:\s*["']small["']/g,
    /size:\s*"small"/g,
    /size:\s*'small'/g,
  ],

  // Small icon buttons
  smallIconButtons: [
    /IconButton.*size="small"/g,
    /IconButton.*size='small'/g,
    /IconButton.*size:\s*["']small["']/g,
  ],

  // Inline buttons without proper sizing
  inlineButtons: [
    /<button[^>]*>(?!.*min-height|.*min-width)[^<]*<\/button>/g,
    /<a[^>]*role=["']button["'][^>]*>(?!.*min-height|.*min-width)[^<]*<\/a>/g,
  ],

  // Links without proper touch targets
  smallLinks: [/<a[^>]*>(?!.*min-height|.*min-width)[^<]*<\/a>/g],

  // Missing touch target classes
  missingTouchTarget: [
    /className="[^"]*(?!.*touch-target)[^"]*"/g,
    /className='[^']*(?!.*touch-target)[^']*'/g,
  ],

  // Small spacing between interactive elements
  smallSpacing: [/gap:\s*[0-3]px/g, /margin:\s*[0-3]px/g, /padding:\s*[0-3]px/g],
};

// Patterns to identify good touch target implementations
const GOOD_PATTERNS = {
  // Proper touch target sizes
  goodTouchTargets: [
    /minHeight:\s*["']44px["']/g,
    /minWidth:\s*["']44px["']/g,
    /minHeight:\s*["']48px["']/g,
    /minWidth:\s*["']48px["']/g,
    /touch-target/g,
    /touch-target-large/g,
  ],

  // Proper spacing
  goodSpacing: [
    /gap:\s*[4-9]px/g,
    /margin:\s*[4-9]px/g,
    /padding:\s*[4-9]px/g,
    /spacing\.sm/g,
    /spacing\.md/g,
  ],
};

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const issues = [];
    const goodPractices = [];

    // Check for problematic patterns
    Object.entries(TOUCH_TARGET_PATTERNS).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          issues.push({
            category,
            pattern: pattern.source,
            count: matches.length,
            file: filePath,
          });
        }
      });
    });

    // Check for good practices
    Object.entries(GOOD_PATTERNS).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        const matches = content.match(pattern);
        if (matches) {
          goodPractices.push({
            category,
            pattern: pattern.source,
            count: matches.length,
            file: filePath,
          });
        }
      });
    });

    return { issues, goodPractices };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return { issues: [], goodPractices: [] };
  }
}

function getAllFiles(dir, extensions) {
  const files = [];

  function traverse(currentDir) {
    try {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error traversing directory ${currentDir}:`, error.message);
    }
  }

  traverse(dir);
  return files;
}

function generateReport(scanResults) {
  const report = {
    summary: {
      totalFiles: scanResults.length,
      filesWithIssues: scanResults.filter(r => r.issues.length > 0).length,
      totalIssues: scanResults.reduce((sum, r) => sum + r.issues.length, 0),
      totalGoodPractices: scanResults.reduce((sum, r) => sum + r.goodPractices.length, 0),
    },
    issues: [],
    goodPractices: [],
    recommendations: [],
  };

  // Collect all issues
  scanResults.forEach(result => {
    result.issues.forEach(issue => {
      report.issues.push(issue);
    });
    result.goodPractices.forEach(practice => {
      report.goodPractices.push(practice);
    });
  });

  // Generate recommendations
  const issueCategories = [...new Set(report.issues.map(i => i.category))];

  issueCategories.forEach(category => {
    const categoryIssues = report.issues.filter(i => i.category === category);
    const files = [...new Set(categoryIssues.map(i => i.file))];

    switch (category) {
      case "smallButtons":
        report.recommendations.push({
          category: "Small Buttons",
          description: `Found ${categoryIssues.length} instances of small buttons in ${files.length} files`,
          files,
          fix: 'Replace size="small" with proper touch target sizing (minHeight: "44px", minWidth: "44px")',
        });
        break;
      case "smallIconButtons":
        report.recommendations.push({
          category: "Small Icon Buttons",
          description: `Found ${categoryIssues.length} instances of small icon buttons in ${files.length} files`,
          files,
          fix: "Use AccessibleIconButton component or ensure minHeight/minWidth of 48px",
        });
        break;
      case "smallSpacing":
        report.recommendations.push({
          category: "Insufficient Spacing",
          description: `Found ${categoryIssues.length} instances of small spacing in ${files.length} files`,
          files,
          fix: "Increase spacing to at least 8px between interactive elements",
        });
        break;
    }
  });

  return report;
}

function main() {
  console.log("🔍 Starting Touch Target Accessibility Audit...\n");

  const allFiles = [];
  SCAN_PATHS.forEach(scanPath => {
    if (fs.existsSync(scanPath)) {
      const files = getAllFiles(scanPath, SCAN_EXTENSIONS);
      allFiles.push(...files);
    }
  });

  console.log(`📁 Found ${allFiles.length} files to scan\n`);

  const scanResults = allFiles.map(file => scanFile(file));
  const report = generateReport(scanResults);

  // Output results
  console.log("📊 AUDIT RESULTS\n");
  console.log(`Total files scanned: ${report.summary.totalFiles}`);
  console.log(`Files with issues: ${report.summary.filesWithIssues}`);
  console.log(`Total issues found: ${report.summary.totalIssues}`);
  console.log(`Good practices found: ${report.summary.totalGoodPractices}\n`);

  if (report.issues.length > 0) {
    console.log("🚨 ISSUES FOUND:\n");
    report.issues.forEach(issue => {
      console.log(`- ${issue.category}: ${issue.count} instances in ${issue.file}`);
    });
    console.log("");
  }

  if (report.recommendations.length > 0) {
    console.log("💡 RECOMMENDATIONS:\n");
    report.recommendations.forEach(rec => {
      console.log(`📋 ${rec.category}`);
      console.log(`   ${rec.description}`);
      console.log(`   Fix: ${rec.fix}`);
      console.log(`   Files: ${rec.files.join(", ")}\n`);
    });
  }

  if (report.goodPractices.length > 0) {
    console.log("✅ GOOD PRACTICES FOUND:\n");
    const practiceSummary = {};
    report.goodPractices.forEach(practice => {
      if (!practiceSummary[practice.category]) {
        practiceSummary[practice.category] = 0;
      }
      practiceSummary[practice.category] += practice.count;
    });

    Object.entries(practiceSummary).forEach(([category, count]) => {
      console.log(`- ${category}: ${count} instances`);
    });
  }

  // Save detailed report
  const reportPath = "reports/touch-target-audit-report.json";
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  return report;
}

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as auditTouchTargets };
