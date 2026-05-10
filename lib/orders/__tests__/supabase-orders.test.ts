import { getSupabaseAdminClient } from '@/lib/supabase-admin-client'
import {
  buildSupabaseOrderMessagePayloads,
  buildSupabaseOrderItemPayloads,
  buildSupabaseOrderNotePayloads,
  buildSupabaseOrderPayload,
  mapSupabaseOrderMessageAttachmentRow,
  mapSupabaseOrderMessageRow,
  mapSupabaseOrderItemRow,
  mapSupabaseOrderNoteImageRow,
  mapSupabaseOrderNoteRow,
  mapSupabaseOrderRow,
  signSupabaseOrderImageUrls
} from '@/lib/orders/supabase-orders'
import type { Order, OrderMessage, OrderNote } from '@/types/order'

jest.mock('@/lib/supabase-admin-client', () => ({
  getSupabaseAdminClient: jest.fn()
}))

const mockCreateSignedUrl = jest.fn()
const mockStorageFrom = jest.fn(() => ({
  createSignedUrl: mockCreateSignedUrl
}))

const mockedGetSupabaseAdminClient = jest.mocked(getSupabaseAdminClient)

const buildOrder = (): Order => ({
  _id: 'order-id',
  _createdAt: '2026-04-27T18:32:51.000Z',
  _updatedAt: '2026-04-27T18:32:51.000Z',
  orderNumber: '26042718325184',
  status: 'new',
  orderType: 'custom-design',
  customer: {
    name: 'Customer',
    email: 'customer@example.com',
    phone: '07123456789'
  },
  items: [{
    productName: 'Custom cake',
    quantity: 1,
    totalPrice: 58
  }],
  delivery: {
    deliveryMethod: 'collection'
  },
  pricing: {
    total: 58,
    paymentStatus: 'pending'
  },
  messages: [{
    message: 'Reference image attached',
    attachments: [{
      _type: 'image',
      asset: {
        _type: 'supabase-file',
        _id: 'orders/26042718325184/references/logo.png',
        _ref: 'orders/26042718325184/references/logo.png',
        url: 'https://example.supabase.co/storage/v1/object/public/custom-cake-enquiries/orders/26042718325184/references/logo.png'
      },
      alt: 'logo.png'
    }]
  }],
  notes: [{
    note: 'Admin note',
    author: 'Admin',
    createdAt: '2026-04-27T18:45:00.000Z',
    images: [{
      _type: 'image',
      asset: {
        _type: 'supabase-file',
        _id: 'orders/order-id/notes/note.png',
        _ref: 'orders/order-id/notes/note.png',
        url: 'https://example.supabase.co/storage/v1/object/public/custom-cake-enquiries/orders/order-id/notes/note.png'
      },
      alt: 'note.png'
    }]
  }]
})

describe('signSupabaseOrderImageUrls', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateSignedUrl
      .mockResolvedValueOnce({
        data: { signedUrl: 'https://example.supabase.co/storage/v1/object/sign/custom-cake-enquiries/orders/26042718325184/references/logo.png?token=reference-token' },
        error: null
      })
      .mockResolvedValueOnce({
        data: { signedUrl: 'https://example.supabase.co/storage/v1/object/sign/custom-cake-enquiries/orders/order-id/notes/note.png?token=note-token' },
        error: null
      })

    mockedGetSupabaseAdminClient.mockReturnValue({
      storage: {
        from: mockStorageFrom
      }
    } as ReturnType<typeof getSupabaseAdminClient>)
  })

  it('replaces private Supabase order image URLs with signed URLs', async () => {
    const signedOrder = await signSupabaseOrderImageUrls(buildOrder())

    expect(mockStorageFrom).toHaveBeenCalledWith('custom-cake-enquiries')
    expect(mockCreateSignedUrl).toHaveBeenNthCalledWith(
      1,
      'orders/26042718325184/references/logo.png',
      60 * 60
    )
    expect(mockCreateSignedUrl).toHaveBeenNthCalledWith(
      2,
      'orders/order-id/notes/note.png',
      60 * 60
    )
    expect(signedOrder.messages?.[0]?.attachments?.[0]?.asset.url).toContain('/object/sign/')
    expect(signedOrder.messages?.[0]?.attachments?.[0]?.asset.url).toContain('reference-token')
    expect(signedOrder.notes?.[0]?.images?.[0]?.asset.url).toContain('/object/sign/')
    expect(signedOrder.notes?.[0]?.images?.[0]?.asset.url).toContain('note-token')
  })
})

