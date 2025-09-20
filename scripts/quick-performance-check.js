#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QuickPerformanceCheck {
  constructor() {
    this.issues = [];
    this.recommendations = [];
  }

  async checkPerformance() {
    console.log('🚀 Quick Performance Check for Olgish Cakes...\n');
    
    this.checkBundleSize();
    this.checkImageOptimization();
    this.checkNextConfig();
    this.checkLayoutOptimizations();
    this.checkServiceWorker();
    
    this.generateReport();
  }

  checkBundleSize() {
    console.log('📦 Checking bundle size...');
    
    const nextDir = path.join(process.cwd(), '.next');
    if (fs.existsSync(nextDir)) {
      const buildInfoPath = path.join(nextDir, 'build-manifest.json');
      if (fs.existsSync(buildInfoPath)) {
        console.log('   ✅ Build manifest exists');
      } else {
        console.log('   ⚠️  No build manifest found - run `npm run build` first');
      }
    } else {
      console.log('   ⚠️  No .next directory found - run `npm run build` first');
    }
  }

  checkImageOptimization() {
    console.log('🖼️  Checking image optimization...');
    
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const config = fs.readFileSync(nextConfigPath, 'utf8');
      
      if (config.includes('formats: ["image/avif", "image/webp"]')) {
        console.log('   ✅ AVIF/WebP formats enabled');
      } else {
        console.log('   ⚠️  AVIF/WebP formats not configured');
        this.issues.push('Image formats not optimized');
      }
      
      if (config.includes('quality: 85')) {
        console.log('   ✅ Image quality optimized (85%)');
      } else {
        console.log('   ⚠️  Image quality not set');
      }
    } else {
      console.log('   ❌ next.config.js not found');
      this.issues.push('Missing next.config.js');
    }
  }

  checkNextConfig() {
    console.log('⚙️  Checking Next.js configuration...');
    
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      const config = fs.readFileSync(nextConfigPath, 'utf8');
      
      const checks = [
        { name: 'SWC minification', pattern: 'swcMinify: true' },
        { name: 'Font optimization', pattern: 'optimizeFonts: true' },
        { name: 'CSS optimization', pattern: 'optimizeCss: true' },
        { name: 'Package imports optimization', pattern: 'optimizePackageImports' },
        { name: 'Bundle splitting', pattern: 'splitChunks' },
        { name: 'Tree shaking', pattern: 'usedExports' },
      ];
      
      checks.forEach(check => {
        if (config.includes(check.pattern)) {
          console.log(`   ✅ ${check.name} enabled`);
        } else {
          console.log(`   ⚠️  ${check.name} not configured`);
          this.issues.push(`${check.name} not enabled`);
        }
      });
    }
  }

  checkLayoutOptimizations() {
    console.log('🎨 Checking layout optimizations...');
    
    const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
    if (fs.existsSync(layoutPath)) {
      const layout = fs.readFileSync(layoutPath, 'utf8');
      
      const checks = [
        { name: 'Font preloading', pattern: 'rel="preload"' },
        { name: 'DNS prefetch', pattern: 'rel="dns-prefetch"' },
        { name: 'Critical CSS', pattern: 'CriticalCSS' },
        { name: 'Performance optimizer', pattern: 'PerformanceOptimizer' },
        { name: 'Service worker registration', pattern: 'serviceWorker.register' },
      ];
      
      checks.forEach(check => {
        if (layout.includes(check.pattern)) {
          console.log(`   ✅ ${check.name} implemented`);
        } else {
          console.log(`   ⚠️  ${check.name} not found`);
          this.issues.push(`${check.name} not implemented`);
        }
      });
    } else {
      console.log('   ❌ app/layout.tsx not found');
      this.issues.push('Missing app/layout.tsx');
    }
  }

  checkServiceWorker() {
    console.log('🔧 Checking service worker...');
    
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    if (fs.existsSync(swPath)) {
      console.log('   ✅ Service worker file exists');
      
      const sw = fs.readFileSync(swPath, 'utf8');
      if (sw.includes('CACHE_NAME')) {
        console.log('   ✅ Caching strategy implemented');
      } else {
        console.log('   ⚠️  Caching strategy not configured');
        this.issues.push('Service worker caching not configured');
      }
    } else {
      console.log('   ❌ Service worker not found');
      this.issues.push('Service worker not implemented');
    }
  }

  generateReport() {
    console.log('\n📊 Performance Check Summary:');
    console.log('=' .repeat(40));
    
    if (this.issues.length === 0) {
      console.log('🎉 All performance optimizations are in place!');
    } else {
      console.log(`⚠️  Found ${this.issues.length} issues:`);
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    console.log('\n💡 Next Steps:');
    console.log('   1. Run `npm run build` to create optimized bundle');
    console.log('   2. Run `npm run lighthouse:test` for detailed performance analysis');
    console.log('   3. Deploy and test in production environment');
    
    // Save report
    const report = {
      timestamp: new Date().toISOString(),
      issues: this.issues,
      status: this.issues.length === 0 ? 'optimal' : 'needs_attention',
    };
    
    fs.writeFileSync('./performance-check-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to: ./performance-check-report.json');
  }
}

// Run the check
const checker = new QuickPerformanceCheck();
checker.checkPerformance().catch(console.error);
