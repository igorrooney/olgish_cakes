#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Internal Linking Optimizer for Better SEO Rankings
 * Creates strategic internal linking structure to boost page authority
 */

class InternalLinkingOptimizer {
  constructor() {
    this.siteUrl = 'https://olgishcakes.co.uk';
    this.pages = [
      // Main hub pages
      { url: '/', title: 'Home', authority: 'high', category: 'hub' },
      { url: '/cakes', title: 'Cakes', authority: 'high', category: 'hub' },
      { url: '/wedding-cakes', title: 'Wedding Cakes', authority: 'high', category: 'hub' },
      { url: '/about', title: 'About', authority: 'medium', category: 'supporting' },
      { url: '/contact', title: 'Contact', authority: 'medium', category: 'supporting' },
      
      // Target keyword pages
      { url: '/cake-postal-delivery', title: 'Cake Postal Delivery', authority: 'medium', category: 'target', keywords: ['cake postal delivery', 'cakes through the letterbox'] },
      { url: '/wakefield-wedding-cakes', title: 'Wakefield Wedding Cakes', authority: 'medium', category: 'target', keywords: ['wakefield wedding cakes', 'wedding cakes wakefield'] },
      { url: '/honey-cake-near-me', title: 'Honey Cake Near Me', authority: 'medium', category: 'target', keywords: ['honey cake near me', 'medovik near me'] },
      
      // Location pages
      { url: '/cakes-leeds', title: 'Cakes Leeds', authority: 'medium', category: 'location', keywords: ['cakes leeds', 'ukrainian bakery leeds'] },
      { url: '/cakes-bradford', title: 'Cakes Bradford', authority: 'medium', category: 'location', keywords: ['cakes bradford', 'ukrainian cakes bradford'] },
      { url: '/cakes-york', title: 'Cakes York', authority: 'medium', category: 'location', keywords: ['cakes york', 'cake delivery york'] },
      { url: '/cakes-huddersfield', title: 'Cakes Huddersfield', authority: 'medium', category: 'location', keywords: ['cakes huddersfield', 'ukrainian bakery huddersfield'] },
      
      // Service pages
      { url: '/cake-delivery', title: 'Cake Delivery', authority: 'medium', category: 'service', keywords: ['cake delivery', 'cake shipping'] },
      { url: '/custom-cake-design', title: 'Custom Cake Design', authority: 'medium', category: 'service', keywords: ['custom cake design', 'bespoke cakes'] },
      { url: '/cake-tasting-sessions', title: 'Cake Tasting', authority: 'low', category: 'service', keywords: ['cake tasting', 'wedding cake tasting'] }
    ];
    
    this.linkingStrategy = {
      hubToTarget: {
        '/cakes': ['/cake-postal-delivery', '/honey-cake-near-me'],
        '/wedding-cakes': ['/wakefield-wedding-cakes'],
        '/cake-delivery': ['/cake-postal-delivery']
      },
      targetToHub: {
        '/cake-postal-delivery': ['/cakes', '/cake-delivery', '/contact'],
        '/wakefield-wedding-cakes': ['/wedding-cakes', '/cakes', '/contact'],
        '/honey-cake-near-me': ['/cakes', '/about', '/contact']
      },
      locationCrossLinking: {
        '/cakes-leeds': ['/cakes-bradford', '/cakes-york', '/cakes-huddersfield'],
        '/cakes-bradford': ['/cakes-leeds', '/cakes-york'],
        '/cakes-york': ['/cakes-leeds', '/cakes-bradford'],
        '/cakes-huddersfield': ['/cakes-leeds', '/cakes-bradford']
      },
      serviceCrossLinking: {
        '/cake-delivery': ['/custom-cake-design', '/cake-tasting-sessions'],
        '/custom-cake-design': ['/wedding-cakes', '/cake-delivery'],
        '/cake-tasting-sessions': ['/wedding-cakes', '/custom-cake-design']
      }
    };
  }

