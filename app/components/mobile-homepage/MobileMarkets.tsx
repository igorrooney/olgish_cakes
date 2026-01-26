import Link from 'next/link'
import { getMarketSchedule } from '@/app/utils/fetchMarketSchedule'
import type { MarketSchedule } from '@/app/types/marketSchedule'

function formatMarketDate(date: string): string {
  const eventDate = new Date(date)
  return eventDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}

function formatMarketTime(startTime: string, endTime: string): string {
  return `${startTime}-${endTime}`
}

function getUpcomingMarkets(markets: MarketSchedule[]): MarketSchedule[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return markets
    .filter((market) => {
      const marketDate = new Date(market.date)
      marketDate.setHours(0, 0, 0, 0)
      return marketDate >= today
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })
    .slice(0, 10)
}

export async function MobileMarkets() {
  const allMarkets = await getMarketSchedule()
  const upcomingMarkets = getUpcomingMarkets(allMarkets)

  if (!upcomingMarkets || upcomingMarkets.length === 0) {
    return null
  }

  return (
    <section className="relative bg-base-100 px-4 py-8 mt-8">
      <div className="homepage-container relative flex flex-col gap-6">
        <h2 className="mt-10 font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center">
          Upcoming
          <br />
          Farmers markets
        </h2>

        <div className="flex flex-col gap-5 rounded-[16px] px-4 py-6 pb-0">
          {upcomingMarkets.map((market) => (
            <div
              key={market._id}
              className="card items-start gap-0 self-stretch p-8 bg-base-100 border border-black/20 shadow-xl rounded-box"
              style={{ borderWidth: '0.5px' }}
            >
              <div className="card-body p-0 gap-2">
                <h3 className="card-title !font-thin font-moreSugar text-xl text-base-content leading-7">
                  {market.title}
                </h3>
                <div className="flex flex-col gap-1 font-sans text-sm text-base-content">
                  <p>{formatMarketDate(market.date)}</p>
                  <p>{formatMarketTime(market.startTime, market.endTime)}</p>
                  <p>{market.location}</p>
                </div>
                <div className={`card-actions ${market.website ? 'justify-between' : 'justify-end'} items-baseline mt-4`}>
                  {market.website && (
                    <Link
                      href={market.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm underline text-primary-500"
                    >
                      Visit website
                    </Link>
                  )}
                  <Link
                    href={market.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm rounded-full border border-primary-500 px-3 text-sm text-primary-500"
                  >
                    Get directions -&gt;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="relative flex justify-center z-1 mr-5">
          <Link
            href="/market-schedule"
            className="flex items-center gap-2 text-black"
          >
            <span className="font-oldenburg">See all markets</span>
            <span className="font-oldenburg text-primary-500 text-lg mt-1">{">"}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