describe('Supabase order row mapping', () => {
  const row = {
    id: 'order-id',
    sanity_id: null,
    order_number: '26042718325184',
    status: 'new',
    order_type: 'custom-design',
    metadata: {},
    customer_name: 'Structured Customer',
    customer_email: 'structured@example.com',
    customer_phone: '07123456789',
    customer_address: '10 Example Street',
    customer_city: 'Leeds',
    customer_postcode: 'LS1 1AA',
    date_needed: '2026-07-26',
    delivery_method: 'postal',
    delivery_address: '10 Example Street, Leeds, LS1 1AA',
    delivery_notes: 'Leave with reception',
    gift_note: 'Happy birthday',
    tracking_number: 'TRACK-1',
    subtotal: '60.00',
    delivery_fee: '5.00',
    discount: '0.00',
    total_price: '65.00',
    payment_status: 'paid',
    payment_method: 'card',
    created_at: '2026-04-27T18:32:51.000Z',
    updated_at: '2026-04-27T18:32:51.000Z'
  }

  it('maps structured order fields and relational children', () => {
    const relationalItems = [{
      productName: 'Relational Cake',
      quantity: 2,
      unitPrice: 30,
      totalPrice: 60
    }]
    const relationalMessages = [{
      message: 'Please use this image',
      attachments: []
    }]
    const relationalNotes = [{
      note: 'Internal reminder',
      author: 'Admin',
      createdAt: '2026-04-27T18:45:00.000Z',
      images: []
    }]

    const order = mapSupabaseOrderRow(row, relationalItems, relationalMessages, relationalNotes)

    expect(order.customer).toMatchObject({
      name: 'Structured Customer',
      email: 'structured@example.com',
      phone: '07123456789',
      city: 'Leeds'
    })
    expect(order.delivery).toMatchObject({
      dateNeeded: '2026-07-26',
      deliveryMethod: 'postal',
      deliveryNotes: 'Leave with reception',
      giftNote: 'Happy birthday',
      trackingNumber: 'TRACK-1'
    })
    expect(order.pricing).toMatchObject({
      subtotal: 60,
      deliveryFee: 5,
      total: 65,
      paymentStatus: 'paid',
      paymentMethod: 'card'
    })
    expect(order.items).toEqual(relationalItems)
    expect(order.messages).toEqual(relationalMessages)
    expect(order.notes).toEqual(relationalNotes)
  })

  it('maps order item rows while preserving legacy unknown fields', () => {
    const item = mapSupabaseOrderItemRow({
      order_id: 'order-id',
      line_number: 1,
      product_type: 'cake',
      product_id: 'honey-cake',
      product_name: 'Honey Cake',
      quantity: '2',
      unit_price: '30.00',
      total_price: '60.00',
      size: '8 inch',
      flavor: 'Vanilla',
      design_type: 'standard',
      special_instructions: 'No nuts',
      legacy_item: {
        _key: 'item-1',
        oldField: 'preserved'
      }
    })

    expect(item).toMatchObject({
      _key: 'item-1',
      oldField: 'preserved',
      productType: 'cake',
      productId: 'honey-cake',
      productName: 'Honey Cake',
      quantity: 2,
      unitPrice: 30,
      totalPrice: 60,
      size: '8 inch',
      flavor: 'Vanilla',
      designType: 'standard',
      specialInstructions: 'No nuts'
    })
  })

  it('maps order message rows with ordered attachments', () => {
    const attachment = mapSupabaseOrderMessageAttachmentRow({
      message_id: 'message-id',
      line_number: 1,
      attachment_type: 'image',
      asset_type: 'supabase-file',
      asset_id: 'orders/order-id/references/reference.png',
      asset_ref: 'orders/order-id/references/reference.png',
      asset_url: 'https://example.com/reference.png',
      alt: 'Reference image',
      caption: 'Front view',
      legacy_attachment: {
        _key: 'attachment-1',
        oldField: 'preserved'
      }
    })
    const message = mapSupabaseOrderMessageRow({
      id: 'message-id',
      order_id: 'order-id',
      line_number: 1,
      message: 'Customer message',
      legacy_message: {
        _key: 'message-1',
        oldField: 'preserved'
      }
    }, [attachment])

    expect(message).toMatchObject({
      _key: 'message-1',
      oldField: 'preserved',
      message: 'Customer message',
      attachments: [
        expect.objectContaining({
          _key: 'attachment-1',
          oldField: 'preserved',
          _type: 'image',
          asset: expect.objectContaining({
            _type: 'supabase-file',
            _id: 'orders/order-id/references/reference.png',
            _ref: 'orders/order-id/references/reference.png',
            url: 'https://example.com/reference.png'
          }),
          alt: 'Reference image',
          caption: 'Front view'
        })
      ]
    })
  })

  it('maps order note rows with ordered images', () => {
    const image = mapSupabaseOrderNoteImageRow({
      note_id: 'note-id',
      line_number: 1,
      image_type: 'image',
      asset_type: 'supabase-file',
      asset_id: 'orders/order-id/notes/note.png',
      asset_ref: 'orders/order-id/notes/note.png',
      asset_url: 'https://example.com/note.png',
      alt: 'Note image',
      caption: 'Detail',
      legacy_image: {
        _key: 'image-1',
        oldField: 'preserved'
      }
    })
    const note = mapSupabaseOrderNoteRow({
      id: 'note-id',
      order_id: 'order-id',
      line_number: 1,
      note: 'Check delivery',
      author: 'Admin',
      note_created_at: '2026-04-27T18:45:00.000Z',
      created_at: '2026-04-27T18:45:01.000Z',
      legacy_note: {
        _key: 'note-1',
        oldField: 'preserved'
      }
    }, [image])

    expect(note).toMatchObject({
      _key: 'note-1',
      oldField: 'preserved',
      note: 'Check delivery',
      author: 'Admin',
      createdAt: '2026-04-27T18:45:00.000Z',
      images: [
        expect.objectContaining({
          _key: 'image-1',
          oldField: 'preserved',
          _type: 'image',
          asset: expect.objectContaining({
            _type: 'supabase-file',
            _id: 'orders/order-id/notes/note.png',
            _ref: 'orders/order-id/notes/note.png',
            url: 'https://example.com/note.png'
          }),
          alt: 'Note image',
          caption: 'Detail'
        })
      ]
    })
  })
})

