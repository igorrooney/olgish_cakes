// Type helpers for test mocks

import { Cake } from '@/types/cake'

// Partial Cake type for testing
export type PartialCake = Partial<Cake> & {
  _id: string
  name: string
  slug?: { current: string }
}

// Mark specific modules as allowing any for tests
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveStyle(style: string | Record<string, any>): R
    }
  }
}

// Helper to create partial cake mocks
export function mockCake(overrides: PartialCake): Cake {
  return {
    _createdAt: '',
    _id: overrides._id,
    _rev: '',
    _type: 'cake',
    _updatedAt: '',
    name: overrides.name,
    slug: overrides.slug || { _type: 'slug', current: '' },
    category: '',
    description: [],
    size: { diameter: 0, height: 0, servings: 0 },
    pricing: { standard: 0 },
    designs: [],
    ...overrides
  } as Cake
}

