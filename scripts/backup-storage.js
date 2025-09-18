#!/usr/bin/env node

/**
 * Backup Storage Manager for Sanity Backups
 * 
 * This script handles uploading backups to cloud storage providers
 * and managing local backup files. Supports AWS S3, Google Cloud Storage,
 * and Azure Blob Storage.
 * 
 * Usage:
 * npm run backup:upload -- --file=./backups/daily/sanity-backup-2024-01-15.tar.gz
 * npm run backup:sync -- --schedule=daily
 */

const fs = require('fs').promises;
const path = require('path');

class BackupStorageManager {
  constructor(config) {
    this.config = config;
    this.providers = {
      aws: require('./storage-providers/aws-s3'),
      gcp: require('./storage-providers/gcp-storage'),
      azure: require('./storage-providers/azure-blob')
    };
  }

  async uploadBackup(filePath, options = {}) {
    const storageConfig = this.config.backup.storage;
    
    if (!storageConfig.cloud.enabled) {
      console.log('☁️  Cloud storage is disabled in configuration');
      return { success: true, message: 'Cloud storage disabled' };
    }

    const provider = this.providers[storageConfig.cloud.provider];
    if (!provider) {
      throw new Error(`Unsupported cloud provider: ${storageConfig.cloud.provider}`);
    }

    try {
      console.log(`☁️  Uploading backup to ${storageConfig.cloud.provider}...`);
      
      const uploadResult = await provider.upload({
        filePath,
        bucket: storageConfig.cloud.bucket,
        region: storageConfig.cloud.region,
        key: this.generateCloudKey(filePath, options)
      });

      console.log(`✅ Backup uploaded successfully: ${uploadResult.url || uploadResult.key}`);
      return uploadResult;
    } catch (error) {
      console.error(`❌ Upload failed:`, error.message);
      throw error;
    }
  }

  generateCloudKey(filePath, options = {}) {
    const storageConfig = this.config.backup.storage;
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const scheduleType = options.scheduleType || 'manual';
    
    return `${storageConfig.cloud.path}/${scheduleType}/${timestamp}/${fileName}`;
  }

  async syncBackups(scheduleType) {
    const localPath = path.join(this.config.backup.options.outputDir, scheduleType);
    
    try {
      const files = await fs.readdir(localPath);
      const backupFiles = files.filter(file => 
        file.includes('sanity-backup-') || file.includes('backup-report-')
      );

      console.log(`🔄 Syncing ${backupFiles.length} files for ${scheduleType} schedule...`);

      const results = [];
      for (const file of backupFiles) {
        const filePath = path.join(localPath, file);
        try {
          const result = await this.uploadBackup(filePath, { scheduleType });
          results.push({ file, success: true, result });
        } catch (error) {
          results.push({ file, success: false, error: error.message });
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`📊 Sync completed: ${successful} successful, ${failed} failed`);
      
      if (failed > 0) {
        console.log('❌ Failed uploads:');
        results.filter(r => !r.success).forEach(r => {
          console.log(`   - ${r.file}: ${r.error}`);
        });
      }

      return results;
    } catch (error) {
      console.error(`❌ Sync failed:`, error.message);
      throw error;
    }
  }

  async listCloudBackups(options = {}) {
    const storageConfig = this.config.backup.storage;
    
    if (!storageConfig.cloud.enabled) {
      console.log('☁️  Cloud storage is disabled');
      return [];
    }

    const provider = this.providers[storageConfig.cloud.provider];
    if (!provider) {
      throw new Error(`Unsupported cloud provider: ${storageConfig.cloud.provider}`);
    }

    try {
      const prefix = options.scheduleType 
        ? `${storageConfig.cloud.path}/${options.scheduleType}/`
        : storageConfig.cloud.path;

      const files = await provider.list({
        bucket: storageConfig.cloud.bucket,
        prefix,
        maxKeys: options.limit || 100
      });

      console.log(`📁 Found ${files.length} backup files in cloud storage`);
      return files;
    } catch (error) {
      console.error(`❌ Failed to list cloud backups:`, error.message);
      throw error;
    }
  }

  async downloadBackup(cloudKey, localPath) {
    const storageConfig = this.config.backup.storage;
    const provider = this.providers[storageConfig.cloud.provider];

    try {
      console.log(`⬇️  Downloading backup: ${cloudKey}`);
      
      const result = await provider.download({
        bucket: storageConfig.cloud.bucket,
        key: cloudKey,
        localPath
      });

      console.log(`✅ Backup downloaded: ${localPath}`);
      return result;
    } catch (error) {
      console.error(`❌ Download failed:`, error.message);
      throw error;
    }
  }

  async cleanupLocalBackups(scheduleType, retentionDays) {
    const localPath = path.join(this.config.backup.options.outputDir, scheduleType);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const files = await fs.readdir(localPath);
      const backupFiles = files
        .filter(file => file.includes('sanity-backup-') || file.includes('backup-report-'))
        .map(file => ({
          name: file,
          path: path.join(localPath, file),
          stats: null
        }));

      // Get file stats
      for (const file of backupFiles) {
        try {
          const stats = await fs.stat(file.path);
          file.stats = stats;
          file.date = stats.mtime;
        } catch {
          // Skip files we can't stat
        }
      }

      // Find old files
      const oldFiles = backupFiles.filter(file => file.date < cutoffDate);
      
      if (oldFiles.length === 0) {
        console.log(`✅ No old backups to clean up for ${scheduleType}`);
        return [];
      }

      console.log(`🗑️  Cleaning up ${oldFiles.length} old backup files...`);

      const removedFiles = [];
      for (const file of oldFiles) {
        try {
          await fs.unlink(file.path);
          removedFiles.push(file.name);
          console.log(`   - Removed: ${file.name}`);
        } catch (error) {
          console.warn(`   - Failed to remove ${file.name}: ${error.message}`);
        }
      }

      console.log(`✅ Cleanup completed: ${removedFiles.length} files removed`);
      return removedFiles;
    } catch (error) {
      console.error(`❌ Cleanup failed:`, error.message);
      throw error;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async getStorageStats() {
    const stats = {
      local: { files: 0, size: 0 },
      cloud: { files: 0, size: 0 }
    };

    try {
      // Local stats
      const localPath = this.config.backup.options.outputDir;
      const files = await this.getAllBackupFiles(localPath);
      
      stats.local.files = files.length;
      stats.local.size = await this.getTotalSize(files);

      // Cloud stats (if enabled)
      if (this.config.backup.storage.cloud.enabled) {
        const cloudFiles = await this.listCloudBackups();
        stats.cloud.files = cloudFiles.length;
        stats.cloud.size = cloudFiles.reduce((sum, file) => sum + (file.size || 0), 0);
      }

      console.log('📊 Storage Statistics:');
      console.log(`   Local: ${stats.local.files} files, ${this.formatBytes(stats.local.size)}`);
      console.log(`   Cloud: ${stats.cloud.files} files, ${this.formatBytes(stats.cloud.size)}`);

      return stats;
    } catch (error) {
      console.error(`❌ Failed to get storage stats:`, error.message);
      throw error;
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
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist
    }
    
    return files;
  }

  async getTotalSize(files) {
    let total = 0;
    
    for (const file of files) {
      try {
        const stats = await fs.stat(file);
        total += stats.size;
      } catch {
        // Skip files we can't stat
      }
    }
    
    return total;
  }
}

module.exports = BackupStorageManager;
