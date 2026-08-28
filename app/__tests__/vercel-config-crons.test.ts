/**
 * @jest-environment node
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

interface VercelCron {
  path: string
  schedule: string
}

interface VercelConfig {
  $schema?: string
  crons?: VercelCron[]
}

describe('vercel.json cron config', () => {
  it('registers scheduled article revalidation every 5 minutes', () => {
    const configPath = path.join(process.cwd(), 'vercel.json')
    const parsedConfig = JSON.parse(readFileSync(configPath, 'utf8')) as VercelConfig

    expect(parsedConfig.$schema).toBe('https://openapi.vercel.sh/vercel.json')
    expect(parsedConfig.crons).toEqual(expect.arrayContaining([
      {
        path: '/api/cron/revalidate-articles',
        schedule: '*/5 * * * *'
      }
    ]))
  })

  it('registers quarterly privacy-retention discovery without automatic deletion', () => {
    const configPath = path.join(process.cwd(), 'vercel.json')
    const parsedConfig = JSON.parse(readFileSync(configPath, 'utf8')) as VercelConfig

    expect(parsedConfig.crons).toEqual(expect.arrayContaining([
      {
        path: '/api/cron/privacy-retention',
        schedule: '0 8 1 3,6,9,12 *'
      }
    ]))
  })
})
