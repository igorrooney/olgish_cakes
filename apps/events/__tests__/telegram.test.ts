import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TempDocument } from '@/lib/storage'
import { sendTelegramNotification } from '@/lib/telegram'

const originalEnv = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_MANAGER_CHAT_ID: process.env.TELEGRAM_MANAGER_CHAT_ID,
  TELEGRAM_NOTIFICATIONS_ENABLED: process.env.TELEGRAM_NOTIFICATIONS_ENABLED
}

function makeDocument(fileName: string): TempDocument {
  return {
    fileName,
    mimeType: 'image/jpeg',
    path: `incoming/${fileName}`,
    blob: new Blob([Uint8Array.from([0xff, 0xd8, 0xff])], {
      type: 'image/jpeg'
    })
  }
}

function telegramResponse(result: unknown): Response {
  return new Response(JSON.stringify({ ok: true, result }), {
    headers: {
      'content-type': 'application/json'
    }
  })
}

describe('Telegram notifications', () => {
  beforeEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = 'bot-token'
    process.env.TELEGRAM_MANAGER_CHAT_ID = 'manager-chat'
    process.env.TELEGRAM_NOTIFICATIONS_ENABLED = 'true'
  })

  afterEach(() => {
    process.env.TELEGRAM_BOT_TOKEN = originalEnv.TELEGRAM_BOT_TOKEN
    process.env.TELEGRAM_MANAGER_CHAT_ID = originalEnv.TELEGRAM_MANAGER_CHAT_ID
    process.env.TELEGRAM_NOTIFICATIONS_ENABLED = originalEnv.TELEGRAM_NOTIFICATIONS_ENABLED
    vi.unstubAllGlobals()
  })

  it('sends a single document with sendDocument', async () => {
    const fetchMock = vi.fn().mockResolvedValue(telegramResponse({ message_id: 101 }))
    vi.stubGlobal('fetch', fetchMock)

    const messageIds = await sendTelegramNotification({
      requestId: 'request-id',
      eventName: 'Olgish Cakes event',
      fullName: 'Anna Smith',
      email: 'anna@example.com',
      documents: [makeDocument('photo.jpg')]
    })

    expect(messageIds).toEqual([101])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toContain('/sendDocument')
  })

  it('sends multiple documents as one media group request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(telegramResponse([
      { message_id: 201 },
      { message_id: 202 }
    ]))
    vi.stubGlobal('fetch', fetchMock)

    const messageIds = await sendTelegramNotification({
      requestId: 'request-id',
      eventName: 'Olgish Cakes event',
      fullName: 'Anna Smith',
      email: 'anna@example.com',
      documents: [
        makeDocument('photo-1.jpg'),
        makeDocument('photo-2.jpg')
      ]
    })

    expect(messageIds).toEqual([201, 202])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toContain('/sendMediaGroup')

    const init = fetchMock.mock.calls[0][1] as RequestInit
    const body = init.body as FormData
    const media = JSON.parse(String(body.get('media'))) as Array<Record<string, string>>

    expect(body.get('chat_id')).toBe('manager-chat')
    expect(media).toHaveLength(2)
    expect(media[0]).toMatchObject({
      type: 'document',
      media: 'attach://document0'
    })
    expect(media[0].caption).toContain('New cake-slice image request')
    expect(media[1]).toEqual({
      type: 'document',
      media: 'attach://document1'
    })
    expect(body.get('document0')).toBeInstanceOf(Blob)
    expect(body.get('document1')).toBeInstanceOf(Blob)
  })

  it('retries transient Telegram responses', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        ok: false,
        description: 'Too many requests'
      }), {
        status: 429,
        headers: {
          'content-type': 'application/json'
        }
      }))
      .mockResolvedValueOnce(telegramResponse({ message_id: 301 }))
    vi.stubGlobal('fetch', fetchMock)

    const messageIds = await sendTelegramNotification({
      requestId: 'request-id',
      eventName: 'Olgish Cakes event',
      fullName: 'Anna Smith',
      email: 'anna@example.com',
      documents: [makeDocument('photo.jpg')]
    })

    expect(messageIds).toEqual([301])
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('stores a clear timeout error after Telegram retries are exhausted', async () => {
    const timeoutError = new DOMException('This operation was aborted', 'AbortError')
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(timeoutError)
      .mockRejectedValueOnce(timeoutError)
    vi.stubGlobal('fetch', fetchMock)

    await expect(sendTelegramNotification({
      requestId: 'request-id',
      eventName: 'Olgish Cakes event',
      fullName: 'Anna Smith',
      email: 'anna@example.com',
      documents: [makeDocument('photo.jpg')]
    })).rejects.toMatchObject({
      message: 'Telegram request timed out after 30 seconds and 2 attempts.',
      messageIds: []
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
