#!/usr/bin/env node

/**
 * Sanity Data Backup Script for Olgish Cakes
 * 
 * This script creates comprehensive backups of all Sanity data including:
 * - All documents in JSON format
 * - Assets metadata
 * - Dataset configuration
 * - Backup metadata with timestamps
 * 
 * Usage:
 * npm run backup:sanity
 * npm run backup:sanity -- --format=json
 * npm run backup:sanity -- --output=./backups
 * npm run backup:sanity -- --include-assets
 */

import { createClient } from '@sanity/client';
import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

// Default options
const defaultOptions = {
  outputDir: './backups',
  format: 'json',
  includeAssets: false,
  compress: true,
  timestamp: new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
};

class SanityBackup {
  constructor(options = {}) {
    this.options = { ...defaultOptions, ...options };
    this.client = null;
    this.backupInfo = {
      timestamp: new Date().toISOString(),
      projectId: config.projectId,
      dataset: config.dataset,
      version: '1.0.0',
      records: {
        documents: 0,
        assets: 0,
        total: 0
      }
    };
  }

  async initialize() {
    console.log('🚀 Initializing Sanity backup...');
    
    if (!config.projectId || !config.dataset || !config.token) {
      throw new Error('Missing required Sanity configuration. Please check your environment variables.');
    }

    this.client = createClient({
      projectId: config.projectId,
      dataset: config.dataset,
      token: config.token,
      apiVersion: config.apiVersion,
      useCdn: false
    });

    // Create output directory
    await fs.mkdir(this.options.outputDir, { recursive: true });
    
    console.log(`📁 Backup directory: ${this.options.outputDir}`);
    console.log(`🎯 Project: ${config.projectId}/${config.dataset}`);
  }

  async fetchAllDocuments() {
    console.log('📄 Fetching all documents...');
    
    const query = `*[_type in ["cake", "giftHamper", "testimonial", "faq", "marketSchedule", "blogPost"]] | order(_createdAt desc)`;
    const documents = await this.client.fetch(query);
    
    this.backupInfo.records.documents = documents.length;
    console.log(`✅ Found ${documents.length} documents`);
    
    return documents;
  }

  async fetchAssets() {
    if (!this.options.includeAssets) {
      return [];
    }

    console.log('🖼️  Fetching assets metadata...');
    
    const query = `*[_type == "sanity.imageAsset" || _type == "sanity.fileAsset"] | order(_createdAt desc)`;
    const assets = await this.client.fetch(query);
    
    this.backupInfo.records.assets = assets.length;
    console.log(`✅ Found ${assets.length} assets`);
    
    return assets;
  }

  async fetchDatasetInfo() {
    console.log('📊 Fetching dataset information...');
    
    try {
      const info = await this.client.request({
        uri: `/projects/${config.projectId}/datasets/${config.dataset}`,
        withCredentials: true
      });
      return info;
    } catch (error) {
      console.warn('⚠️  Could not fetch dataset info:', error.message);
      return null;
    }
  }

  async saveBackup(data, filename) {
    const filePath = path.join(this.options.outputDir, filename);
    
    if (this.options.format === 'json') {
      const jsonData = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonData, 'utf8');
    } else if (this.options.format === 'ndjson') {
      const ndjsonData = data.map(item => JSON.stringify(item)).join('\n');
      await fs.writeFile(filePath, ndjsonData, 'utf8');
    }
    
    console.log(`💾 Saved: ${filename}`);
    return filePath;
  }

  async compressBackup(files) {
    if (!this.options.compress) {
      return files;
    }

    console.log('🗜️  Compressing backup files...');
    
    const timestamp = this.options.timestamp;
    const archiveName = `sanity-backup-${timestamp}.tar.gz`;
    const archivePath = path.join(this.options.outputDir, archiveName);
    
    try {
      // Create tar.gz archive
      const filesList = files.map(f => path.basename(f)).join(' ');
      execSync(`cd "${this.options.outputDir}" && tar -czf "${archiveName}" ${filesList}`, {
        stdio: 'pipe'
      });
      
      console.log(`✅ Created compressed archive: ${archiveName}`);
      
      // Remove individual files after compression
      for (const file of files) {
        await fs.unlink(file);
      }
      
      return [archivePath];
    } catch (error) {
      console.warn('⚠️  Compression failed, keeping individual files:', error.message);
      return files;
    }
  }

  async createBackupReport(files) {
    const report = {
      ...this.backupInfo,
      files: files.map(f => ({
        name: path.basename(f),
        size: await this.getFileSize(f),
        created: new Date().toISOString()
      })),
      totalSize: await this.getTotalSize(files)
    };

    const reportPath = path.join(this.options.outputDir, `backup-report-${this.options.timestamp}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log('📋 Backup report created');
    return report;
  }

  async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch {
      return 0;
    }
  }

  async getTotalSize(files) {
    let total = 0;
    for (const file of files) {
      total += await this.getFileSize(file);
    }
    return total;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async run() {
    try {
      await this.initialize();
      
      // Fetch all data
      const [documents, assets, datasetInfo] = await Promise.all([
        this.fetchAllDocuments(),
        this.fetchAssets(),
        this.fetchDatasetInfo()
      ]);

      this.backupInfo.records.total = this.backupInfo.records.documents + this.backupInfo.records.assets;

      // Save data files
      const files = [];
      
      // Save documents
      const documentsFile = `documents-${this.options.timestamp}.${this.options.format}`;
      files.push(await this.saveBackup(documents, documentsFile));
      
      // Save assets if included
      if (assets.length > 0) {
        const assetsFile = `assets-${this.options.timestamp}.${this.options.format}`;
        files.push(await this.saveBackup(assets, assetsFile));
      }
      
      // Save dataset info if available
      if (datasetInfo) {
        const datasetFile = `dataset-info-${this.options.timestamp}.json`;
        files.push(await this.saveBackup(datasetInfo, datasetFile));
      }

      // Compress if requested
      const finalFiles = await this.compressBackup(files);
      
      // Create backup report
      const report = await this.createBackupReport(finalFiles);
      
      // Summary
      console.log('\n🎉 Backup completed successfully!');
      console.log(`📊 Records backed up: ${this.backupInfo.records.total}`);
      console.log(`   - Documents: ${this.backupInfo.records.documents}`);
      console.log(`   - Assets: ${this.backupInfo.records.assets}`);
      console.log(`💾 Total size: ${this.formatBytes(report.totalSize)}`);
      console.log(`📁 Files created: ${finalFiles.length}`);
      
      return {
        success: true,
        files: finalFiles,
        report,
        records: this.backupInfo.records
      };
      
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      console.error(error.stack);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      
      switch (key) {
        case 'format':
          options.format = value;
          break;
        case 'output':
          options.outputDir = value;
          break;
        case 'include-assets':
          options.includeAssets = true;
          i--; // Don't skip next arg
          break;
        case 'no-compress':
          options.compress = false;
          i--; // Don't skip next arg
          break;
      }
    }
  }
  
  const backup = new SanityBackup(options);
  const result = await backup.run();
  
  process.exit(result.success ? 0 : 1);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SanityBackup;
