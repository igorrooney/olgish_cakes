import { describe, expect, it } from 'vitest'

import { buildWhatsAppUrl } from '@/lib/whatsapp'

describe('WhatsApp fallback link', () => {
  it('builds a direct Olga WhatsApp message', () => {
    const url = buildWhatsAppUrl('Anna')

    expect(url).toContain('https://wa.me/447867218194?text=')
    expect(decodeURIComponent(url)).toContain(
      'Hello Olga, I am trying to send an image for printing on a cake slice. My name is Anna.'
    )
  })
})
