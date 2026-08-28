import { groq } from 'next-sanity'

const marketScheduleProjection = `{
  _id,
  title,
  location,
  googleMapsUrl,
  date,
  startTime,
  endTime,
  description,
  specialOffers,
  website,
  contactInfo,
  featured,
  active,
  weatherDependent,
  image {
    asset-> {
      _ref,
      _type,
      url
    },
    alt,
    hotspot,
    crop
  }
}`

export const MARKET_SCHEDULE_QUERY = groq`
  *[_type == "marketSchedule" && active == true] | order(date asc)
  ${marketScheduleProjection}
`

export const FEATURED_SCHEDULE_QUERY = groq`
  *[_type == "marketSchedule" && active == true && featured == true] | order(date asc) [0...$limit]
  ${marketScheduleProjection}
`

export const UPCOMING_SCHEDULE_QUERY = groq`
  *[_type == "marketSchedule" && active == true && date >= $today && date <= $futureDate] | order(date asc) [0...$limit] {
    _id,
    title,
    location,
    date,
    startTime,
    endTime,
    featured,
    active,
    description,
    specialOffers
  }
`

type MarketScheduleSearchFilters = {
  featured?: boolean
  upcoming?: boolean
  dateFrom?: string
  dateTo?: string
  location?: string
}

export const buildMarketScheduleSearchQuery = (
  filters: MarketScheduleSearchFilters
) => {
  const conditions = ['_type == "marketSchedule"', 'active == true']

  if (filters.featured) {
    conditions.push('featured == true')
  }
  if (filters.upcoming) {
    conditions.push('date >= $today')
  }
  if (filters.dateFrom) {
    conditions.push('date >= $dateFrom')
  }
  if (filters.dateTo) {
    conditions.push('date <= $dateTo')
  }
  if (filters.location) {
    conditions.push('location match $location')
  }

  return `*[${conditions.join(' && ')}] | order(date asc) ${marketScheduleProjection}`
}
