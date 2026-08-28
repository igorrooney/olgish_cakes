export const REVIEW_SOURCES = [
  'google',
  'facebook',
  'instagram',
  'trustpilot',
  'direct',
  'historical'
] as const

export type ReviewSourceValue = typeof REVIEW_SOURCES[number]

export const EXTERNAL_REVIEW_SOURCES = [
  'google',
  'facebook',
  'instagram',
  'trustpilot'
] as const

export type ExternalReviewSource = typeof EXTERNAL_REVIEW_SOURCES[number]

export const REVIEW_SOURCE_ORIGINS: Record<
  ExternalReviewSource,
  readonly string[]
> = {
  google: [
    'https://google.com',
    'https://www.google.com',
    'https://maps.google.com',
    'https://google.co.uk',
    'https://www.google.co.uk',
    'https://maps.google.co.uk',
    'https://maps.app.goo.gl',
    'https://g.co',
    'https://g.page'
  ],
  facebook: [
    'https://facebook.com',
    'https://www.facebook.com',
    'https://m.facebook.com'
  ],
  instagram: [
    'https://instagram.com',
    'https://www.instagram.com'
  ],
  trustpilot: [
    'https://trustpilot.com',
    'https://www.trustpilot.com',
    'https://uk.trustpilot.com'
  ]
}

export const isReviewSource = (value: unknown): value is ReviewSourceValue =>
  typeof value === 'string' &&
  REVIEW_SOURCES.some((source) => source === value)

export const isExternalReviewSource = (
  value: unknown
): value is ExternalReviewSource =>
  typeof value === 'string' &&
  EXTERNAL_REVIEW_SOURCES.some((source) => source === value)

export const isReviewSourceUrl = (
  source: unknown,
  value: unknown
): value is string => {
  if (!isExternalReviewSource(source) || typeof value !== 'string') {
    return false
  }

  if (value.length === 0 || value.trim() !== value) {
    return false
  }

  try {
    const url = new URL(value)

    return url.protocol === 'https:' &&
      url.username === '' &&
      url.password === '' &&
      REVIEW_SOURCE_ORIGINS[source].includes(url.origin.toLowerCase())
  } catch {
    return false
  }
}
