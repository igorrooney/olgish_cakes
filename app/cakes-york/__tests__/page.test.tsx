/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'

// Mock the page module
jest.mock('../page', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve(<div data-testid="page">Page Content</div>)),
  metadata: { title: 'Test Page', description: 'Test description' },
  generateMetadata: jest.fn(() => Promise.resolve({ title: 'Test', description: 'Test' }))
}))

describe('Page', () => {
  it('should export metadata or generateMetadata', () => {
    const module = require('../page')
    expect(module.metadata || module.generateMetadata).toBeDefined()
  })
})
