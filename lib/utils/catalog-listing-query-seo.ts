export type ListingSearchParams = Record<string, string | string[] | undefined>

export interface PageOnlyQueryClassification {
  isPageOnly: boolean
  pageNumber: number | null
}

interface IndexablePageOnlyQueryClassification extends PageOnlyQueryClassification {
  isPageOnly: true
  pageNumber: number
}

const PAGE_QUERY_KEY = 'page'
const positiveIntegerPattern = /^[1-9]\d*$/

function createNotPageOnlyQueryClassification(): PageOnlyQueryClassification {
  return {
    isPageOnly: false,
    pageNumber: null
  }
}

function parsePageNumber(value: string): number | null {
  const normalizedValue = value.trim()

  if (!positiveIntegerPattern.test(normalizedValue)) {
    return null
  }

  return Number(normalizedValue)
}

export function classifyPageOnlyQueryFromUrlSearchParams(
  searchParams: URLSearchParams
): PageOnlyQueryClassification {
  const entries = Array.from(searchParams.entries())

  if (entries.length !== 1) {
    return createNotPageOnlyQueryClassification()
  }

  const [queryKey, pageValue] = entries[0]

  if (queryKey !== PAGE_QUERY_KEY) {
    return createNotPageOnlyQueryClassification()
  }

  const pageNumber = parsePageNumber(pageValue)

  if (pageNumber === null) {
    return createNotPageOnlyQueryClassification()
  }

  return {
    isPageOnly: true,
    pageNumber
  }
}

export function classifyPageOnlyQueryFromListingSearchParams(
  searchParams: ListingSearchParams
): PageOnlyQueryClassification {
  const definedEntries = Object.entries(searchParams).filter(([, value]) => value !== undefined)

  if (definedEntries.length !== 1) {
    return createNotPageOnlyQueryClassification()
  }

  const [queryKey, pageValue] = definedEntries[0]

  if (queryKey !== PAGE_QUERY_KEY || typeof pageValue !== 'string') {
    return createNotPageOnlyQueryClassification()
  }

  const pageNumber = parsePageNumber(pageValue)

  if (pageNumber === null) {
    return createNotPageOnlyQueryClassification()
  }

  return {
    isPageOnly: true,
    pageNumber
  }
}

export function isIndexablePageOnlyPagination(
  classification: PageOnlyQueryClassification
): classification is IndexablePageOnlyQueryClassification {
  return classification.isPageOnly && classification.pageNumber !== null && classification.pageNumber >= 2
}
