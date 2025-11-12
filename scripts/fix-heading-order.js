import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to analyze heading structure in a file
function analyzeHeadingStructure(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const lines = content.split("\n");
    const headingStructure = [];
    const issues = [];

    lines.forEach((line, lineNumber) => {
      // Look for Typography components with heading variants
      const headingMatch = line.match(/variant="h([1-6])"/);
      if (headingMatch) {
        const level = parseInt(headingMatch[1]);
        const componentMatch = line.match(/component="h([1-6])"/);
        const actualComponent = componentMatch ? parseInt(componentMatch[1]) : level;

        headingStructure.push({
          line: lineNumber + 1,
          level: actualComponent,
          variant: level,
          content: line.trim().substring(0, 100) + "...",
          file: filePath,
        });
      }
    });

    // Check for heading order violations
    for (let i = 1; i < headingStructure.length; i++) {
      const current = headingStructure[i];
      const previous = headingStructure[i - 1];

      // Check if heading level is skipped
      if (current.level > previous.level + 1) {
        issues.push({
          type: "skipped_level",
          file: filePath,
          line: current.line,
          current: current.level,
          previous: previous.level,
          message: `Heading level ${current.level} follows level ${previous.level}, skipping level(s)`,
        });
      }
    }

    // Check for h2 with large font size
    lines.forEach((line, lineNumber) => {
      if (line.includes('variant="h2"') && line.includes("fontSize") && line.includes("3rem")) {
        issues.push({
          type: "h2_with_large_font",
          file: filePath,
          line: lineNumber + 1,
          message: "H2 used with large font size (3rem) - consider using H3 for better hierarchy",
        });
      }
    });

    return { headingStructure, issues };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return { headingStructure: [], issues: [] };
  }
}

// Function to fix heading order issues
function fixHeadingOrder(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let modified = false;

    // Fix h2 with large font size to h3
    const lines = content.split("\n");
    const newLines = lines.map(line => {
      if (line.includes('variant="h2"') && line.includes("fontSize") && line.includes("3rem")) {
        modified = true;
        return line.replace(/variant="h2"/g, 'variant="h3"');
      }
      return line;
    });

    // Fix component="h2" to component="h3" for the same cases
    const finalLines = newLines.map(line => {
      if (line.includes('component="h2"') && line.includes("fontSize") && line.includes("3rem")) {
        modified = true;
        return line.replace(/component="h2"/g, 'component="h3"');
      }
      return line;
    });

    if (modified) {
      fs.writeFileSync(filePath, finalLines.join("\n"), "utf8");
      console.log(`✅ Fixed heading order in: ${path.relative(process.cwd(), filePath)}`);
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
  const allIssues = [];
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
  console.log(`🔍 Analyzing ${tsxFiles.length} TypeScript files for heading order issues...\n`);

  for (const file of tsxFiles) {
    const { issues } = analyzeHeadingStructure(file);

    if (issues.length > 0) {
      allIssues.push(...issues);
      console.log(`⚠️  Issues found in: ${path.relative(process.cwd(), file)}`);
      issues.forEach(issue => {
        console.log(`   Line ${issue.line}: ${issue.message}`);
      });
      console.log("");
    }
  }

  if (allIssues.length === 0) {
    console.log("✅ No heading order issues found!");
    return;
  }

  console.log(`\n📊 Summary: Found ${allIssues.length} heading order issues`);

  // Group issues by type
  const issuesByType = allIssues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {});

  console.log("\nIssues by type:");
  Object.entries(issuesByType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  // Fix issues
  console.log("\n🔧 Attempting to fix heading order issues...\n");

  for (const file of tsxFiles) {
    if (fixHeadingOrder(file)) {
      fixedFiles.push(file);
    }
  }

  console.log(`\n✅ Fixed ${fixedFiles.length} files`);

  if (fixedFiles.length > 0) {
    console.log("\nFixed files:");
    fixedFiles.forEach(file => {
      console.log(`  ${path.relative(process.cwd(), file)}`);
    });
  }
}

main();
