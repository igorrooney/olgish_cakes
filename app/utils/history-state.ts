export const PREVIOUS_PATHNAME_STATE_KEY = '__olgishPreviousPathname'

interface HistoryStateWithPreviousPathname extends Record<string, unknown> {
  [PREVIOUS_PATHNAME_STATE_KEY]?: string | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function normalizePathname(pathname: string) {
  if (pathname === '/') {
    return pathname
  }

  const normalizedPathname = pathname.replace(/\/+$/, '')

  return normalizedPathname.length > 0
    ? normalizedPathname
    : '/'
}

export function readPreviousPathnameFromHistoryState() {
  if (typeof window === 'undefined') {
    return null
  }

  const historyState = window.history.state

  if (!isRecord(historyState)) {
    return null
  }

  const previousPathname = (historyState as HistoryStateWithPreviousPathname)[PREVIOUS_PATHNAME_STATE_KEY]

  if (typeof previousPathname !== 'string' || previousPathname.length === 0) {
    return null
  }

  return normalizePathname(previousPathname)
}

export function writePreviousPathnameToHistoryState(previousPathname: string | null) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const currentState = window.history.state
    const nextStateBase: Record<string, unknown> = isRecord(currentState)
      ? currentState
      : {}
    const nextState: HistoryStateWithPreviousPathname = {
      ...nextStateBase,
      [PREVIOUS_PATHNAME_STATE_KEY]: typeof previousPathname === 'string'
        ? normalizePathname(previousPathname)
        : null
    }

    window.history.replaceState(nextState, '', window.location.href)
  } catch {
    // Ignore replaceState failures in restricted browser contexts.
  }
}
