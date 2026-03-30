import { getArchiveSectionCopy } from '../copy'

describe('getArchiveSectionCopy', () => {
  it('returns the recent-post labels for the first archive page', () => {
    expect(getArchiveSectionCopy(1)).toEqual({
      eyebrow: 'More from Olga',
      heading: 'Latest articles'
    })
  })

  it('returns archive labels for paginated archive pages', () => {
    expect(getArchiveSectionCopy(3)).toEqual({
      eyebrow: 'Archive pages',
      heading: 'Page 3'
    })
  })
})
