# Sanity Backup System for Olgish Cakes

This document provides comprehensive documentation for the automated Sanity backup system implemented for the Olgish Cakes website.

## Overview

The backup system provides automated, reliable backups of all Sanity CMS data including:
- All document types (cakes, gift hampers, testimonials, FAQs, market schedules, blog posts)
- Asset metadata (images, files)
- Dataset configuration
- Backup reports and monitoring

## Features

### 🔄 Automated Scheduling
- **Daily backups** at 2:00 AM (30-day retention)
- **Weekly backups** on Sundays at 3:00 AM (12-week retention)  
- **Monthly backups** on the 1st at 4:00 AM (12-month retention)
- All times in Europe/London timezone

### 💾 Multiple Storage Options
- **Local storage** with configurable retention policies
- **Cloud storage** support for AWS S3, Google Cloud Storage, Azure Blob
- **Compression** to reduce storage space
- **Encryption** ready for sensitive data

### 📊 Monitoring & Reporting
- Backup success/failure notifications
- Storage usage statistics
- Backup validation and integrity checks
- Comprehensive logging

### 🛠️ Management Tools
- Manual backup creation
- Backup restoration with validation
- Storage cleanup and maintenance
- Configuration management

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Add these to your `.env.local` file:
```env
# Existing Sanity configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=as9bci7b
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_token_here

# Optional: Cloud storage configuration
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=eu-west-2
```

### 3. Create Your First Backup
```bash
npm run backup:sanity
```

### 4. Start Automated Scheduling
```bash
npm run backup:schedule
```

## Configuration

### Backup Configuration (`scripts/backup-config.json`)

```json
{
  "backup": {
    "enabled": true,
    "schedule": {
      "daily": {
        "enabled": true,
        "time": "02:00",
        "timezone": "Europe/London",
        "retention": 30
      }
    },
    "options": {
      "format": "json",
      "includeAssets": false,
      "compress": true,
      "outputDir": "./backups"
    },
    "storage": {
      "local": {
        "enabled": true,
        "path": "./backups"
      },
      "cloud": {
        "enabled": false,
        "provider": "aws",
        "bucket": "your-backup-bucket",
        "region": "eu-west-2"
      }
    }
  }
}
```

## Available Commands

### Manual Backup Operations
```bash
# Create a one-time backup
npm run backup:sanity

# Create backup with assets
npm run backup:sanity -- --include-assets

# Create backup in specific format
npm run backup:sanity -- --format=ndjson

# Create backup without compression
npm run backup:sanity -- --no-compress
```

### Automated Scheduling
```bash
# Start the backup scheduler (runs continuously)
npm run backup:schedule

# Run a one-time scheduled backup
npm run backup:run daily
npm run backup:run weekly
npm run backup:run monthly
```

### Storage Management
```bash
# Upload backup to cloud storage
npm run backup:upload -- --file=./backups/daily/backup-2024-01-15.tar.gz

# Sync all backups for a schedule type
npm run backup:sync -- --schedule=daily

# Get storage statistics
npm run backup:stats
```

### Comprehensive Management
```bash
# Show system status and recent backups
npm run backup:manager -- --status

# Create backup with specific options
npm run backup:manager -- --backup --schedule=daily --include-assets

# Restore from backup (dry run first)
npm run backup:manager -- --restore ./backups/backup-2024-01-15.tar.gz --dry-run

# Show help and all options
npm run backup:manager -- --help
```

## File Structure

```
scripts/
├── backup-sanity.js          # Core backup functionality
├── backup-scheduler.js       # Automated scheduling
├── backup-storage.js         # Storage management
├── backup-manager.js         # Unified management interface
├── backup-config.json        # Configuration file
└── storage-providers/
    ├── aws-s3.js            # AWS S3 integration
    ├── gcp-storage.js       # Google Cloud Storage
    └── azure-blob.js        # Azure Blob Storage

backups/
├── daily/                   # Daily backups
├── weekly/                  # Weekly backups
├── monthly/                 # Monthly backups
└── manual/                  # Manual backups
```

## Backup File Format

### Structure
Each backup creates:
- `documents-YYYY-MM-DDTHH-mm-ss.json` - All document data
- `assets-YYYY-MM-DDTHH-mm-ss.json` - Asset metadata (if included)
- `dataset-info-YYYY-MM-DDTHH-mm-ss.json` - Dataset configuration
- `backup-report-YYYY-MM-DDTHH-mm-ss.json` - Backup metadata and statistics
- `sanity-backup-YYYY-MM-DDTHH-mm-ss.tar.gz` - Compressed archive (if enabled)

### Document Format
```json
[
  {
    "_id": "cake-123",
    "_type": "cake",
    "_createdAt": "2024-01-15T10:30:00Z",
    "_updatedAt": "2024-01-15T10:30:00Z",
    "name": "Chocolate Birthday Cake",
    "price": 45,
    "ingredients": ["chocolate", "flour", "eggs"],
    // ... other cake properties
  }
]
```

