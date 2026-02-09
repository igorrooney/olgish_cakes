# Olgish Cakes

A professional website for Olgish Cakes, featuring authentic Ukrainian cakes made in Leeds by Olga Ieromenko.

## Features

- Modern, responsive design using Material UI
- Dynamic content management with Sanity.io
- Server-side rendering with Next.js 14
- TypeScript for type safety
- Beautiful typography with Playfair Display font
- Optimized images and animations
- **Advanced SEO with structured data (Schema.org)**
- **Automated schema validation**
- **Performance monitoring and optimization**

## Tech Stack

- Next.js 14
- TypeScript
- Material UI
- Sanity.io
- Framer Motion
- Schema.org structured data

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env.local` file with required credentials:
   ```
   # Sanity CMS
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_token
   
   # Email (Required for contact/order forms)
   RESEND_API_KEY=your_resend_api_key
   NEXTAUTH_URL=http://localhost:3000
   CONTACT_EMAIL_TO=hello@olgishcakes.co.uk
   
   # CSRF Protection (Required for form submissions)
   CSRF_SECRET=your_csrf_secret_here
   ```
   
   **Note:** For development, you can use the template values from `env.development.template`.
   For production, use `env.production.template` and ensure `CSRF_SECRET` is set to a secure random value.
   
   See [Email Setup Guide](docs/EMAIL_SETUP_GUIDE.md) for detailed email configuration.
4. Run the development server:
   ```bash
   pnpm run dev
   ```

## Quality Assurance

![Tests](https://github.com/igorrooney/olgish_cakes/actions/workflows/test.yml/badge.svg)

### Unit Testing
Run automated tests with coverage:
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm run test:coverage
```

### Schema Validation
Validate all structured data before deployment:
```bash
# Quick validation with mock data (fast, no Sanity required)
pnpm run validate:schemas

# Full validation with real Sanity data
pnpm run validate:schemas:real
```

This checks:
- Product schema compliance
- MPN uniqueness
- Required field presence
- Google Merchant Center requirements

### Performance Monitoring
In development mode, the console displays:
- Query timing information
- Schema generation performance
- Cache hit/miss rates
- Performance threshold warnings

## Deployment

The site is deployed on Vercel. Each push to the main branch triggers an automatic deployment.

### Pre-Deployment Checklist:
1. Run `pnpm run build` - Ensure no build errors
2. Run `pnpm run validate:schemas` - Validate structured data
3. Check performance logs in dev mode
4. Review linter output

## Sanity Backups

The project includes an automated backup system that exports the production Sanity dataset (including assets) to Google Drive on a daily schedule. **This solution is completely free** using Google Drive's 15GB free tier with OAuth2 authentication.

### Automated Backups

A GitHub Actions workflow runs automatically once per day at 02:00 UTC to:
1. Export the production Sanity dataset with all assets to a tar.gz archive
2. Upload the backup to a Google Drive folder
3. Clean up temporary files

Backup files are named with UTC timestamps: `sanity-backup-YYYY-MM-DD-HH-mm-UTC.tar.gz`

### Manual Backup

To run a backup manually:

```bash
pnpm backup:sanity:drive
```

This requires the same environment variables as the automated workflow (see below).

### GitHub Secrets Configuration

The following secrets must be configured in your GitHub repository settings:

- **`SANITY_PROJECT_ID`**: Your Sanity project ID (e.g., `as9bci7b`)
- **`SANITY_DATASET`**: Your production dataset name (e.g., `production`)
- **`SANITY_AUTH_TOKEN`**: Sanity API token with read access for the dataset and assets
- **`GDRIVE_CLIENT_ID`**: Google OAuth2 client ID
- **`GDRIVE_CLIENT_SECRET`**: Google OAuth2 client secret
- **`GDRIVE_REFRESH_TOKEN`**: Google OAuth2 refresh token (obtained once during setup)
- **`GDRIVE_BACKUP_FOLDER_ID`**: Google Drive folder ID where backups should be stored

### Local Environment Variables

For local backups, add these to your `.env.local` file:

```bash
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_AUTH_TOKEN=your_sanity_token
GDRIVE_CLIENT_ID=your_oauth_client_id
GDRIVE_CLIENT_SECRET=your_oauth_client_secret
GDRIVE_REFRESH_TOKEN=your_refresh_token
GDRIVE_BACKUP_FOLDER_ID=your_google_drive_folder_id
```

### Google Drive OAuth Setup

1. **Create OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project (or create a new one)
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - If prompted, configure the OAuth consent screen first
   - Choose **Desktop app** as the application type
   - Name it (e.g., "Sanity Backup")
   - Click **Create** and copy the Client ID and Client Secret

2. **Get Refresh Token:**
   ```bash
   pnpm setup:gdrive-oauth
   ```
   Follow the prompts to authorize and get your refresh token.

3. **Create Backup Folder:**
   - Create a folder in Google Drive (e.g., "Sanity Backups")
   - Open the folder and copy the Folder ID from the URL
   - The folder ID is the long string after `/folders/` in the URL

### Restoring from Backup

To restore a backup:

1. Download the backup file from Google Drive
2. Extract the tar.gz archive:
   ```bash
   tar -xzf sanity-backup-YYYY-MM-DD-HH-mm-UTC.tar.gz
   ```
3. Use the Sanity CLI to import:
   ```bash
   npx sanity dataset import <path-to-extracted-folder> <dataset-name> --project <project-id> --token <token>
   ```

**Warning**: Importing will replace all existing data in the target dataset. Always test on a development dataset first.

## Documentation

- **[Structured Data Guide](docs/STRUCTURED_DATA_IMPROVEMENTS.md)** - Schema implementation
- **[Validation Guide](docs/SCHEMA_VALIDATION_GUIDE.md)** - How to validate schemas
- **[Email Setup Guide](docs/EMAIL_SETUP_GUIDE.md)** - Configure email notifications for orders and contact forms
- **[Improvements Summary](IMPROVEMENTS_SUMMARY.md)** - Recent enhancements
