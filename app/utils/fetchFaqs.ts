import { groq } from 'next-sanity'
import { cachedSanityFetch, getCacheConfig } from '@/lib/sanity-cache'

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
      console.error('Skipping malformed FAQ record:', faq)
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

export async function getFaqs(): Promise<FAQ[]> {
  try {
    const query = groq`*[_type == "faq"] | order(order asc) {
      _id,
      question,
      answer,
      order
    }`

    const config = getCacheConfig('faqs')
    const result = await cachedSanityFetch<FAQ[]>(query, {}, config)

    if (!Array.isArray(result)) {
      console.error('Unexpected result format:', result)
      return []
    }

    return sanitizeFaqs(result)
  } catch (error) {
    console.error('Error fetching FAQs:', error)
    throw error
  }
}
