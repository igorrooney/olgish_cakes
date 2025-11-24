# Sanity Backup to Google Cloud Storage - Setup Guide

This guide will walk you through setting up automated Sanity backups to Google Cloud Storage.

## Prerequisites

- A Google account
- Access to Google Cloud Console
- A Sanity project with API token
- GitHub repository access (for automated backups)

## Why Google Cloud Storage?

Google Cloud Storage is recommended over Google Drive for automated backups because:
- ✅ Service accounts work seamlessly with GCS (no storage quota issues)
- ✅ Designed for automated backups and data archival
- ✅ More reliable and scalable
- ✅ Better suited for production backup systems

## Step-by-Step Setup

### Step 1: Google Cloud Setup

#### 1.1 Create or Select a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "New Project" or select an existing project
4. Note the Project ID (you'll need it later)

#### 1.2 Enable Google Cloud Storage API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Cloud Storage API"
3. Click on it and press **Enable**

#### 1.3 Create a Storage Bucket

1. Go to **Cloud Storage** > **Buckets**
2. Click **Create Bucket**
3. Fill in the details:
   - **Name**: Choose a globally unique name (e.g., `your-project-sanity-backups`)
     - Must be lowercase, no spaces, globally unique
     - Can contain hyphens and numbers
   - **Location type**: Choose based on your needs:
     - **Region**: Single region (lower cost, faster access in that region)
     - **Multi-region**: Multiple regions (higher availability)
   - **Storage class**: **Standard** (recommended for backups)
   - **Access control**: **Uniform** (recommended) or **Fine-grained**
   - **Protection tools**: Enable versioning if desired
4. Click **Create**

#### 1.4 Create a Service Account

1. Go to **IAM & Admin** > **Service Accounts**
2. Click **Create Service Account**
3. Fill in:
   - **Service account name**: `sanity-backup` (or any name you prefer)
   - **Service account ID**: Auto-generated (you can change it)
   - **Description**: "Service account for Sanity backups"
4. Click **Create and Continue**
5. **Grant this service account access to project**:
   - Select role: **Storage Admin** (or **Storage Object Admin** for more restricted access)
6. Click **Continue**, then **Done**

#### 1.5 Grant Bucket Access to Service Account

1. Go to **Cloud Storage** > **Buckets**
2. Click on your backup bucket
3. Go to the **Permissions** tab
4. Click **Grant Access**
5. In "New principals", paste the **service account email**
   - You can find this in the service account details or in the JSON key file (field `client_email`)
6. Select role: **Storage Object Admin**
7. Click **Save**

#### 1.6 Create and Download Service Account Key

1. Go back to **IAM & Admin** > **Service Accounts**
2. Click on the service account you just created
3. Go to the **Keys** tab
4. Click **Add Key** > **Create new key**
5. Select **JSON** format
6. Click **Create** - the JSON file will download automatically
7. **IMPORTANT**: Save this file securely. You'll need it in the next steps.

### Step 2: Get Sanity API Token

1. Go to [Sanity Manage](https://sanity.io/manage)
2. Select your project
3. Go to **API** > **Tokens**
4. Click **Add API token**
5. Name it: "Backup Script"
6. Set permissions:
   - **Read** access to the dataset
   - **Read** access to assets
7. Click **Save** and copy the token (you won't see it again!)

### Step 3: Configure Local Environment

1. Open or create `.env.local` in your project root
2. Add the following variables:

```bash
# Sanity Configuration
SANITY_PROJECT_ID=as9bci7b
SANITY_DATASET=production
SANITY_AUTH_TOKEN=your_sanity_token_here

# Google Cloud Storage Backup Configuration
GCS_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"sanity-backup@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
GCS_BUCKET_NAME=your-gcs-bucket-name
```

**How to get GCS_SERVICE_ACCOUNT value:**

**Option A: Raw JSON (Recommended for local)**
1. Open the downloaded service account JSON file
2. Copy the entire contents
3. Paste it as a single-line string in `.env.local`
4. Make sure to wrap the entire thing in single quotes

**Option B: Base64 Encoded (Recommended for GitHub Secrets)**
1. Open the downloaded service account JSON file
2. Encode it to base64:
   ```bash
   # On macOS/Linux:
   base64 -i path/to/service-account.json
   
   # Or use an online tool
   ```
3. Use the base64 string as the value

**Example .env.local:**
```bash
SANITY_PROJECT_ID=as9bci7b
SANITY_DATASET=production
SANITY_AUTH_TOKEN=skAbCdEf1234567890...

# Option A: Raw JSON (wrap in single quotes)
GCS_SERVICE_ACCOUNT='{"type":"service_account","project_id":"my-project-123",...}'

# Option B: Base64 (no quotes needed)
GCS_SERVICE_ACCOUNT=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...

GCS_BUCKET_NAME=my-project-sanity-backups
```

### Step 4: Test Local Backup

1. Make sure all dependencies are installed:
   ```bash
   pnpm install
   ```

2. Run the backup script:
   ```bash
   pnpm backup:sanity:gcs
   ```

3. You should see output like:
   ```
   🚀 Starting Sanity backup to Google Cloud Storage...
   
   📦 Starting Sanity dataset export...
      Project: as9bci7b
      Dataset: production
      Running export command...
   ✅ Export completed: sanity-backup-2025-01-15-14-30-UTC.tar.gz
   
   ☁️  Starting upload to Google Cloud Storage...
      Bucket: my-project-sanity-backups
   ✅ Upload completed: sanity-backup-2025-01-15-14-30-UTC.tar.gz
      GCS Path: gs://my-project-sanity-backups/sanity-backup-2025-01-15-14-30-UTC.tar.gz
      Public URL: https://storage.googleapis.com/my-project-sanity-backups/sanity-backup-2025-01-15-14-30-UTC.tar.gz
   
   🧹 Cleaned up temporary files
   
   ✅ Backup completed successfully!
      File: sanity-backup-2025-01-15-14-30-UTC.tar.gz
      GCS Path: gs://my-project-sanity-backups/sanity-backup-2025-01-15-14-30-UTC.tar.gz
   ```

4. Check your Google Cloud Storage bucket - you should see the backup file!

### Step 5: Configure GitHub Secrets (for Automated Backups)

1. Go to your GitHub repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret** for each of the following:

#### Secret 1: SANITY_PROJECT_ID
- **Name**: `SANITY_PROJECT_ID`
- **Value**: `as9bci7b` (your Sanity project ID)

#### Secret 2: SANITY_DATASET
- **Name**: `SANITY_DATASET`
- **Value**: `production` (your dataset name)

#### Secret 3: SANITY_AUTH_TOKEN
- **Name**: `SANITY_AUTH_TOKEN`
- **Value**: Your Sanity API token (the same one from Step 2)

#### Secret 4: GCS_SERVICE_ACCOUNT
- **Name**: `GCS_SERVICE_ACCOUNT`
- **Value**: 
  - **Option A**: The entire JSON content as a single-line string
  - **Option B**: Base64-encoded JSON (recommended for GitHub)
    ```bash
    # Encode the service account JSON file:
    base64 -i path/to/service-account.json
    # Copy the output and paste as the secret value
    ```

#### Secret 5: GCS_BUCKET_NAME
- **Name**: `GCS_BUCKET_NAME`
- **Value**: Your Google Cloud Storage bucket name (e.g., `my-project-sanity-backups`)

### Step 6: Verify GitHub Actions Workflow

1. Go to your GitHub repository
2. Click **Actions** tab
3. You should see the "Sanity Backup to Google Cloud Storage" workflow
4. You can manually trigger it:
   - Click on the workflow
   - Click **Run workflow** button
   - Select the branch (usually `main` or `master`)
   - Click **Run workflow**
5. Watch it run - it should complete successfully!

### Step 7: Verify Automated Schedule

The workflow is configured to run daily at 02:00 UTC. To verify:

1. Go to **Actions** tab
2. Click on "Sanity Backup to Google Cloud Storage" workflow
3. You'll see scheduled runs in the workflow history

## Troubleshooting

### Error: "Missing required environment variable"
- Make sure all variables are set in `.env.local` (local) or GitHub Secrets (CI)
- Check for typos in variable names

### Error: "Failed to parse GCS_SERVICE_ACCOUNT"
- Make sure the JSON is valid
- If using raw JSON, ensure it's wrapped in single quotes
- If using base64, ensure it's properly encoded

### Error: "Sanity export failed"
- Verify your `SANITY_AUTH_TOKEN` has read access
- Check that `SANITY_PROJECT_ID` and `SANITY_DATASET` are correct
- Ensure the Sanity CLI can access your project

### Error: "Bucket does not exist"
- Verify the bucket name is correct (case-sensitive)
- Check that the bucket exists in your Google Cloud project
- Ensure you're using the correct project ID

### Error: "Permission denied" when uploading
- Verify the service account has "Storage Object Admin" role on the bucket
- Check that the service account email is correct
- Ensure the bucket permissions are set correctly

### Error: "Service account authentication failed"
- Verify the service account JSON is correct
- Check that the service account hasn't been deleted
- Ensure the private key hasn't been rotated

## Restoring from Backup

To restore a backup:

1. **Download the backup file from Google Cloud Storage:**
   ```bash
   # Using gsutil (install Google Cloud SDK first)
   gsutil cp gs://your-bucket-name/sanity-backup-YYYY-MM-DD-HH-mm-UTC.tar.gz ./
   
   # Or download from Google Cloud Console web interface
   ```

2. **Extract the tar.gz archive:**
   ```bash
   tar -xzf sanity-backup-YYYY-MM-DD-HH-mm-UTC.tar.gz
   ```

3. **Import to Sanity:**
   ```bash
   npx sanity dataset import <path-to-extracted-folder> <dataset-name> \
     --project <project-id> \
     --token <your-token>
   ```

**⚠️ Warning**: Importing will replace all existing data in the target dataset. Always test on a development dataset first!

## Backup File Naming

Backups are named with UTC timestamps:
- Format: `sanity-backup-YYYY-MM-DD-HH-mm-UTC.tar.gz`
- Example: `sanity-backup-2025-01-15-14-30-UTC.tar.gz`

This ensures:
- No filename conflicts
- Easy sorting by date
- Clear timezone indication (UTC)

## Maintenance

- **Monitor backups**: Check Google Cloud Storage regularly to ensure backups are being created
- **Set up lifecycle policies**: Configure bucket lifecycle rules to automatically delete old backups (e.g., keep last 30 days)
- **Monitor costs**: Google Cloud Storage is very affordable, but monitor usage
- **Test restores**: Periodically test restoring from a backup to ensure they work
- **Update tokens**: If you rotate Sanity tokens, update GitHub Secrets

## Cost Considerations

Google Cloud Storage pricing (as of 2024):
- **Standard storage**: ~$0.020 per GB/month
- **Operations**: Very low cost for backup operations
- **Network egress**: Free within same region, minimal cost for downloads

For typical Sanity backups (50-500 MB), monthly cost is usually under $1.

## Support

If you encounter issues:
1. Check the GitHub Actions logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the backup locally first before relying on automated backups
4. Review the script output for specific error messages
5. Check Google Cloud Console for bucket permissions and service account status
