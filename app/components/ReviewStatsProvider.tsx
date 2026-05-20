"use client"

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { ReviewStats } from '@/app/utils/review-stats'
import { DEFAULT_REVIEW_STATS } from '@/app/utils/review-stats'

const ReviewStatsContext = createContext<ReviewStats>(DEFAULT_REVIEW_STATS)

export function ReviewStatsProvider({
  stats,
  children
}: {
  stats: ReviewStats
  children: ReactNode
}) {
  return (
    <ReviewStatsContext.Provider value={stats}>
      {children}
    </ReviewStatsContext.Provider>
  )
}

export function useReviewStats() {
  return useContext(ReviewStatsContext)
}
