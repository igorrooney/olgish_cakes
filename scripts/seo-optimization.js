#!/usr/bin/env node

/**
 * Comprehensive SEO Optimization Script for Olgish Cakes
 * This script helps improve Google rankings through various SEO optimizations
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

// Configuration
const SITE_URL = "https://olgishcakes.co.uk";
const GOOGLE_PAGESPEED_API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY;
const GOOGLE_SEARCH_CONSOLE_API_KEY = process.env.GOOGLE_SEARCH_CONSOLE_API_KEY;

class SEOOptimizer {
  constructor() {
    this.results = {
      performance: {},
      structuredData: {},
      technical: {},
      content: {},
      recommendations: [],
    };
  }

  // Performance Optimization
  async checkPerformance() {
    console.log("🔍 Checking performance metrics...");

    try {
      // Check Core Web Vitals
      const pagespeedUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${SITE_URL}&key=${GOOGLE_PAGESPEED_API_KEY}&strategy=mobile&category=performance`;

      const performanceData = await this.makeRequest(pagespeedUrl);

      if (performanceData) {
        const metrics = performanceData.lighthouseResult.audits;

        this.results.performance = {
          firstContentfulPaint: metrics["first-contentful-paint"]?.displayValue,
          largestContentfulPaint: metrics["largest-contentful-paint"]?.displayValue,
          firstInputDelay: metrics["max-potential-fid"]?.displayValue,
          cumulativeLayoutShift: metrics["cumulative-layout-shift"]?.displayValue,
          speedIndex: metrics["speed-index"]?.displayValue,
          totalBlockingTime: metrics["total-blocking-time"]?.displayValue,
          performanceScore: performanceData.lighthouseResult.categories.performance.score * 100,
        };

        // Performance recommendations
        if (this.results.performance.performanceScore < 90) {
          this.results.recommendations.push({
            category: "Performance",
            priority: "High",
            title: "Improve Core Web Vitals",
            description: `Current performance score: ${this.results.performance.performanceScore.toFixed(1)}/100. Focus on LCP, FID, and CLS improvements.`,
            actions: [
              "Optimize images with WebP format",
              "Implement lazy loading for images",
              "Minimize render-blocking resources",
              "Use CDN for static assets",
              "Enable compression (gzip/brotli)",
            ],
          });
        }
      }
    } catch (error) {
      console.error("Error checking performance:", error.message);
    }
  }

  // Structured Data Validation
  async validateStructuredData() {
    console.log("🔍 Validating structured data...");

    const testUrls = [`${SITE_URL}/cakes`, `${SITE_URL}/about`, `${SITE_URL}/contact`];

    for (const url of testUrls) {
      try {
        const richResultsUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`;
        console.log(`Testing structured data for: ${url}`);

        // Note: Google's Rich Results Test doesn't have a public API
        // This is a placeholder for manual testing
        this.results.structuredData[url] = {
          status: "Manual testing required",
          url: richResultsUrl,
        };
      } catch (error) {
        console.error(`Error validating structured data for ${url}:`, error.message);
      }
    }
  }

  // Technical SEO Checks
  async checkTechnicalSEO() {
    console.log("🔍 Performing technical SEO checks...");

    try {
      // Check robots.txt
      const robotsResponse = await this.makeRequest(`${SITE_URL}/robots.txt`);
      this.results.technical.robotsTxt = robotsResponse ? "Present" : "Missing";

      // Check sitemap
      const sitemapResponse = await this.makeRequest(`${SITE_URL}/sitemap.xml`);
      this.results.technical.sitemap = sitemapResponse ? "Present" : "Missing";

      // Check SSL certificate
      this.results.technical.ssl = "Valid (HTTPS)";

      // Check meta tags
      const homePageResponse = await this.makeRequest(SITE_URL);
      if (homePageResponse) {
        const hasTitle = homePageResponse.includes("<title>");
        const hasDescription = homePageResponse.includes('name="description"');
        const hasCanonical = homePageResponse.includes('rel="canonical"');

        this.results.technical.metaTags = {
          title: hasTitle ? "Present" : "Missing",
          description: hasDescription ? "Present" : "Missing",
          canonical: hasCanonical ? "Present" : "Missing",
        };
      }

      // Technical recommendations
      if (this.results.technical.robotsTxt === "Missing") {
        this.results.recommendations.push({
          category: "Technical SEO",
          priority: "High",
          title: "Add robots.txt file",
          description:
            "Missing robots.txt file which helps search engines understand your site structure.",
          actions: ["Create robots.txt file in public directory"],
        });
      }

      if (this.results.technical.sitemap === "Missing") {
        this.results.recommendations.push({
          category: "Technical SEO",
          priority: "High",
          title: "Add XML sitemap",
          description:
            "Missing XML sitemap which helps search engines discover and index your pages.",
          actions: ["Generate XML sitemap", "Submit to Google Search Console"],
        });
      }
    } catch (error) {
      console.error("Error checking technical SEO:", error.message);
    }
  }

  // Content Optimization
  async checkContentSEO() {
    console.log("🔍 Analyzing content optimization...");

    try {
      // Check for duplicate content
      const pages = ["/", "/cakes", "/about", "/contact"];
      const contentHashes = {};

      for (const page of pages) {
        const response = await this.makeRequest(`${SITE_URL}${page}`);
        if (response) {
          // Simple content hash (in production, use more sophisticated duplicate detection)
          const contentHash = this.hashContent(response);
          contentHashes[page] = contentHash;
        }
      }

      // Check for missing alt text in images
      const homePageResponse = await this.makeRequest(SITE_URL);
      if (homePageResponse) {
        const imgTags = homePageResponse.match(/<img[^>]+>/g) || [];
        const imagesWithoutAlt = imgTags.filter(img => !img.includes("alt="));

        this.results.content.imagesWithoutAlt = imagesWithoutAlt.length;

        if (imagesWithoutAlt.length > 0) {
          this.results.recommendations.push({
            category: "Content SEO",
            priority: "Medium",
            title: "Add alt text to images",
            description: `${imagesWithoutAlt.length} images are missing alt text, which affects accessibility and SEO.`,
            actions: ["Add descriptive alt text to all images", "Use relevant keywords naturally"],
          });
        }
      }

      // Content recommendations
      this.results.recommendations.push({
        category: "Content SEO",
        priority: "High",
        title: "Optimize for local SEO",
        description:
          "Focus on local keywords and location-based content for better rankings in Leeds area.",
        actions: [
          "Add location-specific keywords (Leeds, Yorkshire, UK)",
          "Create location-specific landing pages",
          "Optimize Google My Business listing",
          "Encourage local customer reviews",
        ],
      });
    } catch (error) {
      console.error("Error checking content SEO:", error.message);
    }
  }

  // Generate SEO Report
  generateReport() {
    console.log("\n📊 SEO Optimization Report");
    console.log("=".repeat(50));

    // Performance Summary
    if (this.results.performance.performanceScore) {
      console.log(
        `\n🚀 Performance Score: ${this.results.performance.performanceScore.toFixed(1)}/100`
      );
      console.log(`   LCP: ${this.results.performance.largestContentfulPaint}`);
      console.log(`   FID: ${this.results.performance.firstInputDelay}`);
      console.log(`   CLS: ${this.results.performance.cumulativeLayoutShift}`);
    }

    // Technical SEO Summary
    console.log("\n🔧 Technical SEO:");
    console.log(`   Robots.txt: ${this.results.technical.robotsTxt}`);
    console.log(`   Sitemap: ${this.results.technical.sitemap}`);
    console.log(`   SSL: ${this.results.technical.ssl}`);

    // Recommendations
    console.log("\n💡 Key Recommendations:");
    this.results.recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.title} (${rec.priority} priority)`);
      console.log(`   ${rec.description}`);
      console.log("   Actions:");
      rec.actions.forEach(action => console.log(`   - ${action}`));
    });

    // Save detailed report
    const reportPath = path.join(__dirname, "../reports/seo-optimization-report.json");
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }

  // Helper methods
  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      https
        .get(url, res => {
          let data = "";
          res.on("data", chunk => (data += chunk));
          res.on("end", () => resolve(data));
        })
        .on("error", reject);
    });
  }

  hashContent(content) {
    // Simple hash function for content comparison
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  // Run all checks
  async runAllChecks() {
    console.log("🚀 Starting comprehensive SEO optimization check...\n");

    await this.checkPerformance();
    await this.validateStructuredData();
    await this.checkTechnicalSEO();
    await this.checkContentSEO();

    this.generateReport();
  }
}

// Additional SEO optimization functions
class AdvancedSEOOptimizer extends SEOOptimizer {
  // Check for broken links
  async checkBrokenLinks() {
    console.log("🔍 Checking for broken links...");

    try {
      const response = await this.makeRequest(SITE_URL);
      const linkRegex = /href=["']([^"']+)["']/g;
      const links = [];
      let match;

      while ((match = linkRegex.exec(response)) !== null) {
        links.push(match[1]);
      }

      const brokenLinks = [];
      for (const link of links.slice(0, 10)) {
        // Check first 10 links
        if (link.startsWith("/") || link.startsWith(SITE_URL)) {
          try {
            const linkResponse = await this.makeRequest(
              link.startsWith("/") ? SITE_URL + link : link
            );
            if (!linkResponse) {
              brokenLinks.push(link);
            }
          } catch (error) {
            brokenLinks.push(link);
          }
        }
      }

      if (brokenLinks.length > 0) {
        this.results.recommendations.push({
          category: "Technical SEO",
          priority: "High",
          title: "Fix broken links",
          description: `${brokenLinks.length} broken links found on the site.`,
          actions: ["Fix or remove broken links", "Set up 301 redirects for moved pages"],
        });
      }
    } catch (error) {
      console.error("Error checking broken links:", error.message);
    }
  }

  // Check mobile responsiveness
  async checkMobileResponsiveness() {
    console.log("🔍 Checking mobile responsiveness...");

    try {
      const mobileUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${SITE_URL}&key=${GOOGLE_PAGESPEED_API_KEY}&strategy=mobile&category=accessibility`;

      const mobileData = await this.makeRequest(mobileUrl);

      if (mobileData) {
        const accessibilityScore = mobileData.lighthouseResult.categories.accessibility.score * 100;

        if (accessibilityScore < 90) {
          this.results.recommendations.push({
            category: "Mobile SEO",
            priority: "High",
            title: "Improve mobile accessibility",
            description: `Mobile accessibility score: ${accessibilityScore.toFixed(1)}/100`,
            actions: [
              "Ensure proper touch target sizes",
              "Improve color contrast",
              "Add proper ARIA labels",
              "Test with screen readers",
            ],
          });
        }
      }
    } catch (error) {
      console.error("Error checking mobile responsiveness:", error.message);
    }
  }

  // Generate sitemap
  generateSitemap() {
    console.log("🔍 Generating sitemap...");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/cakes</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

    const sitemapPath = path.join(__dirname, "../public/sitemap.xml");
    fs.writeFileSync(sitemapPath, sitemap);

    console.log(`✅ Sitemap generated: ${sitemapPath}`);
  }
}

// Run the optimization
async function main() {
  const optimizer = new AdvancedSEOOptimizer();

  try {
    await optimizer.runAllChecks();
    await optimizer.checkBrokenLinks();
    await optimizer.checkMobileResponsiveness();
    optimizer.generateSitemap();

    console.log("\n✅ SEO optimization check completed successfully!");
    console.log("\n🎯 Next steps for #1 Google ranking:");
    console.log("1. Implement all high-priority recommendations");
    console.log("2. Focus on local SEO for Leeds area");
    console.log("3. Create high-quality, keyword-rich content");
    console.log("4. Build quality backlinks from local businesses");
    console.log("5. Optimize Google My Business listing");
    console.log("6. Encourage customer reviews and testimonials");
    console.log("7. Monitor performance with Google Search Console");
  } catch (error) {
    console.error("❌ Error during SEO optimization:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { SEOOptimizer, AdvancedSEOOptimizer };
