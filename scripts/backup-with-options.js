#!/usr/bin/env node

/**
 * Sanity Backup Script with Options
 * 
 * Usage:
 * node scripts/backup-with-options.js                    # Backup documents only
 * node scripts/backup-with-options.js --include-assets   # Backup documents + assets
 * node scripts/backup-with-options.js --assets-only      # Backup assets only
 */

import { createClient } from '@sanity/client';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: './env.local' });

// Configuration
const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31'
};

// Parse command line arguments
const args = process.argv.slice(2);
const includeAssets = args.includes('--include-assets');
const assetsOnly = args.includes('--assets-only');
const compress = !args.includes('--no-compress');

async function createBackup() {
  console.log('🚀 Starting Sanity backup...');
  
  if (!config.projectId || !config.dataset || !config.token) {
    throw new Error('Missing required Sanity configuration');
  }

  const client = createClient({
    projectId: config.projectId,
    dataset: config.dataset,
    token: config.token,
    apiVersion: config.apiVersion,
    useCdn: false
  });

  // Create backup directory
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const scheduleType = process.env.BACKUP_SCHEDULE_TYPE || 'manual';
  const outputDir = `./backups/${scheduleType}`;
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`📁 Backup directory: ${outputDir}`);
  console.log(`🎯 Project: ${config.projectId}/${config.dataset}`);
  console.log(`🖼️  Include assets: ${includeAssets || assetsOnly ? 'Yes' : 'No'}`);
  console.log(`🗜️  Compression: ${compress ? 'Enabled' : 'Disabled'}`);

  let documents = [];
  let assets = [];
  let downloadedAssets = [];
  let totalAssetsSize = 0;

  // Fetch documents (unless assets-only)
  if (!assetsOnly) {
    console.log('📄 Fetching all documents...');
    const query = `*[_type in ["cake", "giftHamper", "testimonial", "faq", "marketSchedule", "blogPost"]] | order(_createdAt desc)`;
    documents = await client.fetch(query);
    console.log(`✅ Found ${documents.length} documents`);
  }

  // Fetch and download assets (if requested)
  if (includeAssets || assetsOnly) {
    console.log('🖼️  Fetching all assets...');
    const assetsQuery = `*[_type == "sanity.imageAsset" || _type == "sanity.fileAsset"] | order(_createdAt desc)`;
    assets = await client.fetch(assetsQuery);
    console.log(`✅ Found ${assets.length} assets`);

    // Create assets directory
    const assetsDir = path.join(outputDir, 'assets');
    await fs.mkdir(assetsDir, { recursive: true });

    // Download all image assets
    console.log('⬇️  Downloading image assets...');
    
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      try {
        // Use the asset's built-in URL
        const assetUrl = asset.url;
        
        if (!assetUrl) {
          throw new Error('Asset URL not available');
        }
        
        // Download the asset
        const response = await fetch(assetUrl);
        if (!response.ok) {
          throw new Error(`Failed to download asset: ${response.statusText}`);
        }
        
        const buffer = await response.arrayBuffer();
        const fileName = asset.originalFilename || `${asset._id}.${asset.extension || 'bin'}`;
        const filePath = path.join(assetsDir, fileName);
        
        await fs.writeFile(filePath, Buffer.from(buffer));
        
        downloadedAssets.push({
          ...asset,
          localPath: filePath,
          fileName: fileName,
          size: buffer.byteLength
        });
        
        console.log(`   ${i + 1}/${assets.length}: ${fileName} (${Math.round(buffer.byteLength / 1024)} KB)`);
        
      } catch (error) {
        console.warn(`   ⚠️  Failed to download asset ${asset._id}: ${error.message}`);
        downloadedAssets.push({
          ...asset,
          downloadError: error.message
        });
      }
    }

    console.log(`✅ Downloaded ${downloadedAssets.filter(a => !a.downloadError).length}/${assets.length} assets`);
    
    // Calculate total assets size
    totalAssetsSize = downloadedAssets
      .filter(a => !a.downloadError && a.size)
      .reduce((sum, a) => sum + a.size, 0);
  }

  // Create backup data
  const backupData = {
    metadata: {
      timestamp: new Date().toISOString(),
      projectId: config.projectId,
      dataset: config.dataset,
      version: '1.0.0',
      recordCount: documents.length,
      assetCount: assets.length,
      downloadedAssetCount: downloadedAssets.filter(a => !a.downloadError).length,
      includeAssets: includeAssets || assetsOnly,
      assetsOnly: assetsOnly
    },
    documents: documents,
    assets: downloadedAssets
  };

  // Save backup file
  const filename = `sanity-backup-${timestamp}.json`;
  const filepath = path.join(outputDir, filename);
  
  await fs.writeFile(filepath, JSON.stringify(backupData, null, 2), 'utf8');
  
  console.log(`💾 Backup saved: ${filename}`);
  
  // Get file size
  const stats = await fs.stat(filepath);
  const sizeKB = Math.round(stats.size / 1024);
  console.log(`📊 Backup size: ${sizeKB} KB`);
  
  // Create backup report
  const report = {
    ...backupData.metadata,
    filename: filename,
    filepath: filepath,
    size: stats.size,
    totalAssetsSize: totalAssetsSize,
    documentsByType: documents.reduce((acc, doc) => {
      acc[doc._type] = (acc[doc._type] || 0) + 1;
      return acc;
    }, {}),
    assetsByType: downloadedAssets.reduce((acc, asset) => {
      const type = asset._type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}),
    downloadErrors: downloadedAssets.filter(a => a.downloadError).length
  };
  
  const reportFilename = `backup-report-${timestamp}.json`;
  const reportFilepath = path.join(outputDir, reportFilename);
  await fs.writeFile(reportFilepath, JSON.stringify(report, null, 2), 'utf8');
  
  console.log(`📋 Report saved: ${reportFilename}`);
  
  // Show summary
  console.log('\n🎉 Backup completed successfully!');
  console.log(`📊 Records backed up: ${documents.length}`);
  if (includeAssets || assetsOnly) {
    console.log(`🖼️  Assets downloaded: ${report.downloadedAssetCount}/${report.assetCount}`);
    console.log(`📁 Files created: 2 + ${report.downloadedAssetCount} assets`);
    console.log(`🖼️  Assets size: ${Math.round(totalAssetsSize / 1024)} KB`);
  } else {
    console.log(`📁 Files created: 2`);
  }
  console.log(`💾 Total backup size: ${sizeKB} KB`);
  
  if (documents.length > 0) {
    console.log('\n📊 Documents by type:');
    Object.entries(report.documentsByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
  }
  
  if (downloadedAssets.length > 0) {
    console.log('\n🖼️  Assets by type:');
    Object.entries(report.assetsByType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    if (report.downloadErrors > 0) {
      console.log(`\n⚠️  ${report.downloadErrors} assets failed to download`);
    }
  }
  
  // Compress if requested
  if (compress && (includeAssets || assetsOnly)) {
    console.log('\n🗜️  Compressing backup...');
    try {
      const archiveName = `sanity-backup-${timestamp}.tar.gz`;
      const archivePath = path.join(outputDir, archiveName);
      
      execSync(`cd "${outputDir}" && tar -czf "${archiveName}" ${filename} ${reportFilename} assets/`, {
        stdio: 'pipe'
      });
      
      const archiveStats = await fs.stat(archivePath);
      const archiveSizeKB = Math.round(archiveStats.size / 1024);
      
      console.log(`✅ Compressed archive created: ${archiveName}`);
      console.log(`📊 Archive size: ${archiveSizeKB} KB`);
      
      // Remove individual files after compression
      await fs.unlink(filepath);
      await fs.unlink(reportFilepath);
      await fs.rmdir(path.join(outputDir, 'assets'), { recursive: true });
      
      console.log('🗑️  Individual files removed (kept compressed archive)');
      
    } catch (error) {
      console.warn('⚠️  Compression failed, keeping individual files:', error.message);
    }
  }
  
  return {
    success: true,
    files: [filepath, reportFilepath],
    records: documents.length,
    assets: report.downloadedAssetCount,
    size: stats.size,
    assetsSize: totalAssetsSize
  };
}

// Show usage if help requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
🚀 Sanity Backup Script with Options

Usage:
  node scripts/backup-with-options.js                    # Backup documents only
  node scripts/backup-with-options.js --include-assets   # Backup documents + assets
  node scripts/backup-with-options.js --assets-only      # Backup assets only
  node scripts/backup-with-options.js --no-compress      # Disable compression

Options:
  --include-assets   Include all images and files in backup
  --assets-only      Backup only assets (no documents)
  --no-compress      Don't create compressed archive
  --help, -h         Show this help message

Examples:
  # Quick backup (documents only, ~170KB)
  node scripts/backup-with-options.js

  # Full backup with all images (may be 10-100MB+)
  node scripts/backup-with-options.js --include-assets

  # Just download all images
  node scripts/backup-with-options.js --assets-only
`);
  process.exit(0);
}

// Run backup
createBackup().catch(error => {
  console.error('❌ Backup failed:', error.message);
  process.exit(1);
});
