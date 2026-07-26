#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createClient, type SanityClient } from '@sanity/client'
import dotenv from 'dotenv'
import {
  extractBodyPlainText,
  hasSingularNarratorVoice,
  seedArticles,
  toArticleDocumentId,
  validateSeedConfiguration,
  type FaqItem,
  type PortableTextBlock,
  type SeedArticle
} from './import-manual-articles'

dotenv.config({ path: './.env.local' })

interface ArticleSeoCopy {
  metaTitle: string
  metaDescription: string
  keywords: string[]
  canonicalUrl?: string
  priority?: number
  changefreq?: string
}

export interface ExistingArticleDocument {
  _id: string
  _type: 'article'
  _rev: string
  slug?: {
    current?: string
  }
  title?: string
  summary?: string
  dek?: string
  body?: PortableTextBlock[]
  faqItems?: Array<FaqItem & { _key?: string }>
  seo?: Partial<ArticleSeoCopy>
  [key: string]: unknown
}

export interface ArticleCopyPatch {
  title: string
  summary: string
  dek: string
  body: PortableTextBlock[]
  faqItems: Array<FaqItem & { _key: string }>
  seo: ArticleSeoCopy
}

interface MigrationOptions {
  write: boolean
  confirmation?: string
  restorePath?: string
}

interface SanityEnvironment {
  projectId: string
  dataset: string
  token: string
  apiVersion: string
}

interface PublicArticleVerification {
  slug: string
  hasBody: boolean
  hasTopic: boolean
  hasCoverImage: boolean
  hasSeo: boolean
}

const copyFieldNames: Array<keyof ArticleCopyPatch> = [
  'title',
  'summary',
  'dek',
  'body',
  'faqItems',
  'seo'
]

function stableJson(value: unknown) {
  return JSON.stringify(value, (_key, nestedValue: unknown) => {
    if (
      typeof nestedValue !== 'object' ||
      nestedValue === null ||
      Array.isArray(nestedValue)
    ) {
      return nestedValue
    }

    const record = nestedValue as Record<string, unknown>

    return Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((sortedRecord, key) => {
        sortedRecord[key] = record[key]
        return sortedRecord
      }, {})
  })
}

function getFieldDiff(
  document: ExistingArticleDocument,
  patch: ArticleCopyPatch,
  fieldName: keyof ArticleCopyPatch
) {
  return {
    field: fieldName,
    before: document[fieldName],
    after: patch[fieldName]
  }
}

function getSanityEnvironment(): SanityEnvironment {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  const token = process.env.SANITY_API_TOKEN
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31'

  if (!projectId || !dataset || !token) {
    throw new Error(
      'Missing NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, or SANITY_API_TOKEN.'
    )
  }

  return { projectId, dataset, token, apiVersion }
}

function getSanityClient(environment: SanityEnvironment) {
  return createClient({
    projectId: environment.projectId,
    dataset: environment.dataset,
    token: environment.token,
    apiVersion: environment.apiVersion,
    perspective: 'raw',
    useCdn: false
  })
}

export function parseMigrationOptions(argv: string[]): MigrationOptions {
  const write = argv.includes('--write')
  const confirmationArgument = argv.find(argument =>
    argument.startsWith('--confirm-production=')
  )
  const restoreIndex = argv.indexOf('--restore')
  const restorePath = restoreIndex >= 0 ? argv[restoreIndex + 1] : undefined

  if (restoreIndex >= 0 && !restorePath) {
    throw new Error('--restore requires a backup file path')
  }

  return {
    write,
    confirmation: confirmationArgument?.slice('--confirm-production='.length),
    restorePath
  }
}

export function createArticleCopyPatch(
  article: SeedArticle,
  existingDocument: ExistingArticleDocument
): ArticleCopyPatch {
  return {
    title: article.title,
    summary: article.summary,
    dek: article.dek,
    body: article.body,
    faqItems: (article.faqItems ?? []).map((item, index) => ({
      _key: existingDocument.faqItems?.[index]?._key ?? `faq-${index + 1}`,
      question: item.question,
      answer: item.answer
    })),
    seo: {
      ...existingDocument.seo,
      metaTitle: article.seo.metaTitle,
      metaDescription: article.seo.metaDescription,
      keywords: article.seo.keywords
    }
  }
}

export function getChangedCopyFields(
  document: ExistingArticleDocument,
  patch: ArticleCopyPatch
) {
  return copyFieldNames.filter(fieldName =>
    stableJson(document[fieldName]) !== stableJson(patch[fieldName])
  )
}

export function serializeBackupDocuments(documents: ExistingArticleDocument[]) {
  return `${documents.map(document => JSON.stringify(document)).join('\n')}\n`
}

