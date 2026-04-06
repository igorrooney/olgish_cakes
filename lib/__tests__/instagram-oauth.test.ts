/**
 * @jest-environment node
 */

import {
  buildInstagramAuthorizeUrl,
  createInstagramAuthState,
  exchangeInstagramCodeForShortLivedToken,
  exchangeInstagramShortLivedTokenForLongLivedToken,
  extractInstagramAuthorizationCode,
  getInstagramOAuthConfig,
  isLoopbackRedirectUri,
  normalizeInstagramScopes,
  refreshInstagramLongLivedToken
} from '../instagram-oauth'

describe('instagram-oauth', () => {
  it('normalizes Instagram scopes and removes duplicates', () => {
    expect(normalizeInstagramScopes(' instagram_business_basic, instagram_business_basic instagram_business_manage_messages '))
      .toEqual(['instagram_business_basic', 'instagram_business_manage_messages'])
    expect(normalizeInstagramScopes()).toEqual(['instagram_business_basic'])
  })

  it('creates an authorization URL with the expected query parameters', () => {
    const authorizationUrl = buildInstagramAuthorizeUrl({
      appId: 'app-123',
      redirectUri: 'http://127.0.0.1:4318/instagram/callback',
      scopes: ['instagram_business_basic'],
      state: 'state-123'
    })

    const parsedUrl = new URL(authorizationUrl)

    expect(parsedUrl.origin + parsedUrl.pathname).toBe('https://www.instagram.com/oauth/authorize')
    expect(parsedUrl.searchParams.get('client_id')).toBe('app-123')
    expect(parsedUrl.searchParams.get('redirect_uri')).toBe('http://127.0.0.1:4318/instagram/callback')
    expect(parsedUrl.searchParams.get('response_type')).toBe('code')
    expect(parsedUrl.searchParams.get('scope')).toBe('instagram_business_basic')
    expect(parsedUrl.searchParams.get('state')).toBe('state-123')
    expect(parsedUrl.searchParams.get('force_reauth')).toBe('true')
  })

  it('applies the current OAuth state when using an embed URL', () => {
    const authorizationUrl = buildInstagramAuthorizeUrl({
      appId: 'app-123',
      redirectUri: 'http://127.0.0.1:4318/instagram/callback',
      scopes: ['instagram_business_basic'],
      state: 'fresh-state',
      embedUrl: 'https://www.instagram.com/oauth/authorize?utm_source=meta'
    })

    const parsedUrl = new URL(authorizationUrl)

    expect(parsedUrl.searchParams.get('state')).toBe('fresh-state')
    expect(parsedUrl.searchParams.get('utm_source')).toBe('meta')
  })

  it('overrides stale query parameters already present in the embed URL', () => {
    const authorizationUrl = buildInstagramAuthorizeUrl({
      appId: 'fresh-app-id',
      redirectUri: 'http://127.0.0.1:4318/instagram/callback',
      scopes: ['instagram_business_basic', 'instagram_business_manage_messages'],
      state: 'fresh-state',
      embedUrl: 'https://www.instagram.com/oauth/authorize?client_id=stale-app-id&redirect_uri=https%3A%2F%2Fexample.com%2Fcallback&response_type=token&scope=old_scope&state=stale-state&force_reauth=false&theme=dark'
    })

    const parsedUrl = new URL(authorizationUrl)

    expect(parsedUrl.searchParams.get('client_id')).toBe('fresh-app-id')
    expect(parsedUrl.searchParams.get('redirect_uri')).toBe('http://127.0.0.1:4318/instagram/callback')
    expect(parsedUrl.searchParams.get('response_type')).toBe('code')
    expect(parsedUrl.searchParams.get('scope')).toBe('instagram_business_basic,instagram_business_manage_messages')
    expect(parsedUrl.searchParams.get('state')).toBe('fresh-state')
    expect(parsedUrl.searchParams.get('force_reauth')).toBe('true')
    expect(parsedUrl.searchParams.get('theme')).toBe('dark')
  })

  it('generates a non-empty Instagram auth state', () => {
    expect(createInstagramAuthState()).toMatch(/[0-9a-f-]{36}/i)
  })

  it('detects loopback redirect URIs', () => {
    expect(isLoopbackRedirectUri('http://127.0.0.1:4318/instagram/callback')).toBe(true)
    expect(isLoopbackRedirectUri('http://localhost:4318/instagram/callback')).toBe(true)
    expect(isLoopbackRedirectUri('https://olgishcakes.co.uk/callback')).toBe(false)
    expect(isLoopbackRedirectUri('not-a-url')).toBe(false)
  })

  it('extracts an authorization code from a raw code or redirect URL', () => {
    expect(extractInstagramAuthorizationCode('AQBx-hBsH3_example')).toBe('AQBx-hBsH3_example')
    expect(
      extractInstagramAuthorizationCode('http://127.0.0.1:4318/instagram/callback?code=AUTH_CODE&state=test')
    ).toBe('AUTH_CODE')
    expect(extractInstagramAuthorizationCode('')).toBeNull()
    expect(extractInstagramAuthorizationCode('http://127.0.0.1:4318/instagram/callback?state=test')).toBeNull()
  })

  it('reads the Instagram OAuth config from env', () => {
    const config = getInstagramOAuthConfig({
      INSTAGRAM_APP_ID: ' app-id ',
      INSTAGRAM_APP_SECRET: ' app-secret ',
      INSTAGRAM_REDIRECT_URI: 'http://127.0.0.1:4318/instagram/callback',
      INSTAGRAM_EMBED_URL: 'https://www.instagram.com/oauth/authorize?client_id=app-id&redirect_uri=http%3A%2F%2F127.0.0.1%3A4318%2Finstagram%2Fcallback&response_type=code',
      INSTAGRAM_OAUTH_SCOPES: 'instagram_business_basic,instagram_business_manage_messages',
      INSTAGRAM_OAUTH_TIMEOUT_MS: '20000'
    })

    expect(config).toEqual({
      appId: 'app-id',
      appSecret: 'app-secret',
      redirectUri: 'http://127.0.0.1:4318/instagram/callback',
      embedUrl: 'https://www.instagram.com/oauth/authorize?client_id=app-id&redirect_uri=http%3A%2F%2F127.0.0.1%3A4318%2Finstagram%2Fcallback&response_type=code',
      scopes: ['instagram_business_basic', 'instagram_business_manage_messages'],
      timeoutMs: 20000
    })
  })

  it('rejects missing Instagram OAuth env values', () => {
    expect(() => getInstagramOAuthConfig({})).toThrow(
      'Missing required Instagram OAuth environment variables: INSTAGRAM_APP_ID, INSTAGRAM_APP_SECRET, INSTAGRAM_REDIRECT_URI'
    )
  })

  it('rejects an invalid redirect URI', () => {
    expect(() => getInstagramOAuthConfig({
      INSTAGRAM_APP_ID: 'app-id',
      INSTAGRAM_APP_SECRET: 'app-secret',
      INSTAGRAM_REDIRECT_URI: 'relative-path'
    })).toThrow('INSTAGRAM_REDIRECT_URI must be a valid absolute URL')
  })

  it('rejects using the full Instagram login URL as the redirect URI', () => {
    expect(() => getInstagramOAuthConfig({
      INSTAGRAM_APP_ID: 'app-id',
      INSTAGRAM_APP_SECRET: 'app-secret',
      INSTAGRAM_REDIRECT_URI: 'https://www.instagram.com/oauth/authorize?client_id=123'
    })).toThrow('INSTAGRAM_REDIRECT_URI must be your callback URL, not the full Instagram login/embed URL')
  })

  it('rejects an embed URL that points to a different redirect URI', () => {
    expect(() => getInstagramOAuthConfig({
      INSTAGRAM_APP_ID: 'app-id',
      INSTAGRAM_APP_SECRET: 'app-secret',
      INSTAGRAM_REDIRECT_URI: 'https://olgishcakes.co.uk/',
      INSTAGRAM_EMBED_URL: 'https://www.instagram.com/oauth/authorize?redirect_uri=https%3A%2F%2Fexample.com%2F&response_type=code'
    })).toThrow('INSTAGRAM_EMBED_URL redirect_uri must exactly match INSTAGRAM_REDIRECT_URI')
  })

  it('exchanges an authorization code for a short-lived token', async () => {
    const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: 'short-token', user_id: 12345 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    )

    const token = await exchangeInstagramCodeForShortLivedToken({
      appId: 'app-id',
      appSecret: 'app-secret',
      redirectUri: 'http://127.0.0.1:4318/instagram/callback',
      code: 'code-123',
      fetchImpl: mockFetch
    })

    expect(token).toEqual({
      accessToken: 'short-token',
      userId: '12345'
    })

    const [requestUrl, requestOptions] = mockFetch.mock.calls[0]

    expect(requestUrl).toBe('https://api.instagram.com/oauth/access_token')
    expect(requestOptions?.method).toBe('POST')
    expect(requestOptions?.signal).toBeInstanceOf(AbortSignal)

    if (!(requestOptions?.body instanceof FormData)) {
      throw new Error('Expected the Instagram OAuth request body to be FormData')
    }

    expect(requestOptions.body.get('client_id')).toBe('app-id')
    expect(requestOptions.body.get('client_secret')).toBe('app-secret')
    expect(requestOptions.body.get('grant_type')).toBe('authorization_code')
    expect(requestOptions.body.get('redirect_uri')).toBe('http://127.0.0.1:4318/instagram/callback')
    expect(requestOptions.body.get('code')).toBe('code-123')
  })

  it('surfaces short-lived token exchange errors', async () => {
    const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({ error_message: 'Invalid authorization code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    )

    await expect(
      exchangeInstagramCodeForShortLivedToken({
        appId: 'app-id',
        appSecret: 'app-secret',
        redirectUri: 'http://127.0.0.1:4318/instagram/callback',
        code: 'code-123',
        fetchImpl: mockFetch
      })
    ).rejects.toThrow('Instagram OAuth error (400): Invalid authorization code')
  })

  it('exchanges a short-lived token for a long-lived token', async () => {
    const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({
        access_token: 'long-token',
        token_type: 'bearer',
        expires_in: 5184000
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    )

    const token = await exchangeInstagramShortLivedTokenForLongLivedToken({
      appSecret: 'app-secret',
      shortLivedAccessToken: 'short-token',
      fetchImpl: mockFetch
    })

    expect(token).toEqual({
      accessToken: 'long-token',
      expiresIn: 5184000,
      tokenType: 'bearer'
    })

    const [requestUrl, requestOptions] = mockFetch.mock.calls[0]
    const parsedUrl = new URL(String(requestUrl))

    expect(parsedUrl.origin + parsedUrl.pathname).toBe('https://graph.instagram.com/access_token')
    expect(parsedUrl.searchParams.get('grant_type')).toBe('ig_exchange_token')
    expect(parsedUrl.searchParams.get('client_secret')).toBe('app-secret')
    expect(parsedUrl.searchParams.get('access_token')).toBe('short-token')
    expect(requestOptions?.method).toBe('GET')
    expect(requestOptions?.signal).toBeInstanceOf(AbortSignal)
  })

  it('surfaces long-lived token exchange errors', async () => {
    const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    mockFetch.mockResolvedValueOnce(
      new Response('Expired token', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' }
      })
    )

    await expect(
      exchangeInstagramShortLivedTokenForLongLivedToken({
        appSecret: 'app-secret',
        shortLivedAccessToken: 'short-token',
        fetchImpl: mockFetch
      })
    ).rejects.toThrow('Instagram token exchange error (400): Expired token')
  })

  it('refreshes a long-lived token', async () => {
    const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({
        access_token: 'refreshed-token',
        token_type: 'bearer',
        expires_in: 5184000
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    )

    const token = await refreshInstagramLongLivedToken({
      accessToken: 'existing-long-token',
      fetchImpl: mockFetch
    })

    expect(token).toEqual({
      accessToken: 'refreshed-token',
      expiresIn: 5184000,
      tokenType: 'bearer'
    })

    const [requestUrl, requestOptions] = mockFetch.mock.calls[0]
    const parsedUrl = new URL(String(requestUrl))

    expect(parsedUrl.origin + parsedUrl.pathname).toBe('https://graph.instagram.com/refresh_access_token')
    expect(parsedUrl.searchParams.get('grant_type')).toBe('ig_refresh_token')
    expect(parsedUrl.searchParams.get('access_token')).toBe('existing-long-token')
    expect(requestOptions?.method).toBe('GET')
    expect(requestOptions?.signal).toBeInstanceOf(AbortSignal)
  })

  it('surfaces long-lived token refresh errors', async () => {
    const mockFetch = jest.fn<ReturnType<typeof fetch>, Parameters<typeof fetch>>()
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify({
        error: { message: 'Token must be at least 24 hours old to refresh.' }
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    )

    await expect(
      refreshInstagramLongLivedToken({
        accessToken: 'existing-long-token',
        fetchImpl: mockFetch
      })
    ).rejects.toThrow('Instagram token refresh error (400): Token must be at least 24 hours old to refresh.')
  })
})
