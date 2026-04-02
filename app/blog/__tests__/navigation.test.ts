import {
  BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY,
  buildBlogArticleHref,
  buildBlogBackHref,
  readStoredBlogArchiveHref,
  writeStoredBlogArchiveHref
} from '../navigation'

describe('blog navigation helpers', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
  })

  it('builds article hrefs with the encoded archive return path', () => {
    expect(buildBlogArticleHref({
      href: '/blog/cake-by-post-uk-complete-guide',
      fromHref: '/blog?topic=cake-by-post&page=2'
    })).toBe('/blog/cake-by-post-uk-complete-guide?from=%2Fblog%3Ftopic%3Dcake-by-post%26page%3D2')
  })

  it('returns the sanitized blog archive href when the from param is safe', () => {
    expect(buildBlogBackHref({
      fallbackHref: '/blog',
      fromParam: '/blog?topic=cake-by-post&page=2'
    })).toBe('/blog?topic=cake-by-post&page=2')
  })

  it('falls back when the from param contains an external URL', () => {
    expect(buildBlogBackHref({
      fallbackHref: '/blog',
      fromParam: 'https://evil.example/blog'
    })).toBe('/blog')
  })

  it('falls back when the from param contains unsupported query keys', () => {
    expect(buildBlogBackHref({
      fallbackHref: '/blog',
      fromParam: '/blog?topic=cake-by-post&ref=homepage'
    })).toBe('/blog')
  })

  it('falls back when the from param is repeated', () => {
    expect(buildBlogBackHref({
      fallbackHref: '/blog',
      fromParam: ['/blog', '/blog?page=2']
    })).toBe('/blog')
  })

  it('falls back when the page value is invalid', () => {
    expect(buildBlogBackHref({
      fallbackHref: '/blog',
      fromParam: '/blog?page=0'
    })).toBe('/blog')
  })

  it('writes and reads the stored blog archive href from sessionStorage', () => {
    writeStoredBlogArchiveHref('/blog?topic=cake-by-post&page=2')

    expect(window.sessionStorage.getItem(BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY)).toBe(
      '/blog?topic=cake-by-post&page=2'
    )
    expect(readStoredBlogArchiveHref()).toBe('/blog?topic=cake-by-post&page=2')
  })
})
