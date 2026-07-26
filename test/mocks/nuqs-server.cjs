function createMultiParser(parser) {
  return {
    ...parser,
    type: 'multi',
    eq: parser.eq || ((left, right) => left === right),
    withDefault(defaultValue) {
      return {
        ...this,
        defaultValue
      }
    }
  }
}

function toSearchParams(input) {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(input || {})) {
    if (Array.isArray(value)) {
      value.forEach(item => searchParams.append(key, item))
    } else if (value !== undefined) {
      searchParams.set(key, value)
    }
  }

  return searchParams
}

function createLoader(parsers) {
  return (input, { strict = false } = {}) => {
    const searchParams = input instanceof URLSearchParams
      ? input
      : toSearchParams(input)
    const result = {}

    for (const [key, parser] of Object.entries(parsers)) {
      const values = searchParams.getAll(key)

      if (values.length === 0) {
        result[key] = parser.defaultValue ?? null
        continue
      }

      const value = parser.parse(values)

      if (strict && value === null) {
        throw new Error(`Failed to parse ${key}`)
      }

      result[key] = value ?? parser.defaultValue ?? null
    }

    return result
  }
}

function createSerializer(parsers) {
  return (base, values) => {
    const searchParams = new URLSearchParams()

    for (const [key, parser] of Object.entries(parsers)) {
      const value = values[key]

      if (
        value === null ||
        value === undefined ||
        (
          parser.defaultValue !== undefined &&
          parser.eq(value, parser.defaultValue)
        )
      ) {
        continue
      }

      parser.serialize(value).forEach(item => searchParams.append(key, item))
    }

    const queryString = searchParams.toString()

    return queryString ? `${base}?${queryString}` : base
  }
}

module.exports = {
  createLoader,
  createMultiParser,
  createSerializer
}
