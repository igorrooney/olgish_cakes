import {
  isExternalReviewSource,
  isReviewSource,
  isReviewSourceUrl
} from '../review-source'

describe('review source URL safety', () => {
  it.each([
    ['trustpilot', 'https://uk.trustpilot.com/reviews/abc'],
    ['trustpilot', 'https://www.trustpilot.com/reviews/abc'],
    ['google', 'https://www.google.com/maps/place/example'],
    ['google', 'https://maps.google.com/?cid=123'],
    ['google', 'https://www.google.co.uk/maps/place/example'],
    ['google', 'https://maps.google.co.uk/?cid=123'],
    ['google', 'https://maps.app.goo.gl/example'],
    ['google', 'https://g.co/kgs/example'],
    ['google', 'https://g.page/r/example/review'],
    ['facebook', 'https://www.facebook.com/example/reviews'],
    ['facebook', 'https://m.facebook.com/example/reviews'],
    ['instagram', 'https://www.instagram.com/p/example/']
  ])('accepts a genuine %s source URL', (source, sourceUrl) => {
    expect(isReviewSourceUrl(source, sourceUrl)).toBe(true)
  })

  it.each([
    ['trustpilot', 'https://example.com/reviews/abc'],
    ['trustpilot', 'https://trustpilot.com.example.com/reviews/abc'],
    ['trustpilot', 'http://uk.trustpilot.com/reviews/abc'],
    ['google', 'https://google.com.example.org/maps/review'],
    ['google', 'https://maps.google.co.uk.example.org/maps/review'],
    ['google', 'https://google-maps.example/maps/review'],
    ['facebook', 'https://instagram.com/example'],
    ['instagram', 'https://facebook.com/example'],
    ['trustpilot', ' https://uk.trustpilot.com/reviews/abc'],
    ['trustpilot', 'https://user:password@uk.trustpilot.com/reviews/abc']
  ])('rejects mismatched or unsafe %s URLs', (source, sourceUrl) => {
    expect(isReviewSourceUrl(source, sourceUrl)).toBe(false)
  })

  it('recognises only supported source values', () => {
    expect(isReviewSource('direct')).toBe(true)
    expect(isReviewSource('historical')).toBe(true)
    expect(isReviewSource('other')).toBe(false)
    expect(isExternalReviewSource('google')).toBe(true)
    expect(isExternalReviewSource('direct')).toBe(false)
  })

})