export function calculateBackupChecksum(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function parseBackupDocuments(value: string) {
  return value
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      const parsed: unknown = JSON.parse(line)

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('_id' in parsed) ||
        !('_type' in parsed) ||
        typeof parsed._id !== 'string' ||
        parsed._type !== 'article'
      ) {
        throw new Error(`Invalid article backup document on line ${index + 1}`)
      }

      return parsed as ExistingArticleDocument
    })
}

function assertProductionConfirmation(
  environment: SanityEnvironment,
  options: MigrationOptions
) {
  if (!options.write) {
    return
  }

  const expectedConfirmation = `${environment.projectId}/${environment.dataset}`

  if (options.confirmation !== expectedConfirmation) {
    throw new Error(
      `Write mode requires --confirm-production=${expectedConfirmation}`
    )
  }
}

async function fetchExistingArticles(client: SanityClient) {
  const ids = seedArticles.map(article => toArticleDocumentId(article.slug))
  const documents = await client.fetch<ExistingArticleDocument[]>(
    '*[_type == "article" && _id in $ids]',
    { ids }
  )
  const documentMap = new Map(documents.map(document => [document._id, document]))
  const missingIds = ids.filter(id => !documentMap.has(id))

  if (missingIds.length > 0) {
    throw new Error(`Missing article documents: ${missingIds.join(', ')}`)
  }

  return documents
}

async function writeBackup(documents: ExistingArticleDocument[]) {
  const backupDirectory = path.resolve(process.cwd(), 'backups')
  const workspaceRoot = `${path.resolve(process.cwd())}${path.sep}`

  if (`${backupDirectory}${path.sep}`.startsWith(workspaceRoot) === false) {
    throw new Error('Resolved backup directory is outside the workspace')
  }

  await mkdir(backupDirectory, { recursive: true })

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = path.join(backupDirectory, `blog-content-${timestamp}.ndjson`)
  const backup = serializeBackupDocuments(documents)
  const checksum = calculateBackupChecksum(backup)

  await writeFile(backupPath, backup, { encoding: 'utf8', flag: 'wx' })
  await writeFile(`${backupPath}.sha256`, `${checksum}  ${path.basename(backupPath)}\n`, {
    encoding: 'utf8',
    flag: 'wx'
  })

  return { backupPath, checksum }
}

function withoutSystemFields(document: ExistingArticleDocument) {
  const {
    _rev: _revision,
    _createdAt: _created,
    _updatedAt: _updated,
    ...restorableDocument
  } = document

  return restorableDocument
}

async function restoreBackup(
  client: SanityClient,
  environment: SanityEnvironment,
  options: MigrationOptions
) {
  assertProductionConfirmation(environment, options)

  if (!options.write || !options.restorePath) {
    throw new Error('Restore mode requires --restore <path>, --write, and production confirmation')
  }

  const allowedIds = new Set(
    seedArticles.map(article => toArticleDocumentId(article.slug))
  )
  const resolvedBackupPath = path.resolve(options.restorePath)
  const backupValue = await readFile(resolvedBackupPath, 'utf8')
  const expectedChecksumValue = await readFile(`${resolvedBackupPath}.sha256`, 'utf8')
  const expectedChecksum = expectedChecksumValue.trim().split(/\s+/)[0]
  const actualChecksum = calculateBackupChecksum(backupValue)

  if (!expectedChecksum || expectedChecksum !== actualChecksum) {
    throw new Error('Backup checksum validation failed')
  }

  const documents = parseBackupDocuments(backupValue)

  for (const document of documents) {
    if (!allowedIds.has(document._id)) {
      throw new Error(`Backup contains an out-of-scope document: ${document._id}`)
    }
  }

  for (const document of documents) {
    await client.createOrReplace(withoutSystemFields(document))
  }

  const restoredDocuments = await fetchExistingArticles(client)
  const restoredDocumentMap = new Map(
    restoredDocuments.map(document => [document._id, document])
  )

  for (const document of documents) {
    const restoredDocument = restoredDocumentMap.get(document._id)

    if (!restoredDocument) {
      throw new Error(`Restored document could not be fetched: ${document._id}`)
    }

    if (
      stableJson(withoutSystemFields(restoredDocument)) !==
      stableJson(withoutSystemFields(document))
    ) {
      throw new Error(`Restore verification failed for ${document._id}`)
    }
  }

  await verifyPublicProjection(client)
  await revalidateArticleCache(seedArticles[0].slug)

  return {
    restoredCount: documents.length,
    checksum: actualChecksum
  }
}

