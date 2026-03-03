import type { HomepageCollection } from '@/app/types/collection'

export type OccasionOption = {
  label: string
  value?: string
  disabled?: boolean
}

const occasionPlaceholderOption: OccasionOption = {
  label: 'Select from list',
  value: '',
  disabled: true
}

const legacyOccasionOptions: OccasionOption[] = [
  { label: 'Birthday', value: 'birthday' },
  { label: 'Wedding', value: 'wedding' },
  { label: 'Anniversary', value: 'anniversary' },
  { label: 'Baby shower', value: 'baby_shower' },
  { label: 'Corporate event', value: 'corporate_event' },
  { label: 'Christening', value: 'christening' }
]

const fallbackOtherOption: OccasionOption = {
  label: 'Other',
  value: 'other'
}

export const OCCASION_OPTIONS: OccasionOption[] = [
  occasionPlaceholderOption,
  ...legacyOccasionOptions,
  fallbackOtherOption
]

function normalizeCollectionName(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function hasOtherOption(options: OccasionOption[]) {
  return options.some((option) => option.label.trim().toLowerCase() === 'other')
}

export function buildOccasionOptionsFromCollections(collections: HomepageCollection[]): OccasionOption[] {
  const seenLabels = new Set<string>()
  const collectionOptions: OccasionOption[] = []

  collections.forEach((collection) => {
    const normalizedName = normalizeCollectionName(collection.name)

    if (normalizedName.length === 0) {
      return
    }

    const dedupeKey = normalizedName.toLowerCase()
    if (seenLabels.has(dedupeKey)) {
      return
    }

    seenLabels.add(dedupeKey)
    collectionOptions.push({
      label: normalizedName,
      value: normalizedName
    })
  })

  if (collectionOptions.length === 0) {
    return OCCASION_OPTIONS
  }

  const options = [occasionPlaceholderOption, ...collectionOptions]
  if (!hasOtherOption(options)) {
    options.push(fallbackOtherOption)
  }

  return options
}
