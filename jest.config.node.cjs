const nextJest = require('next/jest')
const baseConfig = require('./jest.config.base.cjs')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './'
})

const customJestConfig = {
  ...baseConfig,
  testEnvironment: 'node',
  testMatch: [
    'app/api/**/__tests__/**/*.[jt]s?(x)',
    'app/api/**/?(*.)+(spec|test).[jt]s?(x)'
  ]
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
