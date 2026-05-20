import { serializeSitemap, SITEMAP_RESPONSE_HEADERS } from '@/lib/sitemap-xml'
import sitemapImages from '../sitemap-images'
export const revalidate = 3600
export async function GET() {
  const entries = await sitemapImages()
  return new Response(serializeSitemap(entries, { includeImages: true }), {
    headers: SITEMAP_RESPONSE_HEADERS
  })
}
