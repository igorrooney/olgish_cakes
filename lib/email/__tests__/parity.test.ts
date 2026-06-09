/**
 * @jest-environment node
 */
import { renderEmailTemplate } from '../renderers'
import { sendEmail } from '../service'
import { clearCapturedEmails, getCapturedEmails } from '../transport'

describe('email render/send parity', () => {
  beforeEach(() => {
    clearCapturedEmails()
  })

  it('uses the same rendered output for service sends as direct preview rendering', async () => {
    const input = {
      customerName: 'Parity User',
      customerEmail: 'parity@example.com',
      orderNumber: 'OC-2001',
      productName: 'Kyiv Cake',
      totalPrice: 55
    }

    const preview = renderEmailTemplate('contact-inline-order-customer', input)
    const sendResult = await sendEmail({
      templateId: 'contact-inline-order-customer',
      input,
      modeOverride: 'capture',
      message: {
        from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: 'parity@example.com'
      }
    })

    expect(sendResult.accepted).toBe(true)
    expect(sendResult.rendered.subject).toBe(preview.subject)
    expect(sendResult.rendered.text).toBe(preview.text)
    expect(sendResult.rendered.html).toBe(preview.html)
  })

  it('uses the hosted customer email logo without adding an inline attachment', async () => {
    const sendResult = await sendEmail({
      templateId: 'custom-cake-enquiry-customer',
      input: {
        orderType: 'custom-cake-enquiry',
        customerName: 'Logo User',
        customerEmail: 'logo@example.com'
      },
      modeOverride: 'capture',
      message: {
        from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: 'logo@example.com'
      }
    })

    expect(sendResult.accepted).toBe(true)
    expect(sendResult.rendered.html).toContain('src="https://olgishcakes.co.uk/images/olgish-cakes-email-logo.png"')
    expect(sendResult.rendered.html).not.toContain('src="cid:olgish-cakes-email-logo"')
    expect(getCapturedEmails()[0]?.message.attachments).toBeUndefined()
  })
})
