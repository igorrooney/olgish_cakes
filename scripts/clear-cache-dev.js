#!/usr/bin/env node

/**
 * Development Cache Clearing Script
 * 
 * This script helps clear various caches during development
 * to ensure you see fresh data without hard refreshes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧹 Olgish Cakes - Development Cache Clearer');
console.log('==========================================');

// Clear Next.js build cache
function clearNextCache() {
  const nextCacheDir = path.join(__dirname, '..', '.next');
  if (fs.existsSync(nextCacheDir)) {
    console.log('📁 Clearing Next.js build cache...');
    try {
      fs.rmSync(nextCacheDir, { recursive: true, force: true });
      console.log('✅ Next.js cache cleared');
    } catch (error) {
      console.log('❌ Failed to clear Next.js cache:', error.message);
    }
  } else {
    console.log('ℹ️  No Next.js cache found');
  }
}

// Clear node_modules cache
function clearNodeModulesCache() {
  const nodeModulesDir = path.join(__dirname, '..', 'node_modules');
  if (fs.existsSync(nodeModulesDir)) {
    console.log('📦 Clearing node_modules cache...');
    try {
      // Only clear cache directories, not the entire node_modules
      const cacheDirs = [
        '.cache',
        'cache',
        '.turbo',
        '.eslintcache'
      ];
      
      cacheDirs.forEach(dir => {
        const cachePath = path.join(nodeModulesDir, dir);
        if (fs.existsSync(cachePath)) {
          fs.rmSync(cachePath, { recursive: true, force: true });
          console.log(`✅ Cleared ${dir}`);
        }
      });
      
      console.log('✅ Node modules cache cleared');
    } catch (error) {
      console.log('❌ Failed to clear node_modules cache:', error.message);
    }
  }
}

// Clear TypeScript build cache
function clearTypeScriptCache() {
  const tsBuildInfo = path.join(__dirname, '..', 'tsconfig.tsbuildinfo');
  if (fs.existsSync(tsBuildInfo)) {
    console.log('🔧 Clearing TypeScript build cache...');
    try {
      fs.unlinkSync(tsBuildInfo);
      console.log('✅ TypeScript cache cleared');
    } catch (error) {
      console.log('❌ Failed to clear TypeScript cache:', error.message);
    }
  } else {
    console.log('ℹ️  No TypeScript cache found');
  }
}

// Clear browser cache instructions
function showBrowserCacheInstructions() {
  console.log('\n🌐 Browser Cache Instructions:');
  console.log('==============================');
  console.log('1. Hard Refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)');
  console.log('2. Clear Browser Cache:');
  console.log('   - Chrome: Settings > Privacy > Clear browsing data');
  console.log('   - Firefox: Settings > Privacy > Clear Data');
  console.log('   - Safari: Develop > Empty Caches');
  console.log('3. Open Developer Tools > Network tab > Check "Disable cache"');
  console.log('4. Or use incognito/private browsing mode');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const clearAll = args.includes('--all') || args.includes('-a') || args.length === 0;
  const clearNext = args.includes('--next') || args.includes('-n') || clearAll;
  const clearNode = args.includes('--node') || args.includes('-m') || clearAll;
  const clearTS = args.includes('--typescript') || args.includes('-t') || clearAll;
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('\nUsage: node scripts/clear-cache-dev.js [options]');
    console.log('\nOptions:');
    console.log('  --all, -a        Clear all caches');
    console.log('  --next, -n       Clear Next.js cache');
    console.log('  --node, -m       Clear node_modules cache');
    console.log('  --typescript, -t Clear TypeScript cache');
    console.log('  --help, -h       Show this help message');
    console.log('\nExamples:');
    console.log('  node scripts/clear-cache-dev.js --all');
    console.log('  node scripts/clear-cache-dev.js --next --typescript');
    return;
  }
  
  if (clearNext) {
    clearNextCache();
  }
  
  if (clearNode) {
    clearNodeModulesCache();
  }
  
  if (clearTS) {
    clearTypeScriptCache();
  }
  
  showBrowserCacheInstructions();
  
  console.log('\n🚀 Next steps:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Use the DevCacheControl component in your browser');
  console.log('3. Set NEXT_PUBLIC_AGGRESSIVE_CACHE_CLEAR=true in .env.local');
  console.log('\n✨ Cache clearing complete!');
}

main();
