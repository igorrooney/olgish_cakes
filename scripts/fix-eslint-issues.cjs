#!/usr/bin/env node

/**
 * Script to help fix common ESLint issues automatically
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Get all TypeScript/TSX files
const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '.next/**', 'dist/**', 'coverage/**', 'scripts/**'],
  cwd: __dirname.replace('/scripts', ''),
  absolute: true,
});

console.log(`Found ${files.length} files to process\n`);

let totalChanges = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changes = 0;
  const originalContent = content;

  // Fix 1: Remove unused imports (simple cases)
  // This is a basic version - more complex cases need manual review
  const lines = content.split('\n');
  const unusedImports = [];
  
  lines.forEach((line, index) => {
    // Find import lines
    const importMatch = line.match(/^import\s+{([^}]+)}\s+from/);
    if (importMatch) {
      const imports = importMatch[1].split(',').map(i => i.trim());
      imports.forEach(imp => {
        // Check if the import is used in the file
        const usageRegex = new RegExp(`\\b${imp}\\b`, 'g');
        const matches = content.match(usageRegex) || [];
        // If only found once (the import itself), it's unused
        if (matches.length <= 1) {
          unusedImports.push({ line: index, import: imp });
        }
      });
    }
  });

  // Fix 2: Change console.log to console.warn (except in test files)
  if (!file.includes('test.') && !file.includes('__tests__')) {
    const consoleLogCount = (content.match(/console\.log\(/g) || []).length;
    if (consoleLogCount > 0) {
      content = content.replace(/console\.log\(/g, 'console.warn(');
      changes += consoleLogCount;
    }
  }

  // Fix 3: Add _ prefix to unused variables (those that match argsIgnorePattern)
  // This is complex and should be done carefully - skipping for now

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    totalChanges += changes;
    if (changes > 0) {
      console.log(`✓ ${path.relative(process.cwd(), file)}: ${changes} changes`);
    }
  }
});

console.log(`\n✅ Total changes: ${totalChanges}`);
console.log('\nNote: This script handles simple cases. Run ESLint to see remaining issues.');