describe('Supabase order payload builders', () => {
  it('writes structured order fields without legacy JSONB snapshots', () => {
    const payload = buildSupabaseOrderPayload({
      orderNumber: 'OC-1001',
      status: 'new',
      orderType: 'gift-hamper',
      customer: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '07123456789',
        address: '10 Example Street',
        city: 'Leeds',
        postcode: 'LS1 1AA'
      },
      items: [{
        productName: 'Gift Hamper',
        quantity: 1,
        totalPrice: 45
      }],
      delivery: {
        dateNeeded: '2026-07-26T12:00:00.000Z',
        deliveryMethod: 'postal',
        deliveryAddress: '10 Example Street, Leeds, LS1 1AA',
        deliveryNotes: 'Leave with reception',
        giftNote: 'Happy birthday',
        trackingNumber: 'TRACK-1'
      },
      pricing: {
        subtotal: 45,
        deliveryFee: 5,
        discount: 0,
        total: 50,
        paymentStatus: 'paid',
        paymentMethod: 'card'
      }
    })

    expect(payload).toMatchObject({
      order_number: 'OC-1001',
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      date_needed: '2026-07-26',
      delivery_method: 'postal',
      delivery_notes: 'Leave with reception',
      gift_note: 'Happy birthday',
      total_price: 50,
      payment_status: 'paid'
    })
    expect(payload.customer).toBeUndefined()
    expect(payload.items).toBeUndefined()
    expect(payload.delivery).toBeUndefined()
    expect(payload.pricing).toBeUndefined()
    expect(payload.messages).toBeUndefined()
    expect(payload.notes).toBeUndefined()
  })

  it('normalizes invalid delivery dates to null before RPC casts', () => {
    const payload = buildSupabaseOrderPayload({
      orderNumber: 'OC-1002',
      status: 'new',
      orderType: 'custom-quote',
      customer: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '07123456789'
      },
      items: [{
        productName: 'Custom Order',
        quantity: 1,
        totalPrice: 0
      }],
      delivery: {
        dateNeeded: 'not-a-date',
        deliveryMethod: 'collection'
      },
      pricing: {
        total: 0,
        paymentStatus: 'pending'
      }
    })

    expect(payload.date_needed).toBeNull()
  })

  it('builds ordered child item payloads for order_items', () => {
    const payloads = buildSupabaseOrderItemPayloads('order-id', [
      {
        productName: 'Honey Cake',
        productId: 'honey-cake',
        productType: 'cake',
        quantity: 2,
        unitPrice: 30,
        totalPrice: 60,
        size: '8 inch',
        flavor: 'Vanilla',
        designType: 'standard',
        specialInstructions: 'No nuts'
      },
      {
        productName: 'Napoleon Slice',
        quantity: 1,
        totalPrice: 15
      }
    ])

    expect(payloads).toEqual([
      expect.objectContaining({
        order_id: 'order-id',
        line_number: 1,
        product_id: 'honey-cake',
        product_name: 'Honey Cake',
        quantity: 2,
        unit_price: 30,
        total_price: 60
      }),
      expect.objectContaining({
        order_id: 'order-id',
        line_number: 2,
        product_name: 'Napoleon Slice',
        quantity: 1,
        unit_price: null,
        total_price: 15
      })
    ])
  })

  it('builds ordered child message and attachment payloads', () => {
    const payloads = buildSupabaseOrderMessagePayloads('order-id', [{
      message: 'Please match this image',
      attachments: [{
        _type: 'image',
        asset: {
          _type: 'supabase-file',
          _id: 'orders/order-id/references/reference.png',
          _ref: 'orders/order-id/references/reference.png',
          url: 'https://example.com/reference.png'
        },
        alt: 'Reference',
        caption: 'Front'
      }]
    }])

    expect(payloads.messages).toEqual([
      expect.objectContaining({
        order_id: 'order-id',
        line_number: 1,
        message: 'Please match this image'
      })
    ])
    expect(payloads.attachments).toEqual([
      expect.objectContaining({
        message_id: payloads.messages[0].id,
        line_number: 1,
        attachment_type: 'image',
        asset_ref: 'orders/order-id/references/reference.png',
        alt: 'Reference',
        caption: 'Front'
      })
    ])
  })

  it('does not throw when an optional message attachment asset is missing', () => {
    const messages = [{
      message: 'Please match the reference',
      attachments: [{
        _type: 'image',
        alt: 'Reference without asset'
      }]
    }] as unknown as OrderMessage[]

    const payloads = buildSupabaseOrderMessagePayloads('order-id', messages)

    expect(payloads.attachments).toEqual([
      expect.objectContaining({
        line_number: 1,
        attachment_type: 'image',
        asset_type: null,
        asset_id: null,
        asset_ref: null,
        asset_url: null,
        alt: 'Reference without asset'
      })
    ])
  })

  it('builds ordered child note and image payloads', () => {
    const payloads = buildSupabaseOrderNotePayloads('order-id', [{
      note: 'Call before delivery',
      author: 'Admin',
      createdAt: '2026-04-27T18:45:00.000Z',
      images: [{
        _type: 'image',
        asset: {
          _type: 'supabase-file',
          _id: 'orders/order-id/notes/note.png',
          _ref: 'orders/order-id/notes/note.png',
          url: 'https://example.com/note.png'
        },
        alt: 'Note',
        caption: 'Detail'
      }]
    }])

    expect(payloads.notes).toEqual([
      expect.objectContaining({
        order_id: 'order-id',
        line_number: 1,
        note: 'Call before delivery',
        author: 'Admin',
        note_created_at: '2026-04-27T18:45:00.000Z'
      })
    ])
    expect(payloads.images).toEqual([
      expect.objectContaining({
        note_id: payloads.notes[0].id,
        line_number: 1,
        image_type: 'image',
        asset_ref: 'orders/order-id/notes/note.png',
        alt: 'Note',
        caption: 'Detail'
      })
    ])
  })

  it('does not throw when an optional note image asset is missing', () => {
    const notes = [{
      note: 'Reference saved without an asset',
      author: 'Admin',
      createdAt: '2026-04-27T18:45:00.000Z',
      images: [{
        _type: 'image',
        alt: 'Note image without asset'
      }]
    }] as unknown as OrderNote[]

    const payloads = buildSupabaseOrderNotePayloads('order-id', notes)

    expect(payloads.images).toEqual([
      expect.objectContaining({
        line_number: 1,
        image_type: 'image',
        asset_type: null,
        asset_id: null,
        asset_ref: null,
        asset_url: null,
        alt: 'Note image without asset'
      })
    ])
  })
})
