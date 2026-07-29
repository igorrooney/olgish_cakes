import {
  consentMaxAgeSeconds,
  consentVersion,
  deniedConsentChoices,
  legacyConsentStorageKeys,
  type ConsentChoices
} from './consent-config'

export type ConsentSource = 'banner' | 'preferences' | 'migration'

export interface ConsentRecord {
  version: typeof consentVersion
  updatedAt: string
  source: ConsentSource
  choices: ConsentChoices
}

export type LegacyConsentInputs = {
  klaroCookie: string | null
  simpleCookie: string | null
  localStorageChoices: Partial<Record<(typeof legacyConsentStorageKeys)[number], string | null>>
}

const consentSources: readonly ConsentSource[] = [
  'banner',
  'preferences',
  'migration'
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isConsentChoices(value: unknown): value is ConsentChoices {
  if (!isRecord(value)) {
    return false
  }

  return typeof value.googleAnalytics === 'boolean' &&
    typeof value.microsoftClarity === 'boolean' &&
    typeof value.googleAds === 'boolean' &&
    Object.keys(value).length === 3
}

export function createConsentRecord(
  choices: ConsentChoices,
  source: ConsentSource,
  updatedAt = new Date().toISOString()
): ConsentRecord {
  return {
    version: consentVersion,
    updatedAt,
    source,
    choices: { ...choices }
  }
}

export function parseConsentRecord(
  rawValue: string | null,
  now = new Date()
): ConsentRecord | null {
  if (!rawValue) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(rawValue))

    if (
      !isRecord(parsed) ||
      parsed.version !== consentVersion ||
      typeof parsed.updatedAt !== 'string' ||
      !consentSources.includes(parsed.source as ConsentSource) ||
      !isConsentChoices(parsed.choices) ||
      Object.keys(parsed).length !== 4
    ) {
      return null
    }

    const updatedAt = new Date(parsed.updatedAt)
    if (
      Number.isNaN(updatedAt.getTime()) ||
      updatedAt.getTime() > now.getTime() ||
      now.getTime() - updatedAt.getTime() > consentMaxAgeSeconds * 1000
    ) {
      return null
    }

    return {
      version: consentVersion,
      updatedAt: parsed.updatedAt,
      source: parsed.source as ConsentSource,
      choices: { ...parsed.choices }
    }
  } catch {
    return null
  }
}

export function serializeConsentRecord(record: ConsentRecord) {
  return encodeURIComponent(JSON.stringify(record))
}

function parseKlaroChoices(rawValue: string | null): ConsentChoices | null {
  if (!rawValue) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(rawValue))
    if (!isRecord(parsed)) {
      return null
    }

    const serviceNames = [
      'google-analytics',
      'microsoft-clarity',
      'google-ads'
    ] as const

    if (!serviceNames.every(serviceName => typeof parsed[serviceName] === 'boolean')) {
      return null
    }

    return {
      googleAnalytics: parsed['google-analytics'] as boolean,
      microsoftClarity: parsed['microsoft-clarity'] as boolean,
      googleAds: parsed['google-ads'] as boolean
    }
  } catch {
    return null
  }
}

function parseSimpleChoice(rawValue: string | null): ConsentChoices | null {
  if (rawValue === 'accepted') {
    return {
      googleAnalytics: true,
      microsoftClarity: true,
      googleAds: true
    }
  }

  if (rawValue === 'declined') {
    return { ...deniedConsentChoices }
  }

  return null
}

export function migrateLegacyConsent(
  inputs: LegacyConsentInputs,
  updatedAt = new Date().toISOString()
): ConsentRecord | null {
  const choices = parseKlaroChoices(inputs.klaroCookie) ??
    parseSimpleChoice(inputs.simpleCookie) ??
    parseSimpleChoice(inputs.localStorageChoices.olgishCookieConsent ?? null) ??
    parseSimpleChoice(inputs.localStorageChoices.cookieConsent ?? null)

  return choices ? createConsentRecord(choices, 'migration', updatedAt) : null
}

