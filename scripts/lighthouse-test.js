#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class LighthouseTester {
  constructor() {
    this.results = {};
    this.urls = [
      'https://olgishcakes.co.uk',
      'https://olgishcakes.co.uk/cakes',
      'https://olgishcakes.co.uk/about',
      'https://olgishcakes.co.uk/contact',
    ];
  }

  async runLighthouseTest(url) {
    console.log(`🔍 Testing ${url}...`);
    
    try {
      const output = execSync(`lighthouse ${url} --output=json --output-path=./lighthouse-${this.sanitizeUrl(url)}.json --quiet`, {
        encoding: 'utf8',
        timeout: 120000, // 2 minutes timeout
      });
      
      return this.parseResults(`./lighthouse-${this.sanitizeUrl(url)}.json`);
    } catch (error) {
      console.error(`❌ Lighthouse test failed for ${url}:`, error.message);
      return null;
    }
  }

  sanitizeUrl(url) {
    return url.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '-');
  }

  parseResults(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const report = JSON.parse(data);
      
      return {
        performance: report.categories.performance.score * 100,
        accessibility: report.categories.accessibility.score * 100,
        bestPractices: report.categories['best-practices'].score * 100,
        seo: report.categories.seo.score * 100,
        metrics: {
          firstContentfulPaint: report.audits['first-contentful-paint'].numericValue,
          largestContentfulPaint: report.audits['largest-contentful-paint'].numericValue,
          cumulativeLayoutShift: report.audits['cumulative-layout-shift'].numericValue,
          speedIndex: report.audits['speed-index'].numericValue,
          totalBlockingTime: report.audits['total-blocking-time'].numericValue,
        }
      };
    } catch (error) {
      console.error('❌ Failed to parse Lighthouse results:', error.message);
      return null;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Lighthouse performance tests...\n');
    
    for (const url of this.urls) {
      const results = await this.runLighthouseTest(url);
      if (results) {
        this.results[url] = results;
      }
    }
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 Lighthouse Performance Report:');
    console.log('=' .repeat(50));
    
    let totalPerformance = 0;
    let totalAccessibility = 0;
    let totalBestPractices = 0;
    let totalSEO = 0;
    let urlCount = 0;
    
    for (const [url, results] of Object.entries(this.results)) {
      console.log(`\n🌐 ${url}`);
      console.log(`   Performance: ${results.performance.toFixed(1)}/100`);
      console.log(`   Accessibility: ${results.accessibility.toFixed(1)}/100`);
      console.log(`   Best Practices: ${results.bestPractices.toFixed(1)}/100`);
      console.log(`   SEO: ${results.seo.toFixed(1)}/100`);
      
      console.log(`   📈 Core Web Vitals:`);
      console.log(`      FCP: ${(results.metrics.firstContentfulPaint / 1000).toFixed(2)}s`);
      console.log(`      LCP: ${(results.metrics.largestContentfulPaint / 1000).toFixed(2)}s`);
      console.log(`      CLS: ${results.metrics.cumulativeLayoutShift.toFixed(3)}`);
      console.log(`      SI: ${(results.metrics.speedIndex / 1000).toFixed(2)}s`);
      console.log(`      TBT: ${results.metrics.totalBlockingTime.toFixed(0)}ms`);
      
      totalPerformance += results.performance;
      totalAccessibility += results.accessibility;
      totalBestPractices += results.bestPractices;
      totalSEO += results.seo;
      urlCount++;
    }
    
    if (urlCount > 0) {
      console.log('\n🎯 Averages:');
      console.log(`   Performance: ${(totalPerformance / urlCount).toFixed(1)}/100`);
      console.log(`   Accessibility: ${(totalAccessibility / urlCount).toFixed(1)}/100`);
      console.log(`   Best Practices: ${(totalBestPractices / urlCount).toFixed(1)}/100`);
      console.log(`   SEO: ${(totalSEO / urlCount).toFixed(1)}/100`);
      
      const overallScore = (totalPerformance + totalAccessibility + totalBestPractices + totalSEO) / (urlCount * 4);
      console.log(`\n🏆 Overall Score: ${overallScore.toFixed(1)}/100`);
      
      // Recommendations
      this.generateRecommendations();
    }
    
    // Save summary report
    this.saveSummaryReport();
  }

  generateRecommendations() {
    console.log('\n💡 Recommendations:');
    
    const avgPerformance = Object.values(this.results).reduce((sum, r) => sum + r.performance, 0) / Object.keys(this.results).length;
    
    if (avgPerformance < 90) {
      console.log('   ⚡ Performance: Consider optimizing images and reducing JavaScript bundle size');
    }
    
    const avgLCP = Object.values(this.results).reduce((sum, r) => sum + r.metrics.largestContentfulPaint, 0) / Object.keys(this.results).length;
    if (avgLCP > 2500) {
      console.log('   🖼️  LCP: Optimize largest contentful paint (images, fonts, critical CSS)');
    }
    
    const avgCLS = Object.values(this.results).reduce((sum, r) => sum + r.metrics.cumulativeLayoutShift, 0) / Object.keys(this.results).length;
    if (avgCLS > 0.1) {
      console.log('   📐 CLS: Fix layout shifts by setting image dimensions and font loading');
    }
  }

  saveSummaryReport() {
    const summary = {
      timestamp: new Date().toISOString(),
      results: this.results,
      averages: {
        performance: Object.values(this.results).reduce((sum, r) => sum + r.performance, 0) / Object.keys(this.results).length,
        accessibility: Object.values(this.results).reduce((sum, r) => sum + r.accessibility, 0) / Object.keys(this.results).length,
        bestPractices: Object.values(this.results).reduce((sum, r) => sum + r.bestPractices, 0) / Object.keys(this.results).length,
        seo: Object.values(this.results).reduce((sum, r) => sum + r.seo, 0) / Object.keys(this.results).length,
      }
    };
    
    fs.writeFileSync('./lighthouse-summary.json', JSON.stringify(summary, null, 2));
    console.log('\n📄 Summary report saved to: ./lighthouse-summary.json');
  }
}

// Run the tests
const tester = new LighthouseTester();
tester.runAllTests().catch(console.error);
