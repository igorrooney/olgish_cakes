/**
 * @jest-environment node
 */
import { getTermsEmailAttachment } from '../terms-document'
import {
  CURRENT_TERMS_PDF_FILENAME,
  CURRENT_TERMS_VERSION
} from '../legal-config'

describe('getTermsEmailAttachment', () => {
  it('loads the immutable current terms PDF for customer emails', async () => {
    const attachment = await getTermsEmailAttachment(CURRENT_TERMS_VERSION)

    expect(attachment).toMatchObject({
      filename: CURRENT_TERMS_PDF_FILENAME,
      contentType: 'application/pdf'
    })
    expect(Buffer.isBuffer(attachment.content)).toBe(true)
    expect((attachment.content as Buffer).subarray(0, 4).toString('ascii')).toBe('%PDF')
  })

  it('falls back to the current safe path for an invalid version', async () => {
    const attachment = await getTermsEmailAttachment('../../private')

    expect(attachment.filename).toBe(CURRENT_TERMS_PDF_FILENAME)
    expect(Buffer.isBuffer(attachment.content)).toBe(true)
  })
})
