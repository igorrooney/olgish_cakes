#!/usr/bin/env node

/**
 * Backup System Setup Script
 * 
 * This script helps set up the Sanity backup system by:
 * - Creating necessary directories
 * - Validating configuration
 * - Testing backup functionality
 * - Setting up initial backup
 * 
 * Usage: npm run backup:setup
 */

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: './.env.local' });

class BackupSetup {
  constructor() {
    this.configPath = './scripts/backup-config.json';
    this.backupDir = './backups';
    this.requiredDirs = [
      './backups',
      './backups/daily',
      './backups/weekly', 
      './backups/monthly',
      './backups/manual'
    ];
  }

  async run() {
    console.log('🚀 Setting up Sanity Backup System for Olgish Cakes');
    console.log('==================================================\n');

    try {
      await this.validateEnvironment();
      await this.createDirectories();
      await this.validateConfiguration();
      await this.testBackupFunctionality();
      await this.createInitialBackup();
      await this.showNextSteps();
      
      console.log('\n✅ Backup system setup completed successfully!');
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      console.error('\nPlease check the error above and try again.');
      process.exit(1);
    }
  }

  async validateEnvironment() {
    console.log('🔍 Validating environment...');
    
    // Check required environment variables
    const required = [
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'NEXT_PUBLIC_SANITY_DATASET', 
      'SANITY_API_TOKEN'
    ];
    
    const missing = [];
    for (const envVar of required) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    console.log(`✅ Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    console.log(`✅ Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
    console.log(`✅ API Token: ${process.env.SANITY_API_TOKEN ? 'Set' : 'Missing'}`);
  }

  async createDirectories() {
    console.log('\n📁 Creating backup directories...');
    
    for (const dir of this.requiredDirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`✅ Created: ${dir}`);
      } catch (error) {
        throw new Error(`Failed to create directory ${dir}: ${error.message}`);
      }
    }
  }

  async validateConfiguration() {
    console.log('\n⚙️  Validating configuration...');
    
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      const config = JSON.parse(configData);
      
      // Basic validation
      if (!config.backup) {
        throw new Error('Missing backup configuration section');
      }
      
      if (!config.backup.options) {
        throw new Error('Missing backup options configuration');
      }
      
      if (!config.backup.schedule) {
        throw new Error('Missing backup schedule configuration');
      }
      
      console.log('✅ Configuration file is valid');
      console.log(`✅ Output directory: ${config.backup.options.outputDir}`);
      console.log(`✅ Compression: ${config.backup.options.compress ? 'Enabled' : 'Disabled'}`);
      console.log(`✅ Cloud storage: ${config.backup.storage.cloud.enabled ? 'Enabled' : 'Disabled'}`);
      
    } catch (error) {
      throw new Error(`Configuration validation failed: ${error.message}`);
    }
  }

  async testBackupFunctionality() {
    console.log('\n🧪 Testing backup functionality...');
    
    try {
      // Test Sanity connection
      const { default: SanityBackup } = await import('./backup-sanity.js');
      const backup = new SanityBackup({
        outputDir: './backups/test',
        compress: false
      });
      
      await backup.initialize();
      console.log('✅ Sanity connection successful');
      
      // Test document fetch
      const documents = await backup.fetchAllDocuments();
      console.log(`✅ Document fetch successful: ${documents.length} documents found`);
      
      // Clean up test directory
      await fs.rmdir('./backups/test', { recursive: true });
      console.log('✅ Test cleanup completed');
      
    } catch (error) {
      throw new Error(`Backup functionality test failed: ${error.message}`);
    }
  }

  async createInitialBackup() {
    console.log('\n💾 Creating initial backup...');
    
    try {
      execSync('npm run backup:sanity', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('✅ Initial backup created successfully');
      
      // Check if backup files were created
      const backupFiles = await this.getBackupFiles();
      if (backupFiles.length === 0) {
        throw new Error('No backup files were created');
      }
      
      console.log(`📊 Backup files created: ${backupFiles.length}`);
      for (const file of backupFiles) {
        console.log(`   - ${file}`);
      }
      
    } catch (error) {
      throw new Error(`Initial backup creation failed: ${error.message}`);
    }
  }

  async getBackupFiles() {
    const files = [];
    
    try {
      const entries = await fs.readdir('./backups', { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && (entry.name.includes('sanity-backup-') || entry.name.includes('backup-report-'))) {
          files.push(entry.name);
        }
      }
    } catch (error) {
      // Directory might not exist yet
    }
    
    return files;
  }

  async showNextSteps() {
    console.log('\n📋 Next Steps');
    console.log('=============');
    console.log('');
    console.log('1. Review your backup configuration:');
    console.log('   cat scripts/backup-config.json');
    console.log('');
    console.log('2. Test the backup system:');
    console.log('   npm run backup:manager -- --status');
    console.log('');
    console.log('3. Start automated backups:');
    console.log('   npm run backup:schedule');
    console.log('');
    console.log('4. Create manual backups:');
    console.log('   npm run backup:sanity');
    console.log('');
    console.log('5. Set up cloud storage (optional):');
    console.log('   - Configure AWS S3, Google Cloud, or Azure credentials');
    console.log('   - Enable cloud storage in backup-config.json');
    console.log('   - Test with: npm run backup:upload');
    console.log('');
    console.log('📚 Documentation: docs/SANITY_BACKUP_SYSTEM.md');
    console.log('');
    console.log('🔧 Available Commands:');
    console.log('   npm run backup:sanity       - Create manual backup');
    console.log('   npm run backup:schedule     - Start automated scheduler');
    console.log('   npm run backup:manager      - Comprehensive management');
    console.log('   npm run backup:stats        - Storage statistics');
  }
}

// CLI handling
async function main() {
  const setup = new BackupSetup();
  await setup.run();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default BackupSetup;