## Cloud Storage Setup

### AWS S3
1. Create an S3 bucket in your preferred region
2. Set up IAM user with S3 permissions
3. Configure environment variables:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=eu-west-2
```
4. Enable cloud storage in `backup-config.json`

### Google Cloud Storage
1. Create a GCS bucket
2. Set up service account with Storage Admin role
3. Configure environment variables:
```env
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json
```
4. Enable cloud storage in `backup-config.json`

### Azure Blob Storage
1. Create a Storage Account and container
2. Get connection string or account credentials
3. Configure environment variables:
```env
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
# OR
AZURE_STORAGE_ACCOUNT_NAME=your_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_account_key
```
4. Enable cloud storage in `backup-config.json`

## Monitoring & Alerts

### Email Notifications
Configure in `backup-config.json`:
```json
{
  "backup": {
    "notifications": {
      "email": {
        "enabled": true,
        "recipients": ["hello@olgishcakes.co.uk"],
        "onSuccess": false,
        "onFailure": true
      }
    }
  }
}
```

### Health Checks
The system includes built-in health monitoring:
- Backup success rate tracking
- Storage space monitoring
- Schedule adherence verification
- Data integrity validation

## Restoration Process

### 1. Validate Backup
```bash
npm run backup:manager -- --restore ./backups/backup-2024-01-15.tar.gz --dry-run
```

### 2. Restore Data
```bash
npm run backup:manager -- --restore ./backups/backup-2024-01-15.tar.gz
```

### 3. Verify Restoration
Check your Sanity Studio to ensure all data has been restored correctly.

## Security Considerations

### Data Protection
- All backups are created using read-only API tokens
- Local backups are stored with appropriate file permissions
- Cloud storage uses encrypted connections (HTTPS/TLS)
- Sensitive data is excluded from backup metadata

### Access Control
- Backup scripts require valid Sanity API tokens
- Cloud storage credentials are stored as environment variables
- Local backup files have restricted permissions

### Compliance
- GDPR compliance: Personal data handling follows data protection guidelines
- UK legal requirements: Allergen information is preserved in backups
- Data retention policies are configurable and automated

## Troubleshooting

### Common Issues

#### "Missing required Sanity configuration"
- Ensure all required environment variables are set
- Check that `SANITY_API_TOKEN` has read permissions

#### "Backup failed: Permission denied"
- Check file system permissions for backup directory
- Ensure sufficient disk space is available

#### "Cloud upload failed"
- Verify cloud storage credentials
- Check network connectivity
- Ensure bucket/container exists and is accessible

#### "Scheduler not starting"
- Check cron expression syntax in configuration
- Verify timezone settings
- Ensure no other scheduler instances are running

### Logs and Debugging
- All backup operations log to console
- Failed operations include detailed error messages
- Use `--dry-run` flag to test operations without making changes

### Getting Help
1. Check the backup system status: `npm run backup:manager -- --status`
2. Review configuration: `cat scripts/backup-config.json`
3. Test with dry run: `npm run backup:manager -- --backup --dry-run`
4. Check recent backups: `ls -la backups/`

## Maintenance

### Regular Tasks
- Monitor backup success rates weekly
- Review storage usage monthly
- Test restoration process quarterly
- Update backup configuration as needed

### Cleanup
- Old backups are automatically removed based on retention policies
- Manual cleanup: `npm run backup:manager -- --cleanup`
- Cloud storage cleanup is handled automatically

### Updates
- Keep backup dependencies updated: `pnpm update`
- Review and update backup configuration periodically
- Test backup system after major Sanity updates

## Performance Considerations

### Backup Size
- Typical backup size: 1-5 MB compressed
- Assets metadata adds ~10-20% to backup size
- Full asset backup can be 10x larger

### Timing
- Daily backups typically complete in 30-60 seconds
- Weekly/monthly backups may take longer due to larger datasets
- Cloud upload time depends on connection speed

### Resource Usage
- Backup operations use minimal CPU and memory
- Network usage is minimal for data-only backups
- Cloud uploads may use significant bandwidth

## Best Practices

### Configuration
- Test backup configuration before enabling automation
- Use different retention policies for different schedule types
- Enable compression to save storage space
- Use cloud storage for off-site backup copies

### Monitoring
- Set up email alerts for backup failures
- Monitor storage usage to prevent disk space issues
- Regularly test backup restoration procedures
- Keep backup documentation updated

### Security
- Rotate API tokens regularly
- Use least-privilege access for cloud storage
- Encrypt sensitive backup data if required
- Store backup credentials securely

### Recovery
- Maintain multiple backup copies (local + cloud)
- Test restoration procedures regularly
- Document recovery procedures for your team
- Keep backup files in version control (if appropriate)

---

For additional support or questions about the backup system, please refer to the Sanity documentation or contact the development team.
