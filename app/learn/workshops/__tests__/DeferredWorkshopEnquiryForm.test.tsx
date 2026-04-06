/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { DeferredWorkshopEnquiryForm } from '../DeferredWorkshopEnquiryForm'

type IntersectionObserverCallbackType = (
  entries: Array<Partial<IntersectionObserverEntry>>
) => void

let intersectionObserverCallback: IntersectionObserverCallbackType | null = null

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallbackType) {
    intersectionObserverCallback = callback
  }

  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() {
    return []
  }
}

jest.mock('@/app/providers', () => ({
  Providers: ({ children }: { children: ReactNode }) => (
    <div data-testid='query-providers'>{children}</div>
  )
}))

jest.mock('../WorkshopEnquiryForm', () => ({
  WorkshopEnquiryForm: () => (
    <div data-testid='workshop-enquiry-form-component'>Mock workshop enquiry form</div>
  )
}))

describe('DeferredWorkshopEnquiryForm', () => {
  beforeEach(() => {
    intersectionObserverCallback = null
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    })
  })

  it('renders a placeholder until the form section approaches the viewport', async () => {
    render(<DeferredWorkshopEnquiryForm />)

    expect(screen.getByTestId('workshop-enquiry-form-placeholder')).toBeInTheDocument()
    expect(screen.queryByTestId('query-providers')).not.toBeInTheDocument()

    await act(async () => {
      intersectionObserverCallback?.([{ isIntersecting: true }])
      await Promise.resolve()
    })

    expect(await screen.findByTestId('query-providers')).toBeInTheDocument()
    expect(screen.getByTestId('workshop-enquiry-form-component')).toBeInTheDocument()
  })
})
