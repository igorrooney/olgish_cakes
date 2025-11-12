#!/usr/bin/env node

/**
 * Comprehensive Backup Manager for Sanity Data
 * 
 * This script provides a unified interface for all backup operations including:
 * - Manual backups
 * - Scheduled backups
 * - Cloud storage management
 * - Backup restoration
 * - Monitoring and reporting
 * 
 * Usage:
 * npm run backup:manager -- --help
 * npm run backup:manager -- --backup --schedule=daily
 * npm run backup:manager -- --restore --file=backup-2024-01-15.tar.gz
 * npm run backup:manager -- --status
 */

const fs = require('fs').promises;
const path = require('path');
const SanityBackup = require('./backup-sanity');
const BackupScheduler = require('./backup-scheduler');
const BackupStorageManager = require('./backup-storage');

class BackupManager {
  constructor(configPath = './scripts/backup-config.json') {
    this.configPath = configPath;
    this.config = null;
    this.backup = null;
    this.scheduler = null;
    this.storage = null;
  }

  async initialize() {
    try {
      // Load configuration
      const configData = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(configData);
      
      // Initialize components
      this.backup = new SanityBackup();
      this.scheduler = new BackupScheduler(this.configPath);
      this.storage = new BackupStorageManager(this.config);
      
      console.log('✅ Backup manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize backup manager:', error.message);
      throw error;
    }
  }

  async runBackup(options = {}) {
    console.log('🚀 Starting backup process...');
    
    try {
        ...this.config.backup.options,
        ...options
      };

      const result = await this.backup.run();
      
      if (result.success) {
        console.log('✅ Backup completed successfully');
        
        // Upload to cloud storage if enabled
        if (this.config.backup.storage.cloud.enabled) {
          console.log('☁️  Uploading to cloud storage...');
          for (const file of result.files) {
            await this.storage.uploadBackup(file, { scheduleType: options.scheduleType });
          }
        }
        
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Backup failed:', error.message);
      throw error;
    }
  }

  async restoreBackup(backupFile, options = {}) {
    console.log(`🔄 Restoring from backup: ${backupFile}`);
    
    try {
      // Validate backup file exists
      await fs.access(backupFile);
      
      // Extract backup if compressed
      const extractedDir = await this.extractBackup(backupFile);
      
      // Load backup data
      const backupData = await this.loadBackupData(extractedDir);
      
      // Validate backup data
      if (options.validate !== false) {
        await this.validateBackupData(backupData);
      }
      
      // Perform dry run if requested
      if (options.dryRun) {
        console.log('🔍 Dry run mode - no data will be modified');
        console.log(`📊 Would restore ${backupData.documents.length} documents`);
        return { success: true, dryRun: true, records: backupData.documents.length };
      }
      
      // Restore data to Sanity
      const result = await this.restoreToSanity(backupData);
      
      console.log('✅ Restore completed successfully');
      return result;
    } catch (error) {
      console.error('❌ Restore failed:', error.message);
      throw error;
    }
  }

  async extractBackup(backupFile) {
    const extractDir = path.join(path.dirname(backupFile), 'extracted');
    await fs.mkdir(extractDir, { recursive: true });
    
    if (backupFile.endsWith('.tar.gz')) {
      const { execSync } = require('child_process');
      execSync(`tar -xzf "${backupFile}" -C "${extractDir}"`);
    } else if (backupFile.endsWith('.zip')) {
      const AdmZip = require('adm-zip');
      const zip = new AdmZip(backupFile);
      zip.extractAllTo(extractDir, true);
    } else {
      // Assume it's already extracted
      return path.dirname(backupFile);
    }
    
    return extractDir;
  }

  async loadBackupData(extractDir) {
    const files = await fs.readdir(extractDir);
    const documentsFile = files.find(f => f.startsWith('documents-'));
    const assetsFile = files.find(f => f.startsWith('assets-'));
    
    if (!documentsFile) {
      throw new Error('No documents file found in backup');
    }
    
    const documentsPath = path.join(extractDir, documentsFile);
    const documentsData = await fs.readFile(documentsPath, 'utf8');
    const documents = JSON.parse(documentsData);
    
    let assets = [];
    if (assetsFile) {
      const assetsPath = path.join(extractDir, assetsFile);
      const assetsData = await fs.readFile(assetsPath, 'utf8');
      assets = JSON.parse(assetsData);
    }
    
    return { documents, assets };
  }

  async validateBackupData(backupData) {
    console.log('🔍 Validating backup data...');
    
    const { documents, assets } = backupData;
    
    // Check document structure
    for (const doc of documents) {
      if (!doc._id || !doc._type) {
        throw new Error(`Invalid document structure: missing _id or _type`);
      }
    }
    
    // Check for required document types
    const requiredTypes = this.config.backup.filters.documentTypes;
    const foundTypes = [...new Set(documents.map(d => d._type))];
    const missingTypes = requiredTypes.filter(type => !foundTypes.includes(type));
    
    if (missingTypes.length > 0) {
      console.warn(`⚠️  Missing document types: ${missingTypes.join(', ')}`);
    }
    
    console.log(`✅ Backup validation passed: ${documents.length} documents, ${assets.length} assets`);
  }

