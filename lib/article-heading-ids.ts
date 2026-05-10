function normalizeArticleHeadingId(value: string) {
  const normalized = value
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"\u2019]/g, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

  return normalized.length > 0
    ? normalized
    : 'section'
}

export function createArticleHeadingIdResolver() {
  const headingCounts = new Map<string, number>()

  return (heading: string) => {
    const baseId = normalizeArticleHeadingId(heading)
    const seenCount = headingCounts.get(baseId) ?? 0
    headingCounts.set(baseId, seenCount + 1)

    return seenCount === 0
      ? baseId
      : `${baseId}-${seenCount + 1}`
  }
}
