#!/usr/bin/env node

/**
 * Sanity Backup to Google Cloud Storage Script
 * 
 * Exports the production Sanity dataset (with assets) and uploads to Google Cloud Storage.
 * 
 * Environment variables required:
 *   - SANITY_PROJECT_ID: Sanity project ID
 *   - SANITY_DATASET: Sanity dataset name (e.g., 'production')
 *   - SANITY_AUTH_TOKEN: Sanity token with read access for dataset and assets
 *   - GCS_SERVICE_ACCOUNT: JSON string of Google service account credentials
 *   - GCS_BUCKET_NAME: Google Cloud Storage bucket name where backups are stored
 * 
 * Usage:
 *   pnpm backup:sanity:gcs
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir, rm } from 'fs/promises'
import { existsSync } from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { Storage } from '@google-cloud/storage'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface BackupConfig {
  projectId: string
  dataset: string
  authToken: string
  serviceAccount: Record<string, unknown>
  bucketName: string
}

/**
 * Validates and loads configuration from environment variables
 */
function loadConfig(): BackupConfig {
  const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET
  const authToken = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_TOKEN
  const serviceAccountJson = process.env.GCS_SERVICE_ACCOUNT
  const bucketName = process.env.GCS_BUCKET_NAME

  if (!projectId) {
    throw new Error('Missing required environment variable: SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID')
  }
  if (!dataset) {
    throw new Error('Missing required environment variable: SANITY_DATASET or NEXT_PUBLIC_SANITY_DATASET')
  }
  if (!authToken) {
    throw new Error('Missing required environment variable: SANITY_AUTH_TOKEN or SANITY_API_TOKEN')
  }
  if (!serviceAccountJson) {
    throw new Error('Missing required environment variable: GCS_SERVICE_ACCOUNT')
  }
  if (!bucketName) {
    throw new Error('Missing required environment variable: GCS_BUCKET_NAME')
  }

  let serviceAccount: Record<string, unknown>
  try {
    // Try parsing as JSON string (may be base64 encoded)
    const decoded = serviceAccountJson.startsWith('{')
      ? serviceAccountJson
      : Buffer.from(serviceAccountJson, 'base64').toString('utf-8')
    serviceAccount = JSON.parse(decoded)
  } catch (error) {
    throw new Error(`Failed to parse GCS_SERVICE_ACCOUNT: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Validate service account structure
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('Invalid service account JSON: missing client_email or private_key')
  }

  return {
    projectId,
    dataset,
    authToken,
    serviceAccount,
    bucketName
  }
}

/**
 * Creates a Google Cloud Storage client
 */
function createStorageClient(config: BackupConfig): Storage {
  return new Storage({
    projectId: config.serviceAccount.project_id as string,
    credentials: {
      client_email: config.serviceAccount.client_email as string,
      private_key: config.serviceAccount.private_key as string
    }
  })
}

/**
 * Exports Sanity dataset to a tar.gz file
 * @returns Path to the exported backup file
 */
async function exportSanityDataset(config: BackupConfig): Promise<string> {
  console.log('📦 Starting Sanity dataset export...')
  console.log(`   Project: ${config.projectId}`)
  console.log(`   Dataset: ${config.dataset}`)

  // Create temporary directory for backup
  const tempDir = path.join(__dirname, '..', '.backup-temp')
  await mkdir(tempDir, { recursive: true })

  // Generate filename with UTC timestamp
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  const hours = String(now.getUTCHours()).padStart(2, '0')
  const minutes = String(now.getUTCMinutes()).padStart(2, '0')
  const filename = `sanity-backup-${year}-${month}-${day}-${hours}-${minutes}-UTC.tar.gz`
  const outputPath = path.join(tempDir, filename)

  // Run Sanity CLI export command
  // Note: --no-assets flag is NOT used, so assets are included
  const exportCommand = `npx sanity@latest dataset export ${config.dataset} "${outputPath}" --project ${config.projectId}`

  console.log('   Running export command...')
  try {
    const { stdout, stderr } = await execAsync(exportCommand, {
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        SANITY_AUTH_TOKEN: config.authToken,
        SANITY_TOKEN: config.authToken
      }
    })

    if (stderr && !stderr.includes('warning')) {
      console.warn('   Export warnings:', stderr)
    }

    if (!existsSync(outputPath)) {
      throw new Error(`Export file was not created at ${outputPath}`)
    }

    console.log(`✅ Export completed: ${filename}`)
    return outputPath
  } catch (error) {
    // Clean up temp directory on error
    if (existsSync(tempDir)) {
      await rm(tempDir, { recursive: true, force: true })
    }
    throw new Error(`Sanity export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Uploads backup file to Google Cloud Storage
 */
async function uploadBackupToGCS(
  filePath: string,
  filename: string,
  config: BackupConfig
): Promise<string> {
  console.log('☁️  Starting upload to Google Cloud Storage...')
  console.log(`   Bucket: ${config.bucketName}`)

  const storage = createStorageClient(config)
  const bucket = storage.bucket(config.bucketName)

  try {
    // Check if bucket exists
    const [exists] = await bucket.exists()
    if (!exists) {
      throw new Error(`Bucket ${config.bucketName} does not exist. Please create it first.`)
    }

    // Upload file
    const file = bucket.file(filename)
    await file.save(filePath, {
      metadata: {
        contentType: 'application/gzip',
        metadata: {
          'backup-date': new Date().toISOString(),
          'sanity-project': config.projectId,
          'sanity-dataset': config.dataset
        }
      }
    })

    console.log(`✅ Upload completed: ${filename}`)
    console.log(`   GCS Path: gs://${config.bucketName}/${filename}`)
    console.log(`   Public URL: https://storage.googleapis.com/${config.bucketName}/${filename}`)

    return filename
  } catch (error) {
    throw new Error(`Google Cloud Storage upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Main backup function
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Starting Sanity backup to Google Cloud Storage...\n')

    // Load configuration
    const config = loadConfig()

    // Export Sanity dataset
    const backupPath = await exportSanityDataset(config)
    const filename = path.basename(backupPath)

    // Upload to Google Cloud Storage
    const gcsPath = await uploadBackupToGCS(backupPath, filename, config)

    // Clean up temporary file
    const tempDir = path.dirname(backupPath)
    await rm(tempDir, { recursive: true, force: true })
    console.log('\n🧹 Cleaned up temporary files')

    console.log('\n✅ Backup completed successfully!')
    console.log(`   File: ${filename}`)
    console.log(`   GCS Path: gs://${config.bucketName}/${gcsPath}`)
  } catch (error) {
    console.error('\n❌ Backup failed:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

// Run the script
main()

