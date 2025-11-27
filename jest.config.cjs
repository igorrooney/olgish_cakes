const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/__tests__/**',
    '!**/*.test.{ts,tsx}',
    '!**/*.spec.{ts,tsx}',
    // Exclude server-only files that are difficult to test
    '!app/**/layout.tsx',
    '!app/**/loading.tsx',
    '!app/**/error.tsx',
    '!app/**/not-found.tsx',
    '!app/**/template.tsx',
    '!app/sitemap*.ts',
    '!app/robots.ts',
    '!app/manifest.ts',
    '!app/opengraph-image.tsx',
    '!app/twitter-image.tsx',
    '!app/icon.tsx',
    '!app/apple-icon.tsx',
    // Exclude static landing pages with minimal logic
    '!app/cookies/page.tsx',
    '!app/privacy/page.tsx',
    '!app/terms/page.tsx',
    '!app/return-policy/page.tsx',
    '!app/allergen-information/page.tsx',
    '!app/delivery-areas/page.tsx',
    '!app/accessibility/page.tsx',
    // Exclude SEO landing pages with repetitive structure
    // BUT include specific high-value SEO pages with comprehensive tests
    '!app/*-cakes-leeds/page.tsx',
    '!app/cakes-*/page.tsx',
    '!app/ukrainian-*/page.tsx',
    'app/ukrainian-cake/page.tsx', // Re-include: has comprehensive tests
    '!app/*-wedding-cakes*/page.tsx',
    '!app/best-cakes-for-*/page.tsx',
    '!app/cake-*/page.tsx',
    'app/cake-in-leeds/page.tsx', // Re-include: has comprehensive tests
    'app/honey-cake/page.tsx', // Re-include: has comprehensive tests
    '!app/*-cake-*/page.tsx',
    // Exclude admin pages (tested via integration)
    '!app/admin/**/page.tsx',
    '!app/test-emails/**',
    // Exclude Sanity studio
    '!app/studio/**',
    '!sanity/**',
    '!studio/**',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary', 'html'],
  coverageThreshold: {
    // Realistic coverage thresholds based on current codebase
    // Will be increased incrementally as more tests are added
    global: {
      branches: 30,
      functions: 25,
      lines: 35,
      statements: 35,
    },
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  transformIgnorePatterns: [
    'node_modules/(?!(jose|@mui|@babel/runtime|@emotion)(?:/|$))',
    '^.+\\.module\\.(css|sass|scss)$',
  ],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig);

