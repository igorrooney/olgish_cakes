import { getSupabaseAdminClient } from '@/lib/supabase-admin-client'
import { signSupabaseOrderImageUrls } from '@/lib/orders/supabase-orders'
import type { Order } from '@/types/order'

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
