/**
 * @jest-environment node
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import xlsx from 'xlsx'
import {
  buildClusterReport,
  isBrandedQuery,
  normalizeText,
  parseWorkbook,
  writeClusterReport
} from '../plan-gsc-articles'

function createWorkbookFixture(filePath: string) {
  const workbook = xlsx.utils.book_new()

  const querySheet = xlsx.utils.json_to_sheet([
    { 'Top queries': 'ukrainian cakes', Clicks: 4, Impressions: 120, CTR: '3.3%', Position: 8.4 },
    { 'Top queries': 'cake by post', Clicks: 2, Impressions: 200, CTR: '1%', Position: 21.3 },
    { 'Top queries': 'wedding cakes leeds', Clicks: 1, Impressions: 90, CTR: '1.1%', Position: 12.2 },
    { 'Top queries': 'olgish cakes', Clicks: 5, Impressions: 50, CTR: '10%', Position: 1.2 }
  ])

  const pageSheet = xlsx.utils.json_to_sheet([
    { 'Top pages': '/cakes-by-post', Clicks: 10, Impressions: 500, CTR: '2%', Position: 15.5 },
    { 'Top pages': '/wedding-cakes', Clicks: 9, Impressions: 450, CTR: '2%', Position: 11.2 }
  ])

  const filterSheet = xlsx.utils.json_to_sheet([
    { Filter: 'Search type', Value: 'Web' },
    { Filter: 'Date', Value: 'Last 16 months' },
    { Filter: 'Country', Value: 'United Kingdom' }
  ])

  xlsx.utils.book_append_sheet(workbook, querySheet, 'Queries')
  xlsx.utils.book_append_sheet(workbook, pageSheet, 'Pages')
  xlsx.utils.book_append_sheet(workbook, filterSheet, 'Filters')

  xlsx.writeFile(workbook, filePath)
}

describe('plan-gsc-articles', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gsc-plan-'))
  const workbookPath = path.join(tempDir, 'olgishcakes.co.uk-Performance-on-Search-2026-03-30.xlsx')

  beforeAll(() => {
    createWorkbookFixture(workbookPath)
  })

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('normalizes text and excludes branded queries', () => {
    expect(normalizeText('Olgish Cakes Leeds')).toBe('olgish cakes leeds')
    expect(isBrandedQuery('olgish cakes')).toBe(true)
    expect(isBrandedQuery('ukrainian cakes')).toBe(false)
  })

  it('parses the workbook sheets into typed rows', () => {
    const result = parseWorkbook(workbookPath)

    expect(result.queries).toHaveLength(4)
    expect(result.pages).toHaveLength(2)
    expect(result.filters).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ filter: 'Country', value: 'United Kingdom' })
      ])
    )
  })

  it('builds a cluster report and routes broad postal and wedding intent to canonical pages', () => {
    const report = buildClusterReport(workbookPath)
    const clusterSlugs = report.clusters.map((cluster) => cluster.slug)

    expect(report.sourceDate).toBe('2026-03-30')
    expect(report.brandedExcludedCount).toBe(1)
    expect(clusterSlugs).toEqual(
      expect.arrayContaining([
        'ukrainian-cakes-guide',
        'cake-by-post-canonical',
        'wedding-cakes-canonical'
      ])
    )

    expect(report.clusters.find((cluster) => cluster.slug === 'cake-by-post-canonical')).toEqual(
      expect.objectContaining({
        action: 'support_existing_page',
        target: '/cakes-by-post'
      })
    )

    expect(report.clusters.find((cluster) => cluster.slug === 'wedding-cakes-canonical')).toEqual(
      expect.objectContaining({
        action: 'support_existing_page',
        target: '/wedding-cakes'
      })
    )
  })

  it('writes dated JSON and markdown reports under docs/blog', () => {
    const result = writeClusterReport(workbookPath)

    expect(result.jsonPath.endsWith(path.join('docs', 'blog', 'gsc-clusters-2026-03-30.json'))).toBe(true)
    expect(result.markdownPath.endsWith(path.join('docs', 'blog', 'gsc-clusters-2026-03-30.md'))).toBe(true)
    expect(fs.existsSync(result.jsonPath)).toBe(true)
    expect(fs.existsSync(result.markdownPath)).toBe(true)
  })
})
