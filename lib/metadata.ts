const titleBrandSuffixPattern = /(?:\s*\|\s*Olgish Cakes)+$/i

export function normalizeCmsTitle(title: string | null | undefined) {
  const normalizedTitle = title?.replace(/\s+/g, ' ').trim()

  if (!normalizedTitle) {
    return undefined
  }

  return normalizedTitle.replace(titleBrandSuffixPattern, '').trim()
}
