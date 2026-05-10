#!/usr/bin/env node

import { createServer } from 'node:http'
import { URL } from 'node:url'
import * as readline from 'node:readline'
import dotenv from 'dotenv'
import path from 'path'
import {
  buildInstagramAuthorizeUrl,
  createInstagramAuthState,
  exchangeInstagramCodeForShortLivedToken,
  exchangeInstagramShortLivedTokenForLongLivedToken,
  extractInstagramAuthorizationCode,
  getInstagramOAuthConfig,
  isLoopbackRedirectUri
} from '../lib/instagram-oauth'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = async (prompt: string): Promise<string> =>
  await new Promise(resolve => rl.question(prompt, resolve))

const getArgumentValue = (name: string): string | null => {
  const prefix = `--${name}=`
  const argument = process.argv.slice(2).find(value => value.startsWith(prefix))

  return argument ? argument.slice(prefix.length) : null
}

const hasFlag = (name: string): boolean => process.argv.slice(2).includes(`--${name}`)

const waitForAuthorizationCode = async ({
  redirectUri,
  expectedState,
  timeoutMs
}: {
  redirectUri: string
  expectedState: string
  timeoutMs: number
}): Promise<string> => {
  const redirectUrl = new URL(redirectUri)
  const port = Number.parseInt(redirectUrl.port || '80', 10)
  const hostname = redirectUrl.hostname
  const pathname = redirectUrl.pathname || '/'

  return await new Promise((resolve, reject) => {
    let completed = false
    let timeoutId: NodeJS.Timeout | null = null

    const finish = (callback: () => void) => {
      if (completed) {
        return
      }

      completed = true
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      server.close()
      callback()
    }

    const server = createServer((request, response) => {
      const requestUrl = new URL(request.url ?? '/', redirectUri)

      if (requestUrl.pathname !== pathname) {
        response.statusCode = 404
        response.end('Not found')
        return
      }

      const returnedState = requestUrl.searchParams.get('state')
      const authorizationCode = requestUrl.searchParams.get('code')
      const authorizationError = requestUrl.searchParams.get('error_description') ||
        requestUrl.searchParams.get('error') ||
        requestUrl.searchParams.get('error_reason')

      if (returnedState !== expectedState) {
        response.statusCode = 400
        response.setHeader('Content-Type', 'text/plain; charset=utf-8')
        response.end('Instagram OAuth state mismatch. Return to the terminal.')
        finish(() => reject(new Error('Instagram OAuth state mismatch. Check the redirect URI and try again.')))
        return
      }

      if (authorizationError) {
        response.statusCode = 400
        response.setHeader('Content-Type', 'text/plain; charset=utf-8')
        response.end('Instagram authorization was cancelled or failed. Return to the terminal.')
        finish(() => reject(new Error(`Instagram authorization failed: ${authorizationError}`)))
        return
      }

      if (!authorizationCode) {
        response.statusCode = 400
        response.setHeader('Content-Type', 'text/plain; charset=utf-8')
        response.end('Missing authorization code. Return to the terminal.')
        return
      }

      response.statusCode = 200
      response.setHeader('Content-Type', 'text/html; charset=utf-8')
      response.end([
        '<!doctype html>',
        '<html lang="en">',
        '<head><meta charset="utf-8"><title>Instagram token received</title></head>',
        '<body>',
        '<h1>Instagram token received</h1>',
        '<p>You can close this tab and return to the terminal.</p>',
        '</body>',
        '</html>'
      ].join(''))

      finish(() => resolve(authorizationCode))
    })

    server.on('error', error => {
      finish(() => reject(error))
    })

    server.listen(port, hostname)

    timeoutId = setTimeout(() => {
      finish(() => reject(new Error(`Timed out waiting for Instagram OAuth callback at ${redirectUri}`)))
    }, timeoutMs)
  })
}

const promptForAuthorizationCode = async (): Promise<string> => {
  const response = await question(
    'Paste the full redirect URL or the Instagram authorization code here: '
  )
  const code = extractInstagramAuthorizationCode(response)

  if (!code) {
    throw new Error('Could not extract an Instagram authorization code from your input')
  }

  return code
}

const printUsage = (): void => {
  console.log('Usage: node scripts/run-ts-entry.cjs scripts/setup-instagram-oauth.ts')
  console.log('Optional flags:')
  console.log('  --code=AUTHORIZATION_CODE   Skip browser login and exchange an existing code')
  console.log('  --no-server                 Do not start a local callback server')
  console.log('')
}

async function main(): Promise<void> {
  if (hasFlag('help')) {
    printUsage()
    return
  }

  const config = getInstagramOAuthConfig(process.env)
  const providedCode = getArgumentValue('code')
  const disableLocalServer = hasFlag('no-server')
  const state = createInstagramAuthState()
  const authorizationUrl = buildInstagramAuthorizeUrl({
    appId: config.appId,
    redirectUri: config.redirectUri,
    scopes: config.scopes,
    state,
    embedUrl: config.embedUrl
  })

  let authorizationCode = providedCode

  if (!authorizationCode) {
    console.log('Instagram OAuth helper')
    console.log('')
    console.log(`Redirect URI: ${config.redirectUri}`)
    console.log(`Scopes: ${config.scopes.join(', ')}`)
    console.log('')
    if (config.embedUrl) {
      console.log('Using INSTAGRAM_EMBED_URL as the base authorization URL from your env configuration.')
      console.log('')
    }
    console.log('Open this URL in your browser and complete the Instagram login flow:')
    console.log(authorizationUrl)
    console.log('')
    console.log('Make sure the same redirect URI is allowed in your Meta app configuration.')
    console.log('')

    if (!disableLocalServer && isLoopbackRedirectUri(config.redirectUri)) {
      console.log(`Waiting for the callback on ${config.redirectUri} ...`)
      authorizationCode = await waitForAuthorizationCode({
        redirectUri: config.redirectUri,
        expectedState: state,
        timeoutMs: config.timeoutMs
      })
    } else {
      authorizationCode = await promptForAuthorizationCode()
    }
  }

  const shortLivedToken = await exchangeInstagramCodeForShortLivedToken({
    appId: config.appId,
    appSecret: config.appSecret,
    redirectUri: config.redirectUri,
    code: authorizationCode,
    timeoutMs: config.timeoutMs
  })

  const longLivedToken = await exchangeInstagramShortLivedTokenForLongLivedToken({
    appSecret: config.appSecret,
    shortLivedAccessToken: shortLivedToken.accessToken,
    timeoutMs: config.timeoutMs
  })

  const expiresAt = new Date(Date.now() + (longLivedToken.expiresIn * 1000)).toISOString()

  console.log('')
  console.log('Long-lived Instagram token generated successfully.')
  console.log('')
  console.log('Update your env values with:')
  console.log(`INSTAGRAM_ACCESS_TOKEN=${longLivedToken.accessToken}`)
  console.log(`INSTAGRAM_USER_ID=${shortLivedToken.userId}`)
  console.log(`INSTAGRAM_TOKEN_EXPIRES_AT=${expiresAt}`)
  console.log('')
  console.log(`Token expires around: ${expiresAt}`)
  console.log('')
  console.log('Before it expires, refresh it with:')
  console.log(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${longLivedToken.accessToken}`
  )
}

main()
  .catch(error => {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(`Instagram OAuth setup failed: ${message}`)
    process.exitCode = 1
  })
  .finally(() => {
    rl.close()
  })
