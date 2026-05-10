#!/usr/bin/env node

/**
 * Quick Setup Script for Sanity Backup System
 */

import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env.local' });

async function quickSetup() {
  console.log('🚀 Quick Setup - Sanity Backup System for Olgish Cakes');
  console.log('====================================================\n');

  try {
    // 1. Validate environment
    console.log('🔍 Validating environment...');
    
    const required = [
      'NEXT_PUBLIC_SANITY_PROJECT_ID',
      'NEXT_PUBLIC_SANITY_DATASET', 
      'SANITY_API_TOKEN'
    ];
    
    const missing = required.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    console.log(`✅ Project ID: ${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}`);
    console.log(`✅ Dataset: ${process.env.NEXT_PUBLIC_SANITY_DATASET}`);
    console.log(`✅ API Token: Set`);

    // 2. Create directories
    console.log('\n📁 Creating backup directories...');
    
    const dirs = [
      './backups',
      './backups/daily',
      './backups/weekly', 
      './backups/monthly',
      './backups/manual'
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Created: ${dir}`);
    }

    // 3. Test backup functionality
    console.log('\n🧪 Testing backup functionality...');
    
    try {
      execSync('node scripts/backup-simple.js', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      
      console.log('✅ Backup test completed successfully');
      
      // Check backup files
      const backupFiles = await fs.readdir('./backups/manual');
      const backupCount = backupFiles.filter(f => f.includes('sanity-backup-')).length;
      const reportCount = backupFiles.filter(f => f.includes('backup-report-')).length;
      
      console.log(`📊 Backup files: ${backupCount} backups, ${reportCount} reports`);
      
    } catch (error) {
      throw new Error(`Backup test failed: ${error.message}`);
    }

    // 4. Show success and next steps
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 What you can do now:');
    console.log('');
    console.log('1. Create manual backups:');
    console.log('   npm run backup:sanity');
    console.log('');
    console.log('2. Check backup files:');
    console.log('   ls -la backups/manual/');
    console.log('');
    console.log('3. View backup contents:');
    console.log('   cat backups/manual/backup-report-*.json | head -20');
    console.log('');
    console.log('📚 Documentation: docs/SANITY_BACKUP_SYSTEM.md');
    console.log('🚀 Quick Start: docs/BACKUP_QUICK_START.md');
    console.log('');
    console.log('🔧 Available Commands:');
    console.log('   npm run backup:sanity       - Create manual backup');
    console.log('   node scripts/backup-simple.js - Direct backup script');
    console.log('   node scripts/test-sanity-connection.js - Test connection');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.error('\nPlease check the error above and try again.');
    process.exit(1);
  }
}

// Run setup
quickSetup().catch(console.error);
