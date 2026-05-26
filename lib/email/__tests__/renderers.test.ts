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
    expect(rendered.text).toContain('We\'ve received your details and will check availability before getting back to you.')
    expect(rendered.text).toContain('Contact Details')
    expect(rendered.text).toContain('Name: Igor Ieromenko')
    expect(rendered.text).toContain('Email: igor@example.com')
    expect(rendered.text).toContain('Phone: +44 7867 218194')
    expect(rendered.text).toContain('Address: 1 Cake Street')
    expect(rendered.text).toContain('City: Leeds')
    expect(rendered.text).toContain('Postcode: LS17 1AA')
    expect(rendered.text).toContain('Date needed: 25 May 2026')
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

  it('escapes dangerous cakes by post recipient names in email HTML', () => {
    const rendered = renderEmailTemplate('contact-inline-order-customer', {
      customerName: 'Jane Buyer',
      customerEmail: 'jane@example.com',
      deliveryRecipientName: '<img src=x onerror=alert(1)>',
      address: '7 Sample Street',
      city: 'Leeds',
      postcode: 'LS1 1AA',
      orderType: 'gift-hamper',
      productType: 'gift-hamper'
    })

    expect(rendered.html).toContain('&lt;img src=x onerror=alert(1)&gt;')
    expect(rendered.html).not.toContain('<img src=x onerror=alert(1)>')
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

  it('renders cakes by post customer emails with postal next steps and address details only for gift-hamper products', () => {
    const rendered = renderEmailTemplate('contact-inline-order-customer', {
      customerName: 'Jane',
      customerEmail: 'jane@example.com',
      customerPhone: '07123456789',
      deliveryRecipientName: 'Jane Recipient',
      address: '7 Sample Street',
      city: 'Leeds',
      postcode: 'LS1 1AA',
      orderNumber: '26051218421374',
      orderType: 'gift-hamper',
      productName: 'Personalised Congratulations Cake Card',
      productType: 'gift-hamper',
      totalPrice: 8.95,
      dateNeeded: '2026-05-26',
      designType: 'Standard design',
      filling: 'Honey cake',
      servings: 'One card',
      customerMessage: 'Please write congratulations on the card',
      giftNote: 'Happy birthday!'
    })

    expect(rendered.text).toContain('Ordered by')
    expect(rendered.text).toContain('Delivery Details')
    expect(rendered.text).toContain('Recipient: Jane Recipient')
    expect(rendered.text).toContain('Delivery address: 7 Sample Street')
    expect(rendered.text).toContain('Town or city: Leeds')
    expect(rendered.text).toContain('Postcode: LS1 1AA')
    expect(rendered.text).toContain('Customer Notes')
    expect(rendered.text).toContain('Notes: Please write congratulations on the card')
    expect(rendered.text).toContain('Gift Details')
    expect(rendered.text).toContain('Gift note: Happy birthday!')
    expect(rendered.text).toContain('We\'ll review your order and delivery details within 24 hours')
    expect(rendered.text).toContain('If everything is confirmed, we\'ll send you a secure payment link')
    expect(rendered.text).toContain('Once payment is received, we\'ll prepare, pack, and send your cake by post')
    expect(rendered.text).not.toContain('We\'ll contact you with a quote and final design details')
    expect(rendered.text).not.toContain('We\'ll confirm delivery or collection once you approve')
    expect(rendered.text).not.toContain('Customer message:')
    expect(rendered.text).not.toContain('Product type: gift-hamper')
    expect(rendered.text).not.toContain('Design type:')
    expect(rendered.text).not.toContain('Filling:')
    expect(rendered.text).not.toContain('Servings:')
    expect(rendered.html).toContain('Ordered by')
    expect(rendered.html).toContain('Gift Details')
    expect(rendered.html).toContain('Please write congratulations on the card')
    expect(rendered.html).toContain('7 Sample Street')
    expect(rendered.html).not.toContain('Product type: gift-hamper')
    expect(rendered.html).not.toContain('Design type')
  })

  it('hides legacy product metadata from cakes by post customer message rows', () => {
    const rendered = renderEmailTemplate('contact-inline-order-customer', {
      productType: 'gift-hamper',
      customerMessage: 'Product: Personalised Congratulations Cake Card\nProduct type: gift-hamper\nPrice: \u00A38.95'
    })

    expect(rendered.text).not.toContain('Product type: gift-hamper')
    expect(rendered.html).not.toContain('Product type: gift-hamper')
  })

  it('renders concise cakes by post admin emails with geolocation', () => {
    const rendered = renderEmailTemplate('contact-inline-order-admin', {
      customerName: 'Igor Ieromenko',
      customerEmail: 'igor@example.com',
      customerPhone: '+44 7867 218241',
      deliveryRecipientName: 'Gift Recipient',
      address: '15 Allerton Grange Avenue',
      city: 'Leeds',
      postcode: 'LS17 6PR',
      orderNumber: '26051219414558',
      orderType: 'gift-hamper',
      productName: 'Personalised Congratulations Cake Card',
      productId: 'personalised-congratulations-cake-card',
      productType: 'gift-hamper',
      quantity: 1,
      unitPrice: 8.95,
      totalPrice: 8.95,
      dateNeeded: '2026-05-27',
      designType: 'Standard design',
      customerMessage: 'test message',
      message: 'Product: Personalised Congratulations Cake Card\nProduct type: gift-hamper\nPrice: \u00A38.95\nMessage: test message',
      giftNote: 'gift note test',
      deliveryMethod: 'postal',
      deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
      paymentMethod: 'card',
      approximateSubmittedFrom: 'Leeds, ENG, GB',
      adminUrl: 'https://olgishcakes.co.uk/admin/orders/26051219414558'
    })

    expect(rendered.text).toContain('Ordered by')
    expect(rendered.text).toContain('Delivery details')
    expect(rendered.text).toContain('Recipient: Gift Recipient')
    expect(rendered.text).toContain('Order summary')
    expect(rendered.text).toContain('Customer notes')
    expect(rendered.text).toContain('Request context')
    expect(rendered.text).toContain('Notes: test message')
    expect(rendered.text).toContain('Gift note: gift note test')
    expect(rendered.text).toContain('Approx. submitted from: Leeds, ENG, GB')
    expect(rendered.text).toContain('Admin link: https://olgishcakes.co.uk/admin/orders/26051219414558')
    expect(rendered.text).not.toContain('Order type: gift-hamper')
    expect(rendered.text).not.toContain('Product type: gift-hamper')
    expect(rendered.text).not.toContain('Design type')
    expect(rendered.text).not.toContain('Submitted message')
    expect(rendered.html).toContain('Leeds, ENG, GB')
    expect(rendered.html).not.toContain('Product type: gift-hamper')
  })

  it('renders request-safe customer inline cake wording for non-postal products', () => {
    const rendered = renderEmailTemplate('contact-inline-order-customer', {
      customerName: 'Jane',
      customerEmail: 'jane@example.com',
      address: '7 Sample Street',
      city: 'Leeds',
      postcode: 'LS1 1AA',
      orderNumber: 'OC-NON-POSTAL-1',
      productName: 'Honey Cake',
      productType: 'cake',
      totalPrice: 45,
      priceLabel: 'Estimated price',
      dateNeeded: '2026-06-02',
      customerMessage: 'Please add candles',
      nextSteps: [
        'I\'ll review your requested date, cake details, and any design notes within 24 hours.',
        'I\'ll confirm availability, final price, and any design details before you need to pay.',
        'Nothing is booked or payable until we agree the design, price, and collection or delivery details.'
      ]
    })

    expect(rendered.subject).toBe('Order request received #OC-NON-POSTAL-1')
    expect(rendered.subject).not.toContain('Order Confirmation')
    expect(rendered.text).toContain('Order Preferences')
    expect(rendered.text).toContain('Date needed: 2 June 2026')
    expect(rendered.text).toContain('Estimated price: £45')
    expect(rendered.text).toContain('Customer message: Please add candles')
    expect(rendered.text).toContain('I\'ll confirm availability, final price, and any design details before you need to pay.')
    expect(rendered.text).toContain('Nothing is booked or payable until we agree the design, price, and collection or delivery details.')
    expect(rendered.text).not.toContain('Order Confirmation')
    expect(rendered.text).not.toContain('Total Amount')
    expect(rendered.text).not.toContain('Contact Details')
    expect(rendered.text).not.toContain('Address: 7 Sample Street')
    expect(rendered.text).not.toContain('secure payment link')
    expect(rendered.text).not.toContain('send your cake by post')
    expect(rendered.html).toContain('Order Preferences')
    expect(rendered.html).toContain('Estimated price')
    expect(rendered.html).not.toContain('Order Confirmation')
    expect(rendered.html).not.toContain('Contact details')
  })

  it('keeps order labels for non-enquiry customer emails', () => {
    const rendered = renderEmailTemplate('orders-customer-confirmation', {
      customerName: 'Jane',
      orderNumber: 'OC-ORDER-LABELS-1',
      occasion: 'Birthday',
      totalPrice: 55,
      customerMessage: 'Please include candles'
    })

    expect(rendered.text).toContain('Order Summary')
    expect(rendered.text).toContain('Order Preferences')
    expect(rendered.text).toContain('Total Amount: £55')
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
    expect(sample.occasion).toBeDefined()
    expect(sample.customerMessage).toBeDefined()
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

  it('renders concise cakes by post confirmed status updates', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Igor Ieromenko',
      orderNumber: '26051220022842',
      productName: 'Personalised Congratulations Cake Card',
      productId: 'personalised-congratulations-cake-card',
      productType: 'gift-hamper',
      quantity: 1,
      totalPrice: 8.95,
      dateNeeded: '2026-05-26',
      status: 'confirmed',
      paymentStatus: 'pending',
      deliveryMethod: 'postal',
      designType: 'standard',
      customerMessage: 'test message',
      giftNote: 'gift note test',
      deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
      headingOverride: 'Order request confirmed',
      titleOverride: 'Order Request Confirmed #26051220022842 - Olgish Cakes',
      statusMessage: 'Great news, we\'ve confirmed your cakes by post request.'
    })

    expect(rendered.subject).toBe('Order Request Confirmed #26051220022842 - Olgish Cakes')
    expect(rendered.text).toContain('Order request confirmed')
    expect(rendered.text).not.toContain('Order status update')
    expect(rendered.text).toContain('Order Summary')
    expect(rendered.text).toContain('Product: Personalised Congratulations Cake Card')
    expect(rendered.text).toContain('Quantity: 1')
    expect(rendered.text).not.toContain('Payment status:')
    expect(rendered.text).toContain('Delivery Details')
    expect(rendered.text).toContain('Delivery method: By post')
    expect(rendered.text).toContain('Delivery address: 15 Allerton Grange Avenue, Leeds, LS17 6PR')
    expect(rendered.text.match(/Date needed:/g)).toHaveLength(1)
    expect(rendered.text).toContain('Gift Details')
    expect(rendered.text).toContain('Customer Notes')
    expect(rendered.text).toContain('Notes: test message')
    expect(rendered.text).toContain('Gift note: gift note test')
    expect(rendered.text).toContain('secure payment link')
    expect(rendered.text).not.toContain('Order items')
    expect(rendered.text).not.toContain('Product type: gift-hamper')
    expect(rendered.text).not.toContain('Product ID')
    expect(rendered.text).not.toContain('Design type')
    expect(rendered.text).not.toContain('Order Preferences')
    expect(rendered.html).toContain('Order request confirmed')
    expect(rendered.html).not.toContain('Product type: gift-hamper')
  })

  it('renders a distinct next step for cakes by post in-progress status updates', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Igor Ieromenko',
      orderNumber: '26051220022842',
      productName: 'Personalised Congratulations Cake Card',
      productType: 'gift-hamper',
      quantity: 1,
      totalPrice: 8.95,
      dateNeeded: '2026-05-26',
      status: 'in-progress',
      paymentStatus: 'paid',
      deliveryMethod: 'postal',
      customerMessage: 'test message',
      giftNote: 'gift note test',
      deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
      headingOverride: 'Order in progress',
      titleOverride: 'Order In Progress #26051220022842 - Olgish Cakes',
      statusMessage: 'Your cakes by post order is now being prepared.'
    })

    expect(rendered.text).toContain('Your cakes by post order is now being prepared.')
    expect(rendered.text).toContain('Next step')
    expect(rendered.text).toContain('We\'ll prepare and pack your cake, then send another update when it is ready for dispatch.')
    expect(rendered.text.match(/Your cakes by post order is now being prepared\./g)).toHaveLength(1)
    expect(rendered.html).toContain('ready for dispatch')
  })

  it('renders courier-specific cakes by post tracking links for out-for-delivery updates', () => {
    const royalMail = renderEmailTemplate('orders-status-update', {
      customerName: 'Igor Ieromenko',
      orderNumber: '26051220022842',
      productName: 'Personalised Congratulations Cake Card',
      productType: 'gift-hamper',
      quantity: 1,
      totalPrice: 8.95,
      dateNeeded: '2026-05-26',
      status: 'out-for-delivery',
      paymentStatus: 'paid',
      deliveryMethod: 'postal',
      deliveryCourier: 'royal-mail',
      trackingNumber: 'TRACK-123456',
      deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
      headingOverride: 'Order dispatched',
      titleOverride: 'Order Dispatched #26051220022842 - Olgish Cakes',
      statusMessage: 'Great news, your cakes by post order has been dispatched with Royal Mail.'
    })
    const evri = renderEmailTemplate('orders-status-update', {
      customerName: 'Igor Ieromenko',
      orderNumber: '26051220022842',
      productName: 'Personalised Congratulations Cake Card',
      productType: 'gift-hamper',
      quantity: 1,
      totalPrice: 8.95,
      dateNeeded: '2026-05-26',
      status: 'out-for-delivery',
      paymentStatus: 'paid',
      deliveryMethod: 'postal',
      deliveryCourier: 'evri',
      trackingNumber: 'H02X8A0022918652',
      deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
      headingOverride: 'Order dispatched',
      titleOverride: 'Order Dispatched #26051220022842 - Olgish Cakes',
      statusMessage: 'Great news, your cakes by post order has been dispatched with Evri.'
    })

    expect(royalMail.subject).toBe('Order Dispatched #26051220022842 - Olgish Cakes')
    expect(royalMail.text).toContain('Order dispatched')
    expect(royalMail.text).toContain('Courier: Royal Mail')
    expect(royalMail.text).toContain('Tracking number: TRACK-123456')
    expect(royalMail.text).toContain('Track your parcel: https://www.royalmail.com/track-your-item#/tracking-results/TRACK-123456')
    expect(royalMail.text).toContain('Royal Mail will update the tracking as your parcel moves through their network.')
    expect(royalMail.html).toContain('https://www.royalmail.com/track-your-item#/tracking-results/TRACK-123456')
    expect(royalMail.text.match(/Tracking number/g)).toHaveLength(1)
    expect(royalMail.text).not.toContain('Customer Notes')
    expect(royalMail.text).not.toContain('Gift Details')

    expect(evri.text).toContain('Courier: Evri')
    expect(evri.text).toContain('Track your parcel: https://www.evri.com/track/parcel/H02X8A0022918652/details')
    expect(evri.text).toContain('Evri will update the tracking as your parcel moves through their network.')
    expect(evri.html).toContain('https://www.evri.com/track/parcel/H02X8A0022918652/details')
  })

  it('defaults cakes by post tracking emails to Evri when no courier is stored', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Igor Ieromenko',
      orderNumber: '26051220022842',
      productName: 'Personalised Congratulations Cake Card',
      productType: 'gift-hamper',
      quantity: 1,
      totalPrice: 8.95,
      status: 'out-for-delivery',
      paymentStatus: 'paid',
      deliveryMethod: 'postal',
      trackingNumber: 'H02X8A0022918652',
      deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
      headingOverride: 'Order dispatched',
      titleOverride: 'Order Dispatched #26051220022842 - Olgish Cakes',
      statusMessage: 'Great news, your cakes by post order has been dispatched with Evri.'
    })

    expect(rendered.text).toContain('Courier: Evri')
    expect(rendered.text).toContain('Track your parcel: https://www.evri.com/track/parcel/H02X8A0022918652/details')
    expect(rendered.text).toContain('Evri will update the tracking as your parcel moves through their network.')
  })

  it('renders concise cakes by post delivered updates with courier tracking and support next step', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Igor Ieromenko',
      orderNumber: '26051220022842',
      productName: 'Personalised Congratulations Cake Card',
      productType: 'gift-hamper',
      quantity: 1,
      totalPrice: 8.95,
      dateNeeded: '2026-05-26',
      status: 'delivered',
      paymentStatus: 'paid',
      deliveryMethod: 'postal',
      deliveryCourier: 'royal-mail',
      trackingNumber: '1234567',
      deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
      headingOverride: 'Order delivered',
      titleOverride: 'Order Delivered #26051220022842 - Olgish Cakes',
      statusMessage: 'Your cakes by post order has been delivered. We hope it arrived safely and is enjoyed.'
    })

    expect(rendered.subject).toBe('Order Delivered #26051220022842 - Olgish Cakes')
    expect(rendered.text).toContain('Your cakes by post order has been delivered. We hope it arrived safely and is enjoyed.')
    expect(rendered.text).toContain('Courier: Royal Mail')
    expect(rendered.text).toContain('Tracking number: 1234567')
    expect(rendered.text).toContain('Track your parcel: https://www.royalmail.com/track-your-item#/tracking-results/1234567')
    expect(rendered.text).toContain('If anything doesn\'t look right, please contact us today and we\'ll help.')
    expect(rendered.text).not.toContain('Thank you for choosing Olgish Cakes. We hope you enjoy your order.')
    expect(rendered.html).toContain('https://www.royalmail.com/track-your-item#/tracking-results/1234567')
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

  it('renders Trustpilot review section for cakes by post completed status updates', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Igor Ieromenko',
      orderNumber: '26051220022842',
      productName: 'Personalised Congratulations Cake Card',
      productType: 'gift-hamper',
      quantity: 1,
      totalPrice: 8.95,
      status: 'completed',
      paymentStatus: 'paid',
      deliveryMethod: 'postal',
      deliveryCourier: 'royal-mail',
      trackingNumber: '1234567',
      deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
      headingOverride: 'Order completed',
      titleOverride: 'Order Completed #26051220022842 - Olgish Cakes',
      statusMessage: 'Thank you for choosing Olgish Cakes. Your cakes by post order has been completed.'
    })

    expect(rendered.text).toContain('Order Summary')
    expect(rendered.text).toContain('Delivery Details')
    expect(rendered.text).toContain('We\'d love your feedback')
    expect(rendered.text).toContain('Leave a review on Trustpilot: https://uk.trustpilot.com/review/olgishcakes.co.uk')
    expect(rendered.text).not.toContain('Next step')
    expect(rendered.html).toContain('Leave a review on Trustpilot')
    expect(rendered.html).toContain('https://uk.trustpilot.com/review/olgishcakes.co.uk')
  })

  it('renders cakes by post cancelled updates without delivery or tracking details', () => {
    const rendered = renderEmailTemplate('orders-status-update', {
      customerName: 'Igor Ieromenko',
      orderNumber: '26051219414558',
      productName: 'Personalised Congratulations Cake Card',
      productType: 'gift-hamper',
      quantity: 1,
      totalPrice: 8.95,
      dateNeeded: '2026-05-27',
      status: 'cancelled',
      paymentStatus: 'pending',
      deliveryMethod: 'postal',
      deliveryCourier: 'evri',
      trackingNumber: '12345678',
      deliveryAddress: '15 Allerton Grange Avenue, Leeds, LS17 6PR',
      headingOverride: 'Order cancelled',
      titleOverride: 'Order Cancelled #26051219414558 - Olgish Cakes',
      statusMessage: 'Your cakes by post order has been cancelled. If you have any questions, please contact us and we\'ll help.'
    })

    expect(rendered.text).toContain('Your cakes by post order has been cancelled. If you have any questions, please contact us and we\'ll help.')
    expect(rendered.text).toContain('Next step')
    expect(rendered.text).toContain('If you have any questions, please reply to this email or call us.')
    expect(rendered.text).not.toContain('Delivery Details')
    expect(rendered.text).not.toContain('Courier: Evri')
    expect(rendered.text).not.toContain('Tracking number')
    expect(rendered.text).not.toContain('Track your parcel')
    expect(rendered.html).not.toContain('Delivery Details')
    expect(rendered.html).not.toContain('12345678')
    expect(rendered.html).not.toContain('evri.com/track')
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

