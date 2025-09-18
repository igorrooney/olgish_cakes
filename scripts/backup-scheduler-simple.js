#!/usr/bin/env node

/**
 * Simple Automated Backup Scheduler for Sanity
 * 
 * This script handles automated backup scheduling with different types:
 * - Daily: Documents only (fast, small)
 * - Weekly: Full backup with images (complete)
 * - Monthly: Full backup with images (archival)
 * 
 * Usage:
 * npm run backup:schedule
 * npm run backup:schedule -- --run daily
 * npm run backup:schedule -- --run weekly
 */

import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: './env.local' });

class BackupScheduler {
  constructor() {
    this.config = {
      schedules: {
        daily: {
          enabled: true,
          time: '02:00', // 2:00 AM
          timezone: 'Europe/London',
          retention: 30, // Keep 30 days
          type: 'documents-only'
        },
        weekly: {
          enabled: true,
          day: 'sunday', // Sunday
          time: '03:00', // 3:00 AM
          timezone: 'Europe/London',
          retention: 12, // Keep 12 weeks
          type: 'full'
        },
        monthly: {
          enabled: true,
          day: 1, // 1st of month
          time: '04:00', // 4:00 AM
          timezone: 'Europe/London',
          retention: 12, // Keep 12 months
          type: 'full'
        }
      }
    };
    this.isRunning = false;
    this.jobs = [];
  }

  async runBackup(scheduleType) {
    const schedule = this.config.schedules[scheduleType];
    if (!schedule || !schedule.enabled) {
      console.log(`⏭️  ${scheduleType} backup is disabled`);
      return;
    }

    console.log(`🔄 Starting ${scheduleType} backup...`);
    
    try {
      let command;
      if (schedule.type === 'documents-only') {
        command = 'npm run backup:sanity';
      } else if (schedule.type === 'full') {
        command = 'npm run backup:full';
      } else {
        throw new Error(`Unknown backup type: ${schedule.type}`);
      }

      console.log(`📋 Running: ${command}`);
      execSync(command, { 
        stdio: 'inherit',
        cwd: process.cwd(),
        env: {
          ...process.env,
          BACKUP_SCHEDULE_TYPE: scheduleType
        }
      });

      console.log(`✅ ${scheduleType} backup completed successfully`);
      
      // Handle retention policy
      await this.handleRetention(scheduleType, schedule.retention);
      
      return { success: true, type: scheduleType };
      
    } catch (error) {
      console.error(`❌ ${scheduleType} backup failed:`, error.message);
      return { success: false, type: scheduleType, error: error.message };
    }
  }

  async handleRetention(scheduleType, retentionDays) {
    const outputDir = path.join('./backups', scheduleType);
    
    try {
      const files = await fs.readdir(outputDir);
      const backupFiles = files
        .filter(file => file.includes('sanity-backup-') || file.includes('backup-report-'))
        .map(file => ({
          name: file,
          path: path.join(outputDir, file),
          stats: null
        }));

      // Get file stats for sorting by date
      for (const file of backupFiles) {
        try {
          const stats = await fs.stat(file.path);
          file.stats = stats;
          file.date = stats.mtime;
        } catch {
          // Skip files we can't stat
        }
      }

      // Sort by date (newest first)
      backupFiles.sort((a, b) => b.date - a.date);

      // Remove old backups
      if (backupFiles.length > retentionDays) {
        const filesToRemove = backupFiles.slice(retentionDays);
        
        for (const file of filesToRemove) {
          try {
            await fs.unlink(file.path);
            console.log(`🗑️  Removed old backup: ${file.name}`);
          } catch (error) {
            console.warn(`⚠️  Could not remove ${file.name}:`, error.message);
          }
        }
      }

      console.log(`📊 Retention policy applied: ${backupFiles.length}/${retentionDays} backups kept`);
    } catch (error) {
      console.warn('⚠️  Retention policy failed:', error.message);
    }
  }

  createCronExpression(scheduleType, schedule) {
    const [hours, minutes] = schedule.time.split(':');
    
    switch (scheduleType) {
      case 'daily':
        return `${minutes} ${hours} * * *`;
      
      case 'weekly':
        const dayMap = {
          sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
          thursday: 4, friday: 5, saturday: 6
        };
        return `${minutes} ${hours} * * ${dayMap[schedule.day]}`;
      
      case 'monthly':
        return `${minutes} ${hours} ${schedule.day} * *`;
      
      default:
        throw new Error(`Unknown schedule type: ${scheduleType}`);
    }
  }

