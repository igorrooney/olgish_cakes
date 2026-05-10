/* eslint-disable @typescript-eslint/no-require-imports */
const nextJest = require('next/jest')
const baseConfig = require('./jest.config.base.cjs')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './'
})

const customJestConfig = {
  ...baseConfig,
  displayName: 'web',
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^nanoid$': '<rootDir>/test/mocks/nanoid.cjs'
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)'
  ],
  testPathIgnorePatterns: [...baseConfig.testPathIgnorePatterns, '/app/api/'],
  transformIgnorePatterns: [
    'node_modules/(?!(jose|@babel/runtime|@sanity|next-sanity|nanoid|uuid)(?:/|$))',
    '^.+\\.module\\.(css|sass|scss)$'
  ]
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
