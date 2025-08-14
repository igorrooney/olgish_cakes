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

// Function to fix remaining theme function calls in a file
function fixRemainingThemeFunctions(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let hasChanges = false;

    // Fix theme => theme.palette.primary.main
    if (content.includes("theme => colors.primary.main")) {
      content = content.replace(/theme => colors\.primary\.main/g, "colors.primary.main");
      hasChanges = true;
    }

    // Fix theme => theme.palette.secondary.main
    if (content.includes("theme => colors.secondary.main")) {
      content = content.replace(/theme => colors\.secondary\.main/g, "colors.secondary.main");
      hasChanges = true;
    }

    // Fix any remaining theme => patterns
    if (content.includes("theme =>")) {
      content = content.replace(/theme =>\s*/g, "");
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
  if (fixRemainingThemeFunctions(file)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Fixed ${fixedCount} files with remaining theme function calls`);
console.log("✨ Build should now work properly!");
