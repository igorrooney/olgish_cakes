import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { CANONICAL_FAQS, type CanonicalFaq } from '../lib/faq-content'
import { faqsQuery } from '../lib/queries/faqs'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

type FaqRecord = {
  _id: string
  order?: number
  question?: string
  answer?: string
}

type MatchedFaq = {
  current: FaqRecord
  canonical: CanonicalFaq
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

function normaliseCopy(value: string) {
  return value.trim().replace(/\s+/g, ' ')
}

function matchesQuestion(faq: FaqRecord, canonical: CanonicalFaq) {
  if (typeof faq.question !== 'string') {
    return false
  }

  const question = normaliseCopy(faq.question)

  return question === normaliseCopy(canonical.question) ||
    question === normaliseCopy(canonical.legacyQuestion)
}

function matchExpectedFaqs(faqs: FaqRecord[]) {
  if (faqs.length !== CANONICAL_FAQS.length) {
    throw new Error(
      `Expected exactly ${CANONICAL_FAQS.length} FAQ documents, found ${faqs.length}. No changes were made.`
    )
  }

  const matches = CANONICAL_FAQS.map((canonical): MatchedFaq => {
    const matchingDocuments = faqs.filter((faq) => matchesQuestion(faq, canonical))

    if (matchingDocuments.length !== 1) {
      throw new Error(
        `Expected one document for "${canonical.question}", found ${matchingDocuments.length}. No changes were made.`
      )
    }

    const current = matchingDocuments[0]

    if (!current) {
      throw new Error(`Unable to resolve FAQ "${canonical.question}". No changes were made.`)
    }

    return { current, canonical }
  })

  const matchedIds = new Set(matches.map(({ current }) => current._id))

  if (matchedIds.size !== CANONICAL_FAQS.length) {
    throw new Error('One FAQ document matched more than one expected question. No changes were made.')
  }

  return matches
}

function hasCopyChange({ current, canonical }: MatchedFaq) {
  return normaliseCopy(current.question ?? '') !== normaliseCopy(canonical.question) ||
    normaliseCopy(current.answer ?? '') !== normaliseCopy(canonical.answer)
}

function printDiff({ current, canonical }: MatchedFaq) {
  console.log(`\n${current._id}`)
  console.log(`  Question before: ${current.question ?? '(missing)'}`)
  console.log(`  Question after:  ${canonical.question}`)
  console.log(`  Answer before:   ${current.answer ?? '(missing)'}`)
  console.log(`  Answer after:    ${canonical.answer}`)
}

async function fetchFaqs() {
  return client.fetch<FaqRecord[]>(
    faqsQuery,
    {},
    { signal: AbortSignal.timeout(30_000) }
  )
}

async function createBackup(faqs: FaqRecord[]) {
  const backupDirectory = await mkdtemp(path.join(tmpdir(), 'olgish-faq-backup-'))
  const backupPath = path.join(backupDirectory, 'faqs-before-update.json')
  const backup = {
    projectId,
    dataset,
    createdAt: new Date().toISOString(),
    faqs
  }

  await writeFile(backupPath, `${JSON.stringify(backup, null, 2)}\n`, 'utf8')
  return backupPath
}

function verifyFaqs(faqs: FaqRecord[]) {
  const matches = matchExpectedFaqs(faqs)
  const mismatches = matches.filter(hasCopyChange)

  if (mismatches.length > 0) {
    throw new Error(
      `Verification failed for ${mismatches.length} FAQ document(s): ${mismatches
        .map(({ current }) => current._id)
        .join(', ')}`
    )
  }
}

async function updateFaqTone() {
  const faqs = await fetchFaqs()
  const matches = matchExpectedFaqs(faqs)
  const changes = matches.filter(hasCopyChange)

  console.log(
    `${shouldWrite ? 'Write review' : 'Dry run'} for ${CANONICAL_FAQS.length} expected FAQ documents in dataset "${dataset}".`
  )

  if (changes.length === 0) {
    console.log('FAQ copy is already up to date.')
    verifyFaqs(faqs)
    return
  }

  console.log(`${changes.length} FAQ document(s) require changes:`)
  changes.forEach(printDiff)

  if (!shouldWrite) {
    console.log('\nDry run only. Re-run with --write to update Sanity atomically.')
    return
  }

  const backupPath = await createBackup(faqs)
  console.log(`\nRecoverable pre-write backup: ${backupPath}`)

  const transaction = changes.reduce(
    (currentTransaction, { current, canonical }) => currentTransaction.patch(
      current._id,
      (patch) => patch.set({
        question: canonical.question,
        answer: canonical.answer
      })
    ),
    client.transaction()
  )

  const result = await transaction.commit()
  console.log(`Applied transaction ${result.transactionId}.`)

  const updatedFaqs = await fetchFaqs()
  verifyFaqs(updatedFaqs)
  console.log(`Verified all ${CANONICAL_FAQS.length} FAQ documents after the write.`)
}

updateFaqTone().catch((error: unknown) => {
  console.error('FAQ update failed:', error)
  process.exitCode = 1
})
