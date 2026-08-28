import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { EmailMessage } from '@/lib/email/types'
import {
  CURRENT_TERMS_PDF_FILENAME,
  CURRENT_TERMS_VERSION,
  getTermsPdfPath
} from './legal-config'

export type TermsEmailAttachment = NonNullable<EmailMessage['attachments']>[number]

export async function getTermsEmailAttachment(
  version: string = CURRENT_TERMS_VERSION
): Promise<TermsEmailAttachment> {
  const resolvedVersion = /^\d{4}-\d{2}-\d{2}$/.test(version)
    ? version
    : CURRENT_TERMS_VERSION
  const publicPath = getTermsPdfPath(resolvedVersion)
  const absolutePath = path.join(
    process.cwd(),
    'public',
    ...publicPath.split('/').filter(Boolean)
  )
  const content = await readFile(absolutePath)
  const filename = resolvedVersion === CURRENT_TERMS_VERSION
    ? CURRENT_TERMS_PDF_FILENAME
    : `olgish-cakes-terms-${resolvedVersion}.pdf`

  return {
    filename,
    content,
    contentType: 'application/pdf'
  }
}
