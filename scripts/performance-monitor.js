#!/usr/bin/env node

import { performance } from 'perf_hooks';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance monitoring script for Olgish Cakes
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      buildTime: 0,
      bundleSize: 0,
      pageCount: 0,
      imageCount: 0,
      timestamp: new Date().toISOString(),
    };
    this.reportDir = path.join(process.cwd(), 'reports', 'generated');
    fs.mkdirSync(this.reportDir, { recursive: true });
  }

  async monitorBuild() {
    console.log('🚀 Starting performance monitoring...');
    
    const startTime = performance.now();
    
    try {
      // Monitor bundle size
      await this.checkBundleSize();
      
      // Monitor page count
      await this.countPages();
      
      // Monitor images
      await this.countImages();
      
      // Monitor dependencies
      await this.checkDependencies();
      
      const endTime = performance.now();
      this.metrics.buildTime = Math.round(endTime - startTime);
      
      // Generate report
      await this.generateReport();
      
    } catch (error) {
      console.error('❌ Performance monitoring failed:', error);
    }
  }

  async checkBundleSize() {
    const buildDir = path.join(process.cwd(), '.next');
    
    if (fs.existsSync(buildDir)) {
      const stats = fs.statSync(buildDir);
      this.metrics.bundleSize = Math.round(stats.size / 1024 / 1024); // MB
      console.log(`📦 Bundle size: ${this.metrics.bundleSize}MB`);
    }
  }

  async countPages() {
    const pagesDir = path.join(process.cwd(), 'app');
    
    if (fs.existsSync(pagesDir)) {
      const files = fs.readdirSync(pagesDir, { recursive: true });
      const pageFiles = files.filter(file => 
        typeof file === 'string' && file.endsWith('page.tsx')
      );
      this.metrics.pageCount = pageFiles.length;
      console.log(`📄 Pages count: ${this.metrics.pageCount}`);
    }
  }

  async countImages() {
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    
    if (fs.existsSync(imagesDir)) {
      const files = fs.readdirSync(imagesDir, { recursive: true });
      const imageFiles = files.filter(file => 
        typeof file === 'string' && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(file)
      );
      this.metrics.imageCount = imageFiles.length;
      console.log(`🖼️  Images count: ${this.metrics.imageCount}`);
    }
  }

  async checkDependencies() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const depCount = Object.keys(packageJson.dependencies || {}).length;
      const devDepCount = Object.keys(packageJson.devDependencies || {}).length;
      
      console.log(`📚 Dependencies: ${depCount} prod, ${devDepCount} dev`);
      
      this.metrics.dependencies = {
        production: depCount,
        development: devDepCount,
        total: depCount + devDepCount,
      };
    }
  }

  async generateReport() {
    const reportPath = path.join(this.reportDir, 'performance-report.json');
    
    // Performance recommendations
    const recommendations = [];
    
    if (this.metrics.bundleSize > 50) {
      recommendations.push('Bundle size is large. Consider code splitting.');
    }
    
    if (this.metrics.imageCount > 100) {
      recommendations.push('High image count. Consider lazy loading.');
    }
    
    if (this.metrics.buildTime > 30000) {
      recommendations.push('Build time is slow. Consider optimization.');
    }
    
    const report = {
      ...this.metrics,
      recommendations,
      score: this.calculateScore(),
    };
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('\n📊 Performance Report:');
    console.log(`⏱️  Build time: ${this.metrics.buildTime}ms`);
    console.log(`📦 Bundle size: ${this.metrics.bundleSize}MB`);
    console.log(`📄 Pages: ${this.metrics.pageCount}`);
    console.log(`🖼️  Images: ${this.metrics.imageCount}`);
    console.log(`🎯 Performance score: ${report.score}/100`);
    
    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
  }

  calculateScore() {
    let score = 100;
    
    // Bundle size penalty
    if (this.metrics.bundleSize > 20) score -= 20;
    else if (this.metrics.bundleSize > 10) score -= 10;
    
    // Build time penalty
    if (this.metrics.buildTime > 60000) score -= 20;
    else if (this.metrics.buildTime > 30000) score -= 10;
    
    // Image count penalty
    if (this.metrics.imageCount > 200) score -= 15;
    else if (this.metrics.imageCount > 100) score -= 10;
    
    return Math.max(0, score);
  }
}

// Run the monitor
if (import.meta.url === `file://${process.argv[1]}`) {
  const monitor = new PerformanceMonitor();
  monitor.monitorBuild();
}

export default PerformanceMonitor;
