import {
  buildGetCustomQuoteSubmission,
  buildQuoteRequirements,
  getCustomQuoteInitialValues,
  quoteFormSchema
} from '../getCustomQuoteForm.utils'

describe('getCustomQuoteForm.utils', () => {
  it('builds a structured quote requirements summary with the remaining supported fields', () => {
    const requirements = buildQuoteRequirements({
      ...getCustomQuoteInitialValues,
      occasion: 'Birthday',
      servings: '20',
      brief: 'Pink floral finish with raspberry flavour and an elegant feel.'
    })

    expect(requirements).toBe(
      [
        'Quote brief',
        'Occasion: Birthday',
        'Servings: 20',
        'Brief: Pink floral finish with raspberry flavour and an elegant feel.'
      ].join('\n')
    )
  })

  it('omits empty optional values from the structured requirements summary', () => {
    const requirements = buildQuoteRequirements({
      ...getCustomQuoteInitialValues,
      brief: ''
    })

    expect(requirements).toBe('Quote brief')
  })

  it('maps page values into the shared custom cake enquiry submission shape without location fields', () => {
    const submission = buildGetCustomQuoteSubmission({
      ...getCustomQuoteInitialValues,
      fullName: '  Jane Doe  ',
      email: ' jane@example.com ',
      phone: '',
      date: '2026-06-01',
      occasion: 'Birthday',
      servings: '12',
      brief: 'Blue tones, soft floral detail and a vanilla raspberry flavour.'
    }, 'csrf-token')

    expect(submission).toEqual({
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: undefined,
      occasion: 'Birthday',
      date: '2026-06-01',
      requirements: [
        'Quote brief',
        'Occasion: Birthday',
        'Servings: 12',
        'Brief: Blue tones, soft floral detail and a vanilla raspberry flavour.'
      ].join('\n'),
      csrfToken: 'csrf-token'
    })
  })

  it('accepts a short cake brief once it reaches 8 trimmed characters', () => {
    const result = quoteFormSchema.safeParse({
      ...getCustomQuoteInitialValues,
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '',
      date: '2026-06-01',
      servings: '10',
      brief: 'test cake',
      csrfToken: 'csrf-token'
    })

    expect(result.success).toBe(true)
  })

  it('rejects a cake brief shorter than 8 trimmed characters', () => {
    const result = quoteFormSchema.safeParse({
      ...getCustomQuoteInitialValues,
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      phone: '',
      date: '2026-06-01',
      servings: '10',
      brief: 'cake',
      csrfToken: 'csrf-token'
    })

    expect(result.success).toBe(false)

    if (result.success) {
      throw new Error('Expected quote brief validation to fail')
    }

    expect(result.error.flatten().fieldErrors.brief).toContain('Please add a few words about the cake')
  })
})
