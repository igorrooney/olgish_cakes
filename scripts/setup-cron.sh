#!/bin/bash

# Setup script for automated Sanity backups using system cron
# This script helps you set up real automated backups on your system

echo "🕒 Setting up automated Sanity backup cron jobs"
echo "=============================================="
echo ""

# Get the current directory
BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo "📁 Project directory: $BACKUP_DIR"
echo ""

# Check if we're in the right directory
if [ ! -f "$BACKUP_DIR/package.json" ]; then
    echo "❌ Error: Not in the correct project directory"
    echo "   Please run this script from the project root"
    exit 1
fi

# Create the cron jobs
echo "📋 Creating cron jobs for automated backups:"
echo ""

# Daily backup (documents only) - 2:00 AM
echo "# Daily Sanity backup (documents only) - 2:00 AM"
echo "0 2 * * * cd $BACKUP_DIR && npm run backup:daily >> $BACKUP_DIR/backups/cron.log 2>&1"
echo ""

# Weekly backup (full with images) - Sunday 3:00 AM
echo "# Weekly Sanity backup (full with images) - Sunday 3:00 AM"
echo "0 3 * * 0 cd $BACKUP_DIR && npm run backup:weekly >> $BACKUP_DIR/backups/cron.log 2>&1"
echo ""

# Monthly backup (full with images) - 1st of month 4:00 AM
echo "# Monthly Sanity backup (full with images) - 1st of month 4:00 AM"
echo "0 4 1 * * cd $BACKUP_DIR && npm run backup:monthly >> $BACKUP_DIR/backups/cron.log 2>&1"
echo ""

echo "📝 To install these cron jobs:"
echo "   1. Copy the lines above (starting with '0 2 * * *')"
echo "   2. Run: crontab -e"
echo "   3. Paste the cron jobs at the end of the file"
echo "   4. Save and exit"
echo ""

echo "🔍 To view your current cron jobs:"
echo "   crontab -l"
echo ""

echo "📊 To check backup logs:"
echo "   tail -f $BACKUP_DIR/backups/cron.log"
echo ""

echo "⚠️  Important notes:"
echo "   - Make sure Node.js and npm are available in your PATH"
echo "   - Ensure your environment variables are set correctly"
echo "   - Test the commands manually first: npm run backup:daily"
echo "   - The cron jobs will run in the Europe/London timezone"
echo ""

echo "✅ Cron setup information generated!"
echo "   Follow the steps above to install the automated backups."
