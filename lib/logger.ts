/**
 * Logger utility for consistent, privacy-safe application logging.
 * Metadata is restricted at this boundary so a missed call-site cannot emit
 * customer content, provider response bodies, database details or exceptions.
 */

import { toSafeOperationalError } from './security/safe-operational-error'

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

interface LogEntry {
  level: LogLevel
  data?: SafeLogMetadata
  timestamp: string
}

export interface SafeLogMetadata {
  operation?: string
  code?: string
  status?: number
  recordReference?: string
}

const safeTokenPattern = /^[A-Za-z0-9_.:-]{1,128}$/
const safeReferencePattern = /^[A-Za-z0-9._-]{1,128}$/

const readRecordValue = (value: unknown, key: string): unknown => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  return (value as Record<string, unknown>)[key]
}

const readSafeString = (
  value: unknown,
  pattern: RegExp
): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim()
  return pattern.test(normalized) ? normalized : undefined
}

export const toSafeLogMetadata = (
  value: unknown,
  includeErrorCode = false
): SafeLogMetadata | undefined => {
  if (value === undefined || value === null) {
    return undefined
  }

  const operation = readSafeString(
    readRecordValue(value, 'operation'),
    safeTokenPattern
  )
  const recordReference = readSafeString(
    readRecordValue(value, 'recordReference'),
    safeReferencePattern
  )
  const safeError = toSafeOperationalError(value)
  const explicitCode = readSafeString(
    readRecordValue(value, 'code'),
    safeTokenPattern
  )
  const status = safeError.status
  const code = explicitCode ?? (includeErrorCode ? safeError.code : undefined)

  if (!operation && !code && status === undefined && !recordReference) {
    return undefined
  }

  return {
    ...(operation ? { operation } : {}),
    ...(code ? { code } : {}),
    ...(status !== undefined ? { status } : {}),
    ...(recordReference ? { recordReference } : {})
  }
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production'

  private formatMessage(
    level: LogLevel,
    data?: SafeLogMetadata
  ): LogEntry {
    return {
      level,
      data,
      timestamp: new Date().toISOString()
    }
  }

  error(_message: string, metadata?: unknown): void {
    const entry = this.formatMessage(
      'error',
      toSafeLogMetadata(metadata, true)
    )

    console.error(`[ERROR] ${entry.timestamp}`, entry.data ?? '')
  }

  warn(_message: string, metadata?: unknown): void {
    const entry = this.formatMessage(
      'warn',
      toSafeLogMetadata(metadata)
    )

    console.warn(`[WARN] ${entry.timestamp}`, entry.data ?? '')
  }

  info(_message: string, metadata?: unknown): void {
    const entry = this.formatMessage(
      'info',
      toSafeLogMetadata(metadata)
    )

    // eslint-disable-next-line no-console
    console.info(`[INFO] ${entry.timestamp}`, entry.data ?? '')
  }

  debug(_message: string, metadata?: unknown): void {
    if (!this.isProduction) {
      const entry = this.formatMessage(
        'debug',
        toSafeLogMetadata(metadata)
      )
      // eslint-disable-next-line no-console
      console.debug(`[DEBUG] ${entry.timestamp}`, entry.data ?? '')
    }
  }
}

export const logger = new Logger()
