export interface RequestIpLocation {
  city?: string
  region?: string
  country?: string
  latitude?: string
  longitude?: string
  source: 'vercel-ip-headers'
}

function readDecodedHeader(headers: Headers, name: string): string | undefined {
  const value = headers.get(name)?.trim()

  if (!value) {
    return undefined
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export function getRequestIpLocation(headers: Headers): RequestIpLocation | undefined {
  const location = {
    city: readDecodedHeader(headers, 'x-vercel-ip-city'),
    region: readDecodedHeader(headers, 'x-vercel-ip-country-region'),
    country: readDecodedHeader(headers, 'x-vercel-ip-country'),
    latitude: readDecodedHeader(headers, 'x-vercel-ip-latitude'),
    longitude: readDecodedHeader(headers, 'x-vercel-ip-longitude')
  }

  const hasLocationValue = Object.values(location).some((value) => Boolean(value))

  if (!hasLocationValue) {
    return undefined
  }

  return {
    ...location,
    source: 'vercel-ip-headers'
  }
}

export function formatRequestIpLocation(location: RequestIpLocation | undefined): string | undefined {
  if (!location) {
    return undefined
  }

  const label = [location.city, location.region, location.country]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(', ')

  return label.length > 0 ? label : undefined
}
