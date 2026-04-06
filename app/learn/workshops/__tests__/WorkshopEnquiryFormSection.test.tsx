/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { WorkshopEnquiryFormSection } from '../WorkshopEnquiryFormSection'

jest.mock('../DeferredWorkshopEnquiryForm', () => ({
  DeferredWorkshopEnquiryForm: () => (
    <div data-testid='deferred-workshop-enquiry-form'>Mock enquiry form</div>
  )
}))

describe('WorkshopEnquiryFormSection', () => {
  it('renders the practical enquiry intro and the form container', () => {
    render(<WorkshopEnquiryFormSection />)

    expect(
      screen.getByRole('heading', { level: 2, name: /tell me about the event/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/send the date, venue and rough numbers first/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/if you already know the colours or style, add that as well/i)
    ).toBeInTheDocument()
    expect(screen.getByTestId('deferred-workshop-enquiry-form')).toBeInTheDocument()
  })
})
