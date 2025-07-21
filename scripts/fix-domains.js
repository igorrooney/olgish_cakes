#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🔧 Fixing domain inconsistencies...\n");

const appDir = "app";
let filesUpdated = 0;
let totalReplacements = 0;

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let updatedContent = content;
    let replacements = 0;

    // Replace olgishcakes.com with olgishcakes.co.uk
    const olgishcakesComRegex = /https:\/\/olgishcakes\.com/g;
    updatedContent = updatedContent.replace(olgishcakesComRegex, "https://olgishcakes.co.uk");
    replacements += (content.match(olgishcakesComRegex) || []).length;

    // Replace olgish-cakes.vercel.app with olgishcakes.co.uk
    const olgishCakesVercelRegex = /https:\/\/olgish-cakes\.vercel\.app/g;
    updatedContent = updatedContent.replace(olgishCakesVercelRegex, "https://olgishcakes.co.uk");
    replacements += (content.match(olgishCakesVercelRegex) || []).length;

    if (replacements > 0) {
      fs.writeFileSync(filePath, updatedContent, "utf8");
      filesUpdated++;
      totalReplacements += replacements;
      console.log(`✅ ${filePath}: ${replacements} replacements`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith(".") && item !== "node_modules") {
      walkDirectory(fullPath);
    } else if (item.endsWith(".tsx") || item.endsWith(".ts") || item.endsWith(".js")) {
      processFile(fullPath);
    }
  });
}

// Process all files in the app directory
walkDirectory(appDir);

console.log(`\n📊 Summary:`);
console.log(`✅ Files updated: ${filesUpdated}`);
console.log(`🔧 Total replacements: ${totalReplacements}`);
console.log(`\n🎉 Domain inconsistencies fixed!`);
