# 🚀 Vercel Cron Jobs for Sanity Backups

This guide explains how to set up automated Sanity backups using Vercel's cron job functionality.

## 📋 Overview

The backup route handlers can be enabled as authenticated Vercel cron jobs. Add
the schedules below to `vercel.json` only after confirming that the selected
Vercel plan has sufficient execution time and durable backup storage.

Every backup endpoint requires either Vercel's `Authorization: Bearer
<CRON_SECRET>` header or an authenticated admin credential. Set a random
`CRON_SECRET` of at least 16 characters in Vercel before enabling a schedule;
Vercel then adds the bearer header automatically to its cron requests.

### 🕒 **Schedule Configuration**
- **Daily Backup**: Every day at 2:00 AM UTC (`/api/backup-daily`)
- **Weekly Backup**: Every Sunday at 3:00 AM UTC (`/api/backup-weekly`)
- **Monthly Backup**: 1st of every month at 4:00 AM UTC (`/api/backup-monthly`)

### 📊 **Backup Types**
- **Daily**: Documents only (~170KB, 30-day retention)
- **Weekly**: Full with images (~143MB, 12-week retention)
- **Monthly**: Full with images (~143MB, 12-month retention)

## 🔧 **Setup Complete**

To enable these jobs, add the following entries to the existing `crons` array in
`vercel.json`:
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

## 📁 **API Endpoints Created**

### `/api/backup-daily`
- **Schedule**: Daily at 2:00 AM UTC
- **Function**: Runs `npm run backup:daily`
- **Output**: Documents only backup

### `/api/backup-weekly`
- **Schedule**: Sunday at 3:00 AM UTC
- **Function**: Runs `npm run backup:weekly`
- **Output**: Full backup with images

### `/api/backup-monthly`
- **Schedule**: 1st of month at 4:00 AM UTC
- **Function**: Runs `npm run backup:monthly`
- **Output**: Full backup with images

### `/api/backup-status`
- **Schedule**: Manual access
- **Function**: Shows backup status and statistics
- **Output**: JSON with backup information

## 🚀 **Deployment**

### 1. Deploy to Vercel
```bash
# Deploy your changes
vercel --prod

# Or if using git integration, push to your main branch
git add .
git commit -m "Add automated backup cron jobs"
git push origin main
```

### 2. Verify Cron Jobs
After deployment, check your Vercel dashboard:
1. Go to your project dashboard
2. Click on "Functions" tab
3. Look for your cron job functions
4. Check the "Cron Jobs" section

### 3. Test the Endpoints
```bash
# Test daily backup endpoint
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/backup-daily

# Test weekly backup endpoint  
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/backup-weekly

# Test monthly backup endpoint
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/backup-monthly

# Check backup status
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/backup-status
```

## 📊 **Monitoring & Logs**

### Vercel Dashboard
- **Functions Tab**: View function executions
- **Cron Jobs**: See scheduled job status
- **Logs**: View execution logs and errors

### API Monitoring
```bash
# Check backup status via API
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/backup-status | jq
```

### Response Format
```json
{
  "success": true,
  "type": "daily",
  "timestamp": "2026-08-24T02:00:00.000Z"
}
```

## ⚙️ **Environment Variables**

Ensure these are set in your Vercel project:

### Required Variables
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=as9bci7b
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_token_here
CRON_SECRET=a_random_secret_of_at_least_16_characters
```

### Setting in Vercel Dashboard
1. Go to your project settings
2. Click "Environment Variables"
3. Add the variables above
4. Redeploy your project

## 🕒 **Timezone Considerations**

Vercel cron jobs run in UTC timezone. Your current schedule:
- **2:00 AM UTC** = **3:00 AM GMT** (Winter) / **4:00 AM BST** (Summer)
- **3:00 AM UTC** = **4:00 AM GMT** (Winter) / **5:00 AM BST** (Summer)
- **4:00 AM UTC** = **5:00 AM GMT** (Winter) / **6:00 AM BST** (Summer)

### Adjusting Times (if needed)
Edit the schedules in `vercel.json`:
```json
// For 2:00 AM UK time (adjust for your timezone)
{
  "path": "/api/backup-daily",
  "schedule": "0 1 * * *"  // 1:00 AM UTC = 2:00 AM UK (winter)
}
```

## 🔍 **Troubleshooting**

### Common Issues

#### "Function timeout"
- Vercel has a 10-second timeout for Hobby plan
- Full backups might take longer
- Consider upgrading to Pro plan for longer timeouts

#### "Environment variables not found"
- Check Vercel dashboard for environment variables
- Ensure variables are set for all environments
- Redeploy after adding variables

#### "Backup script not found"
- Ensure all backup scripts are in your repository
- Check that `package.json` scripts are correct
- Verify file paths in API endpoints

### Debugging Steps
1. **Check Vercel logs**: View function execution logs
2. **Test locally**: Run `npm run backup:daily` locally
3. **Check API response**: Call endpoints manually
4. **Verify environment**: Ensure all variables are set

## 📈 **Performance & Limits**

### Vercel Limits
- **Hobby Plan**: 10-second function timeout
- **Pro Plan**: 60-second function timeout
- **Enterprise**: Custom timeouts

### Backup Performance
- **Daily backup**: ~30 seconds (well within limits)
- **Full backup**: ~2-3 minutes (may timeout on Hobby plan)
- **Storage**: Backups stored locally on Vercel (temporary)

### Recommendations
- **Hobby Plan**: Use daily backups only
- **Pro Plan**: Use all backup types
- **Storage**: Consider cloud storage for full backups

## 🔐 **Security Considerations**

### API Security
- Cron endpoints are public (Vercel limitation)
- No authentication required (Vercel handles this)
- Backup data is temporary on Vercel

### Data Protection
- Backups use read-only Sanity tokens
- No sensitive data in backup files
- Automatic cleanup based on retention

## 📚 **Additional Resources**

- **Vercel Cron Docs**: https://vercel.com/docs/cron-jobs
- **Backup System Docs**: `docs/SANITY_BACKUP_SYSTEM.md`
- **API Reference**: Check `/api/backup-status` for current status

---

## 🎉 **You're All Set!**

Your Vercel cron jobs are now configured for automated Sanity backups:

✅ **Daily backups** at 2:00 AM UTC  
✅ **Weekly backups** on Sundays at 3:00 AM UTC  
✅ **Monthly backups** on 1st of month at 4:00 AM UTC  
✅ **Status monitoring** via `/api/backup-status`  
✅ **Error logging** in Vercel dashboard  

**Deploy to Vercel and your backups will run automatically! 🚀**
