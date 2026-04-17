/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { DeferredContactPageForm } from '../DeferredContactPageForm'

jest.mock('../ContactPageFormShell', () => ({
  ContactPageFormShell: () => <div data-testid='contact-page-form-shell'>Contact page form</div>
}))

describe('DeferredContactPageForm', () => {
  it('renders the contact form shell immediately', () => {
    render(<DeferredContactPageForm />)

    expect(screen.getByTestId('contact-page-form-shell')).toBeInTheDocument()
  })
})