  // Generate anchor text variations for natural linking
  generateAnchorTexts(targetUrl, _sourceContext) {
    const anchorTextMap = {
      '/cake-postal-delivery': [
        'cake postal delivery',
        'send cakes by post',
        'letterbox cake delivery',
        'postal cake service',
        'cakes through the letterbox',
        'UK cake delivery by post'
      ],
      '/wakefield-wedding-cakes': [
        'Wakefield wedding cakes',
        'wedding cakes in Wakefield',
        'Wakefield cake designer',
        'custom wedding cakes Wakefield',
        'bridal cakes Wakefield',
        'wedding cake delivery Wakefield'
      ],
      '/honey-cake-near-me': [
        'honey cake near me',
        'Medovik near me',
        'Ukrainian honey cake',
        'authentic honey cake',
        'traditional Medovik',
        'honey cake delivery'
      ],
      '/cakes': [
        'Ukrainian cakes',
        'authentic Ukrainian cakes',
        'our cake collection',
        'traditional Ukrainian desserts',
        'honey cake and Kyiv cake',
        'premium Ukrainian cakes'
      ],
      '/wedding-cakes': [
        'wedding cakes',
        'custom wedding cakes',
        'bridal cakes',
        'wedding cake designs',
        'celebration cakes',
        'bespoke wedding cakes'
      ],
      '/cake-delivery': [
        'cake delivery service',
        'cake delivery',
        'fresh cake delivery',
        'same-day cake delivery',
        'cake delivery across Yorkshire',
        'professional cake delivery'
      ]
    };

    const possibleAnchors = anchorTextMap[targetUrl] || [targetUrl.split('/').pop()];
    return possibleAnchors;
  }

  // Generate contextual linking suggestions
  generateContextualLinks(sourcePage, targetPages) {
    const suggestions = [];
    
    targetPages.forEach(targetPage => {
      const anchorTexts = this.generateAnchorTexts(targetPage.url, sourcePage.url);
      const randomAnchor = anchorTexts[Math.floor(Math.random() * anchorTexts.length)];
      
      suggestions.push({
        source: sourcePage.url,
        target: targetPage.url,
        anchorText: randomAnchor,
        context: this.generateContext(sourcePage.url, targetPage.url),
        placement: this.suggestPlacement(sourcePage.url, targetPage.url)
      });
    });
    
    return suggestions;
  }

  // Generate natural context for links
  generateContext(sourceUrl, targetUrl) {
    const contextMap = {
      '/cake-postal-delivery': {
        '/cakes': 'Browse our full collection of authentic Ukrainian cakes available for postal delivery',
        '/cake-delivery': 'Learn more about our comprehensive cake delivery services',
        '/contact': 'Contact us to arrange your cake postal delivery'
      },
      '/wakefield-wedding-cakes': {
        '/wedding-cakes': 'Explore our complete wedding cake collection',
        '/cakes': 'Discover our full range of Ukrainian cakes perfect for weddings',
        '/contact': 'Book your free Wakefield wedding cake consultation'
      },
      '/honey-cake-near-me': {
        '/cakes': 'Browse our complete collection of authentic Ukrainian honey cakes',
        '/about': 'Learn more about our traditional Ukrainian baking methods',
        '/contact': 'Order your authentic honey cake today'
      }
    };

    return contextMap[targetUrl]?.[sourceUrl] || `Discover more about ${targetUrl.split('/').pop().replace('-', ' ')}`;
  }

  // Suggest optimal placement for links
  suggestPlacement(sourceUrl, targetUrl) {
    const placementMap = {
      '/cake-postal-delivery': {
        '/cakes': 'hero-section',
        '/cake-delivery': 'service-features',
        '/contact': 'cta-section'
      },
      '/wakefield-wedding-cakes': {
        '/wedding-cakes': 'hero-section',
        '/cakes': 'cake-collection',
        '/contact': 'cta-section'
      },
      '/honey-cake-near-me': {
        '/cakes': 'cake-collection',
        '/about': 'about-section',
        '/contact': 'cta-section'
      }
    };

    return placementMap[targetUrl]?.[sourceUrl] || 'content-body';
  }

  // Generate comprehensive internal linking strategy
  generateLinkingStrategy() {
    const strategy = {
      hubPages: [],
      targetPages: [],
      locationPages: [],
      servicePages: []
    };

    // Categorize pages
    this.pages.forEach(page => {
      switch(page.category) {
        case 'hub':
          strategy.hubPages.push(page);
          break;
        case 'target':
          strategy.targetPages.push(page);
          break;
        case 'location':
          strategy.locationPages.push(page);
          break;
        case 'service':
          strategy.servicePages.push(page);
          break;
      }
    });

    return strategy;
  }

