import {
  stringToRichText,
  richTextToText,
  validateRichTextKeys,
  ensureUniqueKeys
} from '../rich-text-utils'

describe('rich-text-utils', () => {
  describe('stringToRichText', () => {
    it('should convert plain string to portable text', () => {
      const result = stringToRichText('Hello World')

      expect(result).toBeInstanceOf(Array)
      expect(result.length).toBe(1)
      expect(result[0]._type).toBe('block')
    })

    it('should create block with correct structure', () => {
      const result = stringToRichText('Test')

      expect(result[0]).toHaveProperty('_type', 'block')
      expect(result[0]).toHaveProperty('_key')
      expect(result[0]).toHaveProperty('style', 'normal')
      expect(result[0]).toHaveProperty('children')
      expect(result[0]).toHaveProperty('markDefs')
    })

    it('should create span child with text', () => {
      const result = stringToRichText('Test text')

      expect(result[0].children).toBeInstanceOf(Array)
      expect(result[0].children.length).toBe(1)
      expect(result[0].children[0]._type).toBe('span')
      expect(result[0].children[0].text).toBe('Test text')
    })

    it('should generate unique keys', () => {
      const result = stringToRichText('Test')

      expect(result[0]._key).toBeDefined()
      expect(result[0]._key).toContain('block_')
      expect(result[0].children[0]._key).toBeDefined()
      expect(result[0].children[0]._key).toContain('span_')
    })

    it('should trim whitespace', () => {
      const result = stringToRichText('  Test  ')

      expect(result[0].children[0].text).toBe('Test')
    })

    it('should return empty array for empty string', () => {
      const result = stringToRichText('')

      expect(result).toEqual([])
    })

    it('should return empty array for whitespace only', () => {
      const result = stringToRichText('   ')

      expect(result).toEqual([])
    })

    it('should have empty markDefs', () => {
      const result = stringToRichText('Test')

      expect(result[0].markDefs).toEqual([])
    })

    it('should handle multiline text', () => {
      const result = stringToRichText('Line 1\nLine 2')

      expect(result[0].children[0].text).toBe('Line 1\nLine 2')
    })

    it('should handle special characters', () => {
      const result = stringToRichText('Test & <html> "quotes"')

      expect(result[0].children[0].text).toBe('Test & <html> "quotes"')
    })

    it('should generate different keys for consecutive calls', () => {
      const result1 = stringToRichText('Test 1')
      const result2 = stringToRichText('Test 2')

      expect(result1[0]._key).not.toBe(result2[0]._key)
    })
  })

  describe('richTextToText', () => {
    it('should convert portable text to plain string', () => {
      const blocks = [
        {
          _type: 'block',
          _key: 'block1',
          children: [
            { _type: 'span', _key: 'span1', text: 'Hello World' }
          ]
        }
      ]

      const result = richTextToText(blocks)

      expect(result).toBe('Hello World')
    })

    it('should join multiple blocks with newlines', () => {
      const blocks = [
        {
          _type: 'block',
          _key: 'block1',
          children: [
            { _type: 'span', _key: 'span1', text: 'Line 1' }
          ]
        },
        {
          _type: 'block',
          _key: 'block2',
          children: [
            { _type: 'span', _key: 'span2', text: 'Line 2' }
          ]
        }
      ]

      const result = richTextToText(blocks)

      expect(result).toBe('Line 1\nLine 2')
    })

    it('should concatenate multiple children', () => {
      const blocks = [
        {
          _type: 'block',
          _key: 'block1',
          children: [
            { _type: 'span', _key: 'span1', text: 'Hello' },
            { _type: 'span', _key: 'span2', text: ' ' },
            { _type: 'span', _key: 'span3', text: 'World' }
          ]
        }
      ]

      const result = richTextToText(blocks)

      expect(result).toBe('Hello World')
    })

    it('should return empty string for null input', () => {
      const result = richTextToText(null as any)

      expect(result).toBe('')
    })

    it('should return empty string for undefined input', () => {
      const result = richTextToText(undefined as any)

      expect(result).toBe('')
    })

    it('should return empty string for non-array input', () => {
      const result = richTextToText({} as any)

      expect(result).toBe('')
    })

    it('should return empty string for empty array', () => {
      const result = richTextToText([])

      expect(result).toBe('')
    })

    it('should handle blocks without children', () => {
      const blocks = [
        {
          _type: 'block',
          _key: 'block1'
        }
      ]

      const result = richTextToText(blocks)

      expect(result).toBe('')
    })

    it('should ignore non-block types', () => {
      const blocks = [
        {
          _type: 'image',
          _key: 'image1'
        },
        {
          _type: 'block',
          _key: 'block1',
          children: [
            { _type: 'span', _key: 'span1', text: 'Text' }
          ]
        }
      ]

      const result = richTextToText(blocks)

      expect(result).toBe('Text')
    })

    it('should trim final result', () => {
      const blocks = [
        {
          _type: 'block',
          _key: 'block1',
          children: [
            { _type: 'span', _key: 'span1', text: 'Text' }
          ]
        },
        {
          _type: 'block',
          _key: 'block2',
          children: []
        }
      ]

      const result = richTextToText(blocks)

      expect(result).toBe('Text')
    })
  })

  describe('validateRichTextKeys', () => {
    it('should return true for valid unique keys', () => {
      const blocks = [
        {
          _key: 'block1',
          children: [
            { _key: 'span1' },
            { _key: 'span2' }
          ]
        }
      ]

      const result = validateRichTextKeys(blocks)

      expect(result).toBe(true)
    })

    it('should return false for duplicate block keys', () => {
      const blocks = [
        { _key: 'block1' },
        { _key: 'block1' }
      ]

      const result = validateRichTextKeys(blocks)

      expect(result).toBe(false)
    })

    it('should return false for duplicate child keys', () => {
      const blocks = [
        {
          _key: 'block1',
          children: [
            { _key: 'span1' },
            { _key: 'span1' }
          ]
        }
      ]

      const result = validateRichTextKeys(blocks)

      expect(result).toBe(false)
    })

    it('should return false for duplicate keys across blocks and children', () => {
      const blocks = [
        {
          _key: 'key1',
          children: [
            { _key: 'key1' }
          ]
        }
      ]

      const result = validateRichTextKeys(blocks)

      expect(result).toBe(false)
    })

    it('should return true for null input', () => {
      const result = validateRichTextKeys(null as any)

      expect(result).toBe(true)
    })

    it('should return true for undefined input', () => {
      const result = validateRichTextKeys(undefined as any)

      expect(result).toBe(true)
    })

    it('should return true for non-array input', () => {
      const result = validateRichTextKeys({} as any)

      expect(result).toBe(true)
    })

    it('should return true for empty array', () => {
      const result = validateRichTextKeys([])

      expect(result).toBe(true)
    })

    it('should handle blocks without keys', () => {
      const blocks = [
        {
          children: [
            { text: 'Test' }
          ]
        }
      ]

      const result = validateRichTextKeys(blocks)

      expect(result).toBe(true)
    })

    it('should handle blocks without children', () => {
      const blocks = [
        { _key: 'block1' },
        { _key: 'block2' }
      ]

      const result = validateRichTextKeys(blocks)

      expect(result).toBe(true)
    })
  })

  describe('ensureUniqueKeys', () => {
    it('should add keys to blocks without them', () => {
      const blocks = [
        {
          _type: 'block',
          children: [
            { _type: 'span', text: 'Test' }
          ]
        }
      ]

      const result = ensureUniqueKeys(blocks)

      expect(result[0]._key).toBeDefined()
      expect(result[0]._key).toContain('block_')
    })

    it('should add keys to children without them', () => {
      const blocks = [
        {
          _type: 'block',
          _key: 'block1',
          children: [
            { _type: 'span', text: 'Test' }
          ]
        }
      ]

      const result = ensureUniqueKeys(blocks)

      expect(result[0].children[0]._key).toBeDefined()
      expect(result[0].children[0]._key).toContain('span_')
    })

    it('should preserve existing keys', () => {
      const blocks = [
        {
          _key: 'custom-block-key',
          children: [
            { _key: 'custom-span-key', text: 'Test' }
          ]
        }
      ]

      const result = ensureUniqueKeys(blocks)

      expect(result[0]._key).toBe('custom-block-key')
      expect(result[0].children[0]._key).toBe('custom-span-key')
    })

    it('should return empty array for null input', () => {
      const result = ensureUniqueKeys(null as any)

      expect(result).toEqual([])
    })

    it('should return empty array for undefined input', () => {
      const result = ensureUniqueKeys(undefined as any)

      expect(result).toEqual([])
    })

    it('should return empty array for non-array input', () => {
      const result = ensureUniqueKeys({} as any)

      expect(result).toEqual([])
    })

    it('should preserve other block properties', () => {
      const blocks = [
        {
          _type: 'block',
          style: 'h1',
          markDefs: [],
          children: []
        }
      ]

      const result = ensureUniqueKeys(blocks)

      expect(result[0]._type).toBe('block')
      expect(result[0].style).toBe('h1')
      expect(result[0].markDefs).toEqual([])
    })

    it('should preserve other child properties', () => {
      const blocks = [
        {
          _key: 'block1',
          children: [
            { _type: 'span', text: 'Test', marks: ['bold'] }
          ]
        }
      ]

      const result = ensureUniqueKeys(blocks)

      expect(result[0].children[0]._type).toBe('span')
      expect(result[0].children[0].text).toBe('Test')
      expect(result[0].children[0].marks).toEqual(['bold'])
    })

    it('should handle blocks without children property', () => {
      const blocks = [
        { _type: 'image', url: 'test.jpg' }
      ]

      const result = ensureUniqueKeys(blocks)

      expect(result[0]._key).toBeDefined()
      expect(result[0].url).toBe('test.jpg')
    })

    it('should not modify original blocks', () => {
      const blocks = [
        {
          _type: 'block',
          children: [
            { _type: 'span', text: 'Test' }
          ]
        }
      ]

      const original = JSON.parse(JSON.stringify(blocks))
      ensureUniqueKeys(blocks)

      expect(blocks).toEqual(original)
    })
  })

  describe('Integration', () => {
    it('should round-trip string to rich text and back', () => {
      const original = 'Hello World'
      const richText = stringToRichText(original)
      const plainText = richTextToText(richText)

      expect(plainText).toBe(original)
    })

    it('should validate stringToRichText output', () => {
      const richText = stringToRichText('Test')
      const isValid = validateRichTextKeys(richText)

      expect(isValid).toBe(true)
    })

    it('should ensure unique keys for converted text', () => {
      const richText = stringToRichText('Test')
      const ensured = ensureUniqueKeys(richText)

      expect(validateRichTextKeys(ensured)).toBe(true)
    })
  })
})

