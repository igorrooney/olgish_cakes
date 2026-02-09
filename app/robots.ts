import { MetadataRoute } from 'next'
import { BUSINESS_CONSTANTS } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/studio/',
        '/api/',
        '/_next/',
        '/admin',
        '/admin/',
        '/test-emails',
        '/test-emails/',
        '/test-lists',
        '/test-lists/'
      ],
      crawlDelay: 1
    },
    sitemap: [
      `${BUSINESS_CONSTANTS.BASE_URL}/sitemap.xml`,
      `${BUSINESS_CONSTANTS.BASE_URL}/sitemap-images.xml`,
      `${BUSINESS_CONSTANTS.BASE_URL}/sitemap-products.xml`
    ]
  }
}
