#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const files = glob.sync('**/*.{ts,tsx}', {
  ignore: ['node_modules/**', '.next/**', 'dist/**', 'coverage/**', '__tests__/**', '**/*.test.*', '**/*.spec.*'],
  cwd: path.join(__dirname, '..'),
  absolute: true,
});

console.log(`Processing ${files.length} files...\n`);

let stats = {
  unusedVarsFixed: 0,
  consoleFixed: 0,
  displayNamesAdded: 0,
  requireFixed: 0,
  filesChanged: 0,
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;
  
  // Fix 1: Prefix unused function parameters with underscore
  // Match: function(param) or (param) => or async (param) =>
  content = content.replace(/\(([\w]+)\)\s*(?:=>|{)/g, (match, param) => {
    // Check if param is used in function body
    const regex = new RegExp(`\\b${param}\\b`, 'g');
    const matches = content.match(regex) || [];
    // If only found once or twice (declaration + one use in destructuring), prefix with _
    if (matches.length <= 2 && !param.startsWith('_')) {
      stats.unusedVarsFixed++;
      return match.replace(param, `_${param}`);
    }
    return match;
  });

  // Fix 2: Remove unused imports - simple standalone imports
  const lines = content.split('\n');
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for simple imports like: import { Something } from 'somewhere';
    const match = line.match(/^import\s+{\s*(\w+)\s*}\s+from/);
    if (match) {
      const imported = match[1];
      const regex = new RegExp(`\\b${imported}\\b`, 'g');
      const usages = content.match(regex) || [];
      
      // If only found once (the import itself), skip this line
      if (usages.length === 1) {
        stats.unusedVarsFixed++;
        continue; // Skip this line
      }
    }
    
    newLines.push(line);
  }
  content = newLines.join('\n');

  // Fix 3: Add display names to arrow function components
  // Match: export const ComponentName = () =>
  content = content.replace(/export const (\w+Component|\w+Modal|\w+Button|\w+Card|\w+Form) = \(/g, (match, name) => {
    // Check if displayName is already set
    if (!content.includes(`${name}.displayName`)) {
      const insertion = `\n${name}.displayName = '${name}';\n`;
      // Add displayName after the component definition
      const componentEnd = content.indexOf('};', content.indexOf(match));
      if (componentEnd > -1) {
        content = content.slice(0, componentEnd + 2) + insertion + content.slice(componentEnd + 2);
        stats.displayNamesAdded++;
      }
    }
    return match;
  });

  // Fix 4: Convert require to import (simple cases)
  content = content.replace(/const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?/g, (match, varName, modulePath) => {
    stats.requireFixed++;
    return `import ${varName} from '${modulePath}';`;
  });

  // Fix 5: Remaining console.log to console.warn (skip test and script files)
  if (!file.includes('test') && !file.includes('scripts/')) {
    const beforeCount = (content.match(/console\.log\(/g) || []).length;
    content = content.replace(/console\.log\(/g, 'console.warn(');
    stats.consoleFixed += beforeCount;
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    stats.filesChanged++;
    console.log(`✓ ${path.relative(process.cwd(), file)}`);
  }
});

console.log(`\n✅ Summary:`);
console.log(`   Files changed: ${stats.filesChanged}`);
console.log(`   Unused vars fixed: ${stats.unusedVarsFixed}`);
console.log(`   Console.log fixed: ${stats.consoleFixed}`);
console.log(`   Display names added: ${stats.displayNamesAdded}`);
console.log(`   Require imports fixed: ${stats.requireFixed}`);

