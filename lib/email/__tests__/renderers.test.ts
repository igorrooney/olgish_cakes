/**
 * @jest-environment node
 */
import { buildTemplateExampleInput, renderEmailTemplate } from '../renderers'

describe('email renderers', () => {
  it('renders required fields for admin templates', () => {
    const rendered = renderEmailTemplate('contact-inline-order-admin', {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      orderNumber: 'OC-1001',
      productName: 'Kyiv Cake',
      totalPrice: 45,
      dateNeeded: '2026-03-20'
    })

    expect(rendered.subject).toContain('OC-1001')
    expect(rendered.text).toContain('Order number')
    expect(rendered.text).toContain('Date needed')
    expect(rendered.html).toContain('Kyiv Cake')
  })

  it('renders all submitted homepage enquiry details for customer emails', () => {
    const rendered = renderEmailTemplate('custom-cake-enquiry-customer', {
      orderType: 'custom-cake-enquiry',
      customerName: 'Igor Ieromenko',
      customerEmail: 'igor@example.com',
      customerPhone: '+44 786 721 8194',
      address: '1 Cake Street',
      city: 'Leeds',
      postcode: 'LS17 1AA',
      dateNeeded: '2026-05-25',
      occasion: 'Mother\'s Day Gifts',
      customerMessage: 'test requirements',
      attachmentNames: ['reference.jpg']
    })

    expect(rendered.subject).toBe('Custom cake enquiry received')
    expect(rendered.text).toContain('I\'ve received your details and will check availability before getting back to you.')
    expect(rendered.text).toContain('Contact Details')
    expect(rendered.text).toContain('Name: Igor Ieromenko')
    expect(rendered.text).toContain('Email: igor@example.com')
    expect(rendered.text).toContain('Phone: +44 7867 218194')
    expect(rendered.text).toContain('Address: 1 Cake Street')
    expect(rendered.text).toContain('City: Leeds')
    expect(rendered.text).toContain('Postcode: LS17 1AA')
    expect(rendered.text).toContain('Date needed: 25/05/2026')
    expect(rendered.text).toContain('Occasion: Mother\'s Day Gifts')
    expect(rendered.text).toContain('Customer message: test requirements')
    expect(rendered.text).toContain('Reference image uploaded: reference.jpg')
    expect(rendered.html).toContain('Contact details')
    expect(rendered.html).toContain('Cake details')
    expect(rendered.html).toContain('reference.jpg')
    expect(rendered.html).toContain('src="cid:olgish-cakes-email-logo"')
    expect(rendered.html).toContain('width="112" height="112"')
    expect(rendered.html).not.toContain('olgish-cakes-email-logo.png')
    expect(rendered.html).not.toContain('olgish-cakes-logo-bakery-brand.png')
    expect(rendered.html).not.toContain('olgish-cakes-logo-bakery-brand-128.webp')
    expect(rendered.html).toContain('font-family: Inter, Arial, Helvetica, sans-serif')
    expect(rendered.html).toContain('font-family: \'More Sugar\', \'Trebuchet MS\', Arial, Helvetica, sans-serif')
    expect(rendered.html).toContain('background-color: #FFF5E6')
    expect(rendered.html).toContain('background-color: #FFFBEB')
    expect(rendered.html).toContain('background-color: #2E3192')
  })

  it('omits empty optional fields', () => {
    const rendered = renderEmailTemplate('contact-admin-inquiry', {
      customerName: 'Jane',
      customerEmail: 'jane@example.com'
    })

    expect(rendered.text).toContain('Name: Jane')
    expect(rendered.text).not.toContain('Date needed:')
    expect(rendered.html).not.toContain('Date needed')
  })

  it('escapes dangerous input', () => {
    const rendered = renderEmailTemplate('contact-inline-order-customer', {
      customerName: '<script>alert(1)</script>',
      customerMessage: '<img src=x onerror=alert(1) />'
    })

    expect(rendered.html).not.toContain('<script>')
    expect(rendered.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(rendered.html).toContain('&lt;img src=x onerror=alert(1) /&gt;')
  })

  it('renders gift note in customer inline order emails when provided', () => {
    const rendered = renderEmailTemplate('contact-inline-order-customer', {
      customerName: 'Jane',
      customerEmail: 'jane@example.com',
      giftNote: 'Happy birthday!'
    })

    expect(rendered.text).toContain('Gift note: Happy birthday!')
    expect(rendered.html).toContain('Gift note')
  })

  it('keeps order labels for non-enquiry customer emails', () => {
    const rendered = renderEmailTemplate('orders-customer-confirmation', {
      customerName: 'Jane',
      orderNumber: 'OC-ORDER-LABELS-1',
      occasion: 'Birthday',
      customerMessage: 'Please include candles'
    })

    expect(rendered.text).toContain('Order Summary')
    expect(rendered.text).toContain('Order Preferences')
    expect(rendered.text).not.toContain('Enquiry Summary')
    expect(rendered.text).not.toContain('Cake Details')
    expect(rendered.html).toContain('Order Summary')
    expect(rendered.html).toContain('Order Preferences')
    expect(rendered.html).not.toContain('Enquiry summary')
    expect(rendered.html).not.toContain('Cake details')
  })

  it('keeps date and currency formatting deterministic', () => {
    const rendered = renderEmailTemplate('orders-admin-notification', {
      orderNumber: 'OC-1002',
      dateNeeded: '2026-03-21',
      totalPrice: 125
    })

    expect(rendered.text).toContain('21/03/2026')
    expect(rendered.text).toContain('\u00A3125')
  })

  it('builds default sample payloads', () => {
    const sample = buildTemplateExampleInput('custom-cake-enquiry-customer')

    expect(sample.customerName).toBeDefined()
    expect(sample.customerEmail).toBeDefined()
    expect(sample.productName).toBeDefined()
  })
  it('renders Instagram token reminder alerts with expiry guidance', () => {
    const rendered = renderEmailTemplate('instagram-token-refresh-alert', {
      customerName: 'Olgish Cakes team',
      productName: 'Instagram access token',
      dateNeeded: '2026-06-05T08:00:00.000Z',
      titleOverride: 'Instagram token expires in 5 days',
      message: 'The current Instagram token expires in 5 days.',
      note: 'Run pnpm instagram:refresh-token and update INSTAGRAM_TOKEN_EXPIRES_AT.'
    })

    expect(rendered.subject).toBe('Instagram token expires in 5 days')
    expect(rendered.text).toContain('Instagram access token')
    expect(rendered.text).toContain('05/06/2026')
    expect(rendered.html).toContain('Instagram access token')
    expect(rendered.html).toContain('Run pnpm instagram:refresh-token')
  })
  it('renders tracking number for out-for-delivery status updates', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Jane',
      orderNumber: 'OC-TRACK-1',
      status: 'out-for-delivery',
      trackingNumber: 'TRACK-123456'
    })

    expect(rendered.text).toContain('Tracking number: TRACK-123456')
    expect(rendered.html).toContain('Tracking number')
    expect(rendered.html).toContain('TRACK-123456')
  })

  it('does not render tracking number for non-delivery statuses', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Jane',
      orderNumber: 'OC-TRACK-2',
      status: 'confirmed',
      trackingNumber: 'TRACK-123456'
    })

    expect(rendered.text).not.toContain('Tracking number: TRACK-123456')
    expect(rendered.html).not.toContain('Tracking number')
  })

  it('does not render default onboarding steps for status updates without next steps', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Jane',
      orderNumber: 'OC-NEXT-STATUS-1',
      status: 'confirmed'
    })

    expect(rendered.text).not.toContain('What happens next?')
    expect(rendered.text).not.toContain('We\'ll review your order and confirm all details within 24 hours')
    expect(rendered.html).not.toContain('What happens next?')
    expect(rendered.html).not.toContain('We\'ll review your order and confirm all details within 24 hours')
  })

  it('renders default onboarding steps for customer confirmation without explicit next steps', () => {
    const rendered = renderEmailTemplate('orders-customer-confirmation', {
      customerName: 'Jane',
      orderNumber: 'OC-NEXT-CONFIRM-1'
    })

    expect(rendered.text).toContain('What happens next?')
    expect(rendered.text).toContain('We\'ll review your order and confirm all details within 24 hours')
    expect(rendered.html).toContain('What happens next?')
    expect(rendered.html).toContain('review your order and confirm all details within 24 hours')
  })
  it('renders Trustpilot review section for completed status updates', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Jane',
      orderNumber: 'OC-REVIEW-1',
      status: 'completed'
    })

    expect(rendered.text).toContain('We\'d love your feedback')
    expect(rendered.text).toContain('Leave a review on Trustpilot: https://uk.trustpilot.com/review/olgishcakes.co.uk')
    expect(rendered.html).toContain('Leave a review on Trustpilot')
    expect(rendered.html).toContain('https://uk.trustpilot.com/review/olgishcakes.co.uk')
  })

  it('does not render Trustpilot review section for non-completed status updates', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Jane',
      orderNumber: 'OC-REVIEW-2',
      status: 'confirmed'
    })

    expect(rendered.text).not.toContain('We\'d love your feedback')
    expect(rendered.text).not.toContain('Leave a review on Trustpilot')
    expect(rendered.html).not.toContain('Leave a review on Trustpilot')
    expect(rendered.html).not.toContain('https://uk.trustpilot.com/review/olgishcakes.co.uk')
  })
  it('renders multiple order items in admin notifications', () => {
    const rendered = renderEmailTemplate('orders-admin-notification', {
      customerName: 'Admin',
      orderNumber: 'OC-MULTI-ADMIN',
      orderItems: [
        {
          productName: 'Honey Cake',
          quantity: 2,
          totalPrice: 40,
          designType: 'Floral piping',
          servings: 'Serves 8'
        },
        {
          productName: 'Napoleon Slice',
          quantity: 1,
          totalPrice: 15
        }
      ]
    })

    expect(rendered.text).toContain('Order items')
    expect(rendered.text).toContain('Honey Cake (Qty: 2) - \u00A340')
    expect(rendered.text).toContain('Napoleon Slice (Qty: 1) - \u00A315')
    expect(rendered.text).toContain('Design type: Floral piping')
    expect(rendered.html).toContain('Order items')
    expect(rendered.html).toContain('Honey Cake')
    expect(rendered.html).toContain('Napoleon Slice')
  })

  it('renders reference image previews in admin notifications', () => {
    const rendered = renderEmailTemplate('orders-admin-notification', {
      customerName: 'Admin',
      orderNumber: 'OC-IMAGE-ADMIN',
      attachmentNames: ['design-reference.jpg'],
      referenceImageUrls: ['https://cdn.sanity.io/images/demo/reference-1.jpg']
    })

    expect(rendered.text).toContain('Attachments: design-reference.jpg')
    expect(rendered.html).toContain('Reference images')
    expect(rendered.html).toContain('https://cdn.sanity.io/images/demo/reference-1.jpg')
    expect(rendered.html).toContain('alt="Reference image 1"')
  })

  it('renders multiple order items in customer confirmation', () => {
    const rendered = renderEmailTemplate('orders-customer-confirmation', {
      customerName: 'Jane',
      orderNumber: 'OC-MULTI-CUSTOMER',
      orderItems: [
        {
          productName: 'Honey Cake',
          quantity: 2,
          totalPrice: 40,
          filling: 'Vanilla'
        },
        {
          productName: 'Napoleon Slice',
          quantity: 1,
          totalPrice: 15
        }
      ]
    })

    expect(rendered.text).toContain('Order items')
    expect(rendered.text).toContain('Honey Cake (Qty: 2) - \u00A340')
    expect(rendered.text).toContain('Napoleon Slice (Qty: 1) - \u00A315')
    expect(rendered.text).toContain('Filling: Vanilla')
    expect(rendered.html).toContain('Order items')
    expect(rendered.html).toContain('Honey Cake')
    expect(rendered.html).toContain('Napoleon Slice')
  })

  it('renders multiple order items in status updates for text and html', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Jane',
      orderNumber: 'OC-MULTI-STATUS',
      status: 'confirmed',
      orderItems: [
        {
          productName: 'Honey Cake',
          quantity: 2,
          totalPrice: 40,
          specialInstructions: 'No nuts'
        },
        {
          productName: 'Napoleon Slice',
          quantity: 1,
          totalPrice: 15
        }
      ]
    })

    expect(rendered.text).toContain('Order items')
    expect(rendered.text).toContain('Honey Cake (Qty: 2) - \u00A340')
    expect(rendered.text).toContain('Napoleon Slice (Qty: 1) - \u00A315')
    expect(rendered.text).toContain('Customer message / requirements: No nuts')
    expect(rendered.html).toContain('Order items')
    expect(rendered.html).toContain('Honey Cake')
    expect(rendered.html).toContain('Napoleon Slice')
  })
})

