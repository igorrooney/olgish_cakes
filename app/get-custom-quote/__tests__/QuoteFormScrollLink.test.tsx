/**
 * @jest-environment jsdom
 */
import type { MouseEvent, ReactNode } from 'react'
import { createEvent, fireEvent, render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { QuoteFormScrollLink } from '../QuoteFormScrollLink'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn()
}))

jest.mock('next/link', () => {
  return function MockNextLink({
    children,
    href,
    onClick,
    className
  }: {
    children: ReactNode
    href: string
    onClick?: (event: MouseEvent<HTMLAnchorElement>) => void
    className?: string
  }) {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    )
  }
})

const mockedUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

function createQuoteFormTarget() {
  const quoteFormSection = document.createElement('section')
  quoteFormSection.id = 'quote-form'
  const scrollIntoViewMock = jest.fn()

  Object.defineProperty(quoteFormSection, 'scrollIntoView', {
    value: scrollIntoViewMock,
    writable: true
  })

  document.body.appendChild(quoteFormSection)

  return { scrollIntoViewMock }
}

describe('QuoteFormScrollLink', () => {
  beforeEach(() => {
    mockedUsePathname.mockReset()
    window.history.replaceState(null, '', '/get-custom-quote')
  })

  afterEach(() => {
    document.body.innerHTML = ''
    jest.restoreAllMocks()
  })

  it('scrolls to the quote form on the quote page', () => {
    mockedUsePathname.mockReturnValue('/get-custom-quote')
    const { scrollIntoViewMock } = createQuoteFormTarget()
    const pushStateSpy = jest.spyOn(window.history, 'pushState')

    render(
      <QuoteFormScrollLink className='btn'>
        Start your quote
      </QuoteFormScrollLink>
    )

    fireEvent.click(screen.getByRole('link', { name: /start your quote/i }))

    expect(pushStateSpy).toHaveBeenCalledTimes(1)
    expect(pushStateSpy).toHaveBeenCalledWith(null, '', '/get-custom-quote#quote-form')
    expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
    expect(window.location.hash).toBe('#quote-form')
  })

  it('scrolls again when the hash is already active', () => {
    mockedUsePathname.mockReturnValue('/get-custom-quote')
    const { scrollIntoViewMock } = createQuoteFormTarget()
    const pushStateSpy = jest.spyOn(window.history, 'pushState')
    window.history.replaceState(null, '', '/get-custom-quote#quote-form')

    render(
      <QuoteFormScrollLink className='btn'>
        Start your quote
      </QuoteFormScrollLink>
    )

    fireEvent.click(screen.getByRole('link', { name: /start your quote/i }))
    fireEvent.click(screen.getByRole('link', { name: /start your quote/i }))

    expect(pushStateSpy).not.toHaveBeenCalled()
    expect(scrollIntoViewMock).toHaveBeenCalledTimes(2)
  })

  it('does not block modified clicks on the quote page', () => {
    mockedUsePathname.mockReturnValue('/get-custom-quote')
    const { scrollIntoViewMock } = createQuoteFormTarget()
    const pushStateSpy = jest.spyOn(window.history, 'pushState')

    render(
      <QuoteFormScrollLink className='btn'>
        Start your quote
      </QuoteFormScrollLink>
    )

    const link = screen.getByRole('link', { name: /start your quote/i })
    const clickEvent = createEvent.click(link, { metaKey: true })

    fireEvent(link, clickEvent)

    expect(clickEvent.defaultPrevented).toBe(false)
    expect(pushStateSpy).not.toHaveBeenCalled()
    expect(scrollIntoViewMock).not.toHaveBeenCalled()
    expect(link).toHaveAttribute('href', '/get-custom-quote#quote-form')
  })

  it('does not throw when the quote form is missing', () => {
    mockedUsePathname.mockReturnValue('/get-custom-quote')
    const getByIdSpy = jest.spyOn(document, 'getElementById')
    const pushStateSpy = jest.spyOn(window.history, 'pushState')

    render(
      <QuoteFormScrollLink className='btn'>
        Start your quote
      </QuoteFormScrollLink>
    )

    expect(() => {
      fireEvent.click(screen.getByRole('link', { name: /start your quote/i }))
    }).not.toThrow()
    expect(getByIdSpy).toHaveBeenCalledWith('quote-form')
    expect(pushStateSpy).not.toHaveBeenCalled()
  })

  it('does not block navigation outside the quote page', () => {
    mockedUsePathname.mockReturnValue('/cakes')
    const pushStateSpy = jest.spyOn(window.history, 'pushState')

    render(
      <QuoteFormScrollLink className='btn'>
        Start your quote
      </QuoteFormScrollLink>
    )

    const link = screen.getByRole('link', { name: /start your quote/i })
    const clickEvent = createEvent.click(link)

    fireEvent(link, clickEvent)

    expect(clickEvent.defaultPrevented).toBe(false)
    expect(pushStateSpy).not.toHaveBeenCalled()
    expect(link).toHaveAttribute('href', '/get-custom-quote#quote-form')
  })
})
