/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { ContactFormScrollLink } from '../ContactFormScrollLink'

const mockUsePathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname()
}))

describe('ContactFormScrollLink', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    mockUsePathname.mockReturnValue('/contact')
    window.history.replaceState({}, '', '/contact')
  })

  it('scrolls to the contact form when clicked on the contact page', () => {
    const scrollIntoViewMock = jest.fn()
    const contactFormCard = document.createElement('div')
    contactFormCard.id = 'contact-form-card'
    contactFormCard.scrollIntoView = scrollIntoViewMock
    document.body.appendChild(contactFormCard)

    render(<ContactFormScrollLink>Ask a question</ContactFormScrollLink>)

    fireEvent.click(screen.getByRole('link', { name: /ask a question/i }))

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(window.location.hash).toBe('#contact-form-card')
  })

  it('does not intercept the click outside the contact page', () => {
    const scrollIntoViewMock = jest.fn()
    const contactFormCard = document.createElement('div')
    contactFormCard.id = 'contact-form-card'
    contactFormCard.scrollIntoView = scrollIntoViewMock
    document.body.appendChild(contactFormCard)
    mockUsePathname.mockReturnValue('/cakes')

    render(<ContactFormScrollLink>Ask a question</ContactFormScrollLink>)

    fireEvent.click(screen.getByRole('link', { name: /ask a question/i }))

    expect(scrollIntoViewMock).not.toHaveBeenCalled()
  })
})
