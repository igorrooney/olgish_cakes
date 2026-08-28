import {
  DEFAULT_AGGREGATE_RATING,
  DEFAULT_KYIV_CAKE_REVIEW,
  DEFAULT_REVIEWS
} from '../structured-data-defaults'

describe('structured-data defaults', () => {
  it('never fabricates reviews when evidence is missing', () => {
    expect(DEFAULT_REVIEWS).toEqual([])
    expect(DEFAULT_KYIV_CAKE_REVIEW).toBeNull()
    expect(DEFAULT_AGGREGATE_RATING).toBeNull()
  })
})
