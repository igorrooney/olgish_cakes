import { getMarketSchedule } from '@/app/utils/fetchMarketSchedule'
import type { MarketSchedule } from '@/app/types/marketSchedule'
import { getLondonDateKey, getMarketDateKey } from '@/app/utils/londonDate'
import { DeferredMarketsClient } from './DeferredMarketsClient'

type MarketEventSchema = {
  '@type': 'Event'
  '@id': string
  name: string
  description: string
  startDate: string
  endDate: string
  url: string
  eventStatus: 'https://schema.org/EventScheduled' | 'https://schema.org/EventCancelled'
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode'
  location: {
    '@type': 'Place'
    name: string
    url: string
  }
  organizer: {
    '@type': 'Organization'
    name: string
    url: string
  }
}

const marketScheduleUrl = 'https://olgishcakes.co.uk/#markets'
const maxStructuredDataMarkets = 10

function buildMarketTimeValue(time: string): string | null {
  const trimmed = time.trim()

  if (!trimmed) {
    return null
  }

  if (/^\d{2}:\d{2}$/.test(trimmed) || /^\d{2}:\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed
  }

  return null
}

function buildMarketDateTime(date: string, time: string): string {
  const timeValue = buildMarketTimeValue(time) ?? '00:00'
  return `${date}T${timeValue}`
}

function buildMarketEventSchema(market: MarketSchedule): MarketEventSchema {
  const description = market.description?.trim() || `Meet Olgish Cakes at ${market.title} in ${market.location}.`

  return {
    '@type': 'Event',
    '@id': `${marketScheduleUrl}#${market._id}`,
    name: market.title,
    description,
    startDate: buildMarketDateTime(market.date, market.startTime),
    endDate: buildMarketDateTime(market.date, market.endTime),
    url: market.website || market.googleMapsUrl || marketScheduleUrl,
    eventStatus: market.active
      ? 'https://schema.org/EventScheduled'
      : 'https://schema.org/EventCancelled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: market.location,
      url: market.googleMapsUrl
    },
    organizer: {
      '@type': 'Organization',
      name: 'Olgish Cakes',
      url: 'https://olgishcakes.co.uk'
    }
  }
}

function getUpcomingMarkets(markets: MarketSchedule[]): MarketSchedule[] {
  const today = getLondonDateKey(new Date())

  return markets
    .filter((market) => {
      const marketDate = getMarketDateKey(market.date)
      return marketDate !== null && marketDate >= today
    })
    .sort((a, b) => {
      const dateA = getMarketDateKey(a.date) ?? ''
      const dateB = getMarketDateKey(b.date) ?? ''
      return dateA.localeCompare(dateB)
    })
}

export async function Markets() {
  const allMarkets = await getMarketSchedule()
  const upcomingMarkets = getUpcomingMarkets(allMarkets)
  const clientMarkets = upcomingMarkets.map((market) => ({
    _id: market._id,
    date: market.date,
    endTime: market.endTime,
    googleMapsUrl: market.googleMapsUrl,
    location: market.location,
    startTime: market.startTime,
    title: market.title,
    website: market.website
  }))
  const marketStructuredData = upcomingMarkets.length > 0
    ? {
        '@context': 'https://schema.org',
        '@graph': upcomingMarkets
          .slice(0, maxStructuredDataMarkets)
          .map((market) => buildMarketEventSchema(market))
      }
    : null

  return (
    <>
      {marketStructuredData ? (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(marketStructuredData).replace(/</g, '\\u003c')
          }}
        />
      ) : null}
      <DeferredMarketsClient upcomingMarkets={clientMarkets} />
    </>
  )
}
