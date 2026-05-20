import type { MetadataRoute } from 'next'

type SitemapEntry = MetadataRoute.Sitemap[number]

interface SerializeSitemapOptions {
  includeImages?: boolean
}

export const SITEMAP_RESPONSE_HEADERS = {
  'Cache-Control': 'public, max-age=3600, s-maxage=86400',
  'Content-Type': 'application/xml; charset=utf-8'
} as const

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatLastModified(lastModified: SitemapEntry['lastModified']) {
  if (!lastModified) {
    return null
  }

  const date = lastModified instanceof Date ? lastModified : new Date(lastModified)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toISOString()
}

function renderImageEntries(images: SitemapEntry['images']) {
  if (!images || images.length === 0) {
    return ''
  }

  return images
    .map((imageUrl) => `    <image:image><image:loc>${escapeXml(imageUrl)}</image:loc></image:image>`)
    .join('\n')
}

export function serializeSitemap(entries: MetadataRoute.Sitemap, options: SerializeSitemapOptions = {}) {
  const namespace = options.includeImages
    ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : ''

  const urls = entries.map((entry) => {
    const lastModified = formatLastModified(entry.lastModified)
    const imageEntries = options.includeImages ? renderImageEntries(entry.images) : ''

    return [
      '  <url>',
      `    <loc>${escapeXml(entry.url)}</loc>`,
      lastModified ? `    <lastmod>${lastModified}</lastmod>` : null,
      entry.changeFrequency ? `    <changefreq>${entry.changeFrequency}</changefreq>` : null,
      typeof entry.priority === 'number' ? `    <priority>${entry.priority}</priority>` : null,
      imageEntries || null,
      '  </url>'
    ]
      .filter((line): line is string => Boolean(line))
      .join('\n')
  }).join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${namespace}>\n${urls}\n</urlset>`
}
