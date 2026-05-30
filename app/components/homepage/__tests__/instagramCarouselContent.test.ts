import {
  getInstagramPostAlt,
  getInstagramPostCaptionLine,
  mapInstagramPostToCarouselPost,
  sanitizeCaptionText
} from '../instagramCarouselContent'
import type { InstagramPost } from '@/app/types/instagram'

describe('instagramCarouselContent', () => {
  it('removes urls, tags, and extra spacing from captions', () => {
    expect(sanitizeCaptionText(' Honey cake https://example.com #cake @bakery  ')).toBe('Honey cake')
    expect(sanitizeCaptionText(' #cake @bakery ')).toBeNull()
    expect(sanitizeCaptionText(null)).toBeNull()
  })

  it('uses the sanitized first line for alt text and captions', () => {
    const post = {
      caption: 'Honey cake close-up #cake\nMore details here'
    }

    expect(getInstagramPostAlt(post)).toBe('Honey cake close-up')
    expect(getInstagramPostCaptionLine(post)).toBe('Honey cake close-up')
  })

  it('falls back and truncates alt text when the first useful text is long', () => {
    const longText = 'A'.repeat(140)

    expect(getInstagramPostAlt({ caption: `#cake\n${longText}` })).toBe(`${'A'.repeat(117)}...`)
    expect(getInstagramPostAlt({ caption: undefined })).toBe('Olgish Cakes Instagram post')
    expect(getInstagramPostCaptionLine({ caption: undefined })).toBeNull()
  })

  it('maps full Instagram posts into the slim carousel payload', () => {
    const post: InstagramPost = {
      id: 'post-1',
      caption: 'Honey cake close-up\nMore details',
      imageUrl: 'https://scontent.cdninstagram.com/media.jpg',
      permalink: 'https://instagram.com/p/post-1',
      mediaType: 'IMAGE',
      likeCount: 12,
      timestamp: '2026-04-30T10:00:00Z'
    }

    expect(mapInstagramPostToCarouselPost(post)).toEqual({
      id: 'post-1',
      captionLine: 'Honey cake close-up',
      imageAlt: 'Honey cake close-up',
      imageUrl: 'https://scontent.cdninstagram.com/media.jpg',
      mediaType: 'IMAGE',
      permalink: 'https://instagram.com/p/post-1'
    })
  })
})
