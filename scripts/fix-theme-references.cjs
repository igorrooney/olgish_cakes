const fs = require("fs");
const path = require("path");

// Function to recursively find all TypeScript/TSX files
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !file.startsWith(".") && file !== "node_modules") {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to fix theme references in a file
function fixThemeReferences(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let hasChanges = false;

    // Check if file already imports from design-system
    const hasDesignSystemImport =
      content.includes('from "../lib/design-system"') ||
      content.includes('from "@/lib/design-system"') ||
      content.includes('from "../../lib/design-system"') ||
      content.includes('from "../../../lib/design-system"');

    // Add design-system import if not present
    if (
      !hasDesignSystemImport &&
      (content.includes("theme.palette.primary.main") ||
        content.includes("theme.palette.secondary.main"))
    ) {
      // Find the last import statement
      const importMatch = content.match(/(import.*?from.*?['"][^'"]*['"];?\s*)+/g);
      if (importMatch) {
        const lastImport = importMatch[importMatch.length - 1];
        const newImport = 'import { colors } from "@/lib/design-system";\n';
        content = content.replace(lastImport, lastImport + "\n" + newImport);
        hasChanges = true;
      }
    }

    // Replace theme.palette.primary.main with colors.primary.main
    if (content.includes("theme.palette.primary.main")) {
      content = content.replace(/theme\.palette\.primary\.main/g, "colors.primary.main");
      hasChanges = true;
    }

    // Replace theme.palette.secondary.main with colors.secondary.main
    if (content.includes("theme.palette.secondary.main")) {
      content = content.replace(/theme\.palette\.secondary\.main/g, "colors.secondary.main");
      hasChanges = true;
    }

    // Replace theme function calls with direct color values
    if (content.includes("theme => theme.palette.secondary.main")) {
      content = content.replace(
        /theme => theme\.palette\.secondary\.main/g,
        "colors.secondary.main"
      );
      hasChanges = true;
    }

    if (content.includes("theme => theme.palette.primary.main")) {
      content = content.replace(/theme => theme\.palette\.primary\.main/g, "colors.primary.main");
      hasChanges = true;
    }

    // Write changes back to file if any were made
    if (hasChanges) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log("🔍 Finding all TypeScript/TSX files...");
const tsxFiles = findTsxFiles("./app");

console.log(`📁 Found ${tsxFiles.length} TypeScript/TSX files`);

let fixedCount = 0;
tsxFiles.forEach(file => {
  if (fixThemeReferences(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files with theme references`);
console.log("✨ Build should now work properly!");
