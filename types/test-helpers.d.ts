
// Extend Next.js Metadata type with custom properties used in tests
declare module 'next' {
  interface Metadata {
    image?: string
    url?: string
    type?: string
    author?: string
    section?: string
    tags?: string[]
  }
}

// Extended sitemap types for image sitemaps
export interface ImageSitemapEntry {
  url: string
  lastModified?: string | Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  images?: Array<{
    url: string
    title?: string
    caption?: string
    geoLocation?: string
  }>
}

