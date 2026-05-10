/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest')
const baseConfig = require('./jest.config.base.cjs')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './'
})

const apiTestRegex = 'app[\\\\/]api[\\\\/].*\\.(spec|test)\\.[jt]sx?$'

const customJestConfig = {
  ...baseConfig,
  displayName: 'api',
  testEnvironment: 'node',
  testRegex: [apiTestRegex]
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
