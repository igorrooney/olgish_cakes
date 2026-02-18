import {
  classifyPageOnlyQueryFromListingSearchParams,
  classifyPageOnlyQueryFromUrlSearchParams,
  isIndexablePageOnlyPagination,
  type ListingSearchParams
} from '../catalog-listing-query-seo'

describe('classifyPageOnlyQueryFromUrlSearchParams', () => {
  it('classifies ?page=2 as page-only and indexable', () => {
    const classification = classifyPageOnlyQueryFromUrlSearchParams(new URLSearchParams('page=2'))

    expect(classification).toEqual({
      isPageOnly: true,
      pageNumber: 2
    })
    expect(isIndexablePageOnlyPagination(classification)).toBe(true)
  })

  it('classifies ?page=1 as page-only but not indexable', () => {
    const classification = classifyPageOnlyQueryFromUrlSearchParams(new URLSearchParams('page=1'))

    expect(classification).toEqual({
      isPageOnly: true,
      pageNumber: 1
    })
    expect(isIndexablePageOnlyPagination(classification)).toBe(false)
  })

  it.each([
    'page=0',
    'page=-1',
    'page=abc'
  ])('classifies invalid page query "%s" as not page-only', (queryString) => {
    const classification = classifyPageOnlyQueryFromUrlSearchParams(new URLSearchParams(queryString))

    expect(classification).toEqual({
      isPageOnly: false,
      pageNumber: null
    })
    expect(isIndexablePageOnlyPagination(classification)).toBe(false)
  })

  it('classifies repeated page values as not page-only', () => {
    const classification = classifyPageOnlyQueryFromUrlSearchParams(new URLSearchParams('page=2&page=3'))

    expect(classification).toEqual({
      isPageOnly: false,
      pageNumber: null
    })
    expect(isIndexablePageOnlyPagination(classification)).toBe(false)
  })

  it('classifies mixed page and filter query as not page-only', () => {
    const classification = classifyPageOnlyQueryFromUrlSearchParams(new URLSearchParams('page=2&collections=x'))

    expect(classification).toEqual({
      isPageOnly: false,
      pageNumber: null
    })
    expect(isIndexablePageOnlyPagination(classification)).toBe(false)
  })
})

describe('classifyPageOnlyQueryFromListingSearchParams', () => {
  it('classifies listing search params with page=2 as page-only and indexable', () => {
    const searchParams: ListingSearchParams = { page: '2' }
    const classification = classifyPageOnlyQueryFromListingSearchParams(searchParams)

    expect(classification).toEqual({
      isPageOnly: true,
      pageNumber: 2
    })
    expect(isIndexablePageOnlyPagination(classification)).toBe(true)
  })

  it('classifies listing search params with page=1 as page-only but not indexable', () => {
    const searchParams: ListingSearchParams = { page: '1' }
    const classification = classifyPageOnlyQueryFromListingSearchParams(searchParams)

    expect(classification).toEqual({
      isPageOnly: true,
      pageNumber: 1
    })
    expect(isIndexablePageOnlyPagination(classification)).toBe(false)
  })

  it('classifies mixed listing search params as not page-only', () => {
    const searchParams: ListingSearchParams = { page: '2', collections: 'c-wedding-cakes' }
    const classification = classifyPageOnlyQueryFromListingSearchParams(searchParams)

    expect(classification).toEqual({
      isPageOnly: false,
      pageNumber: null
    })
    expect(isIndexablePageOnlyPagination(classification)).toBe(false)
  })
})