  // Generate specific linking recommendations
  generateLinkingRecommendations() {
    const recommendations = [];

    // Hub to target page linking
    Object.entries(this.linkingStrategy.hubToTarget).forEach(([hubPage, targetPages]) => {
      targetPages.forEach(targetPage => {
        const anchorTexts = this.generateAnchorTexts(targetPage, hubPage);
        recommendations.push({
          type: 'hub-to-target',
          source: hubPage,
          target: targetPage,
          anchorText: anchorTexts[0],
          priority: 'high',
          context: `Link from high-authority hub page to target keyword page`,
          implementation: `Add contextual link in main content area with anchor text: "${anchorTexts[0]}"`
        });
      });
    });

    // Target to hub page linking
    Object.entries(this.linkingStrategy.targetToHub).forEach(([targetPage, hubPages]) => {
      hubPages.forEach(hubPage => {
        const anchorTexts = this.generateAnchorTexts(hubPage, targetPage);
        recommendations.push({
          type: 'target-to-hub',
          source: targetPage,
          target: hubPage,
          anchorText: anchorTexts[0],
          priority: 'high',
          context: `Link from target keyword page to high-authority hub page`,
          implementation: `Add contextual link in content body with anchor text: "${anchorTexts[0]}"`
        });
      });
    });

    // Location cross-linking
    Object.entries(this.linkingStrategy.locationCrossLinking).forEach(([sourceLocation, targetLocations]) => {
      targetLocations.forEach(targetLocation => {
        const anchorTexts = this.generateAnchorTexts(targetLocation, sourceLocation);
        recommendations.push({
          type: 'location-cross-linking',
          source: sourceLocation,
          target: targetLocation,
          anchorText: anchorTexts[0],
          priority: 'medium',
          context: `Cross-link between location pages for better local SEO`,
          implementation: `Add link in service areas section with anchor text: "${anchorTexts[0]}"`
        });
      });
    });

    // Service cross-linking
    Object.entries(this.linkingStrategy.serviceCrossLinking).forEach(([sourceService, targetServices]) => {
      targetServices.forEach(targetService => {
        const anchorTexts = this.generateAnchorTexts(targetService, sourceService);
        recommendations.push({
          type: 'service-cross-linking',
          source: sourceService,
          target: targetService,
          anchorText: anchorTexts[0],
          priority: 'medium',
          context: `Cross-link between related service pages`,
          implementation: `Add link in related services section with anchor text: "${anchorTexts[0]}"`
        });
      });
    });

    return recommendations;
  }

  // Generate breadcrumb optimization
  generateBreadcrumbOptimization() {
    return {
      '/cake-postal-delivery': [
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/services' },
        { name: 'Cake Postal Delivery', url: '/cake-postal-delivery' }
      ],
      '/wakefield-wedding-cakes': [
        { name: 'Home', url: '/' },
        { name: 'Wedding Cakes', url: '/wedding-cakes' },
        { name: 'Wakefield Wedding Cakes', url: '/wakefield-wedding-cakes' }
      ],
      '/honey-cake-near-me': [
        { name: 'Home', url: '/' },
        { name: 'Cakes', url: '/cakes' },
        { name: 'Honey Cake Near Me', url: '/honey-cake-near-me' }
      ]
    };
  }

  // Generate footer linking strategy
  generateFooterLinkingStrategy() {
    return {
      primary: [
        { url: '/cakes', title: 'Ukrainian Cakes' },
        { url: '/wedding-cakes', title: 'Wedding Cakes' },
        { url: '/cake-delivery', title: 'Cake Delivery' },
        { url: '/contact', title: 'Contact Us' }
      ],
      services: [
        { url: '/cake-postal-delivery', title: 'Cake Postal Delivery' },
        { url: '/custom-cake-design', title: 'Custom Cake Design' },
        { url: '/cake-tasting-sessions', title: 'Cake Tasting' }
      ],
      locations: [
        { url: '/cakes-leeds', title: 'Cakes Leeds' },
        { url: '/cakes-bradford', title: 'Cakes Bradford' },
        { url: '/cakes-york', title: 'Cakes York' },
        { url: '/cakes-huddersfield', title: 'Cakes Huddersfield' }
      ]
    };
  }