async function verifyPublicProjection(client: SanityClient) {
  const slugs = seedArticles.map(article => article.slug)
  const records = await client.fetch<PublicArticleVerification[]>(
    `*[_type == "article" && slug.current in $slugs &&
      coalesce(publishedAt, _createdAt) <= now()] |
      order(publishedAt desc, _createdAt desc){
        "slug": slug.current,
        "hasBody": count(body) > 0,
        "hasTopic": defined(topic->_id),
        "hasCoverImage": defined(coverImage.asset._ref),
        "hasSeo": defined(seo.metaTitle) && defined(seo.metaDescription)
      }`,
    { slugs },
    { perspective: 'published' }
  )
  const actualOrder = records.map(record => record.slug)

  if (stableJson(actualOrder) !== stableJson(slugs)) {
    throw new Error('Public article order or count does not match the seed source')
  }

  for (const record of records) {
    if (!record.hasBody || !record.hasTopic || !record.hasCoverImage || !record.hasSeo) {
      throw new Error(`Incomplete public article after migration: ${record.slug}`)
    }
  }
}

async function revalidateArticleCache(slug: string) {
  const secret = process.env.REVALIDATE_SECRET
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://olgishcakes.co.uk'

  if (!secret) {
    throw new Error('REVALIDATE_SECRET is required to clear article cache tags after writing')
  }

  const response = await fetch(`${siteUrl.replace(/\/$/, '')}/api/revalidate`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${secret}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      _type: 'article',
      _id: toArticleDocumentId(slug),
      slug: { current: slug }
    }),
    signal: AbortSignal.timeout(15_000)
  })

  if (!response.ok) {
    throw new Error(`Article cache revalidation failed with HTTP ${response.status}`)
  }
}

export async function runBlogVoiceMigration(argv = process.argv.slice(2)) {
  validateSeedConfiguration()

  const options = parseMigrationOptions(argv)
  const environment = getSanityEnvironment()
  const client = getSanityClient(environment)

  if (options.restorePath) {
    return restoreBackup(client, environment, options)
  }

  assertProductionConfirmation(environment, options)

  const documents = await fetchExistingArticles(client)
  const documentMap = new Map(documents.map(document => [document._id, document]))
  const changes = seedArticles.map(article => {
    const documentId = toArticleDocumentId(article.slug)
    const document = documentMap.get(documentId)

    if (!document) {
      throw new Error(`Missing article document: ${documentId}`)
    }

    const patch = createArticleCopyPatch(article, document)

    return {
      article,
      document,
      patch,
      changedFields: getChangedCopyFields(document, patch)
    }
  }).filter(change => change.changedFields.length > 0)

  changes.forEach(change => {
    console.log(`${change.article.slug}:`)
    change.changedFields.forEach(fieldName => {
      console.log(JSON.stringify(getFieldDiff(change.document, change.patch, fieldName), null, 2))
    })
  })

  if (!options.write) {
    return {
      mode: 'dry-run' as const,
      changedCount: changes.length
    }
  }

  const { backupPath, checksum } = await writeBackup(
    changes.map(change => change.document)
  )
  const updatedIds: string[] = []

  try {
    for (const change of changes) {
      await client
        .patch(change.document._id)
        .ifRevisionId(change.document._rev)
        .set(change.patch)
        .commit()
      updatedIds.push(change.document._id)
    }
  } catch (error) {
    throw new Error(
      `Blog migration stopped after ${updatedIds.length} updates. Restore with ` +
      `--restore "${backupPath}" --write --confirm-production=` +
      `${environment.projectId}/${environment.dataset}. Cause: ${String(error)}`
    )
  }

  try {
    const updatedDocuments = await fetchExistingArticles(client)
    const updatedDocumentMap = new Map(
      updatedDocuments.map(document => [document._id, document])
    )

    for (const article of seedArticles) {
      const document = updatedDocumentMap.get(toArticleDocumentId(article.slug))

      if (!document) {
        throw new Error(`Missing article during post-write verification: ${article.slug}`)
      }

      const remainingChanges = getChangedCopyFields(
        document,
        createArticleCopyPatch(article, document)
      )

      if (remainingChanges.length > 0) {
        throw new Error(
          `Post-write verification failed for ${article.slug}: ${remainingChanges.join(', ')}`
        )
      }

      if (hasSingularNarratorVoice(extractBodyPlainText(article.body))) {
        throw new Error(`Singular narrator voice remains in ${article.slug}`)
      }
    }

    await verifyPublicProjection(client)
    await revalidateArticleCache(seedArticles[0].slug)
  } catch (error) {
    throw new Error(
      `Post-write verification failed. Restore with --restore "${backupPath}" ` +
      `--write --confirm-production=${environment.projectId}/${environment.dataset}. ` +
      `Cause: ${String(error)}`
    )
  }

  return {
    mode: 'write' as const,
    changedCount: changes.length,
    backupPath,
    checksum
  }
}

if (process.argv[1]?.endsWith('migrate-blog-voice.ts')) {
  runBlogVoiceMigration()
    .then(result => {
      console.log(JSON.stringify(result, null, 2))
    })
    .catch((error: unknown) => {
      console.error(error)
      process.exitCode = 1
    })
}
