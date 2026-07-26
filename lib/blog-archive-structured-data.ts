import { BUSINESS_CONSTANTS } from './constants'

export function createBlogArchiveBreadcrumbStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BUSINESS_CONSTANTS.BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Articles',
        item: `${BUSINESS_CONSTANTS.BASE_URL}/blog`
      }
    ]
  } as const
}
