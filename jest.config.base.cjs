module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    // Mock server-only modules
    'server-only': '<rootDir>/__mocks__/empty.js',
    // Mock Next.js fonts
    '@next/font/(.*)': '<rootDir>/__mocks__/empty.js',
    'next/font/(.*)': '<rootDir>/__mocks__/empty.js'
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
    '!studio/**'
  ],
  coverageThreshold: {
    // Commercial release gate: keep broad coverage healthy while focusing
    // stricter reviews on high-risk business and security paths.
    global: {
      branches: 70,
      functions: 80,
      lines: 85,
      statements: 85
    }
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '<rootDir>/next.config.js',
    '<rootDir>/scripts/',
    '<rootDir>/sanity/',
    '<rootDir>/studio/',
    '<rootDir>/test/'
  ],
  moduleDirectories: ['node_modules', '<rootDir>/'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '<rootDir>/apps/events/',
    '<rootDir>/\\.tmp-script-run/',
    '<rootDir>/\\.codex-artifacts/',
    '<rootDir>/\\.playwright-mcp/'
  ],
  watchPathIgnorePatterns: [
    '<rootDir>/apps/events/',
    '<rootDir>/\\.tmp-script-run/',
    '<rootDir>/\\.codex-artifacts/',
    '<rootDir>/\\.playwright-mcp/'
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jose|@babel/runtime)(?:/|$))',
    '^.+\\.module\\.(css|sass|scss)$'
  ]
}
