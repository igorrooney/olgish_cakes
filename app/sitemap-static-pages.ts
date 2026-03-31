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
  createStaticSitemapEntry('/order', '2026-02-09', 'daily', 0.95),
  createStaticSitemapEntry('/order/leeds', '2025-09-20', 'daily', 0.95),
  createStaticSitemapEntry('/cakes', '2026-03-17', 'daily', 0.9),
  createStaticSitemapEntry('/cake-in-leeds', '2026-02-09', 'weekly', 0.85),
  createStaticSitemapEntry('/honey-cake', '2026-02-09', 'weekly', 0.85),
  createStaticSitemapEntry('/market-schedule', '2025-11-12', 'weekly', 0.88),
  createStaticSitemapEntry('/cakes-by-post', '2026-03-12', 'daily', 0.88),
  createStaticSitemapEntry('/get-custom-quote', '2026-03-17', 'weekly', 0.9),
  createStaticSitemapEntry('/contact', '2026-02-09', 'monthly', 0.8),
  createStaticSitemapEntry('/about', '2026-02-09', 'monthly', 0.8),
  createStaticSitemapEntry('/testimonials', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/reviews-awards', '2025-11-12', 'weekly', 0.8),
  createStaticSitemapEntry('/faq', '2025-11-12', 'monthly', 0.7),
  createStaticSitemapEntry('/blog', '2025-10-04', 'weekly', 0.7)
]

export const deliveryStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/delivery-areas', '2026-02-09', 'weekly', 0.9)
]

export const locationStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/cakes-leeds', '2026-02-09', 'weekly', 0.9),
  createStaticSitemapEntry('/cakes-bradford', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/cakes-halifax', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/cakes-huddersfield', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/cakes-ilkley', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/cakes-otley', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/cakes-skipton', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/cakes-wakefield', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/cakes-york', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/cakes-pudsey', '2026-02-09', 'weekly', 0.8)
]

export const eventStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/celebration-cakes', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/graduation-cakes-leeds', '2025-11-12', 'weekly', 0.8),
  createStaticSitemapEntry('/retirement-cakes-leeds', '2025-11-11', 'weekly', 0.8),
  createStaticSitemapEntry('/christmas-cakes-leeds', '2025-11-12', 'weekly', 0.8),
  createStaticSitemapEntry('/easter-cakes-leeds', '2025-11-10', 'weekly', 0.8),
  createStaticSitemapEntry('/valentines-cakes-leeds', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/halloween-cakes-leeds', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/mother-day-cakes-leeds', '2025-11-11', 'weekly', 0.8),
  createStaticSitemapEntry('/father-day-cakes-leeds', '2025-11-11', 'weekly', 0.8)
]

export const dietaryStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/vegan-cakes-leeds', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/dairy-free-cakes-leeds', '2026-02-09', 'weekly', 0.8),
  createStaticSitemapEntry('/gluten-friendly-ukrainian-cakes', '2025-11-12', 'weekly', 0.8),
  createStaticSitemapEntry('/egg-free-cakes-leeds', '2026-02-09', 'weekly', 0.8)
]

export const educationalStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/honey-cake-history', '2025-11-12', 'monthly', 0.7),
  createStaticSitemapEntry('/honey-cake-vs-kyiv-cake', '2025-11-12', 'monthly', 0.7),
  createStaticSitemapEntry('/ukrainian-bakery-leeds', '2025-11-18', 'monthly', 0.8),
  createStaticSitemapEntry('/ukrainian-baking-classes', '2025-11-12', 'monthly', 0.7),
  createStaticSitemapEntry('/ukrainian-cake-recipes', '2025-11-12', 'monthly', 0.7),
  createStaticSitemapEntry('/ukrainian-culture-baking', '2025-11-12', 'monthly', 0.7),
  createStaticSitemapEntry('/how-to-make-honey-cake', '2025-11-11', 'monthly', 0.7),
  createStaticSitemapEntry('/ukrainian-baking-traditions', '2025-11-11', 'monthly', 0.7),
  createStaticSitemapEntry('/ukrainian-celebrations', '2025-11-11', 'monthly', 0.7),
  createStaticSitemapEntry('/ukrainian-wedding-traditions', '2025-11-11', 'monthly', 0.7),
  createStaticSitemapEntry('/ukrainian-christmas-traditions', '2025-11-11', 'monthly', 0.7)
]

export const guideStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/cake-care-storage', '2025-11-18', 'monthly', 0.7),
  createStaticSitemapEntry('/cake-delivery', '2025-11-12', 'monthly', 0.8),
  createStaticSitemapEntry('/cake-flavors', '2025-11-12', 'monthly', 0.8),
  createStaticSitemapEntry('/cake-gallery', '2025-11-12', 'weekly', 0.8),
  createStaticSitemapEntry('/cake-pricing', '2025-11-18', 'monthly', 0.8),
  createStaticSitemapEntry('/cake-sizes-guide', '2025-11-12', 'monthly', 0.7),
  createStaticSitemapEntry('/cake-tasting-sessions', '2025-11-12', 'monthly', 0.7),
  createStaticSitemapEntry('/how-to-order', '2025-11-18', 'monthly', 0.8),
  createStaticSitemapEntry('/best-cakes-for-weddings', '2025-11-18', 'monthly', 0.8),
  createStaticSitemapEntry('/best-cakes-for-birthdays', '2025-11-11', 'monthly', 0.8),
  createStaticSitemapEntry('/cake-flavor-guide', '2025-11-12', 'monthly', 0.7),
  createStaticSitemapEntry('/ukrainian-cake-vs-british-cake', '2025-09-20', 'monthly', 0.7)
]

export const serviceStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/custom-cake-design', '2026-02-09', 'weekly', 0.9),
  createStaticSitemapEntry('/seasonal-cakes', '2025-11-12', 'weekly', 0.8),
  createStaticSitemapEntry('/gift-cards', '2026-02-09', 'monthly', 0.7),
  createStaticSitemapEntry('/cake-decorating-services', '2025-11-12', 'monthly', 0.7),
  createStaticSitemapEntry('/cake-photography', '2025-11-12', 'monthly', 0.7),
  createStaticSitemapEntry('/cake-shipping', '2025-11-12', 'monthly', 0.7)
]

export const communityStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/allergen-information', '2025-11-12', 'monthly', 0.8),
  createStaticSitemapEntry('/customer-stories', '2025-11-12', 'weekly', 0.8),
  createStaticSitemapEntry('/wedding-cake-gallery', '2025-10-04', 'weekly', 0.8),
  createStaticSitemapEntry('/birthday-cake-gallery', '2025-09-20', 'weekly', 0.8),
  createStaticSitemapEntry('/ukrainian-community-leeds', '2025-09-20', 'monthly', 0.7),
  createStaticSitemapEntry('/charity-events', '2025-11-12', 'monthly', 0.7)
]

export const legalStaticSitemapPages: StaticSitemapEntry[] = [
  createStaticSitemapEntry('/privacy', '2026-02-09', 'yearly', 0.3),
  createStaticSitemapEntry('/terms', '2026-02-09', 'yearly', 0.3),
  createStaticSitemapEntry('/cookies', '2026-02-09', 'yearly', 0.3),
  createStaticSitemapEntry('/accessibility', '2025-11-12', 'yearly', 0.3)
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
