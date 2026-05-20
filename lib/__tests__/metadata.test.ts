import { normalizeCmsTitle } from '../metadata'

describe('normalizeCmsTitle', () => {
  it('removes a trailing Olgish Cakes suffix once or multiple times', () => {
    expect(normalizeCmsTitle('Cake by post guide | Olgish Cakes')).toBe('Cake by post guide')
    expect(normalizeCmsTitle('Cake by post guide | Olgish Cakes | Olgish Cakes')).toBe(
      'Cake by post guide'
    )
  })

  it('keeps titles without the suffix intact', () => {
    expect(normalizeCmsTitle('Buy Honey Cake Online | Authentic Ukrainian Medovik')).toBe(
      'Buy Honey Cake Online | Authentic Ukrainian Medovik'
    )
  })

  it('returns undefined for empty input', () => {
    expect(normalizeCmsTitle('   ')).toBeUndefined()
    expect(normalizeCmsTitle(undefined)).toBeUndefined()
  })
})
