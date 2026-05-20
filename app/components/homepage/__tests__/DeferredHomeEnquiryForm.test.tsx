/**
 * @jest-environment jsdom
 */
import { act, render, screen } from '@testing-library/react'
import { DeferredHomeEnquiryForm } from '../DeferredHomeEnquiryForm'

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

jest.mock('../HomeEnquiryFormInner', () => ({
  HomeEnquiryFormInner: ({
    occasionOptions
  }: {
    occasionOptions: Array<{ label: string, value?: string, disabled?: boolean }>
  }) => (
    <div
      data-testid='home-enquiry-form-component'
      data-occasion-count={occasionOptions.length}
    >
      Mock home enquiry form
    </div>
  )
}))

describe('DeferredHomeEnquiryForm', () => {
  beforeEach(() => {
    intersectionObserverCallback = null
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    })
  })

  it('renders a placeholder until the section approaches the viewport', async () => {
    render(
      <DeferredHomeEnquiryForm
        occasionOptions={[
          { label: 'Birthday', value: 'birthday' },
          { label: 'Other', value: 'other' }
        ]}
      />
    )

    expect(screen.getByTestId('home-enquiry-form-placeholder')).toBeInTheDocument()

    await act(async () => {
      intersectionObserverCallback?.([{ isIntersecting: true }])
      await Promise.resolve()
    })

    expect(await screen.findByTestId('home-enquiry-form-component')).toBeInTheDocument()
    expect(screen.getByTestId('home-enquiry-form-component')).toHaveAttribute(
      'data-occasion-count',
      '2'
    )
  })

  it('loads immediately when IntersectionObserver is unavailable', async () => {
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: undefined,
    })

    render(
      <DeferredHomeEnquiryForm
        occasionOptions={[{ label: 'Wedding', value: 'wedding' }]}
      />
    )

    expect(await screen.findByTestId('home-enquiry-form-component')).toBeInTheDocument()
  })
})
