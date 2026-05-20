import { serializeSitemap, SITEMAP_RESPONSE_HEADERS } from '@/lib/sitemap-xml'
import sitemapProducts from '../sitemap-products'
export const revalidate = 3600
export async function GET() {
  const entries = await sitemapProducts()
  return new Response(serializeSitemap(entries), {
    headers: SITEMAP_RESPONSE_HEADERS
  })
}