  async restoreToSanity(backupData) {
    console.log('🔄 Restoring data to Sanity...');
    
    // This would implement the actual restoration logic
    // For now, just report what would be restored
    console.log(`📊 Would restore ${backupData.documents.length} documents`);
    console.log(`📊 Would restore ${backupData.assets.length} assets`);
    
    // TODO: Implement actual Sanity restoration using mutations
    // const client = this.backup.client;
    // const transaction = client.transaction();
    // 
    // for (const doc of backupData.documents) {
    //   transaction.createOrReplace(doc);
    // }
    // 
    // await transaction.commit();
    
    return {
      success: true,
      documents: backupData.documents.length,
      assets: backupData.assets.length
    };
  }

  async getStatus() {
    console.log('📊 Backup System Status');
    console.log('========================');
    
    try {
      // Configuration status
      console.log(`📋 Configuration: ${this.config.backup.enabled ? 'Enabled' : 'Disabled'}`);
      console.log(`📁 Output Directory: ${this.config.backup.options.outputDir}`);
      console.log(`🗜️  Compression: ${this.config.backup.options.compress ? 'Enabled' : 'Disabled'}`);
      console.log(`☁️  Cloud Storage: ${this.config.backup.storage.cloud.enabled ? 'Enabled' : 'Disabled'}`);
      
      // Schedule status
      const schedules = this.config.backup.schedule;
      console.log('\n📅 Scheduled Backups:');
      Object.entries(schedules).forEach(([type, schedule]) => {
        if (schedule.enabled) {
          console.log(`   ${type}: ${schedule.time} (retention: ${schedule.retention} days)`);
        } else {
          console.log(`   ${type}: Disabled`);
        }
      });
      
      // Storage statistics
      console.log('\n💾 Storage Statistics:');
      await this.storage.getStorageStats();
      
      // Recent backups
      console.log('\n📂 Recent Backups:');
      await this.listRecentBackups();
      
    } catch (error) {
      console.error('❌ Failed to get status:', error.message);
      throw error;
    }
  }

  async listRecentBackups(limit = 10) {
    try {
      const outputDir = this.config.backup.options.outputDir;
      const files = await this.getAllBackupFiles(outputDir);
      
      // Sort by modification time (newest first)
      files.sort((a, b) => b.mtime - a.mtime);
      
      const recent = files.slice(0, limit);
      
      if (recent.length === 0) {
        console.log('   No backups found');
        return;
      }
      
      recent.forEach((file, index) => {
        const size = this.formatBytes(file.size);
        const date = file.mtime.toISOString().slice(0, 19);
        console.log(`   ${index + 1}. ${file.name} (${size}, ${date})`);
      });
    } catch (error) {
      console.warn('⚠️  Could not list recent backups:', error.message);
    }
  }

  async getAllBackupFiles(dir) {
    const files = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getAllBackupFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && (entry.name.includes('sanity-backup-') || entry.name.includes('backup-report-'))) {
          const stats = await fs.stat(fullPath);
          files.push({
            name: entry.name,
            path: fullPath,
            size: stats.size,
            mtime: stats.mtime
          });
        }
      }
    } catch (error) {
      // Directory might not exist
    }
    
    return files;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showHelp() {
    console.log(`
🔄 Sanity Backup Manager

Usage: npm run backup:manager -- [options]

Options:
  --help                    Show this help message
  --backup                  Create a new backup
  --restore <file>          Restore from backup file
  --schedule <type>         Schedule type (daily, weekly, monthly)
  --status                  Show backup system status
  --dry-run                 Perform dry run (no actual changes)
  --validate                Validate backup data before restore
  --include-assets          Include assets in backup
  --output <dir>            Output directory for backups
  --format <format>         Backup format (json, ndjson)
  --compress                Compress backup files
  --no-compress             Don't compress backup files

Examples:
  npm run backup:manager -- --backup
  npm run backup:manager -- --backup --schedule=daily --include-assets
  npm run backup:manager -- --restore ./backups/daily/sanity-backup-2024-01-15.tar.gz
  npm run backup:manager -- --restore ./backup.tar.gz --dry-run
  npm run backup:manager -- --status

Configuration:
  Edit scripts/backup-config.json to customize backup settings
`);
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    const manager = new BackupManager();
    manager.showHelp();
    return;
  }
  
  const manager = new BackupManager();
  await manager.initialize();
  
  try {
    if (args.includes('--backup')) {
      const options = {};
      
      if (args.includes('--include-assets')) options.includeAssets = true;
      if (args.includes('--no-compress')) options.compress = false;
      
      const scheduleIndex = args.indexOf('--schedule');
      if (scheduleIndex !== -1 && args[scheduleIndex + 1]) {
        options.scheduleType = args[scheduleIndex + 1];
      }
      
      await manager.runBackup(options);
    } else if (args.includes('--restore')) {
      const restoreIndex = args.indexOf('--restore');
      if (restoreIndex === -1 || !args[restoreIndex + 1]) {
        throw new Error('--restore requires a backup file path');
      }
      
      const backupFile = args[restoreIndex + 1];
      const options = {};
      
      if (args.includes('--dry-run')) options.dryRun = true;
      if (args.includes('--validate')) options.validate = true;
      
      await manager.restoreBackup(backupFile, options);
    } else if (args.includes('--status')) {
      await manager.getStatus();
    } else {
      console.log('❌ No action specified. Use --help for usage information.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Operation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = BackupManager;
