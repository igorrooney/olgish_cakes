#!/usr/bin/env node

/**
 * Google Drive OAuth Setup Script
 * 
 * This script helps you obtain a refresh token for Google Drive OAuth authentication.
 * Run this once to get your refresh token, then use it in your environment variables.
 * 
 * Usage:
 *   tsx scripts/setup-google-drive-oauth.ts
 */

import { google } from 'googleapis'
import * as readline from 'readline'
import dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve))
}

/**
 * Simple structured logger utility
 */
const logger = {
  info: (message: string, ...args: unknown[]) => {
    console.log(`[INFO] ${message}`, ...args)
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${message}`, ...args)
  },
  error: (message: string, error?: Error | unknown) => {
    const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error')
    const isDev = process.env.NODE_ENV === 'development'
    const stackTrace = error instanceof Error && error.stack && isDev
      ? `\nStack: ${error.stack}`
      : ''
    console.error(`[ERROR] ${message}: ${errorMessage}${stackTrace}`)
  },
  success: (message: string, ...args: unknown[]) => {
    console.log(`[SUCCESS] ${message}`, ...args)
  }
}

async function createBackupFolder(oauth2Client: InstanceType<typeof google.auth.OAuth2>): Promise<string> {
  const drive = google.drive({ version: 'v3', auth: oauth2Client })
  
  try {
    const response = await drive.files.create({
      requestBody: {
        name: 'Sanity Backups',
        mimeType: 'application/vnd.google-apps.folder'
      },
      fields: 'id, name, webViewLink'
    })

    return response.data.id || ''
  } catch (error) {
    logger.error('Failed to create backup folder', error)
    throw error
  }
}

async function main() {
  logger.info('🔐 Google Drive OAuth Setup\n')
  logger.info('This script will help you get a refresh token for Google Drive access.\n')

  // Get OAuth credentials
  const clientId = process.env.GDRIVE_CLIENT_ID || await question('Enter your Google OAuth Client ID: ')
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET || await question('Enter your Google OAuth Client Secret: ')

  if (!clientId || !clientSecret) {
    logger.error('❌ Client ID and Client Secret are required')
    process.exit(1)
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'urn:ietf:wg:oauth:2.0:oob'
  )

  // Generate auth URL
  const scopes = ['https://www.googleapis.com/auth/drive.file']
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent' // Force consent to get refresh token
  })

  logger.info('\n📋 Follow these steps:')
  logger.info('1. Open this URL in your browser:')
  logger.info(`\n   ${authUrl}\n`)
  logger.info('2. Sign in with your Google account')
  logger.info('3. Grant permissions to the application')
  logger.info('4. Copy the authorization code from the page\n')

  const code = await question('Enter the authorization code: ')

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    
    if (!tokens.refresh_token) {
      logger.error('\n❌ No refresh token received. This may happen if you previously authorized this app.')
      logger.error('   To fix this:')
      logger.error('   1. Go to https://myaccount.google.com/permissions')
      logger.error('   2. Find and remove this app')
      logger.error('   3. Run this script again')
      rl.close()
      process.exit(1)
    }

    logger.success('\n✅ Successfully obtained refresh token!')
    
    // Test the token by creating a backup folder
    logger.info('\n⏳ Testing token by creating "Sanity Backups" folder...')
    oauth2Client.setCredentials({ refresh_token: tokens.refresh_token })
    
    const folderId = await createBackupFolder(oauth2Client)
    
    logger.success('\n✅ Test successful! Folder created.')
    logger.info('\n📝 Add these to your .env.local file:\n')
    logger.info(`GDRIVE_CLIENT_ID=${clientId}`)
    logger.info(`GDRIVE_CLIENT_SECRET=${clientSecret}`)
    logger.info(`GDRIVE_REFRESH_TOKEN=${tokens.refresh_token}`)
    logger.info(`GDRIVE_BACKUP_FOLDER_ID=${folderId}\n`)
    logger.info(`📁 View folder: https://drive.google.com/drive/folders/${folderId}\n`)
    
    logger.info('💡 For GitHub Actions, add these as repository secrets:')
    logger.info('   Settings → Secrets and variables → Actions → New repository secret\n')
    logger.warn('⚠️  Keep these tokens secure and never commit them to version control!\n')

    rl.close()
  } catch (error) {
    logger.error('\n❌ Error during setup', error)
    logger.info('\n💡 Troubleshooting:')
    logger.info('   • Make sure Google Drive API is enabled in Google Cloud Console')
    logger.info('   • Check that your email is added as a test user in OAuth consent screen')
    logger.info('   • Try revoking access at https://myaccount.google.com/permissions')
    rl.close()
    process.exit(1)
  }
}

main()

