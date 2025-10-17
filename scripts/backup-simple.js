#!/usr/bin/env node

/**
 * Simple Sanity Backup Script
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
dotenv.config({ path: './.env.local' });

// Configuration
const config = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31'
};

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

  // Fetch all documents
  console.log('📄 Fetching all documents...');
  const query = `*[_type in ["cake", "giftHamper", "testimonial", "faq", "marketSchedule", "blogPost"]] | order(_createdAt desc)`;
  const documents = await client.fetch(query);
  
  console.log(`✅ Found ${documents.length} documents`);

  // Only fetch assets if this is a full backup (not daily)
  let assets = [];
  let downloadedAssets = [];
  let totalAssetsSize = 0;
  
  if (scheduleType !== 'daily') {
    console.log('🖼️  Fetching all assets...');
    const assetsQuery = `*[_type == "sanity.imageAsset" || _type == "sanity.fileAsset"] | order(_createdAt desc)`;
    assets = await client.fetch(assetsQuery);
    
    console.log(`✅ Found ${assets.length} assets`);
  } else {
    console.log('📄 Daily backup: Skipping assets (documents only)');
  }

  // Download assets only if we have them
  if (assets.length > 0) {
    // Create assets directory for downloading images
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
      downloadedAssetCount: downloadedAssets.filter(a => !a.downloadError).length
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
  console.log(`🖼️  Assets downloaded: ${report.downloadedAssetCount}/${report.assetCount}`);
  console.log(`📁 Files created: 2 + ${report.downloadedAssetCount} assets`);
  console.log(`💾 Backup size: ${sizeKB} KB`);
  console.log(`🖼️  Assets size: ${Math.round(totalAssetsSize / 1024)} KB`);
  
  console.log('\n📊 Documents by type:');
  Object.entries(report.documentsByType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  
  console.log('\n🖼️  Assets by type:');
  Object.entries(report.assetsByType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  
  if (report.downloadErrors > 0) {
    console.log(`\n⚠️  ${report.downloadErrors} assets failed to download`);
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

// Run backup
createBackup().catch(error => {
  console.error('❌ Backup failed:', error.message);
  process.exit(1);
});
