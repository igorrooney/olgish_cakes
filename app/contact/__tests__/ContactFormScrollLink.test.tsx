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
    window.matchMedia = jest.fn().mockReturnValue({
      matches: false
    })
  })

  it('scrolls to the contact form when clicked on the contact page', () => {
    const scrollIntoViewMock = jest.fn()
    const contactFormCard = document.createElement('div')
    contactFormCard.id = 'contact-form-card'
    contactFormCard.tabIndex = -1
    contactFormCard.scrollIntoView = scrollIntoViewMock
    document.body.appendChild(contactFormCard)

    render(<ContactFormScrollLink>Ask a question</ContactFormScrollLink>)

    fireEvent.click(screen.getByRole('link', { name: /ask a question/i }))

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(contactFormCard).toHaveFocus()
    expect(window.location.hash).toBe('#contact-form-card')
  })

  it('uses instant scrolling when reduced motion is requested', () => {
    window.matchMedia = jest.fn().mockReturnValue({
      matches: true
    })
    const scrollIntoViewMock = jest.fn()
    const contactFormCard = document.createElement('div')
    contactFormCard.id = 'contact-form-card'
    contactFormCard.tabIndex = -1
    contactFormCard.scrollIntoView = scrollIntoViewMock
    document.body.appendChild(contactFormCard)

    render(<ContactFormScrollLink>Ask a question</ContactFormScrollLink>)

    fireEvent.click(screen.getByRole('link', { name: /ask a question/i }))

    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' })
    expect(contactFormCard).toHaveFocus()
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
