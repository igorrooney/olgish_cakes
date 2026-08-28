/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { WorkshopEnquiryFormSection } from '../WorkshopEnquiryFormSection'

jest.mock('@/app/providers', () => ({
  Providers: ({ children }: { children: ReactNode }) => (
    <div data-testid='query-providers'>{children}</div>
  )
}))

jest.mock('../WorkshopEnquiryForm', () => ({
  WorkshopEnquiryForm: () => (
    <form aria-label='Workshop enquiry'>
      <label htmlFor='fullName'>Full name</label>
      <input id='fullName' />
    </form>
  )
}))

describe('WorkshopEnquiryFormSection', () => {
  it('renders the practical enquiry intro and the form immediately inside its provider', () => {
    render(<WorkshopEnquiryFormSection />)

    expect(
      screen.getByRole('heading', { level: 2, name: /tell us about the event/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/send the date, venue and rough numbers first/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/if you already know the colours or style, add that as well/i)
    ).toBeInTheDocument()
    expect(screen.getByTestId('query-providers')).toBeInTheDocument()
    expect(screen.getByRole('form', { name: /workshop enquiry/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^full name$/i)).toBeInTheDocument()
    expect(screen.queryByTestId('workshop-enquiry-form-placeholder')).not.toBeInTheDocument()
    const section = document.getElementById('workshop-enquiry-form')
    expect(section).toHaveAttribute('tabindex', '-1')
    expect(section).toHaveAttribute('aria-labelledby', 'workshop-enquiry-form-heading')
  })
})
