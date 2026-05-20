#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import xlsx from 'xlsx'

export interface QueryMetricRow {
  query: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface PageMetricRow {
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface FilterRow {
  filter: string
  value: string
}

export type ClusterAction =
  | 'new_article'
  | 'rewrite_existing_article'
  | 'support_existing_page'
  | 'backlog'

interface ClusterDefinition {
  slug: string
  title: string
  action: ClusterAction
  target: string
  patterns: RegExp[]
}

export interface ClusterReportItem {
  slug: string
  title: string
  action: ClusterAction
  target: string
  clicks: number
  impressions: number
  ctr: number
  position: number
  matchedQueries: string[]
}

export interface GscPlanningReport {
  sourceFile: string
  sourceDate: string
  filters: Record<string, string>
  queryCount: number
  brandedExcludedCount: number
  clusters: ClusterReportItem[]
  topPages: PageMetricRow[]
}

const clusterDefinitions: ClusterDefinition[] = [
  {
    slug: 'ukrainian-cakes-guide',
    title: 'Ukrainian cakes',
    action: 'new_article',
    target: '/blog/ukrainian-cakes-guide',
    patterns: [/\bukrainian cake/, /\bukranian cake/, /\bukrainian bakery/, /\bukrainian desserts? near me/]
  },
  {
    slug: 'napoleon-cake-guide',
    title: 'Napoleon cake',
    action: 'rewrite_existing_article',
    target: '/blog/napoleon-cake-guide',
    patterns: [/\bnapoleon cake\b/, /\bnapolean cake\b/, /\bbuy napoleon cake\b/]
  },
  {
    slug: 'medovik-honey-cake-near-me-guide',
    title: 'Medovik and honey cake near me',
    action: 'new_article',
    target: '/blog/medovik-honey-cake-near-me-guide',
    patterns: [/\bhoney cake near me\b/, /\bukrainian honey cake near me\b/, /\bmedovik cake near me\b/, /\bmedovik near me\b/, /\bhoney cake order\b/]
  },
  {
    slug: 'kyiv-cake-guide',
    title: 'Kyiv cake',
    action: 'rewrite_existing_article',
    target: '/blog/kyiv-cake-guide',
    patterns: [/\bkyiv cake\b/, /\bkiev cake\b/]
  },
  {
    slug: 'cake-delivery-leeds-guide',
    title: 'Cake delivery Leeds',
    action: 'new_article',
    target: '/blog/cake-delivery-leeds-guide',
    patterns: [/\bcake delivery leeds\b/, /\bsame day cake delivery leeds\b/]
  },
  {
    slug: 'nut-free-cakes-leeds-guide',
    title: 'Nut free cakes Leeds',
    action: 'new_article',
    target: '/blog/nut-free-cakes-leeds-guide',
    patterns: [/\bnut free cakes? leeds\b/, /\bnut free cakes? near me\b/]
  },
  {
    slug: 'cake-by-post-canonical',
    title: 'Broad cakes by post',
    action: 'support_existing_page',
    target: '/cakes-by-post',
    patterns: [/\bcakes? by post\b/, /\bpostal cakes?\b/, /\bletterbox cakes?\b/]
  },
  {
    slug: 'gift-cakes-by-post-guide',
    title: 'Gift cakes by post',
    action: 'new_article',
    target: '/blog/gift-cakes-by-post-guide',
    patterns: [/\bgift cakes?\b/, /\bcake gift\b/, /\bcake gift hamper/, /\bcake gift basket/]
  },
  {
    slug: 'birthday-gifts-by-post',
    title: 'Birthday gifts by post',
    action: 'rewrite_existing_article',
    target: '/blog/birthday-gifts-by-post',
    patterns: [/\bbirthday gifts? by post\b/, /\bbirthday cake hamper/, /\bonline cake gift delivery/]
  },
  {
    slug: 'cake-cards-and-cake-slice-gifts',
    title: 'Cake cards and cake slice gifts',
    action: 'rewrite_existing_article',
    target: '/blog/cake-cards-and-cake-slice-gifts',
    patterns: [/\bcake gift card\b/, /\bcake slice gift\b/, /\bletterbox birthday cake\b/, /\bbirthday cake post\b/]
  },
  {
    slug: 'wedding-cakes-canonical',
    title: 'Broad wedding cakes',
    action: 'support_existing_page',
    target: '/wedding-cakes',
    patterns: [/\bwedding cakes? leeds\b/, /\bnut free wedding cakes\b/, /\bwedding cake near me\b/]
  },
  {
    slug: 'wedding-cake-flavours-guide',
    title: 'Wedding cake flavours and Ukrainian wedding traditions',
    action: 'rewrite_existing_article',
    target: '/blog/wedding-cake-flavours-guide',
    patterns: [/\bukrainian wedding cake\b/, /\bukrainian wedding bread\b/, /\bmedovik wedding cake\b/]
  },
  {
    slug: 'cake-storage-and-preservation-guide',
    title: 'Cake storage and preservation',
    action: 'new_article',
    target: '/blog/cake-storage-and-preservation-guide',
    patterns: [/\bcake preservation\b/, /\bhow to preserve cake\b/, /\bhow to store cake\b/, /\bhoney cake lasts\b/, /\bshould honey cake be refrigerated\b/]
  },
  {
    slug: 'cake-size-and-portions-guide',
    title: 'Cake size and portions',
    action: 'new_article',
    target: '/blog/cake-size-and-portions-guide',
    patterns: [/\bcake servings\b/, /\bcake portion/, /\bwhat size cake to feed\b/, /\bcake size/]
  },
  {
    slug: 'valentines-cake-delivery-guide',
    title: 'Valentine season',
    action: 'new_article',
    target: '/blog/valentines-cake-delivery-guide',
    patterns: [/\bvalentine/]
  },
  {
    slug: 'easter-cakes-to-order-guide',
    title: 'Easter season',
    action: 'new_article',
    target: '/blog/easter-cakes-to-order-guide',
    patterns: [/\beaster/]
  },
  {
    slug: 'halloween-cakes-delivery-guide',
    title: 'Halloween season',
    action: 'new_article',
    target: '/blog/halloween-cakes-delivery-guide',
    patterns: [/\bhalloween/]
  },
  {
    slug: 'ukrainian-christmas-cakes-and-desserts-guide',
    title: 'Christmas season',
    action: 'new_article',
    target: '/blog/ukrainian-christmas-cakes-and-desserts-guide',
    patterns: [/\bchristmas\b/, /\bxmas\b/]
  }
]

function parseNumber(value: unknown) {
  if (typeof value === 'number') {
    return value
  }

  const parsed = Number(String(value).replace(/,/g, '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

function parseCtr(value: unknown) {
  if (typeof value === 'number') {
    return value > 1 ? value / 100 : value
  }

  const normalized = String(value).trim()

  if (normalized.endsWith('%')) {
    return parseNumber(normalized.slice(0, -1)) / 100
  }

  return parseNumber(normalized)
}

export function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function isBrandedQuery(query: string) {
  const normalized = normalizeText(query)
  return /\bolgish\b/.test(normalized) || /\bolga cakes?\b/.test(normalized) || /\bolgish cakes?\b/.test(normalized)
}

export function parseWorkbook(filePath: string) {
  const workbook = xlsx.readFile(filePath)
  const queryRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets.Queries, { defval: '' })
  const pageRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets.Pages, { defval: '' })
  const filterRows = xlsx.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets.Filters, { defval: '' })

  const queries: QueryMetricRow[] = queryRows.map((row: Record<string, unknown>) => ({
    query: String(row['Top queries'] || '').trim(),
    clicks: parseNumber(row.Clicks),
    impressions: parseNumber(row.Impressions),
    ctr: parseCtr(row.CTR),
    position: parseNumber(row.Position)
  })).filter((row: QueryMetricRow) => row.query.length > 0)

  const pages: PageMetricRow[] = pageRows.map((row: Record<string, unknown>) => ({
    page: String(row['Top pages'] || '').trim(),
    clicks: parseNumber(row.Clicks),
    impressions: parseNumber(row.Impressions),
    ctr: parseCtr(row.CTR),
    position: parseNumber(row.Position)
  })).filter((row: PageMetricRow) => row.page.length > 0)

  const filters: FilterRow[] = filterRows.map((row: Record<string, unknown>) => ({
    filter: String(row.Filter || '').trim(),
    value: String(row.Value || '').trim()
  })).filter((row: FilterRow) => row.filter.length > 0)

  return { queries, pages, filters }
}

function matchCluster(query: string) {
  return clusterDefinitions.find((definition) =>
    definition.patterns.some((pattern) => pattern.test(query))
  )
}

export function buildClusterReport(filePath: string) {
  const { queries, pages, filters } = parseWorkbook(filePath)
  const clusterMap = new Map<string, ClusterReportItem>()
  let brandedExcludedCount = 0

  for (const row of queries) {
    if (isBrandedQuery(row.query)) {
      brandedExcludedCount += 1
      continue
    }

    const cluster = matchCluster(row.query.toLowerCase())

    if (!cluster) {
      continue
    }

    const existing = clusterMap.get(cluster.slug)

    if (existing) {
      existing.clicks += row.clicks
      existing.impressions += row.impressions
      existing.position += row.position * row.impressions
      existing.matchedQueries.push(row.query)
      continue
    }

    clusterMap.set(cluster.slug, {
      slug: cluster.slug,
      title: cluster.title,
      action: cluster.action,
      target: cluster.target,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: 0,
      position: row.position * row.impressions,
      matchedQueries: [row.query]
    })
  }

  const clusters = Array.from(clusterMap.values())
    .map((cluster) => ({
      ...cluster,
      ctr: cluster.impressions > 0 ? cluster.clicks / cluster.impressions : 0,
      position: cluster.impressions > 0 ? cluster.position / cluster.impressions : 0,
      matchedQueries: Array.from(new Set(cluster.matchedQueries)).sort()
    }))
    .filter((cluster) => cluster.impressions >= 20 || cluster.clicks >= 1)
    .sort((a, b) => b.impressions - a.impressions)

  const fileName = path.basename(filePath)
  const sourceDate = fileName.match(/(\d{4}-\d{2}-\d{2})/)?.[1] || 'unknown-date'

  return {
    sourceFile: fileName,
    sourceDate,
    filters: Object.fromEntries(filters.map((row) => [row.filter, row.value])),
    queryCount: queries.length,
    brandedExcludedCount,
    clusters,
    topPages: pages.slice(0, 10)
  } satisfies GscPlanningReport
}

export function toMarkdownReport(report: GscPlanningReport) {
  const lines = [
    '# GSC Cluster Report',
    '',
    `Source file: \`${report.sourceFile}\``,
    `Source date: \`${report.sourceDate}\``,
    `Queries parsed: \`${report.queryCount}\``,
    `Branded queries excluded: \`${report.brandedExcludedCount}\``,
    '',
    '## Filters',
    ''
  ]

  for (const [filter, value] of Object.entries(report.filters)) {
    lines.push(`- ${filter}: ${value}`)
  }

  lines.push('', '## Clusters', '')

  for (const cluster of report.clusters) {
    lines.push(`### ${cluster.title}`)
    lines.push('')
    lines.push(`- action: \`${cluster.action}\``)
    lines.push(`- target: \`${cluster.target}\``)
    lines.push(`- clicks: \`${cluster.clicks}\``)
    lines.push(`- impressions: \`${cluster.impressions}\``)
    lines.push(`- ctr: \`${(cluster.ctr * 100).toFixed(2)}%\``)
    lines.push(`- position: \`${cluster.position.toFixed(2)}\``)
    lines.push('- matched queries:')
    cluster.matchedQueries.forEach((query) => {
      lines.push(`  - ${query}`)
    })
    lines.push('')
  }

  lines.push('## Top Pages', '')

  for (const page of report.topPages) {
    lines.push(`- ${page.page} | clicks: ${page.clicks} | impressions: ${page.impressions} | position: ${page.position.toFixed(2)}`)
  }

  lines.push('')

  return lines.join('\n')
}

function getRequiredFileArg(argv: string[]) {
  const fileFlagIndex = argv.findIndex((value) => value === '--file')

  if (fileFlagIndex === -1 || !argv[fileFlagIndex + 1]) {
    throw new Error('Missing required --file argument')
  }

  return argv[fileFlagIndex + 1]
}

export function writeClusterReport(filePath: string) {
  const report = buildClusterReport(filePath)
  const outputDir = path.join(process.cwd(), 'docs', 'blog')
  const baseName = `gsc-clusters-${report.sourceDate}`
  const jsonPath = path.join(outputDir, `${baseName}.json`)
  const markdownPath = path.join(outputDir, `${baseName}.md`)

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  fs.writeFileSync(markdownPath, `${toMarkdownReport(report)}\n`, 'utf8')

  return {
    jsonPath,
    markdownPath,
    report
  }
}

if (process.argv[1]?.endsWith('plan-gsc-articles.ts')) {
  try {
    const filePath = getRequiredFileArg(process.argv.slice(2))
    const result = writeClusterReport(filePath)
    console.log(`Wrote ${result.jsonPath}`)
    console.log(`Wrote ${result.markdownPath}`)
  } catch (error: unknown) {
    console.error(error)
    process.exitCode = 1
  }
}
