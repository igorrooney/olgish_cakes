#!/usr/bin/env tsx

/**
 * Request Google Search Console Indexing for Priority URLs
 * 
 * This script submits the top 20 priority URLs to Google Search Console
 * for re-indexing to fix the critical indexing issue (0 pages indexed).
 * 
 * Usage: pnpm tsx scripts/request-gsc-indexing.ts
 */

import { mcp_gsc_index_inspect } from './mcp-gsc-index-inspect';

// Top 20 priority URLs for indexing
const PRIORITY_URLS = [
  'https://olgishcakes.co.uk/',
  'https://olgishcakes.co.uk/cakes',
  'https://olgishcakes.co.uk/order',
  'https://olgishcakes.co.uk/order/leeds',
  'https://olgishcakes.co.uk/gift-hampers',
  'https://olgishcakes.co.uk/wedding-cakes',
  'https://olgishcakes.co.uk/birthday-cakes',
  'https://olgishcakes.co.uk/market-schedule',
  'https://olgishcakes.co.uk/cakes/honey-cake-medovik',
  'https://olgishcakes.co.uk/about',
  'https://olgishcakes.co.uk/contact',
  'https://olgishcakes.co.uk/faq',
  'https://olgishcakes.co.uk/testimonials',
  'https://olgishcakes.co.uk/delivery-areas',
  'https://olgishcakes.co.uk/cakes-leeds',
  'https://olgishcakes.co.uk/halloween-cakes-leeds',
  'https://olgishcakes.co.uk/nut-free-cakes-leeds',
  'https://olgishcakes.co.uk/gift-hampers/cake-by-post',
  'https://olgishcakes.co.uk/ukrainian-bakery-leeds',
  'https://olgishcakes.co.uk/cake-care-storage',
];

const SITE_URL = 'sc-domain:olgishcakes.co.uk';

interface IndexingResult {
  url: string;
  status: 'success' | 'error' | 'already_indexed';
  message: string;
  lastCrawlTime?: string;
  coverageState?: string;
}

async function requestIndexingForUrl(url: string): Promise<IndexingResult> {
  try {
    console.log(`🔍 Inspecting URL: ${url}`);
    
    const result = await mcp_gsc_index_inspect({
      siteUrl: SITE_URL,
      inspectionUrl: url,
    });

    const inspectionResult = result.inspectionResult;
    const indexStatus = inspectionResult.indexStatusResult;
    
    if (indexStatus.coverageState === 'Submitted and indexed') {
      return {
        url,
        status: 'already_indexed',
        message: 'Already indexed',
        lastCrawlTime: indexStatus.lastCrawlTime,
        coverageState: indexStatus.coverageState,
      };
    }

    // For URLs that need indexing, we can't directly request indexing via the API
    // but we can provide instructions for manual submission
    return {
      url,
      status: 'success',
      message: 'Ready for manual indexing request via GSC UI',
      coverageState: indexStatus.coverageState,
    };

  } catch (error) {
    console.error(`❌ Error inspecting ${url}:`, error);
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
    console.log('   (Submit these via GSC UI: Search Console > URL Inspection)');
    readyForIndexing.forEach(result => {
      console.log(`  🔄 ${result.url}`);
      if (result.coverageState) {
        console.log(`     Status: ${result.coverageState}`);
      }
    });
  }

  if (errors.length > 0) {
    console.log('\n❌ ERRORS:');
    errors.forEach(result => {
      console.log(`  ❌ ${result.url}: ${result.message}`);
    });
  }

  // Generate manual indexing instructions
  console.log('\n📝 MANUAL INDEXING INSTRUCTIONS:');
  console.log('=' .repeat(50));
  console.log('1. Go to Google Search Console: https://search.google.com/search-console');
  console.log('2. Select property: olgishcakes.co.uk');
  console.log('3. Use URL Inspection tool for each URL below:');
  console.log('4. Click "Request Indexing" for each URL');
  console.log('\nURLs to submit manually:');
  readyForIndexing.forEach((result, index) => {
    console.log(`${index + 1}. ${result.url}`);
  });

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
if (require.main === module) {
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
