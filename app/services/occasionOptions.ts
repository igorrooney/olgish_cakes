import type { OccasionOption } from '@/app/components/homepage/formOptions'

export const occasionOptionsQueryKey = ['occasion-options'] as const
export const occasionOptionsStaleTimeMs = 1000 * 60 * 30

type OccasionOptionsResponse = {
  occasionOptions?: unknown
}

function isOccasionOption(value: unknown): value is OccasionOption {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as { label?: unknown, value?: unknown, disabled?: unknown }

  if (typeof candidate.label !== 'string' || candidate.label.trim().length === 0) {
    return false
  }

  if (candidate.value !== undefined && typeof candidate.value !== 'string') {
    return false
  }

  if (candidate.disabled !== undefined && typeof candidate.disabled !== 'boolean') {
    return false
  }

  return true
}

export async function fetchOccasionOptions(signal?: AbortSignal): Promise<OccasionOption[]> {
  const response = await fetch('/api/form/occasion-options', {
    headers: {
      Accept: 'application/json'
    },
    signal
  })

  if (!response.ok) {
    throw new Error('Failed to fetch occasion options')
  }

  const payload = (await response.json()) as OccasionOptionsResponse
  const options = payload.occasionOptions

  if (!Array.isArray(options)) {
    throw new Error('Invalid occasion options response')
  }

  return options.filter(isOccasionOption)
}

