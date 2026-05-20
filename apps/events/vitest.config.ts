import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'lcov'],
      include: [
        'app/api/cron/**/*.ts',
        'app/api/event-photo/**/*.ts',
        'lib/**/*.ts'
      ],
      exclude: [
        'lib/constants.ts',
        'lib/types/**',
        'lib/supabase/browser.ts'
      ],
      thresholds: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80,
        'app/api/event-photo/request/route.ts': {
          statements: 90,
          branches: 80,
          functions: 90,
          lines: 90
        },
        'app/api/event-photo/uploads/route.ts': {
          statements: 90,
          branches: 80,
          functions: 90,
          lines: 90
        },
        'lib/requests.ts': {
          statements: 90,
          branches: 80,
          functions: 90,
          lines: 90
        },
        'lib/storage.ts': {
          statements: 90,
          branches: 75,
          functions: 90,
          lines: 90
        },
        'lib/upload-proof.ts': {
          statements: 90,
          branches: 80,
          functions: 90,
          lines: 90
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': new URL('.', import.meta.url).pathname
    }
  }
})
