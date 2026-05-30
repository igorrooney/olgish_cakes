import type { InstagramPost } from '@/app/types/instagram'

export type InstagramCarouselPost = {
  id: string
  captionLine: string | null
  imageAlt: string
  imageUrl: string
  mediaType: InstagramPost['mediaType']
  permalink: string
}

export const sanitizeCaptionText = (caption?: string | null) => {
  if (!caption) return null

  const withoutUrls = caption.replace(/https?:\/\/\S+/gi, '')
  const withoutTags = withoutUrls.replace(/[#@][\w-]+/g, '')
  const collapsed = withoutTags.replace(/\s+/g, ' ').trim()

  return collapsed.length > 0 ? collapsed : null
}

export const getInstagramPostAlt = (post: Pick<InstagramPost, 'caption'>) => {
  const sanitizedCaption = sanitizeCaptionText(post.caption)
  const firstLine = post.caption?.split(/\r?\n/)[0]
  const sanitizedFirstLine = sanitizeCaptionText(firstLine)
  const altText = sanitizedFirstLine || sanitizedCaption

  if (!altText) {
    return 'Olgish Cakes Instagram post'
  }

  if (altText.length <= 120) {
    return altText
  }

  return `${altText.slice(0, 117)}...`
}

export const getInstagramPostCaptionLine = (post: Pick<InstagramPost, 'caption'>) => {
  const trimmedCaption = post.caption?.trim()
  if (!trimmedCaption) {
    return null
  }

  const firstLine = trimmedCaption.split(/\r?\n/)[0]?.trim()
  return sanitizeCaptionText(firstLine)
}

export const mapInstagramPostToCarouselPost = (post: InstagramPost): InstagramCarouselPost => ({
  id: post.id,
  captionLine: getInstagramPostCaptionLine(post),
  imageAlt: getInstagramPostAlt(post),
  imageUrl: post.imageUrl,
  mediaType: post.mediaType,
  permalink: post.permalink
})
