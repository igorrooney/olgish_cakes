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
      logger.error('\n❌ No refresh token received. Make sure you:')
      logger.error('   - Set access_type to "offline"')
      logger.error('   - Include prompt: "consent"')
      logger.error('   - Are using the app for the first time or revoked access')
      process.exit(1)
    }

    logger.success('\n✅ Success! Here are your tokens:\n')
    logger.info('Add these to your .env.local file:\n')
    logger.info(`GDRIVE_CLIENT_ID=${clientId}`)
    logger.info(`GDRIVE_CLIENT_SECRET=${clientSecret}`)
    logger.info(`GDRIVE_REFRESH_TOKEN=${tokens.refresh_token}\n`)
    logger.warn('⚠️  Keep these tokens secure and never commit them to version control!\n')

    rl.close()
  } catch (error) {
    logger.error('\n❌ Error getting tokens', error)
    process.exit(1)
  }
}

main()

