#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Finding files with unused imports...\n');

// Get lint output
const lintOutput = execSync('pnpm run lint 2>&1', { encoding: 'utf8', cwd: path.join(__dirname, '..'), maxBuffer: 50 * 1024 * 1024 });

const lines = lintOutput.split('\n');
const fileIssues = {};
let currentFile = null;

// Parse lint output
lines.forEach(line => {
  if (line.startsWith('/')) {
    currentFile = line.trim();
    fileIssues[currentFile] = [];
  } else if (currentFile && line.includes('is defined but never used')) {
    const match = line.match(/(\d+):(\d+)\s+warning\s+'(\w+)'/);
    if (match) {
      fileIssues[currentFile].push({
        line: parseInt(match[1]),
        name: match[3]
      });
    }
  }
});

let fixed = 0;

Object.entries(fileIssues).forEach(([filePath, issues]) => {
  if (issues.length === 0 || !fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const linesToRemove = [];

  issues.forEach(issue => {
    const lineIdx = issue.line - 1;
    const line = lines[lineIdx];
    
    // Check if this is a simple unused import line
    if (line && line.match(/^import\s+{\s*\w+\s*}\s+from/)) {
      // Single import that's unused - mark for removal
      linesToRemove.push(lineIdx);
    } else if (line && line.match(/import.*{.*}/)) {
      // Multi-import line - remove just this import
      const importName = issue.name;
      const regex = new RegExp(`\\b${importName}\\b,?\\s*`, 'g');
      lines[lineIdx] = line.replace(regex, '').replace(/,\s*}/, ' }').replace(/{\s*,/, '{ ').replace(/,\s*,/, ',');
      
      // If the line now only has empty braces, mark for removal
      if (lines[lineIdx].match(/^import\s+{\s*}\s+from/)) {
        linesToRemove.push(lineIdx);
      }
    }
  });

  // Remove marked lines (in reverse order to maintain indices)
  linesToRemove.sort((a, b) => b - a).forEach(idx => {
    lines.splice(idx, 1);
    fixed++;
  });

  if (linesToRemove.length > 0) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`✓ ${path.relative(process.cwd(), filePath)}: removed ${linesToRemove.length} unused imports`);
  }
});

console.log(`\n✅ Removed ${fixed} unused import lines`);

