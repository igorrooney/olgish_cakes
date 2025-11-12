#!/usr/bin/env node

/**
 * Automated Sanity Backup Scheduler
 * 
 * This script handles automated backup scheduling using node-cron.
 * It supports daily, weekly, and monthly backup schedules with
 * configurable retention policies.
 * 
 * Usage:
 * npm run backup:schedule
 * npm run backup:schedule -- --config=./custom-config.json
 */

const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');
const SanityBackup = require('./backup-sanity');

class BackupScheduler {
  constructor(configPath = './scripts/backup-config.json') {
    this.configPath = configPath;
    this.config = null;
    this.jobs = [];
    this.isRunning = false;
  }

  async loadConfig() {
    try {
      const configData = await fs.readFile(this.configPath, 'utf8');
      this.config = JSON.parse(configData);
      console.log('✅ Configuration loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load configuration:', error.message);
      throw error;
    }
  }

  async validateConfig() {
    const required = ['backup.schedule', 'backup.options'];
    
    for (const path of required) {
      if (!this.getNestedValue(this.config, path)) {
        throw new Error(`Missing required configuration: ${path}`);
      }
    }

    // Validate schedule format
    const schedules = this.config.backup.schedule;
    if (schedules.daily && !this.isValidTime(schedules.daily.time)) {
      throw new Error('Invalid daily backup time format. Use HH:MM format.');
    }
    if (schedules.weekly && !this.isValidDay(schedules.weekly.day)) {
      throw new Error('Invalid weekly backup day. Use sunday, monday, etc.');
    }
    if (schedules.monthly && !this.isValidDayOfMonth(schedules.monthly.day)) {
      throw new Error('Invalid monthly backup day. Use 1-31.');
    }

    console.log('✅ Configuration validation passed');
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  isValidTime(time) {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  isValidDay(day) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days.includes(day.toLowerCase());
  }

  isValidDayOfMonth(day) {
    return Number.isInteger(day) && day >= 1 && day <= 31;
  }

  async runBackup(scheduleType, options = {}) {
    console.log(`🔄 Starting ${scheduleType} backup...`);
    
    try {
      const backupOptions = {
        ...this.config.backup.options,
        ...options,
        timestamp: new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      };

      // Add schedule type to filename
      backupOptions.outputDir = path.join(backupOptions.outputDir, scheduleType);

      const backup = new SanityBackup(backupOptions);
      const result = await backup.run();

      if (result.success) {
        console.log(`✅ ${scheduleType} backup completed successfully`);
        
        // Handle retention policy
        await this.handleRetention(scheduleType, backupOptions.outputDir);
        
        // Send notifications
        await this.sendNotification('success', scheduleType, result);
        
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`❌ ${scheduleType} backup failed:`, error.message);
      
      // Send failure notification
      await this.sendNotification('failure', scheduleType, { error: error.message });
      
      throw error;
    }
  }

  async handleRetention(scheduleType, outputDir) {
    const retention = this.config.backup.schedule[scheduleType]?.retention;
    if (!retention) return;

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
      if (backupFiles.length > retention) {
        const filesToRemove = backupFiles.slice(retention);
        
        for (const file of filesToRemove) {
          try {
            await fs.unlink(file.path);
            console.log(`🗑️  Removed old backup: ${file.name}`);
          } catch (error) {
            console.warn(`⚠️  Could not remove ${file.name}:`, error.message);
          }
        }
      }

      console.log(`📊 Retention policy applied: ${backupFiles.length}/${retention} backups kept`);
    } catch (error) {
      console.warn('⚠️  Retention policy failed:', error.message);
    }
  }

  async sendNotification(type, scheduleType, data) {
    const notifications = this.config.backup.notifications;
    
    if (type === 'failure' && notifications.email.enabled && notifications.email.onFailure) {
      await this.sendEmailNotification(scheduleType, data);
    }
    
    if (type === 'success' && notifications.email.enabled && notifications.email.onSuccess) {
      await this.sendEmailNotification(scheduleType, data);
    }
  }

  async sendEmailNotification(scheduleType, data) {
    // This would integrate with your email service (Resend)
    // For now, just log the notification
    console.log(`📧 Email notification would be sent for ${scheduleType} backup:`, {
      type: data.success ? 'success' : 'failure',
      records: data.records || 0,
      error: data.error || null
    });
  }

