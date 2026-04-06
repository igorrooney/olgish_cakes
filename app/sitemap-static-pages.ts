import type { MetadataRoute } from 'next'

export type StaticSitemapPath = '/' | `/${string}`

export type StaticSitemapChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

export interface StaticSitemapEntry {
  url: StaticSitemapPath
  lastModified: string
  changeFrequency: StaticSitemapChangeFrequency
  priority: number
}

function createStaticSitemapEntry(
  url: StaticSitemapPath,
  lastModified: string,
  changeFrequency: StaticSitemapChangeFrequency,
  priority: number
): StaticSitemapEntry {
  return {
    url,
    lastModified,
    changeFrequency,
    priority
  }
}

export const coreStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/', '2026-03-03', 'daily', 1.0),
  createStaticSitemapEntry('/cakes', '2026-03-17', 'daily', 0.9),
  createStaticSitemapEntry('/cakes-by-post', '2026-03-12', 'daily', 0.88),
  createStaticSitemapEntry('/get-custom-quote', '2026-03-17', 'weekly', 0.9),
  createStaticSitemapEntry('/contact', '2026-02-09', 'monthly', 0.8),
  createStaticSitemapEntry('/blog', '2025-10-04', 'weekly', 0.7)
]

export const deliveryStaticSitemapPages: StaticSitemapEntry[] = []

export const locationStaticSitemapPages: StaticSitemapEntry[] = []

export const eventStaticSitemapPages: StaticSitemapEntry[] = []

export const dietaryStaticSitemapPages: StaticSitemapEntry[] = []

export const educationalStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/learn/workshops', '2026-04-02', 'monthly', 0.75)
]

export const guideStaticSitemapPages: StaticSitemapEntry[] = []

export const serviceStaticSitemapPages: StaticSitemapEntry[] = []

export const communityStaticSitemapPages: StaticSitemapEntry[] = []

export const legalStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/privacy', '2026-02-09', 'yearly', 0.3),
  createStaticSitemapEntry('/terms', '2026-02-09', 'yearly', 0.3),
  createStaticSitemapEntry('/cookies', '2026-02-09', 'yearly', 0.3)
]

export const staticSitemapPages: StaticSitemapEntry[] = [
  ...coreStaticSitemapPages,
  ...deliveryStaticSitemapPages,
  ...locationStaticSitemapPages,
  ...eventStaticSitemapPages,
  ...dietaryStaticSitemapPages,
  ...educationalStaticSitemapPages,
  ...guideStaticSitemapPages,
  ...serviceStaticSitemapPages,
  ...communityStaticSitemapPages,
  ...legalStaticSitemapPages
]

const staticSitemapPageByUrl = new Map<StaticSitemapPath, StaticSitemapEntry>(
  staticSitemapPages.map((entry) => [entry.url, entry])
)

export function getStaticSitemapEntry(url: StaticSitemapPath) {
  return staticSitemapPageByUrl.get(url) ?? null
}

export function getStaticSitemapLastModified(url: StaticSitemapPath) {
  const entry = getStaticSitemapEntry(url)

  if (!entry) {
    throw new Error(`Missing static sitemap entry for ${url}`)
  }

  return new Date(entry.lastModified)
}

export function toStaticSitemapEntry(
  baseUrl: string,
  entry: StaticSitemapEntry
): MetadataRoute.Sitemap[number] {
  return {
    url: entry.url === '/' ? baseUrl : `${baseUrl}${entry.url}`,
    lastModified: new Date(entry.lastModified),
    changeFrequency: entry.changeFrequency,
    priority: entry.priority
  }
}