  async startScheduler() {
    if (this.isRunning) {
      console.log('⚠️  Scheduler is already running');
      return;
    }

    console.log('🚀 Starting backup scheduler...');
    console.log('📅 Schedule configuration:');
    
    Object.entries(this.config.schedules).forEach(([type, schedule]) => {
      if (schedule.enabled) {
        const cronExpr = this.createCronExpression(type, schedule);
        console.log(`   ${type}: ${cronExpr} (${schedule.timezone}) - ${schedule.type} - ${schedule.retention} days retention`);
      } else {
        console.log(`   ${type}: Disabled`);
      }
    });

    this.isRunning = true;
    console.log('\n⏰ Scheduler started. Press Ctrl+C to stop.');
    
    // For demo purposes, we'll simulate the scheduler
    // In a real implementation, you'd use node-cron or a system cron job
    console.log('\n💡 Note: This is a demo scheduler. For production use:');
    console.log('   1. Set up a system cron job');
    console.log('   2. Use a process manager like PM2');
    console.log('   3. Use a cloud scheduler service');
    
    // Keep the process running
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
    
    // For demo, show what would happen
    await this.showScheduleDemo();
  }

  async showScheduleDemo() {
    console.log('\n🔄 Demo: Running scheduled backups...');
    
    // Run daily backup
    console.log('\n📅 Daily backup (documents only):');
    await this.runBackup('daily');
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Run weekly backup
    console.log('\n📅 Weekly backup (full with images):');
    await this.runBackup('weekly');
    
    console.log('\n✅ Demo completed!');
    console.log('\n📋 To set up real automation:');
    console.log('   1. Add cron jobs to your system');
    console.log('   2. Or use: npm run backup:run daily/weekly/monthly');
  }

  stop() {
    console.log('\n🛑 Stopping backup scheduler...');
    this.isRunning = false;
    console.log('✅ Scheduler stopped');
    process.exit(0);
  }

  async runOnce(scheduleType) {
    console.log(`🔄 Running one-time ${scheduleType} backup...`);
    
    if (!this.config.schedules[scheduleType]) {
      throw new Error(`Unknown schedule type: ${scheduleType}. Use: daily, weekly, monthly`);
    }
    
    await this.runBackup(scheduleType);
  }

  async showStatus() {
    console.log('📊 Backup System Status');
    console.log('========================');
    
    try {
      // Check backup directories
      const backupDirs = ['daily', 'weekly', 'monthly', 'manual'];
      
      for (const dir of backupDirs) {
        const dirPath = path.join('./backups', dir);
        try {
          const files = await fs.readdir(dirPath);
          const backupFiles = files.filter(f => f.includes('sanity-backup-'));
          const reportFiles = files.filter(f => f.includes('backup-report-'));
          
          console.log(`📁 ${dir}: ${backupFiles.length} backups, ${reportFiles.length} reports`);
          
          if (backupFiles.length > 0) {
            // Get latest backup
            const latestBackup = backupFiles
              .map(f => ({ name: f, path: path.join(dirPath, f) }))
              .map(f => ({ ...f, stats: null }))
              .sort((a, b) => {
                try {
                  const aStats = require('fs').statSync(a.path);
                  const bStats = require('fs').statSync(b.path);
                  return bStats.mtime - aStats.mtime;
                } catch {
                  return 0;
                }
              })[0];
            
            if (latestBackup) {
              try {
                const stats = require('fs').statSync(latestBackup.path);
                const size = Math.round(stats.size / 1024);
                const date = stats.mtime.toISOString().slice(0, 19);
                console.log(`   Latest: ${latestBackup.name} (${size} KB, ${date})`);
              } catch (error) {
                console.log(`   Latest: ${latestBackup.name}`);
              }
            }
          }
        } catch (error) {
          console.log(`📁 ${dir}: No backups found`);
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to get status:', error.message);
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const scheduler = new BackupScheduler();
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🕒 Sanity Backup Scheduler

Usage:
  npm run backup:schedule                    # Start scheduler (demo mode)
  npm run backup:schedule -- --run daily     # Run daily backup now
  npm run backup:schedule -- --run weekly    # Run weekly backup now
  npm run backup:schedule -- --run monthly   # Run monthly backup now
  npm run backup:schedule -- --status        # Show backup status

Schedule Types:
  daily     - Documents only (fast, ~170KB, 30 days retention)
  weekly    - Full backup with images (~143MB, 12 weeks retention)
  monthly   - Full backup with images (~143MB, 12 months retention)

Times (Europe/London):
  Daily:    2:00 AM
  Weekly:   Sunday 3:00 AM
  Monthly:  1st of month 4:00 AM
`);
    return;
  }
  
  try {
    if (args.includes('--run')) {
      const runIndex = args.indexOf('--run');
      const scheduleType = args[runIndex + 1];
      
      if (!scheduleType) {
        throw new Error('--run requires a schedule type (daily, weekly, monthly)');
      }
      
      await scheduler.runOnce(scheduleType);
    } else if (args.includes('--status')) {
      await scheduler.showStatus();
    } else {
      await scheduler.startScheduler();
    }
  } catch (error) {
    console.error('❌ Scheduler failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default BackupScheduler;