  createCronExpression(scheduleType, schedule) {
    const [hours, minutes] = schedule.time.split(':');
    
    switch (scheduleType) {
      case 'daily':
        return `${minutes} ${hours} * * *`;
      
      case 'weekly': {
        const dayMap = {
          sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
          thursday: 4, friday: 5, saturday: 6
        };
        return `${minutes} ${hours} * * ${dayMap[schedule.day]}`;
      }
      
      case 'monthly':
        return `${minutes} ${hours} ${schedule.day} * *`;
      
      default:
        throw new Error(`Unknown schedule type: ${scheduleType}`);
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️  Scheduler is already running');
      return;
    }

    try {
      await this.loadConfig();
      await this.validateConfig();
      
      this.isRunning = true;
      console.log('🚀 Starting backup scheduler...');
      
      // Schedule daily backups
      if (this.config.backup.schedule.daily.enabled) {
        const cronExpr = this.createCronExpression('daily', this.config.backup.schedule.daily);
        const job = cron.schedule(cronExpr, async () => {
          await this.runBackup('daily');
        }, {
          scheduled: false,
          timezone: this.config.backup.schedule.daily.timezone
        });
        
        job.start();
        this.jobs.push({ type: 'daily', job });
        console.log(`📅 Daily backup scheduled: ${cronExpr} (${this.config.backup.schedule.daily.timezone})`);
      }
      
      // Schedule weekly backups
      if (this.config.backup.schedule.weekly.enabled) {
        const cronExpr = this.createCronExpression('weekly', this.config.backup.schedule.weekly);
        const job = cron.schedule(cronExpr, async () => {
          await this.runBackup('weekly');
        }, {
          scheduled: false,
          timezone: this.config.backup.schedule.weekly.timezone
        });
        
        job.start();
        this.jobs.push({ type: 'weekly', job });
        console.log(`📅 Weekly backup scheduled: ${cronExpr} (${this.config.backup.schedule.weekly.timezone})`);
      }
      
      // Schedule monthly backups
      if (this.config.backup.schedule.monthly.enabled) {
        const cronExpr = this.createCronExpression('monthly', this.config.backup.schedule.monthly);
        const job = cron.schedule(cronExpr, async () => {
          await this.runBackup('monthly');
        }, {
          scheduled: false,
          timezone: this.config.backup.schedule.monthly.timezone
        });
        
        job.start();
        this.jobs.push({ type: 'monthly', job });
        console.log(`📅 Monthly backup scheduled: ${cronExpr} (${this.config.backup.schedule.monthly.timezone})`);
      }
      
      console.log(`✅ Scheduler started with ${this.jobs.length} jobs`);
      console.log('Press Ctrl+C to stop the scheduler');
      
      // Keep the process running
      process.on('SIGINT', () => this.stop());
      process.on('SIGTERM', () => this.stop());
      
    } catch (error) {
      console.error('❌ Failed to start scheduler:', error.message);
      this.isRunning = false;
      throw error;
    }
  }

  stop() {
    console.log('\n🛑 Stopping backup scheduler...');
    
    this.jobs.forEach(({ type, job }) => {
      job.stop();
      console.log(`⏹️  Stopped ${type} backup job`);
    });
    
    this.jobs = [];
    this.isRunning = false;
    console.log('✅ Scheduler stopped');
    process.exit(0);
  }

  async runOnce(scheduleType) {
    try {
      await this.loadConfig();
      await this.validateConfig();
      
      console.log(`🔄 Running one-time ${scheduleType} backup...`);
      await this.runBackup(scheduleType);
    } catch (error) {
      console.error(`❌ One-time backup failed:`, error.message);
      throw error;
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  let configPath = './scripts/backup-config.json';
  let scheduleType = null;
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const value = args[i + 1];
      
      switch (key) {
        case 'config':
          configPath = value;
          break;
        case 'run':
          scheduleType = value;
          break;
      }
    }
  }
  
  const scheduler = new BackupScheduler(configPath);
  
  if (scheduleType) {
    // Run one-time backup
    await scheduler.runOnce(scheduleType);
  } else {
    // Start continuous scheduler
    await scheduler.start();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = BackupScheduler;
