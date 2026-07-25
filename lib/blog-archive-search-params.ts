import {
  createLoader,
  createMultiParser,
  createSerializer,
  type SearchParams
} from 'nuqs/server'

export type BlogArchiveSearchParams = SearchParams

export interface BlogArchiveQueryState {
  topic?: string
  page: number
}

const topicParser = createMultiParser({
  parse(values) {
    if (values.length !== 1) {
      return null
    }

    const topic = values[0]?.trim()

    return topic ? topic : null
  },
  serialize(value: string) {
    return [value]
  }
})

const pageParser = createMultiParser({
  parse(values) {
    if (values.length !== 1) {
      return null
    }

    const value = values[0]

    if (!value || /^[1-9]\d*$/.test(value) === false) {
      return null
    }

    const page = Number(value)

    return Number.isSafeInteger(page) ? page : null
  },
  serialize(value: number) {
    return [String(value)]
  }
}).withDefault(1)

const blogArchiveParsers = {
  topic: topicParser,
  page: pageParser
}

const loadBlogArchiveSearchParams = createLoader(blogArchiveParsers)
const serializeBlogArchiveSearchParams = createSerializer(blogArchiveParsers)

export function resolveBlogArchiveSearchParams(
  searchParams: BlogArchiveSearchParams
): BlogArchiveQueryState | null {
  try {
    const queryState = loadBlogArchiveSearchParams(searchParams, { strict: true })

    return {
      topic: queryState.topic ?? undefined,
      page: queryState.page
    }
  } catch {
    return null
  }
}

export function getBlogArchiveHref({
  topic,
  page = 1
}: Partial<BlogArchiveQueryState>) {
  return serializeBlogArchiveSearchParams('/blog', {
    topic: topic ?? null,
    page
  })
}
