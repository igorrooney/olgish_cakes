# 🚀 Sanity Backup System - Quick Start Guide

Get your Sanity data backed up automatically in just a few minutes!

## ⚡ Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Setup Script
```bash
npm run backup:setup
```

This will:
- ✅ Validate your Sanity configuration
- ✅ Create backup directories
- ✅ Test backup functionality
- ✅ Create your first backup
- ✅ Show you next steps

### 3. Start Automated Backups
```bash
npm run backup:schedule
```

That's it! Your data is now being backed up automatically.

## 📋 What You Get

### Automatic Backups
- **Daily**: 2:00 AM (keeps 30 days)
- **Weekly**: Sunday 3:00 AM (keeps 12 weeks)
- **Monthly**: 1st of month 4:00 AM (keeps 12 months)

### What's Backed Up
- ✅ All cakes data
- ✅ Gift hampers
- ✅ Testimonials
- ✅ FAQs
- ✅ Market schedules
- ✅ Blog posts
- ✅ Asset metadata (optional)

### Storage Options
- 📁 **Local**: Stored in `./backups/` directory
- ☁️ **Cloud**: AWS S3, Google Cloud, or Azure (optional)

## 🛠️ Common Commands

```bash
# Create manual backup
npm run backup:sanity

# Check system status
npm run backup:manager -- --status

# Create backup with assets
npm run backup:sanity -- --include-assets

# Start scheduler (for continuous backups)
npm run backup:schedule

# Get storage statistics
npm run backup:stats
```

## 🔧 Configuration

Edit `scripts/backup-config.json` to customize:
- Backup schedules and retention
- Storage locations
- Notification settings
- Cloud storage providers

## 📚 Full Documentation

For detailed information, see: `docs/SANITY_BACKUP_SYSTEM.md`

## 🆘 Need Help?

1. Check system status: `npm run backup:manager -- --status`
2. Test with dry run: `npm run backup:manager -- --backup --dry-run`
3. Review configuration: `cat scripts/backup-config.json`

## 🔐 Security Notes

- All backups use read-only API tokens
- Local backups have restricted permissions
- Cloud storage uses encrypted connections
- No sensitive data in backup metadata

---

**Your data is now safe! 🎉**

The backup system will automatically:
- Create backups on schedule
- Clean up old backups
- Monitor for failures
- Send notifications (if configured)

You can focus on your business while your data stays protected.
