# Sanity Backup Troubleshooting Guide

## Current Issue: `invalid_grant` Error

### What Happened

The GitHub Actions backup workflow failed with error:
```
Google Drive upload failed: invalid_grant
```

The Sanity export completed successfully (83 documents, 142 assets), but the upload to Google Drive failed during OAuth authentication.

### Why This Happens

Google OAuth refresh tokens can become invalid for several reasons:

1. **Token Expiration** - Refresh tokens expire after 6 months of inactivity
2. **OAuth Consent Screen Changes** - Changes to your Google Cloud project settings
3. **User Revocation** - Access was revoked in Google account permissions
4. **Project Configuration Changes** - Changes to OAuth credentials in Google Cloud Console

## Solution: Regenerate the Refresh Token

Follow these steps to fix the authentication issue:

### Step 1: Prerequisites Check

Before starting, ensure you have:

- [ ] Access to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Google Drive API enabled in your project
- [ ] OAuth 2.0 credentials (Desktop app type)
- [ ] Your email added as a test user in OAuth consent screen

### Step 2: Run the Setup Script Locally

1. **Open your terminal** in the project directory

2. **Run the setup script:**
   ```bash
   pnpm setup:gdrive
   ```

3. **Follow the prompts:**
   - A URL will be displayed
   - Open it in your browser
   - Sign in with your Google account
   - Grant permissions
   - Copy the authorization code
   - Paste it back in the terminal

4. **The script will:**
   - Exchange the code for a refresh token
   - Create a "Sanity Backups" folder in your Google Drive
   - Display the required environment variables

### Step 3: Update GitHub Secrets

1. **Go to your GitHub repository**
   ```
   https://github.com/igorrooney/olgish_cakes/settings/secrets/actions
   ```

2. **Update these secrets:**

   Click "Update secret" next to each one:
   
   - **GDRIVE_REFRESH_TOKEN** - Use the new token from the script
   - **GDRIVE_BACKUP_FOLDER_ID** - Use the folder ID from the script
   
   (The other secrets should remain unchanged unless you created new OAuth credentials)

### Step 4: Test the Fix

1. **Navigate to Actions tab** in your GitHub repository

2. **Find the "Sanity Backup to Google Drive" workflow**

3. **Click "Run workflow"** button

4. **Select branch** (usually `master`) and click "Run workflow"

5. **Monitor the run** - It should complete successfully within 2-3 minutes

### Step 5: Verify the Backup

1. **Go to your Google Drive**

2. **Find the "Sanity Backups" folder**

3. **Check for a new backup file:**
   ```
   sanity-backup-YYYY-MM-DD-HH-MM-UTC.tar.gz
   ```

4. **Verify the file size** - Should be several MB depending on your content

## Preventing Future Issues

### Keep Tokens Active

The automated daily backups at 02:00 UTC will keep your refresh token active. If you disable the scheduled workflow, remember to:

- Run manual backups at least once every 6 months
- Or regenerate the token when re-enabling backups

### Monitor Backup Success

Set up notifications for workflow failures:

1. Go to repository **Settings** → **Notifications**
2. Enable **Actions** notifications
3. Choose email or other notification method

### Regular Testing

Test the backup workflow manually:
- Monthly manual run recommended
- After any Google Cloud project changes
- After updating OAuth credentials

## Common Issues and Solutions

### Issue: "No refresh token received"

**Cause:** Google didn't return a refresh token because you previously authorized the app.

**Solution:**
1. Go to https://myaccount.google.com/permissions
2. Find and remove your app
3. Run `pnpm setup:gdrive` again

### Issue: "API not enabled"

**Cause:** Google Drive API is not enabled in your Google Cloud project.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Library**
4. Search for "Google Drive API"
5. Click **Enable**

### Issue: "Access blocked: Request is from a test application"

**Cause:** Your app is in testing mode and your email isn't added as a test user.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **OAuth consent screen**
3. Scroll to **Test users**
4. Click **Add Users**
5. Add your email address

### Issue: Script can't find OAuth credentials

**Cause:** Environment variables not set in `.env.local`

**Solution:**
1. Copy `.env.example` to `.env.local` if it doesn't exist
2. Add these variables:
   ```env
   GDRIVE_CLIENT_ID=your-client-id
   GDRIVE_CLIENT_SECRET=your-client-secret
   ```

## Backup Schedule

The automated backup runs:
- **Daily at 02:00 UTC** (03:00 GMT in winter, 03:00 BST in summer)
- Can be run manually anytime from GitHub Actions

## Security Notes

### Never Commit These Secrets

The following should ONLY exist in:
- GitHub repository secrets
- Local `.env.local` file (which is gitignored)

```env
GDRIVE_CLIENT_ID=...
GDRIVE_CLIENT_SECRET=...
GDRIVE_REFRESH_TOKEN=...
GDRIVE_BACKUP_FOLDER_ID=...
```

### Rotate Credentials Regularly

Consider rotating OAuth credentials:
- Every 6-12 months
- After team member changes
- After any security incidents

### Limit Access Scope

The backup only needs these Google Drive permissions:
- `https://www.googleapis.com/auth/drive.file`

This scope only allows access to files created by the app, not all Drive files.

## Need Help?

If you continue experiencing issues:

1. Check the [GitHub Actions logs](https://github.com/igorrooney/olgish_cakes/actions)
2. Verify all secrets are set correctly
3. Ensure Google Cloud project is properly configured
4. Review Google Cloud Console audit logs for OAuth issues

## Related Files

- **Backup script:** `scripts/backup-sanity-to-drive.ts`
- **Setup script:** `scripts/setup-google-drive-oauth.ts`
- **Workflow file:** `.github/workflows/sanity-backup.yml`
- **Package scripts:** `package.json` (see `backup:sanity:drive` and `setup:gdrive`)

## Quick Reference

```bash
# Run setup to get new tokens
pnpm setup:gdrive

# Test backup manually
pnpm backup:sanity:drive

# Check workflow status
# Go to: https://github.com/igorrooney/olgish_cakes/actions
```

