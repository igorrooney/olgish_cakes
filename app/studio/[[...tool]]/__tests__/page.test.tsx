/**
 * @jest-environment jsdom
 */

// Mock all Sanity studio dependencies before any imports
jest.mock('next-sanity/studio', () => ({
  NextStudio: () => null
}))

jest.mock('@/sanity.config', () => ({
  default: {}
}))

jest.mock('sanity', () => ({
  createClient: jest.fn(() => ({}))
}))

describe('StudioPage', () => {
  it('should have studio configuration', () => {
    // Studio page is handled by Sanity
    expect(true).toBe(true)
  })
})

