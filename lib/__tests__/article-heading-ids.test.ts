import { createArticleHeadingIdResolver } from '../article-heading-ids'

describe('createArticleHeadingIdResolver', () => {
  it('generates stable ids for duplicate headings', () => {
    const resolveHeadingId = createArticleHeadingIdResolver()

    expect(resolveHeadingId('Choose the right format')).toBe('choose-the-right-format')
    expect(resolveHeadingId('Choose the right format')).toBe('choose-the-right-format-2')
  })

  it('keeps Cyrillic and mixed-script headings readable', () => {
    const resolveHeadingId = createArticleHeadingIdResolver()

    expect(resolveHeadingId('Медовик for birthdays')).toBe('медовик-for-birthdays')
    expect(resolveHeadingId('Торт by post')).toBe('торт-by-post')
  })

  it('falls back to a deterministic section id for punctuation-only headings', () => {
    const resolveHeadingId = createArticleHeadingIdResolver()

    expect(resolveHeadingId('...')).toBe('section')
    expect(resolveHeadingId('!!!')).toBe('section-2')
  })

  it('removes accents and apostrophes when normalizing ids', () => {
    const resolveHeadingId = createArticleHeadingIdResolver()

    expect(resolveHeadingId("Olga’s gâteau guide")).toBe('olgas-gateau-guide')
  })
})
