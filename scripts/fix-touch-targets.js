import fs from "fs";
import path from "path";

// Configuration
const WCAG_MIN_SIZE = 44; // Minimum touch target size in pixels
const WCAG_MIN_SPACING = 8; // Minimum spacing between touch targets in pixels

// Files to scan and fix
const SCAN_PATHS = ["app", "lib", "components"];

// File extensions to scan
const SCAN_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js"];

// Patterns to fix
const FIX_PATTERNS = [
  // Fix small buttons
  {
    pattern: /size="small"/g,
    replacement: "",
    description: 'Remove size="small" from buttons',
  },
  {
    pattern: /size='small'/g,
    replacement: "",
    description: "Remove size='small' from buttons",
  },

  // Fix small chips
  {
    pattern: /<Chip[^>]*size="small"[^>]*>/g,
    replacement: match => {
      // Remove size="small" and add touch target styles
      const withoutSize = match.replace(/size="small"/, "");
      if (withoutSize.includes("sx=")) {
        // If sx already exists, add touch target styles to it
        return withoutSize.replace(/sx=\{[^}]*\}/, sxMatch => {
          const sxContent = sxMatch.slice(4, -1); // Remove 'sx={' and '}'
          return `sx={{${sxContent}, minHeight: "44px", padding: "8px 16px"}}`;
        });
      } else {
        // If no sx, add it
        return withoutSize.replace(/>/, ' sx={{ minHeight: "44px", padding: "8px 16px" }} />');
      }
    },
    description: "Fix small chips with proper touch targets",
  },

  // Fix small rating components
  {
    pattern: /<Rating[^>]*size="small"[^>]*>/g,
    replacement: match => {
      const withoutSize = match.replace(/size="small"/, "");
      if (withoutSize.includes("sx=")) {
        return withoutSize.replace(/sx=\{[^}]*\}/, sxMatch => {
          const sxContent = sxMatch.slice(4, -1);
          return `sx={{${sxContent}, minHeight: "44px", minWidth: "44px", "& .MuiRating-icon": { fontSize: "1.5rem" }}}`;
        });
      } else {
        return withoutSize.replace(
          />/,
          ' sx={{ minHeight: "44px", minWidth: "44px", "& .MuiRating-icon": { fontSize: "1.5rem" } }} />'
        );
      }
    },
    description: "Fix small rating components with proper touch targets",
  },

  // Fix small icon buttons
  {
    pattern: /<IconButton[^>]*size="small"[^>]*>/g,
    replacement: match => {
      const withoutSize = match.replace(/size="small"/, "");
      if (withoutSize.includes("sx=")) {
        return withoutSize.replace(/sx=\{[^}]*\}/, sxMatch => {
          const sxContent = sxMatch.slice(4, -1);
          return `sx={{${sxContent}, minHeight: "48px", minWidth: "48px", width: "48px", height: "48px", padding: "12px"}}`;
        });
      } else {
        return withoutSize.replace(
          />/,
          ' sx={{ minHeight: "48px", minWidth: "48px", width: "48px", height: "48px", padding: "12px" }} />'
        );
      }
    },
    description: "Fix small icon buttons with proper touch targets",
  },
];

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
      // Skip directories that don't exist or can't be read
    }
  }

  traverse(dir);
  return files;
}

function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let modifiedContent = content;
    const fixes = [];

    FIX_PATTERNS.forEach(({ pattern, replacement, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        if (typeof replacement === "function") {
          modifiedContent = modifiedContent.replace(pattern, replacement);
        } else {
          modifiedContent = modifiedContent.replace(pattern, replacement);
        }
        fixes.push({
          description,
          count: matches.length,
        });
      }
    });

    if (fixes.length > 0) {
      fs.writeFileSync(filePath, modifiedContent, "utf8");
      return { filePath, fixes };
    }

    return null;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error.message);
    return null;
  }
}

function main() {
  console.log("🔧 Starting Touch Target Fixes...\n");

  const allFiles = [];
  SCAN_PATHS.forEach(scanPath => {
    if (fs.existsSync(scanPath)) {
      const files = getAllFiles(scanPath, SCAN_EXTENSIONS);
      allFiles.push(...files);
    }
  });

  console.log(`📁 Found ${allFiles.length} files to scan\n`);

  const results = [];
  let totalFixes = 0;

  allFiles.forEach(file => {
    const result = fixFile(file);
    if (result) {
      results.push(result);
      const fileFixes = result.fixes.reduce((sum, fix) => sum + fix.count, 0);
      totalFixes += fileFixes;
    }
  });

  // Output results
  console.log("📊 FIX RESULTS\n");
  console.log(`Total files processed: ${allFiles.length}`);
  console.log(`Files modified: ${results.length}`);
  console.log(`Total fixes applied: ${totalFixes}\n`);

  if (results.length > 0) {
    console.log("✅ FIXES APPLIED:\n");
    results.forEach(result => {
      console.log(`📄 ${result.filePath}`);
      result.fixes.forEach(fix => {
        console.log(`   - ${fix.description}: ${fix.count} instances`);
      });
      console.log("");
    });
  }

  // Save detailed report
  const reportPath = "reports/touch-target-fixes-report.json";
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        summary: {
          totalFiles: allFiles.length,
          filesModified: results.length,
          totalFixes,
        },
        results,
      },
      null,
      2
    )
  );
  console.log(`📄 Detailed report saved to: ${reportPath}`);

  return results;
}

// Check if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as fixTouchTargets };