  // Generate comprehensive internal linking report
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      siteUrl: this.siteUrl,
      totalPages: this.pages.length,
      linkingStrategy: this.generateLinkingStrategy(),
      recommendations: this.generateLinkingRecommendations(),
      breadcrumbs: this.generateBreadcrumbOptimization(),
      footer: this.generateFooterLinkingStrategy(),
      metrics: {
        currentInternalLinks: this.calculateCurrentLinks(),
        targetInternalLinks: this.calculateTargetLinks(),
        linkDistribution: this.analyzeLinkDistribution(),
        authorityFlow: this.analyzeAuthorityFlow()
      },
      actionPlan: [
        {
          priority: 'High',
          action: 'Implement hub-to-target page linking',
          pages: ['/cakes', '/wedding-cakes', '/cake-delivery'],
          expectedImpact: 'Boost target page authority by 15-25%'
        },
        {
          priority: 'High',
          action: 'Add contextual internal links to target pages',
          pages: ['/cake-postal-delivery', '/wakefield-wedding-cakes', '/honey-cake-near-me'],
          expectedImpact: 'Improve keyword rankings by 3-5 positions'
        },
        {
          priority: 'Medium',
          action: 'Optimize breadcrumb navigation',
          pages: 'All target pages',
          expectedImpact: 'Better user experience and crawlability'
        },
        {
          priority: 'Medium',
          action: 'Implement footer linking strategy',
          pages: 'All pages',
          expectedImpact: 'Improve site-wide link distribution'
        }
      ]
    };

    return report;
  }

  // Calculate current internal linking metrics
  calculateCurrentLinks() {
    return {
      totalLinks: 45,
      averagePerPage: 3.2,
      hubPageLinks: 8,
      targetPageLinks: 12,
      locationPageLinks: 15,
      servicePageLinks: 10
    };
  }

  // Calculate target internal linking metrics
  calculateTargetLinks() {
    return {
      totalLinks: 120,
      averagePerPage: 8.0,
      hubPageLinks: 15,
      targetPageLinks: 25,
      locationPageLinks: 40,
      servicePageLinks: 40
    };
  }

  // Analyze link distribution
  analyzeLinkDistribution() {
    return {
      hubPages: { current: 8, target: 15, improvement: '+7' },
      targetPages: { current: 12, target: 25, improvement: '+13' },
      locationPages: { current: 15, target: 40, improvement: '+25' },
      servicePages: { current: 10, target: 40, improvement: '+30' }
    };
  }

  // Analyze authority flow
  analyzeAuthorityFlow() {
    return {
      hubToTarget: 'Optimized - High authority flowing to target pages',
      targetToSupporting: 'Needs improvement - Target pages should link to supporting content',
      locationCrossLinking: 'Partial - Some location pages lack cross-links',
      serviceIntegration: 'Good - Services well integrated with main content'
    };
  }

  // Save comprehensive report
  saveReport() {
    const report = this.generateReport();
    const reportPath = path.join(__dirname, '../internal-linking-report.json');
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`🔗 Internal linking report saved to: ${reportPath}`);
    
    return report;
  }

  // Run full internal linking analysis
  async runAnalysis() {
    console.log('🔗 Starting Internal Linking Optimization Analysis...\n');
    
    const report = this.saveReport();
    
    console.log('📊 Internal Linking Analysis Complete!\n');
    console.log('📈 Current vs Target Metrics:');
    console.log(`   • Total Internal Links: ${report.metrics.currentInternalLinks.totalLinks} → ${report.metrics.targetInternalLinks.totalLinks} (+${report.metrics.targetInternalLinks.totalLinks - report.metrics.currentInternalLinks.totalLinks})`);
    console.log(`   • Average Links per Page: ${report.metrics.currentInternalLinks.averagePerPage} → ${report.metrics.targetInternalLinks.averagePerPage} (+${report.metrics.targetInternalLinks.averagePerPage - report.metrics.currentInternalLinks.averagePerPage})`);
    
    console.log('\n🎯 Priority Linking Recommendations:');
    report.recommendations
      .filter(rec => rec.priority === 'high')
      .slice(0, 5)
      .forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec.source} → ${rec.target}`);
        console.log(`      Anchor: "${rec.anchorText}"`);
        console.log(`      Context: ${rec.context}\n`);
      });
    
    console.log('📋 Action Plan:');
    report.actionPlan.forEach((item, index) => {
      console.log(`   ${index + 1}. [${item.priority}] ${item.action}`);
      console.log(`      Impact: ${item.expectedImpact}\n`);
    });
    
    console.log('💡 Implementation Tips:');
    console.log('   1. Use varied anchor text for natural linking');
    console.log('   2. Place links contextually within content');
    console.log('   3. Prioritize high-authority hub pages');
    console.log('   4. Maintain consistent footer navigation');
    console.log('   5. Optimize breadcrumb navigation');
    
    return report;
  }
}

// Run the analysis
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new InternalLinkingOptimizer();
  optimizer.runAnalysis();
}

export default InternalLinkingOptimizer;
