import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

type FaqRecord = {
  _id: string
  order?: number
  question?: string
  answer?: string
}

type FaqUpdate = {
  legacyQuestion: string
  question: string
  answer: string
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const token = process.env.SANITY_API_TOKEN
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31'
const shouldWrite = process.argv.includes('--write')

if (!projectId) {
  console.error('Error: NEXT_PUBLIC_SANITY_PROJECT_ID is not set in .env.local')
  process.exit(1)
}

if (!token) {
  console.error('Error: SANITY_API_TOKEN is not set in .env.local')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion,
  useCdn: false
})

const faqUpdates: FaqUpdate[] = [
  {
    legacyQuestion: 'What is your process for custom cake orders?',
    question: 'How do I order a custom cake?',
    answer: 'Send the date first. Then tell me the size and what sort of cake you want. Photos help, even if they are just screenshots. That is enough for me to quote it.'
  },
  {
    legacyQuestion: 'What are your delivery options?',
    question: 'Do you deliver or is it collection only?',
    answer: 'Most celebration cakes are collection from Leeds. I can deliver locally on some orders, but I need the postcode first. Posted cakes are separate. I do not send tall buttercream cakes by courier.'
  },
  {
    legacyQuestion: 'How far in advance should I place my order?',
    question: 'How much notice do you need?',
    answer: 'For most celebration cakes, two to three weeks. Wedding cakes and detailed work need longer, usually four to six weeks. If the date is close, still ask.'
  },
  {
    legacyQuestion: 'How do you handle dietary requirements?',
    question: 'Can you make cakes for gluten-free, dairy-free or vegan diets?',
    answer: 'Sometimes. Tell me exactly what needs to be avoided before I say yes. A gluten-free request is not the same as a serious allergy, and some cakes are much easier to adapt than others.'
  },
  {
    legacyQuestion: 'What payment methods do you accept?',
    question: 'How do I pay?',
    answer: 'Usually by bank transfer, but card and cash are fine too. Orders over GBP200 need a 50% deposit to hold the date. The balance is due seven days before collection or delivery. For business or event orders, I can invoice.'
  },
  {
    legacyQuestion: 'What is your cancellation and refund policy?',
    question: 'What if I need to cancel or move my order?',
    answer: 'If you cancel more than 14 days before the date, I refund the deposit in full. Between 7 and 14 days, I refund half. Inside 7 days, the deposit is not refundable because the slot has been held for you and prep may have started. If you need to move the date, tell me as soon as you can.'
  },
  {
    legacyQuestion: 'Do you offer wedding cake consultations?',
    question: 'Can I book a wedding cake consultation or tasting?',
    answer: 'Yes. We can go through portions, design, flavours and delivery, and I can arrange tasting if that helps. Wedding dates go much earlier than birthday cake dates, especially in spring and summer.'
  },
  {
    legacyQuestion: 'Do you offer traditional Ukrainian cake flavors?',
    question: 'Do you make Ukrainian cake flavours like Medovik or Napoleon?',
    answer: 'Yes. The ones people ask for most are Medovik, Kyiv cake and Napoleon. If you are not sure which one to choose, tell me what you usually like and I will narrow it down.'
  },
  {
    legacyQuestion: 'What makes Ukrainian cakes unique?',
    question: 'What is different about Ukrainian cakes?',
    answer: 'Usually the texture. A lot of Ukrainian cakes are built in thin layers instead of one thick sponge, so they eat differently. Medovik is soft honey cake with cream between the layers. Napoleon is pastry with custard.'
  },
  {
    legacyQuestion: 'Do you offer corporate and event catering?',
    question: 'Do you do cakes for offices or events?',
    answer: 'Yes, if the date works. Send the guest numbers, the date and what you need, and I will tell you quickly if I can do it.'
  }
]

function normaliseCopy(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function findSingleFaqMatch(faqs: FaqRecord[], legacyQuestion: string) {
  const normalizedLegacyQuestion = normaliseCopy(legacyQuestion)
  const matches = faqs.filter((faq) => {
    return typeof faq.question === 'string' && normaliseCopy(faq.question) === normalizedLegacyQuestion
  })

  if (matches.length > 1) {
    throw new Error(`Multiple FAQ documents matched legacy question "${legacyQuestion}"`)
  }

  return matches[0] ?? null
}

async function updateFaqTone() {
  const faqs = await client.fetch<FaqRecord[]>(`*[_type == "faq"] | order(order asc) {
    _id,
    order,
    question,
    answer
  }`)

  if (faqs.length === 0) {
    console.log('No FAQ documents found.')
    return
  }

  const patches = faqUpdates.flatMap((nextValue) => {
    const faq = findSingleFaqMatch(faqs, nextValue.legacyQuestion)

    if (!faq) {
      console.log(`Skipping legacy FAQ "${nextValue.legacyQuestion}": no matching document found.`)
      return []
    }

    const currentQuestion = typeof faq.question === 'string' ? faq.question : ''
    const currentAnswer = typeof faq.answer === 'string' ? faq.answer : ''
    const hasQuestionChange = normaliseCopy(currentQuestion) !== normaliseCopy(nextValue.question)
    const hasAnswerChange = normaliseCopy(currentAnswer) !== normaliseCopy(nextValue.answer)

    if (!hasQuestionChange && !hasAnswerChange) {
      return []
    }

    return [{
      id: faq._id,
      order: faq.order,
      legacyQuestion: nextValue.legacyQuestion,
      question: nextValue.question,
      answer: nextValue.answer
    }]
  })

  if (patches.length === 0) {
    console.log('FAQ copy is already up to date.')
    return
  }

  console.log(`${shouldWrite ? 'Applying' : 'Planned'} ${patches.length} FAQ update(s):`)

  for (const patch of patches) {
    console.log(`- ${patch.id}: "${patch.legacyQuestion}" -> "${patch.question}"`)

    if (!shouldWrite) {
      continue
    }

    await client.patch(patch.id).set({
      question: patch.question,
      answer: patch.answer
    }).commit()
  }

  if (!shouldWrite) {
    console.log('Dry run only. Re-run with --write to update Sanity.')
  }
}

updateFaqTone().catch((error: unknown) => {
  console.error('FAQ tone update failed:', error)
  process.exit(1)
})
