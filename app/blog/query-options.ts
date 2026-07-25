import 'server-only'

import { queryOptions } from '@tanstack/react-query'
import {
  BLOG_ARCHIVE_PAGE_SIZE,
  getArticleTopics,
  getPaginatedArchiveArticles
} from '@/lib/articles'

export const blogArchiveQueryKeys = {
  all: ['blog-archive'] as const,
  topics: () => [...blogArchiveQueryKeys.all, 'topics'] as const,
  page: (topic: string | null, page: number, pageSize: number) => (
    [...blogArchiveQueryKeys.all, 'page', topic, page, pageSize] as const
  )
}

export function blogArchiveTopicsQueryOptions() {
  return queryOptions({
    queryKey: blogArchiveQueryKeys.topics(),
    queryFn: ({ signal }) => getArticleTopics({ signal }),
    staleTime: Infinity
  })
}

export function blogArchivePageQueryOptions(
  topic: string | null,
  page: number,
  pageSize = BLOG_ARCHIVE_PAGE_SIZE
) {
  return queryOptions({
    queryKey: blogArchiveQueryKeys.page(topic, page, pageSize),
    queryFn: ({ signal }) => getPaginatedArchiveArticles(
      topic,
      page,
      pageSize,
      { signal }
    ),
    staleTime: Infinity
  })
}
