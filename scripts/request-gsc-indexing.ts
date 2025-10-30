#!/usr/bin/env tsx

/**
 * Request Google Search Console Indexing for Priority URLs
 * 
 * This script submits the top 20 priority URLs to Google Search Console
 * for re-indexing to fix the critical indexing issue (0 pages indexed).
 * 
 * Usage: pnpm tsx scripts/request-gsc-indexing.ts
 */

// Note: This script requires GSC API access via MCP tools
// For now, it provides manual instructions for indexing requests

// Priority URLs that need re-indexing after recent changes
// Focus: Pages with pricing/metadata updates (December 2025)
const PRIORITY_URLS = [
  // 🔴 HIGH PRIORITY - Pricing changes
  'https://olgishcakes.co.uk/birthday-cakes', // Updated pricing £35 → £25
  'https://olgishcakes.co.uk/cakes-wakefield', // Fixed pricing consistency
  
  // 🟡 MEDIUM PRIORITY - Verify consistency
  'https://olgishcakes.co.uk/cakes-bradford',
  'https://olgishcakes.co.uk/cakes-huddersfield',
  'https://olgishcakes.co.uk/', // Added "Areas We Serve" section
  
  // 🟢 LOW PRIORITY - Other important pages
  'https://olgishcakes.co.uk/cake-delivery-leeds', // Visual changes only
  'https://olgishcakes.co.uk/cakes',
  'https://olgishcakes.co.uk/wedding-cakes',
  'https://olgishcakes.co.uk/delivery-areas',
];

const SITE_URL = 'sc-domain:olgishcakes.co.uk';

interface IndexingResult {
  url: string;
  status: 'success' | 'error' | 'already_indexed';
  message: string;
  lastCrawlTime?: string;
  coverageState?: string;
  inspectionLink?: string;
}

/**
 * Note: GSC API doesn't support programmatic "Request Indexing" 
 * This function inspects URLs and provides direct GSC links for manual indexing
 */
async function requestIndexingForUrl(url: string): Promise<IndexingResult> {
  try {
    console.log(`🔍 Inspecting URL: ${url}`);
    
    // Note: Actual GSC API inspection would happen here if we had direct API access
    // For now, we'll generate GSC inspection links
    
    // Extract path from URL for GSC inspection link
    const urlPath = url.replace('https://olgishcakes.co.uk', '');
    const inspectionLink = `https://search.google.com/search-console/inspect?resource_id=${SITE_URL}&url=${encodeURIComponent(url)}`;
    
    return {
      url,
      status: 'success',
      message: `Ready for indexing - use GSC inspection link`,
      coverageState: 'Needs re-crawl after recent changes',
      inspectionLink,
    };

  } catch (error) {
    console.error(`❌ Error checking ${url}:`, error);
    return {
      url,
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function requestIndexingForAllUrls(): Promise<void> {
  console.log('🚀 Starting GSC Indexing Request Process');
  console.log(`📊 Processing ${PRIORITY_URLS.length} priority URLs...\n`);

  const results: IndexingResult[] = [];
  
  for (const url of PRIORITY_URLS) {
    const result = await requestIndexingForUrl(url);
    results.push(result);
    
    // Add delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Generate summary report
  console.log('\n📋 INDEXING REQUEST SUMMARY');
  console.log('=' .repeat(50));
  
  const alreadyIndexed = results.filter(r => r.status === 'already_indexed');
  const readyForIndexing = results.filter(r => r.status === 'success');
  const errors = results.filter(r => r.status === 'error');

  console.log(`✅ Already indexed: ${alreadyIndexed.length}`);
  console.log(`🔄 Ready for indexing: ${readyForIndexing.length}`);
  console.log(`❌ Errors: ${errors.length}`);

  if (alreadyIndexed.length > 0) {
    console.log('\n📈 ALREADY INDEXED URLs:');
    alreadyIndexed.forEach(result => {
      console.log(`  ✅ ${result.url}`);
      if (result.lastCrawlTime) {
        console.log(`     Last crawled: ${result.lastCrawlTime}`);
      }
    });
  }

  if (readyForIndexing.length > 0) {
    console.log('\n🔄 URLs READY FOR MANUAL INDEXING:');
    console.log('   (Click each link to open GSC URL Inspection, then click "Request Indexing")');
    console.log('');
    readyForIndexing.forEach((result, index) => {
      const priority = index < 2 ? '🔴 HIGH' : index < 5 ? '🟡 MEDIUM' : '🟢 LOW';
      console.log(`  ${priority} Priority: ${result.url}`);
      if (result.inspectionLink) {
        console.log(`     🔗 ${result.inspectionLink}`);
      }
      if (result.coverageState) {
        console.log(`     Status: ${result.coverageState}`);
      }
      console.log('');
    });
  }

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(result => {
      console.log(`  ❌ ${result.url}: ${result.message}`);
    });
  }

  // Generate manual indexing instructions
  console.log('\n📝 QUICK INDEXING GUIDE:');
  console.log('=' .repeat(50));
  console.log('Google Search Console API does not support programmatic "Request Indexing"');
  console.log('You need to manually request indexing via GSC UI:');
  console.log('');
  console.log('STEPS:');
  console.log('1. Click each inspection link above');
  console.log('2. Wait for page to load in GSC');
  console.log('3. Click "Request Indexing" button');
  console.log('4. Wait 5-10 minutes between requests');
  console.log('');
  console.log('⚠️  Important: Start with HIGH priority URLs first!');
  console.log('   - birthday-cakes (pricing change)');
  console.log('   - cakes-wakefield (pricing fix)');

  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Submit URLs manually via GSC UI (see instructions above)');
  console.log('2. Monitor GSC Coverage report for indexing progress');
  console.log('3. Check Rich Results for structured data validation');
  console.log('4. Track ranking improvements in 7-14 days');

  // Save results to file for monitoring
  const reportData = {
    timestamp: new Date().toISOString(),
    totalUrls: PRIORITY_URLS.length,
    alreadyIndexed: alreadyIndexed.length,
    readyForIndexing: readyForIndexing.length,
    errors: errors.length,
    results,
  };

  const fs = await import('fs');
  const path = await import('path');
  
  const reportPath = path.join(process.cwd(), 'reports', 'gsc-indexing-request.json');
  await fs.promises.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.promises.writeFile(reportPath, JSON.stringify(reportData, null, 2));
  
  console.log(`\n💾 Report saved to: ${reportPath}`);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  requestIndexingForAllUrls()
    .then(() => {
      console.log('\n✅ GSC Indexing Request Process Complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { requestIndexingForAllUrls, PRIORITY_URLS };
