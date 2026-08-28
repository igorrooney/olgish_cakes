import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'
import { faqsQuery } from '@/lib/queries/faqs'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'

export interface FAQ {
  _id: string
  question: string
  answer: string
  order: number
}

type RawFaq = Partial<FAQ> & {
  _id?: unknown
  question?: unknown
  answer?: unknown
  order?: unknown
}

function normalizeQuestionKey(question: string) {
  return question.trim().toLowerCase().replace(/\s+/g, ' ')
}

function isValidFaqRecord(faq: RawFaq): faq is FAQ {
  return (
    typeof faq._id === 'string' &&
    typeof faq.question === 'string' &&
    typeof faq.answer === 'string' &&
    typeof faq.order === 'number'
  )
}

function sanitizeFaqs(faqs: RawFaq[]) {
  const seenQuestions = new Set<string>()

  return faqs.flatMap((faq) => {
    if (!isValidFaqRecord(faq)) {
      console.error('Malformed FAQ record skipped', {
        operation: 'sanity.faq.normalize',
        code: 'INVALID_RECORD'
      })
      return []
    }

    const normalizedQuestion = faq.question.trim()
    const normalizedAnswer = faq.answer.trim()

    if (normalizedQuestion === '' || normalizedAnswer === '') {
      return []
    }

    const questionKey = normalizeQuestionKey(normalizedQuestion)

    if (seenQuestions.has(questionKey)) {
      return []
    }

    seenQuestions.add(questionKey)

    return [
      {
        ...faq,
        question: normalizedQuestion,
        answer: normalizedAnswer
      }
    ]
  })
}

type GetFaqsOptions = {
  signal?: AbortSignal
}

export async function getFaqs({ signal }: GetFaqsOptions = {}): Promise<FAQ[]> {
  try {
    const config = getCacheConfig('faqs')
    const result = await cachedSanityFetch<FAQ[]>(
      faqsQuery,
      {},
      {
        ...config,
        signal
      }
    )

    if (!Array.isArray(result)) {
      console.error('Unexpected FAQ result format', {
        operation: 'sanity.faq.fetch',
        code: 'INVALID_RESPONSE_SHAPE'
      })
      return []
    }

    return sanitizeFaqs(result)
  } catch (error) {
    console.error('Sanity read failed', {
      operation: 'sanity.faq.fetch',
      ...toSafeOperationalError(error)
    })
    throw error
  }
}
