export type ReviewStats = {
  count: number
  averageRating: number
}

export const DEFAULT_REVIEW_STATS: ReviewStats = {
  count: 0,
  averageRating: 5
}

export function normalizeReviewStats(stats?: ReviewStats): ReviewStats {
  if (!stats) return { ...DEFAULT_REVIEW_STATS }

  const count = Number.isFinite(stats.count) && stats.count > 0 ? stats.count : 0
  const averageRating =
    Number.isFinite(stats.averageRating) && stats.averageRating > 0
      ? stats.averageRating
      : DEFAULT_REVIEW_STATS.averageRating

  return { count, averageRating }
}

export function formatRatingValue(averageRating: number): string {
  const safeRating = Number.isFinite(averageRating) && averageRating > 0 ? averageRating : DEFAULT_REVIEW_STATS.averageRating
  return safeRating.toFixed(1)
}

export function formatReviewCount(count: number): string {
  const safeCount = Number.isFinite(count) && count > 0 ? count : 0
  return safeCount.toString()
}

export function buildAggregateRating(stats?: ReviewStats) {
  const normalized = normalizeReviewStats(stats)

  if (normalized.count <= 0) {
    return null
  }

  return {
    '@type': 'AggregateRating',
    ratingValue: formatRatingValue(normalized.averageRating),
    reviewCount: formatReviewCount(normalized.count),
    bestRating: '5',
    worstRating: '1'
  }
}
