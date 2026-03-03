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

