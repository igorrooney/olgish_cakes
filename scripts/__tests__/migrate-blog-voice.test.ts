/**
 * @jest-environment node
 */

import {
  calculateBackupChecksum,
  createArticleCopyPatch,
  getChangedCopyFields,
  parseBackupDocuments,
  parseMigrationOptions,
  serializeBackupDocuments,
  type ExistingArticleDocument
} from '../migrate-blog-voice'
import { seedArticles } from '../import-manual-articles'

function createExistingDocument(): ExistingArticleDocument {
  const article = seedArticles[0]

  return {
    _id: `article-${article.slug}`,
    _type: 'article',
    _rev: 'revision-1',
    slug: { current: article.slug },
    title: 'Old title',
    summary: article.summary,
    dek: article.dek,
    body: article.body,
    faqItems: article.faqItems?.map((item, index) => ({
      _key: `existing-faq-${index}`,
      ...item
    })),
    seo: {
      metaTitle: article.seo.metaTitle,
      metaDescription: article.seo.metaDescription,
      keywords: article.seo.keywords,
      canonicalUrl: 'https://example.com/canonical',
      priority: 0.8,
      changefreq: 'monthly'
    },
    publishedAt: article.publishedAt,
    coverImage: {
      asset: {
        _ref: 'image-1'
      }
    }
  }
}

describe('migrate-blog-voice', () => {
  it('defaults to dry-run and parses explicit write and restore options', () => {
    expect(parseMigrationOptions([])).toEqual({
      write: false,
      confirmation: undefined,
      restorePath: undefined
    })
    expect(parseMigrationOptions([
      '--write',
      '--confirm-production=project/production'
    ])).toEqual({
      write: true,
      confirmation: 'project/production',
      restorePath: undefined
    })
    expect(parseMigrationOptions([
      '--restore',
      'backups/blog.ndjson',
      '--write',
      '--confirm-production=project/production'
    ])).toEqual({
      write: true,
      confirmation: 'project/production',
      restorePath: 'backups/blog.ndjson'
    })
    expect(() => parseMigrationOptions(['--restore'])).toThrow(
      '--restore requires a backup file path'
    )
  })

  it('patches copy only while preserving custom SEO settings and FAQ keys', () => {
    const article = seedArticles[0]
    const existing = createExistingDocument()
    const patch = createArticleCopyPatch(article, existing)

    expect(patch.title).toBe(article.title)
    expect(patch.faqItems[0]?._key).toBe('existing-faq-0')
    expect(patch.seo).toEqual({
      metaTitle: article.seo.metaTitle,
      metaDescription: article.seo.metaDescription,
      keywords: article.seo.keywords,
      canonicalUrl: 'https://example.com/canonical',
      priority: 0.8,
      changefreq: 'monthly'
    })
    expect(existing.publishedAt).toBe(article.publishedAt)
    expect(existing.coverImage).toEqual({
      asset: {
        _ref: 'image-1'
      }
    })
    expect(getChangedCopyFields(existing, patch)).toEqual(['title'])
  })

  it('round-trips scoped NDJSON backups and rejects invalid documents', () => {
    const document = createExistingDocument()
    const backup = serializeBackupDocuments([document])

    expect(parseBackupDocuments(backup)).toEqual([document])
    expect(() => parseBackupDocuments('{"_id":"cake-1","_type":"cake"}\n')).toThrow(
      'Invalid article backup document on line 1'
    )
  })

  it('produces a stable checksum that detects backup tampering', () => {
    const backup = serializeBackupDocuments([createExistingDocument()])
    const checksum = calculateBackupChecksum(backup)

    expect(checksum).toMatch(/^[a-f0-9]{64}$/)
    expect(calculateBackupChecksum(backup)).toBe(checksum)
    expect(calculateBackupChecksum(`${backup} `)).not.toBe(checksum)
  })
})
