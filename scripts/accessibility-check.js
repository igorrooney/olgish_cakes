#!/usr/bin/env node

/**
 * Accessibility Check Script
 * 
 * This script helps identify potential accessibility issues in the codebase.
 * Run with: node scripts/accessibility-check.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function findFiles(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        traverse(fullPath);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        // Exclude script files from accessibility checks
        if (!fullPath.includes('/scripts/') && !fullPath.includes('\\scripts\\') && !fullPath.includes('seo-audit-improved.js') && !fullPath.includes('accessibility-check.js')) {
          files.push(fullPath);
        }
      }
    }
  }
  
  traverse(dir);
  return files;
}

function checkAccessibilityIssues() {
  log('🔍 Starting accessibility check...', 'blue');
  
  const files = findFiles('.');
  let issues = [];
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for IconButton without aria-label
    const iconButtonRegex = /<IconButton[^>]*>/g;
    const iconButtonMatches = content.match(iconButtonRegex);
    
    if (iconButtonMatches) {
      for (const match of iconButtonMatches) {
        if (!match.includes('aria-label') && !match.includes('ariaLabel')) {
          issues.push({
            file,
            type: 'IconButton without aria-label',
            line: findLineNumber(content, match),
            snippet: match.substring(0, 100) + '...'
          });
        }
      }
    }
    
    // Check for buttons without accessible names
    const buttonRegex = /<button[^>]*>/g;
    const buttonMatches = content.match(buttonRegex);
    
    if (buttonMatches) {
      for (const match of buttonMatches) {
        if (!match.includes('aria-label') && !match.includes('aria-labelledby')) {
          // Check if button has text content
          const buttonTagEnd = content.indexOf('</button>', content.indexOf(match));
          if (buttonTagEnd !== -1) {
            const buttonContent = content.substring(content.indexOf(match) + match.length, buttonTagEnd);
            if (!buttonContent.trim()) {
              issues.push({
                file,
                type: 'Button without accessible name',
                line: findLineNumber(content, match),
                snippet: match.substring(0, 100) + '...'
              });
            }
          }
        }
      }
    }
    
    // Check for images without alt text
    const imageRegex = /<Image[^>]*>/g;
    const imageMatches = content.match(imageRegex);
    
    if (imageMatches) {
      for (const match of imageMatches) {
        if (!match.includes('alt=')) {
          issues.push({
            file,
            type: 'Image without alt text',
            line: findLineNumber(content, match),
            snippet: match.substring(0, 100) + '...'
          });
        }
      }
    }
    
    // Check for form inputs without labels
    const inputRegex = /<input[^>]*>/g;
    const inputMatches = content.match(inputRegex);
    
    if (inputMatches) {
      for (const match of inputMatches) {
        if (!match.includes('aria-label') && !match.includes('aria-labelledby') && !match.includes('id=')) {
          issues.push({
            file,
            type: 'Input without label',
            line: findLineNumber(content, match),
            snippet: match.substring(0, 100) + '...'
          });
        }
      }
    }
  }
  
  return issues;
}

function findLineNumber(content, searchText) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchText.substring(0, 50))) {
      return i + 1;
    }
  }
  return 'unknown';
}

function generateReport(issues) {
  log('\n📊 Accessibility Report', 'bold');
  log('='.repeat(50), 'blue');
  
  if (issues.length === 0) {
    log('✅ No accessibility issues found!', 'green');
    return;
  }
  
  log(`❌ Found ${issues.length} potential accessibility issues:`, 'red');
  log('');
  
  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.type]) {
      acc[issue.type] = [];
    }
    acc[issue.type].push(issue);
    return acc;
  }, {});
  
  for (const [type, typeIssues] of Object.entries(groupedIssues)) {
    log(`${type} (${typeIssues.length} issues):`, 'yellow');
    
    for (const issue of typeIssues) {
      log(`  📁 ${issue.file}:${issue.line}`, 'blue');
      log(`     ${issue.snippet}`, 'reset');
      log('');
    }
  }
  
  log('💡 Recommendations:', 'green');
  log('1. Use AccessibleIconButton component for icon-only buttons', 'reset');
  log('2. Add meaningful alt text to all images', 'reset');
  log('3. Ensure all form inputs have associated labels', 'reset');
  log('4. Test with screen readers and keyboard navigation', 'reset');
  log('5. Run Lighthouse accessibility audit', 'reset');
}

function main() {
  try {
    const issues = checkAccessibilityIssues();
    generateReport(issues);
    
    if (issues.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    log(`❌ Error during accessibility check: ${error.message}`, 'red');
    process.exit(1);
  }
}

main(); 