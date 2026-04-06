#!/usr/bin/env node

import dotenv from 'dotenv'
import path from 'path'
import { refreshInstagramLongLivedToken } from '../lib/instagram-oauth'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const getArgumentValue = (name: string): string | null => {
  const prefix = `--${name}=`
  const argument = process.argv.slice(2).find(value => value.startsWith(prefix))

  return argument ? argument.slice(prefix.length) : null
}

const hasFlag = (name: string): boolean => process.argv.slice(2).includes(`--${name}`)

const printUsage = (): void => {
  console.log('Usage: pnpm instagram:refresh-token')
  console.log('Optional flags:')
  console.log('  --token=INSTAGRAM_ACCESS_TOKEN   Refresh a specific long-lived token')
  console.log('')
}

const getRequiredToken = (): string => {
  const token = getArgumentValue('token') ?? process.env.INSTAGRAM_ACCESS_TOKEN?.trim()

  if (!token) {
    throw new Error('Missing INSTAGRAM_ACCESS_TOKEN. Add it to .env.local or pass --token=...')
  }

  return token
}

async function main(): Promise<void> {
  if (hasFlag('help')) {
    printUsage()
    return
  }

  const accessToken = getRequiredToken()
  const userId = process.env.INSTAGRAM_USER_ID?.trim()
  const refreshedToken = await refreshInstagramLongLivedToken({ accessToken })
  const expiresAt = new Date(Date.now() + (refreshedToken.expiresIn * 1000)).toISOString()

  console.log('Instagram long-lived token refreshed successfully.')
  console.log('')
  console.log('Update your env values with:')
  console.log(`INSTAGRAM_ACCESS_TOKEN=${refreshedToken.accessToken}`)
  if (userId) {
    console.log(`INSTAGRAM_USER_ID=${userId}`)
  }
  console.log(`INSTAGRAM_TOKEN_EXPIRES_AT=${expiresAt}`)
  console.log('')
  console.log(`Token expires around: ${expiresAt}`)
}

main()
  .catch(error => {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Instagram token refresh failed: ${message}`)
    process.exitCode = 1
  })
