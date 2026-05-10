export type InstagramMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'

export interface InstagramPost {
  id: string
  caption?: string
  imageUrl: string
  permalink: string
  mediaType: InstagramMediaType
  timestamp?: string
  likeCount?: number
}
