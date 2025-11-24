#!/usr/bin/env node

/**
 * Sanity Backup to Google Drive Script (Free - Uses OAuth)
 * 
 * Exports the production Sanity dataset (with assets) and uploads to Google Drive.
 * Uses OAuth2 with refresh tokens for free Google Drive storage (15GB free tier).
 * 
 * Environment variables required:
 *   - SANITY_PROJECT_ID: Sanity project ID
 *   - SANITY_DATASET: Sanity dataset name (e.g., 'production')
 *   - SANITY_AUTH_TOKEN: Sanity token with read access for dataset and assets
 *   - GDRIVE_CLIENT_ID: Google OAuth2 client ID
 *   - GDRIVE_CLIENT_SECRET: Google OAuth2 client secret
 *   - GDRIVE_REFRESH_TOKEN: Google OAuth2 refresh token (obtained once during setup)
 *   - GDRIVE_BACKUP_FOLDER_ID: Google Drive folder ID where backups are stored
 * 
 * Usage:
 *   pnpm backup:sanity:drive
 */

import { spawn } from 'child_process'
import dotenv from 'dotenv'
import { createReadStream, existsSync } from 'fs'
import { mkdir, rm } from 'fs/promises'
import { google } from 'googleapis'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface BackupConfig {
    projectId: string
    dataset: string
    authToken: string
    clientId: string
    clientSecret: string
    refreshToken: string
    folderId: string
}

/**
 * Validates and loads configuration from environment variables
 */
function loadConfig(): BackupConfig {
    const projectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
    const dataset = process.env.SANITY_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET
    const authToken = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_TOKEN
    const clientId = process.env.GDRIVE_CLIENT_ID
    const clientSecret = process.env.GDRIVE_CLIENT_SECRET
    const refreshToken = process.env.GDRIVE_REFRESH_TOKEN
    const folderId = process.env.GDRIVE_BACKUP_FOLDER_ID

    if (!projectId) {
        throw new Error('Missing required environment variable: SANITY_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID')
    }
    if (!dataset) {
        throw new Error('Missing required environment variable: SANITY_DATASET or NEXT_PUBLIC_SANITY_DATASET')
    }
    if (!authToken) {
        throw new Error('Missing required environment variable: SANITY_AUTH_TOKEN or SANITY_API_TOKEN')
    }
    if (!clientId) {
        throw new Error('Missing required environment variable: GDRIVE_CLIENT_ID')
    }
    if (!clientSecret) {
        throw new Error('Missing required environment variable: GDRIVE_CLIENT_SECRET')
    }
    if (!refreshToken) {
        throw new Error('Missing required environment variable: GDRIVE_REFRESH_TOKEN')
    }
    if (!folderId) {
        throw new Error('Missing required environment variable: GDRIVE_BACKUP_FOLDER_ID')
    }

    // Validate project ID format (Sanity project IDs are lowercase alphanumeric)
    if (!/^[a-z0-9]+$/.test(projectId)) {
        throw new Error(`Invalid SANITY_PROJECT_ID format: must be lowercase alphanumeric, got "${projectId}"`)
    }

    // Validate dataset name (lowercase, hyphens allowed)
    if (!/^[a-z0-9-]+$/.test(dataset)) {
        throw new Error(`Invalid SANITY_DATASET format: must be lowercase alphanumeric with hyphens, got "${dataset}"`)
    }

    // Validate folder ID format (Google Drive folder IDs are alphanumeric with underscores and hyphens)
    if (!/^[a-zA-Z0-9_-]+$/.test(folderId)) {
        throw new Error(`Invalid GDRIVE_BACKUP_FOLDER_ID format: must be alphanumeric with underscores or hyphens, got "${folderId}"`)
    }

    // Validate OAuth client ID format (typically ends with .apps.googleusercontent.com or is a long string)
    if (!/^[a-zA-Z0-9._-]+$/.test(clientId)) {
        throw new Error(`Invalid GDRIVE_CLIENT_ID format`)
    }

    return {
        projectId,
        dataset,
        authToken,
        clientId,
        clientSecret,
        refreshToken,
        folderId
    }
}

/**
 * Creates an OAuth2 client for Google Drive API authentication
 */
function createOAuth2Client(config: BackupConfig) {
    const oauth2Client = new google.auth.OAuth2(
        config.clientId,
        config.clientSecret,
        'urn:ietf:wg:oauth:2.0:oob' // For installed applications
    )

    // Set the refresh token to get a new access token automatically
    oauth2Client.setCredentials({
        refresh_token: config.refreshToken
    })

    return oauth2Client
}

/**
 * Creates a timeout promise that rejects after the specified duration
 */
