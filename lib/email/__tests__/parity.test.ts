/**
 * @jest-environment node
 */
import { renderEmailTemplate } from '../renderers'
import { sendEmail } from '../service'

describe('email render/send parity', () => {
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
})
