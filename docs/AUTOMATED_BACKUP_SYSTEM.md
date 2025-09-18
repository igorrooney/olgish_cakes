# 🤖 Automated Backup System for Olgish Cakes

This document explains how to set up and use the automated backup system for your Sanity CMS data.

## 🎯 Overview

The automated backup system provides three types of scheduled backups:

### 📅 **Daily Backups** (Documents Only)
- **When**: Every day at 2:00 AM (Europe/London timezone)
- **What**: All Sanity documents (cakes, testimonials, FAQs, etc.)
- **Size**: ~170 KB
- **Retention**: 30 days
- **Speed**: ~30 seconds
- **Purpose**: Quick daily protection of your content data

### 📅 **Weekly Backups** (Full with Images)
- **When**: Every Sunday at 3:00 AM (Europe/London timezone)
- **What**: All documents + all images and assets
- **Size**: ~143 MB compressed
- **Retention**: 12 weeks (3 months)
- **Speed**: ~2-3 minutes
- **Purpose**: Complete weekly archives with all visual content

### 📅 **Monthly Backups** (Full with Images)
- **When**: 1st of every month at 4:00 AM (Europe/London timezone)
- **What**: All documents + all images and assets
- **Size**: ~143 MB compressed
- **Retention**: 12 months
- **Speed**: ~2-3 minutes
- **Purpose**: Long-term archival storage

## 🚀 Quick Start

### 1. Test the System
```bash
# Test daily backup (documents only)
npm run backup:daily

# Test weekly backup (full with images)
npm run backup:weekly

# Test monthly backup (full with images)
npm run backup:monthly

# Check backup status
npm run backup:status
```

### 2. Set Up Automated Scheduling

#### Option A: System Cron (Recommended for Servers)
```bash
# Generate cron setup instructions
./scripts/setup-cron.sh

# Follow the instructions to add cron jobs
crontab -e
```

#### Option B: Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start the scheduler
pm2 start "npm run backup:schedule" --name "sanity-backup-scheduler"

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Option C: Cloud Scheduler (Vercel Cron Jobs)
Add to your `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/backup-daily",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/backup-weekly", 
      "schedule": "0 3 * * 0"
    },
    {
      "path": "/api/backup-monthly",
      "schedule": "0 4 1 * *"
    }
  ]
}
```

## 📋 Available Commands

### Manual Backups
```bash
# Quick backup (documents only)
npm run backup:sanity

# Full backup (documents + images)
npm run backup:full

# Assets only
npm run backup:assets
```

### Scheduled Backups
```bash
# Run scheduled backups manually
npm run backup:daily      # Documents only
npm run backup:weekly     # Full backup
npm run backup:monthly    # Full backup

# Check system status
npm run backup:status

# Start demo scheduler
npm run backup:schedule
```

## 📁 Backup Structure

```
backups/
├── daily/           # Daily document-only backups
│   ├── sanity-backup-2024-01-15T02-00-00.json
│   └── backup-report-2024-01-15T02-00-00.json
├── weekly/          # Weekly full backups
│   └── sanity-backup-2024-01-14T03-00-00.tar.gz
├── monthly/         # Monthly full backups
│   └── sanity-backup-2024-01-01T04-00-00.tar.gz
└── manual/          # Manual backups
    ├── sanity-backup-2024-01-15T10-30-00.json
    └── backup-report-2024-01-15T10-30-00.json
```

## 🔧 Configuration

### Schedule Configuration
Edit `scripts/backup-scheduler-simple.js` to modify:
- Backup times
- Retention policies
- Backup types
- Timezone settings

### Environment Variables
Ensure these are set in your `.env.local`:
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=as9bci7b
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_token_here
```

## 📊 Monitoring & Maintenance

### Check Backup Status
```bash
npm run backup:status
```

### View Backup Logs
```bash
# If using cron jobs
tail -f backups/cron.log

# If using PM2
pm2 logs sanity-backup-scheduler
```

### Manual Cleanup
```bash
# Clean old backups manually
find backups/daily -name "*.json" -mtime +30 -delete
find backups/weekly -name "*.tar.gz" -mtime +84 -delete
find backups/monthly -name "*.tar.gz" -mtime +365 -delete
```

## 🔐 Security & Best Practices

### Data Protection
- ✅ All backups use read-only API tokens
- ✅ Local backups have restricted file permissions
- ✅ Compressed archives reduce storage space
- ✅ Retention policies prevent unlimited growth

### Access Control
- ✅ Backup scripts require valid Sanity credentials
- ✅ Environment variables are not exposed in backups
- ✅ Backup files are excluded from version control

### Compliance
- ✅ GDPR compliant data handling
- ✅ UK legal requirements for allergen information
- ✅ Automated retention policies

## 🚨 Troubleshooting

### Common Issues

#### "Backup failed: Missing required Sanity configuration"
- Check environment variables are set correctly
- Verify `SANITY_API_TOKEN` has read permissions

#### "Permission denied" errors
- Check file system permissions for backup directory
- Ensure sufficient disk space is available

#### Cron jobs not running
- Verify cron service is running: `systemctl status cron`
- Check cron logs: `journalctl -u cron`
- Test cron syntax: `crontab -l`

#### PM2 process stopped
- Check PM2 status: `pm2 status`
- View PM2 logs: `pm2 logs sanity-backup-scheduler`
- Restart if needed: `pm2 restart sanity-backup-scheduler`

### Getting Help
1. Check backup status: `npm run backup:status`
2. Test manually: `npm run backup:daily`
3. Check logs: `tail -f backups/cron.log`
4. Verify environment: `node scripts/test-sanity-connection.js`

## 📈 Performance Considerations

### Backup Sizes
- **Daily (documents only)**: ~170 KB
- **Weekly/Monthly (full)**: ~143 MB compressed
- **Storage growth**: ~5 MB per month (daily) + ~143 MB per week/month

### Timing
- **Daily backups**: Complete in ~30 seconds
- **Full backups**: Complete in ~2-3 minutes
- **Network usage**: Minimal for documents, ~143 MB for full backups

### Resource Usage
- **CPU**: Minimal during backup operations
- **Memory**: Low memory footprint
- **Disk I/O**: Moderate during full backups

## 🔄 Backup Restoration

### From Daily Backup (Documents Only)
```bash
# Extract backup file
tar -xzf backups/daily/sanity-backup-2024-01-15.tar.gz

# Restore using Sanity CLI or Studio
```

### From Full Backup (Documents + Images)
```bash
# Extract backup file
tar -xzf backups/weekly/sanity-backup-2024-01-14.tar.gz

# Restore documents and assets
# (Implementation depends on your restoration needs)
```

## 📚 Additional Resources

- **Quick Start Guide**: `BACKUP_QUICK_START.md`
- **Complete Documentation**: `docs/SANITY_BACKUP_SYSTEM.md`
- **Setup Script**: `scripts/setup-cron.sh`
- **Test Connection**: `node scripts/test-sanity-connection.js`

---

**Your data is now fully protected with automated backups! 🎉**

The system will automatically:
- ✅ Create daily document backups
- ✅ Create weekly full backups with images
- ✅ Create monthly archival backups
- ✅ Clean up old backups based on retention policies
- ✅ Log all backup operations
- ✅ Handle errors gracefully
