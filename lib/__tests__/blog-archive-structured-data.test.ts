import { createBlogArchiveBreadcrumbStructuredData } from '../blog-archive-structured-data'

describe('blog archive structured data', () => {
  it('returns a visible-content-aligned BreadcrumbList without an archive ItemList', () => {
    const schema = createBlogArchiveBreadcrumbStructuredData()

    expect(schema).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://olgishcakes.co.uk'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Articles',
          item: 'https://olgishcakes.co.uk/blog'
        }
      ]
    })
    expect(JSON.stringify(schema)).not.toContain('"@type":"ItemList"')
  })
})
