import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { designTokens } from '../lib/design-system'
import {
  CURRENT_LEGAL_DATE,
  CURRENT_TERMS_VERSION,
  LEGAL_BUSINESS_DETAILS
} from '../lib/legal/legal-config'
import { termsSections, termsSummaryItems } from '../lib/legal/terms-content'

const temporaryDirectory = path.join(process.cwd(), 'tmp', 'pdfs')
const outputPath = path.join(temporaryDirectory, 'terms-content.json')

async function exportTermsPdfContent() {
  await mkdir(temporaryDirectory, { recursive: true })

  await writeFile(
    outputPath,
    JSON.stringify({
      title: 'Olgish Cakes Terms of Service',
      subtitle: 'Customer terms for orders from our Leeds bakery',
      updated: CURRENT_LEGAL_DATE,
      version: CURRENT_TERMS_VERSION,
      business: LEGAL_BUSINESS_DETAILS,
      summary: termsSummaryItems,
      sections: termsSections,
      colors: {
        primary: designTokens.colors.primary.dark,
        secondary: designTokens.colors.secondary.main,
        text: designTokens.colors.text.primary,
        muted: designTokens.colors.text.secondary,
        background: designTokens.colors.background.default,
        border: designTokens.colors.border.light
      }
    }, null, 2),
    'utf8'
  )
}

exportTermsPdfContent().catch((error: unknown) => {
  console.error('Failed to export terms PDF content', error)
  process.exitCode = 1
})
