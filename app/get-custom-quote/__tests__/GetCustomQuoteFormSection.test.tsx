/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { GetCustomQuoteFormSection } from '../GetCustomQuoteFormSection'

jest.mock('../../providers', () => ({
  Providers: ({ children }: { children: ReactNode }) => (
    <div data-testid='query-providers'>{children}</div>
  )
}))

jest.mock('../GetCustomQuoteForm', () => ({
  GetCustomQuoteForm: ({
    occasionOptions
  }: {
    occasionOptions: Array<{ label: string, value?: string, disabled?: boolean }>
  }) => (
    <div
      data-testid='get-custom-quote-form'
      data-occasion-count={occasionOptions.length}
    >
      Mock quote form
    </div>
  )
}))

describe('GetCustomQuoteFormSection', () => {
  it('renders the quote copy and wraps the form with local query providers', () => {
    render(
      <GetCustomQuoteFormSection
        occasionOptions={[
          { label: 'Select from list', value: '', disabled: true },
          { label: 'Wedding Cakes', value: 'Wedding Cakes' }
        ]}
      />
    )

    expect(screen.getByRole('heading', { level: 2, name: /tell me what you are planning/i })).toBeInTheDocument()
    expect(screen.getByText(/start with the details that help me price the cake properly/i)).toBeInTheDocument()
    expect(screen.getByTestId('query-providers')).toBeInTheDocument()
    expect(screen.getByTestId('get-custom-quote-form')).toHaveAttribute('data-occasion-count', '2')
  })
})
