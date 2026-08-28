import { serializeJsonLd } from '../serialize-json-ld'

describe('serializeJsonLd', () => {
  it('escapes opening angle brackets so script-closing payloads cannot break out', () => {
    const serialized = serializeJsonLd({
      name: '</script><script>alert("xss")</script>'
    })

    expect(serialized).not.toContain('<')
    expect(serialized).toContain('\\u003c/script>')
    expect(JSON.parse(serialized)).toEqual({
      name: '</script><script>alert("xss")</script>'
    })
  })
})
