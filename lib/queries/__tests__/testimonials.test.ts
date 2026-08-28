import {
  ALL_TESTIMONIALS_QUERY,
  FEATURED_TESTIMONIALS_QUERY,
  PAGINATED_TESTIMONIALS_QUERY,
  TESTIMONIAL_STATS_QUERY
} from '../testimonials'

const publicQueries = [
  ALL_TESTIMONIALS_QUERY,
  FEATURED_TESTIMONIALS_QUERY,
  PAGINATED_TESTIMONIALS_QUERY,
  TESTIMONIAL_STATS_QUERY
]

describe('testimonial publication queries', () => {
  it.each(publicQueries)('selects all technically displayable Sanity testimonials', (query) => {
    expect(query).toContain('_type == "testimonial"')
    expect(query).toContain('defined(_id)')
    expect(query).toContain('defined(date)')
    expect(query).toContain('defined(text)')
    expect(query).toContain('defined(rating)')
    expect(query).toContain('rating >= 1')
    expect(query).toContain('rating <= 5')
  })

  it.each(publicQueries)('does not gate reviews on approval or provenance metadata', (query) => {
    expect(query).not.toContain('publicationApproved')
    expect(query).not.toContain('verifiedAt')
    expect(query).not.toContain('verifiedBy')
    expect(query).not.toContain('internalEvidenceReference')
    expect(query).not.toContain('legacyPublicationEvidence')
    expect(query).not.toContain('incentivised ==')
  })

  it('preserves stable pagination ordering and cursor conditions', () => {
    expect(PAGINATED_TESTIMONIALS_QUERY).toContain('order(date desc, _id asc)')
    expect(PAGINATED_TESTIMONIALS_QUERY).toContain('date < $cursorDate')
    expect(PAGINATED_TESTIMONIALS_QUERY).toContain(
      '(date == $cursorDate && _id > $cursorId)'
    )
  })

  it('does not project private provenance fields in paginated API records', () => {
    const projection = PAGINATED_TESTIMONIALS_QUERY.slice(
      PAGINATED_TESTIMONIALS_QUERY.lastIndexOf('] | order')
    )

    expect(projection).not.toContain('verifiedBy')
    expect(projection).not.toContain('internalEvidenceReference')
    expect(projection).not.toContain('legacyPublicationEvidence')
    expect(projection).not.toContain('testimonialVerificationBatch')
  })
})
