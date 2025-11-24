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

async function main() {
  console.log('🔐 Google Drive OAuth Setup\n')
  console.log('This script will help you get a refresh token for Google Drive access.\n')

  // Get OAuth credentials
  const clientId = process.env.GDRIVE_CLIENT_ID || await question('Enter your Google OAuth Client ID: ')
  const clientSecret = process.env.GDRIVE_CLIENT_SECRET || await question('Enter your Google OAuth Client Secret: ')

  if (!clientId || !clientSecret) {
    console.error('❌ Client ID and Client Secret are required')
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

  console.log('\n📋 Follow these steps:')
  console.log('1. Open this URL in your browser:')
  console.log(`\n   ${authUrl}\n`)
  console.log('2. Sign in with your Google account')
  console.log('3. Grant permissions to the application')
  console.log('4. Copy the authorization code from the page\n')

  const code = await question('Enter the authorization code: ')

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    
    if (!tokens.refresh_token) {
      console.error('\n❌ No refresh token received. Make sure you:')
      console.error('   - Set access_type to "offline"')
      console.error('   - Include prompt: "consent"')
      console.error('   - Are using the app for the first time or revoked access')
      process.exit(1)
    }

    console.log('\n✅ Success! Here are your tokens:\n')
    console.log('Add these to your .env.local file:\n')
    console.log(`GDRIVE_CLIENT_ID=${clientId}`)
    console.log(`GDRIVE_CLIENT_SECRET=${clientSecret}`)
    console.log(`GDRIVE_REFRESH_TOKEN=${tokens.refresh_token}\n`)
    console.log('⚠️  Keep these tokens secure and never commit them to version control!\n')

    rl.close()
  } catch (error) {
    console.error('\n❌ Error getting tokens:', error instanceof Error ? error.message : 'Unknown error')
    process.exit(1)
  }
}

main()

