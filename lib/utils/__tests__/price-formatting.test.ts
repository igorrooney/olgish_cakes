/**
 * @jest-environment jsdom
 */
import {
  createPriceData,
  extractNumericPrice,
  formatDisplayPrice,
  formatStructuredDataPrice,
  type PriceData
} from '../price-formatting'

describe('formatStructuredDataPrice', () => {
  describe('number inputs', () => {
    it('should return valid numbers as-is', () => {
      expect(formatStructuredDataPrice(25)).toBe(25)
      expect(formatStructuredDataPrice(25.99)).toBe(25.99)
      expect(formatStructuredDataPrice(0)).toBe(0)
      expect(formatStructuredDataPrice(1000)).toBe(1000)
    })

    it('should use default value for invalid numbers', () => {
      expect(formatStructuredDataPrice(NaN, 25)).toBe(25)
      expect(formatStructuredDataPrice(Infinity, 25)).toBe(25)
      expect(formatStructuredDataPrice(-Infinity, 25)).toBe(25)
    })

    it('should reject negative numbers and use default', () => {
      expect(formatStructuredDataPrice(-10, 25)).toBe(25)
      expect(formatStructuredDataPrice(-0.01, 25)).toBe(25)
    })
  })

  describe('string inputs', () => {
    it('should parse simple numeric strings', () => {
      expect(formatStructuredDataPrice('25')).toBe(25)
      expect(formatStructuredDataPrice('25.99')).toBe(25.99)
      expect(formatStructuredDataPrice('0')).toBe(0)
    })

    it('should handle currency symbols', () => {
      expect(formatStructuredDataPrice('£25')).toBe(25)
      expect(formatStructuredDataPrice('$30')).toBe(30)
      expect(formatStructuredDataPrice('€40')).toBe(40)
      expect(formatStructuredDataPrice('£25.99')).toBe(25.99)
    })

    it('should handle "From" prefix', () => {
      expect(formatStructuredDataPrice('From £25')).toBe(25)
      expect(formatStructuredDataPrice('from £30')).toBe(30)
      expect(formatStructuredDataPrice('FROM £40')).toBe(40)
      expect(formatStructuredDataPrice('From £25.99')).toBe(25.99)
    })

    it('should handle "Free" text', () => {
      expect(formatStructuredDataPrice('Free')).toBe(0)
      expect(formatStructuredDataPrice('free')).toBe(0)
      expect(formatStructuredDataPrice('FREE')).toBe(0)
    })

    it('should handle complex price strings', () => {
      expect(formatStructuredDataPrice('From £25.99')).toBe(25.99)
      expect(formatStructuredDataPrice('Starting at £30')).toBe(30)
      expect(formatStructuredDataPrice('Price: £40.50')).toBe(40.5)
    })

    it('should handle empty strings', () => {
      expect(formatStructuredDataPrice('', 25)).toBe(25)
      expect(formatStructuredDataPrice('   ', 25)).toBe(25)
    })

    it('should handle strings with no numbers', () => {
      expect(formatStructuredDataPrice('No price', 25)).toBe(25)
      expect(formatStructuredDataPrice('N/A', 25)).toBe(25)
      expect(formatStructuredDataPrice('TBD', 25)).toBe(25)
    })

    it('should handle scientific notation strings', () => {
      expect(formatStructuredDataPrice('1e2', 25)).toBe(100)
      expect(formatStructuredDataPrice('2.5e1', 25)).toBe(25)
    })

    it('should handle multiple decimal points (takes first valid number)', () => {
      expect(formatStructuredDataPrice('25.99.50', 25)).toBe(25.99)
    })

    it('should handle very large numbers', () => {
      expect(formatStructuredDataPrice('999999.99')).toBe(999999.99)
    })
  })

  describe('undefined and null inputs', () => {
    it('should return default value for undefined', () => {
      expect(formatStructuredDataPrice(undefined, 25)).toBe(25)
      expect(formatStructuredDataPrice(undefined)).toBe(0)
    })

    it('should return default value for null', () => {
      expect(formatStructuredDataPrice(null as unknown as undefined, 25)).toBe(25)
    })
  })

  describe('edge cases', () => {
    it('should handle zero correctly', () => {
      expect(formatStructuredDataPrice(0)).toBe(0)
      expect(formatStructuredDataPrice('0')).toBe(0)
      expect(formatStructuredDataPrice('£0')).toBe(0)
      expect(formatStructuredDataPrice('Free')).toBe(0)
    })

    it('should handle whitespace', () => {
      expect(formatStructuredDataPrice('  25  ')).toBe(25)
      expect(formatStructuredDataPrice('  £  30  ')).toBe(30)
    })

    it('should handle mixed case', () => {
      expect(formatStructuredDataPrice('FrOm £25')).toBe(25)
      expect(formatStructuredDataPrice('FREE')).toBe(0)
    })
  })
})

