import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to analyze and fix skipped heading levels
function fixSkippedHeadings(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    let modified = false;

    // Track heading levels to ensure proper hierarchy
    const headingStack = [];
    const newLines = lines.map((line, lineIndex) => {
      // Check for Typography components with heading variants
      const headingMatch = line.match(/variant="h([1-6])"/);
      if (headingMatch) {
        const level = parseInt(headingMatch[1]);
        const componentMatch = line.match(/component="h([1-6])"/);
        const actualLevel = componentMatch ? parseInt(componentMatch[1]) : level;

        // Check if this creates a skipped level
        if (headingStack.length > 0) {
          const lastLevel = headingStack[headingStack.length - 1];
          if (actualLevel > lastLevel + 1) {
            // Fix the skipped level by adjusting to the next appropriate level
            const correctedLevel = lastLevel + 1;
            modified = true;

            // Update both variant and component
            let newLine = line.replace(/variant="h[1-6]"/, `variant="h${correctedLevel}"`);
            if (componentMatch) {
              newLine = newLine.replace(/component="h[1-6]"/, `component="h${correctedLevel}"`);
            }

            console.log(
              `  Line ${lineIndex + 1}: Fixed heading level ${actualLevel} → ${correctedLevel}`
            );
            return newLine;
          }
        }

        // Update heading stack
        headingStack.push(actualLevel);
      }

      return line;
    });

    if (modified) {
      fs.writeFileSync(filePath, newLines.join("\n"), "utf8");
      console.log(`✅ Fixed skipped headings in: ${path.relative(process.cwd(), filePath)}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
function main() {
  const appDir = path.join(__dirname, "..", "app");
  const fixedFiles = [];

  // Recursively find all .tsx files
  function findTsxFiles(dir) {
    const files = [];
    try {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...findTsxFiles(fullPath));
        } else if (item.endsWith(".tsx")) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error.message);
    }

    return files;
  }

  const tsxFiles = findTsxFiles(appDir);
  console.log(`🔍 Fixing skipped heading levels in ${tsxFiles.length} TypeScript files...\n`);

  for (const file of tsxFiles) {
    if (fixSkippedHeadings(file)) {
      fixedFiles.push(file);
    }
  }

  console.log(`\n✅ Fixed ${fixedFiles.length} files with skipped heading levels`);

  if (fixedFiles.length > 0) {
    console.log("\nFixed files:");
    fixedFiles.forEach(file => {
      console.log(`  ${path.relative(process.cwd(), file)}`);
    });
  }
}

main();
