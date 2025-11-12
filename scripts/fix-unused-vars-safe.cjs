#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Analyzing unused variables...\n');

// Get lint output
const lintOutput = execSync('pnpm run lint 2>&1', { 
  encoding: 'utf8', 
  cwd: path.join(__dirname, '..'),
  maxBuffer: 50 * 1024 * 1024 
});

const lines = lintOutput.split('\n');
const issues = [];
let currentFile = null;

lines.forEach(line => {
  if (line.startsWith('/')) {
    currentFile = line.trim();
  } else if (currentFile && line.includes('warning') && line.includes('no-unused-vars')) {
    const match = line.match(/(\d+):(\d+)\s+warning\s+'(\w+)'/);
    if (match && line.includes('Allowed unused args must match /^_/u')) {
      issues.push({
        file: currentFile,
        line: parseInt(match[1]),
        name: match[3],
        type: 'args'
      });
    }
  }
});

console.log(`Found ${issues.length} function arguments to prefix with _\n`);

let fixed = 0;

// Group by file for efficient processing
const fileGroups = issues.reduce((acc, issue) => {
  if (!acc[issue.file]) acc[issue.file] = [];
  acc[issue.file].push(issue);
  return acc;
}, {});

Object.entries(fileGroups).forEach(([filePath, fileIssues]) => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;

  // Sort by line number descending to avoid index shifting
  fileIssues.sort((a, b) => b.line - a.line);

  fileIssues.forEach(issue => {
    const lineIdx = issue.line - 1;
    const line = lines[lineIdx];
    
    if (line) {
      // Only prefix if it's clearly a function parameter
      // Match patterns like: (param,  (param)  (param:  (param =
      const paramPattern = new RegExp(`\\((\\w*,\\s*)*${issue.name}(\\s*[,:=)])`);
      if (paramPattern.test(line)) {
        lines[lineIdx] = line.replace(
          new RegExp(`\\b${issue.name}\\b`),
          `_${issue.name}`
        );
        modified = true;
        fixed++;
      }
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`✓ ${path.relative(process.cwd(), filePath)}: ${fileIssues.length} parameters prefixed`);
  }
});

console.log(`\n✅ Fixed: ${fixed} unused function parameters`);
console.log(`\nNote: Run tests to verify no regressions`);

