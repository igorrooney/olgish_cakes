import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/api/', '/admin', '/admin/', '/test-emails', '/test-emails/'],
    },
    sitemap: 'https://olgishcakes.co.uk/sitemap.xml',
  }
}
