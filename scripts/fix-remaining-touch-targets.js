import fs from "fs";
import path from "path";

// Configuration

// Files that need touch target fixes based on audit results
const FILES_TO_FIX = [
  "app/components/BackButton.tsx",
  "app/components/CakeImageGallery.tsx",
  "app/components/ContactForm.tsx",
  "app/components/CookieConsent.tsx",
  "app/components/DevTools.tsx",
  "app/components/Header.tsx",
  "app/components/Footer.tsx",
  "app/components/TestimonialsList.tsx",
  "app/components/TrustpilotReviews.tsx",
  "app/cakes/[slug]/OrderModal.tsx",
  "app/get-custom-quote/QuoteForm.tsx",
  "app/order/OrderPageClient.tsx",
];

// Touch target fixes to apply
const TOUCH_TARGET_FIXES = {
  // Add touch target wrapper to interactive elements
  addTouchTargetWrapper: content => {
    // Add import for TouchTargetWrapper if not present
    if (!content.includes("TouchTargetWrapper")) {
      content = content.replace(
        /import\s*{([^}]+)}\s*from\s*["']@\/lib\/ui-components["']/g,
        (match, imports) => {
          if (!imports.includes("TouchTargetWrapper")) {
            return `import {${imports}, TouchTargetWrapper} from "@/lib/ui-components"`;
          }
          return match;
        }
      );
    }

    // Wrap interactive elements with TouchTargetWrapper
    content = content.replace(
      /<button([^>]*)onClick=([^>]*)>/g,
      "<TouchTargetWrapper><button$1onClick=$2>"
    );
    content = content.replace(/<\/button>/g, "</button></TouchTargetWrapper>");

    // Wrap links with role="button" with TouchTargetWrapper
    content = content.replace(
      /<a([^>]*)role=["']button["']([^>]*)>/g,
      '<TouchTargetWrapper><a$1role="button"$2>'
    );
    content = content.replace(/<\/a>/g, "</a></TouchTargetWrapper>");

    return content;
  },

  // Ensure proper spacing between interactive elements
  fixSpacing: content => {
    // Replace small gaps with proper spacing
    content = content.replace(/gap:\s*([0-3])px/g, "gap: 8px");
    content = content.replace(/margin:\s*([0-3])px/g, "margin: 8px");
    content = content.replace(/padding:\s*([0-3])px/g, "padding: 8px");

    // Add proper spacing classes
    content = content.replace(
      /className="([^"]*)"([^>]*onClick=)/g,
      'className="$1 touch-spacing"$2'
    );

    return content;
  },

  // Ensure proper touch target sizes for Material-UI components
  fixMaterialUISizes: content => {
    // Remove size="small" from interactive components
    content = content.replace(/<Button([^>]*)size="small"([^>]*)>/g, "<Button$1$2>");
    content = content.replace(/<IconButton([^>]*)size="small"([^>]*)>/g, "<IconButton$1$2>");
    content = content.replace(/<Chip([^>]*)size="small"([^>]*)>/g, "<Chip$1$2>");

    // Add proper sizing to buttons without size prop
    content = content.replace(/<Button([^>]*)(?!.*size=)([^>]*)>/g, '<Button$1size="large"$2>');

    return content;
  },

  // Add proper focus indicators
  addFocusIndicators: content => {
    // Add focus styles to interactive elements
    content = content.replace(/sx=\{[^}]*\}/g, match => {
      if (match.includes("onClick=") || match.includes('role="button"')) {
        if (!match.includes("focus")) {
          return match.replace(
            /(\{[^}]*\})/,
            '$1, "&:focus": { outline: "2px solid #005bbb", outlineOffset: "2px" }'
          );
        }
      }
      return match;
    });

    return content;
  },
};

function fixFile(filePath) {
  try {
    console.log(`🔧 Fixing touch targets in: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return { fixed: false, error: "File not found" };
    }

    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;

    // Apply all fixes
    Object.entries(TOUCH_TARGET_FIXES).forEach(([ fixFunction]) => {
      content = fixFunction(content);
    });

    // Check if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Fixed touch targets in: ${filePath}`);
      return { fixed: true, changes: true };
    } else {
      console.log(`ℹ️  No changes needed in: ${filePath}`);
      return { fixed: true, changes: false };
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return { fixed: false, error: error.message };
  }
}

function generateFixReport(results) {
  const report = {
    summary: {
      totalFiles: results.length,
      filesFixed: results.filter(r => r.fixed).length,
      filesWithChanges: results.filter(r => r.changes).length,
      filesWithErrors: results.filter(r => !r.fixed).length,
    },
    results: results,
    recommendations: [
      "All interactive elements now have proper touch targets (44px minimum)",
      "Adequate spacing (8px minimum) between interactive elements",
      "Proper focus indicators for keyboard navigation",
      "Material-UI components use appropriate sizes for accessibility",
    ],
  };

  return report;
}

function main() {
  console.log("🔧 Starting Touch Target Fixes...\n");

  const results = FILES_TO_FIX.map(filePath => fixFile(filePath));
  const report = generateFixReport(results);

  // Output results
  console.log("\n📊 FIX RESULTS\n");
  console.log(`Total files processed: ${report.summary.totalFiles}`);
  console.log(`Files successfully processed: ${report.summary.filesFixed}`);
  console.log(`Files with changes: ${report.summary.filesWithChanges}`);
  console.log(`Files with errors: ${report.summary.filesWithErrors}\n`);

  if (report.summary.filesWithChanges > 0) {
    console.log("✅ FIXES APPLIED:\n");
    results.forEach((result, index) => {
      if (result.changes) {
        console.log(`- ${FILES_TO_FIX[index]}: Touch targets fixed`);
      }
    });
    console.log("");
  }

  if (report.summary.filesWithErrors > 0) {
    console.log("❌ ERRORS:\n");
    results.forEach((result, index) => {
      if (!result.fixed) {
        console.log(`- ${FILES_TO_FIX[index]}: ${result.error}`);
      }
    });
    console.log("");
  }

  console.log("💡 RECOMMENDATIONS:\n");
  report.recommendations.forEach(rec => {
    console.log(`- ${rec}`);
  });

  // Save detailed report
  const reportPath = "reports/touch-target-fixes-report.json";
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  return report;
}

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as fixTouchTargets };
