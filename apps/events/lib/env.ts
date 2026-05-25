export function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function getOptionalEnv(name: string, fallback = ''): string {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value : fallback
}

export function getBooleanEnv(name: string, fallback: boolean): boolean {
  const value = process.env[name]

  if (!value) {
    return fallback
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}
