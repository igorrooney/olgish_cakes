import 'server-only'

import { queryOptions } from '@tanstack/react-query'
import { getFaqs } from '../utils/fetchFaqs'

export const faqQueryKeys = {
  all: ['faqs'] as const
}

export function faqQueryOptions() {
  return queryOptions({
    queryKey: faqQueryKeys.all,
    queryFn: ({ signal }) => getFaqs({ signal }),
    staleTime: Infinity
  })
}
