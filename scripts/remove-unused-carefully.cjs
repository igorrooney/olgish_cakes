#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Finding unused imports and variables to remove...\n');

const lintOutput = execSync('pnpm run lint 2>&1', { 
  encoding: 'utf8', 
  cwd: path.join(__dirname, '..'),
  maxBuffer: 50 * 1024 * 1024 
});

const lines = lintOutput.split('\n');
const toRemove = {};
let currentFile = null;

lines.forEach(line => {
  if (line.startsWith('/')) {
    currentFile = line.trim();
  } else if (currentFile && line.includes('is defined but never used') && line.includes('match /^_/u')) {
    const match = line.match(/(\d+):(\d+)\s+warning\s+'(\w+)'/);
    if (match) {
      if (!toRemove[currentFile]) toRemove[currentFile] = [];
      toRemove[currentFile].push({
        line: parseInt(match[1]),
        name: match[3]
      });
    }
  } else if (currentFile && line.includes('is assigned a value but never used') && line.includes('match /^_/u')) {
    const match = line.match(/(\d+):(\d+)\s+warning\s+'(\w+)'/);
    if (match) {
      if (!toRemove[currentFile]) toRemove[currentFile] = [];
      toRemove[currentFile].push({
        line: parseInt(match[1]),
        name: match[3],
        isConst: true
      });
    }
  }
});

let removed = 0;

Object.entries(toRemove).forEach(([filePath, items]) => {
  if (!fs.existsSync(filePath) || filePath.includes('test')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalLines = content.split('\n');
  const linesToDelete = [];

  items.forEach(item => {
    const lineIdx = item.line - 1;
    const line = originalLines[lineIdx];
    
    if (!line) return;

    // Check if it's a simple import line: import { Something } from 'module';
    if (line.match(new RegExp(`^import\\s+{\\s*${item.name}\\s*}\\s+from`))) {
      linesToDelete.push(lineIdx);
      removed++;
    }
    // Check if it's part of a multi-import
    else if (line.includes(`{ ${item.name}`) || line.includes(`, ${item.name}`) || line.includes(`${item.name},`)) {
      // Remove just this import from the line
      const cleaned = line
        .replace(new RegExp(`,?\\s*${item.name}\\s*,?`), '')
        .replace(/{\s*,/, '{ ')
        .replace(/,\s*}/, ' }')
        .replace(/,\s*,/g, ',');
      
      // If line now has empty braces, mark for deletion
      if (cleaned.match(/^import\s+{\s*}\s+from/)) {
        linesToDelete.push(lineIdx);
      } else {
        originalLines[lineIdx] = cleaned;
      }
      removed++;
    }
    // Check if it's an unused const declaration
    else if (item.isConst && line.match(new RegExp(`^\\s*const\\s+${item.name}\\s*=`))) {
      linesToDelete.push(lineIdx);
      removed++;
    }
  });

  // Delete marked lines (reverse order)
  linesToDelete.sort((a, b) => b - a).forEach(idx => {
    originalLines.splice(idx, 1);
  });

  const newContent = originalLines.join('\n');
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✓ ${path.relative(process.cwd(), filePath)}: ${items.length} items processed`);
  }
});

console.log(`\n✅ Removed: ${removed} unused imports/variables`);

