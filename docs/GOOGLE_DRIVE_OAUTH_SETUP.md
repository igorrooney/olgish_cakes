# Google Drive OAuth Setup Guide (Free)

This guide will help you set up free Google Drive backups using OAuth2 authentication.

## Why OAuth Instead of Service Account?

- ✅ **Free**: Uses Google Drive's 15GB free tier
- ✅ **No storage quota issues**: Regular user accounts have storage
- ✅ **Simple setup**: One-time OAuth authorization
- ✅ **Automated**: Refresh tokens allow automated access

## Step-by-Step Setup

### Step 1: Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (or create a new one)
3. Go to **APIs & Services** > **Credentials**
4. **Configure OAuth Consent Screen** (IMPORTANT):
   - Click **Configure Consent Screen**
   - Choose **External** (unless you have Google Workspace)
   - Fill in app name: "Sanity Backup"
   - Add your email as the support email
   - Add your email as the developer contact
   - Click **Save and Continue**
   - **Add Scopes**: Click "Add or Remove Scopes"
     - Search for and add: `https://www.googleapis.com/auth/drive.file`
     - Click **Update**, then **Save and Continue**
   - **Add Test Users** (CRITICAL STEP):
     - Click **Add Users**
     - Add your Google account email (the one you'll use for backups)
     - Click **Add**
     - Click **Save and Continue**
   - Review and click **Back to Dashboard**
5. **Create OAuth Client**:
   - Go to **Credentials** tab
   - Click **Create Credentials** > **OAuth client ID**
   - Choose **Desktop app** as the application type
   - Name it: "Sanity Backup"
   - Click **Create**
   - **Copy the Client ID and Client Secret** (you'll need these)

### Step 2: Get Refresh Token

1. Add your OAuth credentials to `.env.local`:
   ```bash
   GDRIVE_CLIENT_ID=your_client_id_here
   GDRIVE_CLIENT_SECRET=your_client_secret_here
   ```

2. Run the setup script:
   ```bash
   pnpm setup:gdrive-oauth
   ```

3. Follow the prompts:
   - The script will show you an authorization URL
   - Open it in your browser
   - Sign in with your Google account
   - Grant permissions
   - Copy the authorization code from the page
   - Paste it into the script

4. The script will output your refresh token - add it to `.env.local`:
   ```bash
   GDRIVE_REFRESH_TOKEN=your_refresh_token_here
   ```

### Step 3: Create Backup Folder

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder (e.g., "Sanity Backups")
3. Open the folder
4. Copy the Folder ID from the URL:
   - URL format: `https://drive.google.com/drive/folders/FOLDER_ID_HERE`
   - The folder ID is the long string after `/folders/`

5. Add to `.env.local`:
   ```bash
   GDRIVE_BACKUP_FOLDER_ID=your_folder_id_here
   ```

### Step 4: Test the Backup

1. Make sure all environment variables are set in `.env.local`:
   ```bash
   SANITY_PROJECT_ID=as9bci7b
   SANITY_DATASET=production
   SANITY_AUTH_TOKEN=your_sanity_token
   GDRIVE_CLIENT_ID=your_client_id
   GDRIVE_CLIENT_SECRET=your_client_secret
   GDRIVE_REFRESH_TOKEN=your_refresh_token
   GDRIVE_BACKUP_FOLDER_ID=your_folder_id
   ```

2. Run the backup:
   ```bash
   pnpm backup:sanity:drive
   ```

3. Check your Google Drive folder - the backup should be there!

### Step 5: Configure GitHub Secrets

For automated backups, add these secrets to your GitHub repository:

1. Go to your repository > **Settings** > **Secrets and variables** > **Actions**
2. Add each secret:

- `SANITY_PROJECT_ID`: Your Sanity project ID
- `SANITY_DATASET`: Your dataset name (e.g., `production`)
- `SANITY_AUTH_TOKEN`: Your Sanity API token
- `GDRIVE_CLIENT_ID`: Your OAuth client ID
- `GDRIVE_CLIENT_SECRET`: Your OAuth client secret
- `GDRIVE_REFRESH_TOKEN`: Your refresh token
- `GDRIVE_BACKUP_FOLDER_ID`: Your Google Drive folder ID

## Troubleshooting

### "Access blocked: app has not completed Google verification" error
**This is the most common issue!** The app is in Testing mode and you need to add yourself as a test user:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **OAuth consent screen**
3. Scroll down to **Test users** section
4. Click **Add Users**
5. Add your Google account email (the one you're trying to use)
6. Click **Add**
7. Try the OAuth flow again

**Note**: If you want to avoid this limitation, you can publish your app, but it requires Google verification for sensitive scopes. For personal use, adding yourself as a test user is the easiest solution.

### "Invalid grant" error
- Your refresh token may have expired
- Re-run `pnpm setup:gdrive-oauth` to get a new refresh token
- Make sure you're using the same Google account that's added as a test user

### "Access denied" error
- Check that the folder ID is correct
- Ensure you have write access to the folder
- Verify the OAuth scopes include Drive file access
- Make sure you're added as a test user in the OAuth consent screen

### Refresh token not working
- Refresh tokens can expire if not used for 6 months
- If you revoke app access, you'll need a new refresh token
- Re-run the setup script to get a new token
- Ensure you're still listed as a test user

## Security Notes

- ⚠️ **Never commit** your `.env.local` file or OAuth credentials
- ⚠️ Keep your refresh token secure - it provides access to your Google Drive
- ⚠️ If your refresh token is compromised, revoke access in [Google Account Settings](https://myaccount.google.com/permissions)

## Cost

**This solution is completely free!**
- Google Drive provides 15GB of free storage
- OAuth authentication is free
- No API costs for Drive file operations
- Perfect for backup use cases