function createTimeout(ms: number, operation: string): Promise<never> {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`${operation} operation timed out after ${ms / 1000 / 60} minutes`))
        }, ms)
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
    // Use spawn with argument arrays to prevent command injection
    console.log('   Running export command...')

    const EXPORT_TIMEOUT = 30 * 60 * 1000 // 30 minutes

    return Promise.race([
        new Promise<string>((resolve, reject) => {
            const child = spawn(
                'npx',
                [
                    'sanity@latest',
                    'dataset',
                    'export',
                    config.dataset,
                    outputPath,
                    '--project',
                    config.projectId
                ],
                {
                    cwd: path.join(__dirname, '..'),
                    env: {
                        ...process.env,
                        SANITY_AUTH_TOKEN: config.authToken,
                        SANITY_TOKEN: config.authToken
                    },
                    stdio: 'pipe'
                }
            )

            let stdout = ''
            let stderr = ''

            child.stdout?.on('data', (data) => {
                stdout += data.toString()
            })

            child.stderr?.on('data', (data) => {
                stderr += data.toString()
            })

            child.on('close', async (code) => {
                if (code !== 0) {
                    // Clean up temp directory on error
                    if (existsSync(tempDir)) {
                        await rm(tempDir, { recursive: true, force: true })
                    }
                    reject(new Error(`Sanity export failed with code ${code}: ${stderr || stdout}`))
                    return
                }

                if (stderr && !stderr.includes('warning')) {
                    console.warn('   Export warnings:', stderr)
                }

                if (!existsSync(outputPath)) {
                    // Clean up temp directory on error
                    if (existsSync(tempDir)) {
                        await rm(tempDir, { recursive: true, force: true })
                    }
                    reject(new Error(`Export file was not created at ${outputPath}`))
                    return
                }

                console.log(`✅ Export completed: ${filename}`)
                resolve(outputPath)
            })

            child.on('error', async (error) => {
                // Clean up temp directory on error
                if (existsSync(tempDir)) {
                    await rm(tempDir, { recursive: true, force: true })
                }
                reject(new Error(`Sanity export failed: ${error.message}`))
            })
        }),
        createTimeout(EXPORT_TIMEOUT, 'Sanity export')
    ])
}

/**
 * Uploads backup file to Google Drive
 */
async function uploadBackupToDrive(
    filePath: string,
    filename: string,
    config: BackupConfig
): Promise<string> {
    console.log('☁️  Starting upload to Google Drive...')
    console.log(`   Folder ID: ${config.folderId}`)

    const oauth2Client = createOAuth2Client(config)
    const drive = google.drive({ version: 'v3', auth: oauth2Client })

    try {
        const fileStream = createReadStream(filePath)

        const response = await drive.files.create({
            requestBody: {
                name: filename,
                parents: [config.folderId]
            },
            media: {
                mimeType: 'application/gzip',
                body: fileStream
            }
        })

        if (!response.data.id) {
            throw new Error('Upload completed but no file ID was returned')
        }

        const fileId = response.data.id
        console.log(`✅ Upload completed: ${filename}`)
        console.log(`   File ID: ${fileId}`)
        console.log(`   View: https://drive.google.com/file/d/${fileId}/view`)

        return fileId
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        if (errorMessage.includes('timed out')) {
            throw error
        }
        throw new Error(`Google Drive upload failed: ${errorMessage}`)
    }
}

// Wrap upload with timeout
async function uploadBackupToDriveWithTimeout(
    filePath: string,
    filename: string,
    config: BackupConfig
): Promise<string> {
    const UPLOAD_TIMEOUT = 60 * 60 * 1000 // 1 hour
    return Promise.race([
        uploadBackupToDrive(filePath, filename, config),
        createTimeout(UPLOAD_TIMEOUT, 'Google Drive upload')
    ])
}

/**
 * Main backup function
 */
async function main(): Promise<void> {
    try {
        console.log('🚀 Starting Sanity backup to Google Drive (Free)...\n')

        // Load configuration
        const config = loadConfig()

        // Export Sanity dataset
        const backupPath = await exportSanityDataset(config)
        const filename = path.basename(backupPath)

        // Upload to Google Drive
        const fileId = await uploadBackupToDriveWithTimeout(backupPath, filename, config)

        // Clean up temporary file
        const tempDir = path.dirname(backupPath)
        await rm(tempDir, { recursive: true, force: true })
        console.log('\n🧹 Cleaned up temporary files')

        console.log('\n✅ Backup completed successfully!')
        console.log(`   File: ${filename}`)
        console.log(`   Google Drive ID: ${fileId}`)
    } catch (error) {
        console.error('\n❌ Backup failed:', error instanceof Error ? error.message : 'Unknown error')
        process.exit(1)
    }
}

// Run the script
main()
