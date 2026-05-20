/**
 * @jest-environment node
 */
import {
  getAdminEnquiryDetail,
  getAdminEnquiryHref,
  isAdminEnquiryType,
  listAdminEnquiries
} from '../supabase-enquiries'

const mockFrom = jest.fn()
const mockStorageFrom = jest.fn()

jest.mock('@/lib/supabase-admin-client', () => ({
  getSupabaseAdminClient: () => ({
    from: mockFrom,
    storage: {
      from: mockStorageFrom
    }
  })
}))

const createListQuery = (data: unknown[]) => {
  const limit = jest.fn().mockResolvedValue({ data, error: null })
  const order = jest.fn(() => ({ limit }))
  const select = jest.fn(() => ({ order }))

  return { select, order, limit }
}

const createDetailQuery = (data: unknown) => {
  const maybeSingle = jest.fn().mockResolvedValue({ data, error: null })
  const eq = jest.fn(() => ({ maybeSingle }))
  const select = jest.fn(() => ({ eq }))

  return { select, eq, maybeSingle }
}

describe('supabase enquiries admin data', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStorageFrom.mockReturnValue({
      createSignedUrl: jest.fn().mockResolvedValue({
        data: { signedUrl: 'https://signed.example/reference.jpg' },
        error: null
      })
    })
  })

  it('builds stable admin enquiry hrefs and validates route types', () => {
    expect(getAdminEnquiryHref('custom-cake', 42)).toBe('/admin/enquiries/custom-cake/42')
    expect(isAdminEnquiryType('workshop')).toBe(true)
    expect(isAdminEnquiryType('orders')).toBe(false)
  })

  it('lists enquiries from all enquiry tables in newest-first order', async () => {
    const listQueries: Partial<Record<string, ReturnType<typeof createListQuery>>> = {}

    mockFrom.mockImplementation((table: string) => {
      if (table === 'custom_cake_enquiries') {
        const query = createListQuery([
          {
            id: 1,
            full_name: 'Custom Customer',
            email: 'custom@example.com',
            phone: '07111111111',
            address: null,
            city: null,
            postcode: null,
            occasion: 'Birthday',
            date_needed: '2026-07-01',
            requirements: 'A blue floral cake.',
            reference_image_bucket: 'custom-cake-enquiries',
            reference_image_path: 'enquiries/reference.jpg',
            reference_image_name: 'reference.jpg',
            reference_image_type: 'image/jpeg',
            reference_image_size: 2048,
            created_at: '2026-05-02T10:00:00.000Z'
          }
        ])
        listQueries[table] = query
        return query
      }

      if (table === 'contact_enquiries') {
        const query = createListQuery([
          {
            id: 2,
            full_name: 'Contact Customer',
            email: 'contact@example.com',
            phone: null,
            address: null,
            city: null,
            postcode: null,
            cake_interest: 'Honey cake',
            date_needed: null,
            message: 'Can you help with a cake?',
            note: null,
            gift_note: null,
            referrer: 'homepage',
            attachment_names: null,
            created_at: '2026-05-01T10:00:00.000Z'
          }
        ])
        listQueries[table] = query
        return query
      }

      const query = createListQuery([
        {
          id: 3,
          full_name: 'Workshop Customer',
          email: 'workshop@example.com',
          phone: '07222222222',
          event_type: 'Birthday',
          group_size: '8 children',
          location: 'Leeds',
          preferred_date: '2026-06-01',
          decoration_theme: null,
          brief: 'Decorating workshop for children.',
          created_at: '2026-05-03T10:00:00.000Z'
        }
      ])
      listQueries[table] = query
      return query
    })

    const enquiries = await listAdminEnquiries()

    expect(enquiries.map((enquiry) => enquiry.customerName)).toEqual([
      'Workshop Customer',
      'Custom Customer',
      'Contact Customer'
    ])
    expect(enquiries[1]).toMatchObject({
      type: 'custom-cake',
      href: '/admin/enquiries/custom-cake/1',
      hasAttachment: true,
      topic: 'Birthday'
    })
    expect(listQueries.custom_cake_enquiries?.select).toHaveBeenCalledWith(expect.not.stringContaining('updated_at'))
  })

  it('loads a custom cake enquiry detail with a signed reference image URL', async () => {
    const query = createDetailQuery({
      id: 42,
      full_name: 'Custom Customer',
      email: 'custom@example.com',
      phone: '07111111111',
      address: '10 Cake Street',
      city: 'Leeds',
      postcode: 'LS1 1AA',
      occasion: 'Birthday',
      date_needed: '2026-07-01',
      requirements: 'A blue floral cake.',
      reference_image_bucket: 'custom-cake-enquiries',
      reference_image_path: 'enquiries/reference.jpg',
      reference_image_name: 'reference.jpg',
      reference_image_type: 'image/jpeg',
      reference_image_size: 2048,
      created_at: '2026-05-02T10:00:00.000Z'
    })
    mockFrom.mockReturnValue(query)

    const detail = await getAdminEnquiryDetail('custom-cake', '42')

    expect(detail).toMatchObject({
      id: '42',
      customerName: 'Custom Customer',
      attachments: [
        {
          label: 'reference.jpg',
          href: 'https://signed.example/reference.jpg',
          downloadHref: 'https://signed.example/reference.jpg',
          previewHref: 'https://signed.example/reference.jpg',
          mimeType: 'image/jpeg',
          detail: 'image/jpeg - 2 KB'
        }
      ]
    })
    expect(detail?.summaryText).toContain('Custom cake enquiry #42')
    expect(detail?.sections.some((section) => section.title === 'Requirements')).toBe(true)
    expect(query.select).toHaveBeenCalledWith(expect.not.stringContaining('updated_at'))
  })

  it('does not inline-preview custom cake attachments with unsafe image types', async () => {
    mockFrom.mockReturnValue(createDetailQuery({
      id: 43,
      full_name: 'Custom Customer',
      email: 'custom@example.com',
      phone: '07111111111',
      address: null,
      city: null,
      postcode: null,
      occasion: 'Birthday',
      date_needed: '2026-07-01',
      requirements: 'A blue floral cake.',
      reference_image_bucket: 'custom-cake-enquiries',
      reference_image_path: 'enquiries/reference.svg',
      reference_image_name: 'reference.svg',
      reference_image_type: 'image/svg+xml',
      reference_image_size: 2048,
      created_at: '2026-05-02T10:00:00.000Z'
    }))

    const detail = await getAdminEnquiryDetail('custom-cake', '43')

    expect(detail?.attachments[0]).toMatchObject({
      label: 'reference.svg',
      href: 'https://signed.example/reference.jpg',
      downloadHref: 'https://signed.example/reference.jpg',
      mimeType: 'image/svg+xml',
      detail: 'image/svg+xml - 2 KB'
    })
    expect(detail?.attachments[0]?.previewHref).toBeUndefined()
  })

  it('loads contact enquiry detail with saved attachment names', async () => {
    mockFrom.mockReturnValue(createDetailQuery({
      id: 7,
      full_name: 'Contact Customer',
      email: 'contact@example.com',
      phone: null,
      address: '10 Cake Street',
      city: 'Leeds',
      postcode: 'LS1 1AA',
      cake_interest: 'Honey cake',
      date_needed: '2026-08-01',
      message: 'Can you make a honey cake?',
      note: 'Prefers morning collection.',
      gift_note: null,
      referrer: 'homepage',
      attachment_names: ['brief.jpg'],
      created_at: '2026-05-04T09:00:00.000Z',
      updated_at: '2026-05-04T09:00:00.000Z'
    }))

    const detail = await getAdminEnquiryDetail('contact', '7')

    expect(detail).toMatchObject({
      id: '7',
      type: 'contact',
      topic: 'Honey cake',
      attachments: [{ label: 'brief.jpg' }]
    })
    expect(detail?.sections.some((section) => section.title === 'Message')).toBe(true)
    expect(detail?.summaryText).toContain('Can you make a honey cake?')
  })

  it('loads workshop enquiry detail and returns null when a row is missing', async () => {
    mockFrom.mockReturnValueOnce(createDetailQuery({
      id: 9,
      full_name: 'Workshop Customer',
      email: 'workshop@example.com',
      phone: '07123456789',
      event_type: 'Team building',
      group_size: '10 adults',
      location: 'Leeds',
      preferred_date: '2026-09-01',
      decoration_theme: 'Flowers',
      brief: 'A team workshop.',
      created_at: '2026-05-05T09:00:00.000Z',
      updated_at: '2026-05-05T09:00:00.000Z'
    }))

    const detail = await getAdminEnquiryDetail('workshop', '9')

    expect(detail).toMatchObject({
      id: '9',
      type: 'workshop',
      topic: 'Team building',
      attachments: []
    })
    expect(detail?.sections.some((section) => section.title === 'Workshop')).toBe(true)

    mockFrom.mockReturnValueOnce(createDetailQuery(null))

    await expect(getAdminEnquiryDetail('workshop', 'missing')).resolves.toBeNull()
  })
})