describe('formatDisplayPrice', () => {
  it('should format integers without decimals', () => {
    expect(formatDisplayPrice(25)).toBe('£25')
    expect(formatDisplayPrice(0)).toBe('£0')
    expect(formatDisplayPrice(100)).toBe('£100')
  })

  it('should format decimals with 2 decimal places', () => {
    expect(formatDisplayPrice(25.99)).toBe('£25.99')
    expect(formatDisplayPrice(30.5)).toBe('£30.50')
    expect(formatDisplayPrice(40.1)).toBe('£40.10')
  })

  it('should handle prefix', () => {
    expect(formatDisplayPrice(25, 'From')).toBe('From £25')
    expect(formatDisplayPrice(30.99, 'Starting at')).toBe('Starting at £30.99')
  })

  it('should handle zero', () => {
    expect(formatDisplayPrice(0)).toBe('£0')
    expect(formatDisplayPrice(0, 'Free')).toBe('Free £0')
  })

  it('should handle very large numbers', () => {
    expect(formatDisplayPrice(999999.99)).toBe('£999999.99')
  })
})

describe('extractNumericPrice', () => {
  it('should extract numeric price from display strings', () => {
    expect(extractNumericPrice('From £25')).toBe(25)
    expect(extractNumericPrice('£30.99')).toBe(30.99)
    expect(extractNumericPrice('Free')).toBe(0)
    expect(extractNumericPrice('25')).toBe(25)
  })

  it('should return 0 for invalid strings', () => {
    expect(extractNumericPrice('No price')).toBe(0)
    expect(extractNumericPrice('')).toBe(0)
    expect(extractNumericPrice('N/A')).toBe(0)
  })
})

describe('createPriceData', () => {
  it('should create PriceData from number', () => {
    const result = createPriceData(25)
    expect(result).toEqual({
      displayPrice: '£25',
      numericPrice: 25
    })
    expect(result.numericPrice).toBe(25)
    expect(typeof result.numericPrice).toBe('number')
  })

  it('should create PriceData from number with prefix', () => {
    const result = createPriceData(25, 'From')
    expect(result).toEqual({
      displayPrice: 'From £25',
      numericPrice: 25
    })
  })

  it('should create PriceData from string', () => {
    const result = createPriceData('25')
    expect(result).toEqual({
      displayPrice: '£25',
      numericPrice: 25
    })
    expect(typeof result.numericPrice).toBe('number')
  })

  it('should create PriceData from string with prefix', () => {
    const result = createPriceData('30', 'From')
    expect(result).toEqual({
      displayPrice: 'From £30',
      numericPrice: 30
    })
  })

  it('should create PriceData from complex price string', () => {
    const result = createPriceData('From £25.99', 'Starting at')
    expect(result).toEqual({
      displayPrice: 'Starting at £25.99',
      numericPrice: 25.99
    })
  })

  it('should handle decimal prices', () => {
    const result = createPriceData(25.99)
    expect(result).toEqual({
      displayPrice: '£25.99',
      numericPrice: 25.99
    })
  })

  it('should handle zero', () => {
    const result = createPriceData(0)
    expect(result).toEqual({
      displayPrice: '£0',
      numericPrice: 0
    })
  })

  it('should extract numeric value from "Free" string', () => {
    const result = createPriceData('Free')
    expect(result).toEqual({
      displayPrice: '£0',
      numericPrice: 0
    })
  })
})

describe('Type safety', () => {
  it('should ensure PriceData interface is correct', () => {
    const priceData: PriceData = {
      displayPrice: '£25',
      numericPrice: 25
    }
    expect(typeof priceData.displayPrice).toBe('string')
    expect(typeof priceData.numericPrice).toBe('number')
  })
})

