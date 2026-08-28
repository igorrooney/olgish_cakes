import { validateTestimonialSourceUrl } from '../testimonialSourceEvidence'

describe('testimonial source URL validation', () => {
  it('does not require an external URL', () => {
    expect(validateTestimonialSourceUrl(undefined, 'trustpilot')).toBe(true)
    expect(validateTestimonialSourceUrl('', 'trustpilot')).toBe(true)
  })

  it('rejects a URL hosted on a different declared platform', () => {
    expect(validateTestimonialSourceUrl(
      'https://www.google.com/maps/reviews/example',
      'trustpilot'
    )).toBe('Use an HTTPS URL on the declared trustpilot platform.')
  })

  it('accepts a source-specific external URL', () => {
    expect(validateTestimonialSourceUrl(
      'https://uk.trustpilot.com/reviews/example',
      'trustpilot'
    )).toBe(true)
  })

  it.each(['direct', 'historical'])('does not apply external-platform validation to %s reviews', (source) => {
    expect(validateTestimonialSourceUrl(
      'https://example.com/direct-review',
      source
    )).toBe(true)
  })
})
