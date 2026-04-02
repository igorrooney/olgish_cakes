/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { BlogBackLink } from '../BlogBackLink'
import { BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY } from '../navigation'

const mockUseSearchParams = jest.fn()

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockUseSearchParams()
}))

describe('BlogBackLink', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.sessionStorage.clear()
    window.history.replaceState({}, '', 'http://localhost/blog/how-to-order-cake-by-post')
    mockUseSearchParams.mockReturnValue(new URLSearchParams())
  })

  it('renders the cakes-style back link label', () => {
    render(<BlogBackLink />)

    expect(screen.getByRole('link', { name: 'Back to articles' })).toHaveAttribute('href', '/blog')
  })

  it('uses the safe archive href from the current from param', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('from=%2Fblog%3Ftopic%3Dcake-by-post%26page%3D2')
    )
    window.sessionStorage.setItem(
      BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY,
      '/blog?page=3'
    )

    render(<BlogBackLink />)

    expect(screen.getByTestId('blog-back-link')).toHaveAttribute('href', '/blog?topic=cake-by-post&page=2')
  })

  it('falls back to sessionStorage when no from param is present', () => {
    window.sessionStorage.setItem(
      BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY,
      '/blog?topic=cake-by-post&page=2'
    )

    render(<BlogBackLink />)

    expect(screen.getByTestId('blog-back-link')).toHaveAttribute('href', '/blog?topic=cake-by-post&page=2')
  })

  it('falls back to /blog when the from param is unsafe', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('from=https%3A%2F%2Fevil.example%2Fblog')
    )
    window.sessionStorage.setItem(
      BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY,
      '/blog?page=3'
    )

    render(<BlogBackLink />)

    expect(screen.getByTestId('blog-back-link')).toHaveAttribute('href', '/blog')
  })

  it('falls back to /blog when the stored href is unsafe', () => {
    window.sessionStorage.setItem(
      BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY,
      'https://evil.example/blog'
    )

    render(<BlogBackLink />)

    expect(screen.getByTestId('blog-back-link')).toHaveAttribute('href', '/blog')
  })

  it('uses history.back for a matching previous archive pathname', () => {
    window.sessionStorage.setItem(
      BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY,
      '/blog?topic=cake-by-post&page=2'
    )
    window.history.replaceState({ __olgishPreviousPathname: '/blog' }, '', window.location.href)
    const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {})

    render(<BlogBackLink />)
    fireEvent.click(screen.getByTestId('blog-back-link'))

    expect(historyBackSpy).toHaveBeenCalledTimes(1)

    historyBackSpy.mockRestore()
  })

  it('does not use history.back when the previous pathname does not match the archive', () => {
    window.sessionStorage.setItem(
      BLOG_ARCHIVE_RETURN_HREF_STORAGE_KEY,
      '/blog?topic=cake-by-post&page=2'
    )
    window.history.replaceState({ __olgishPreviousPathname: '/cakes' }, '', window.location.href)
    const historyBackSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {})

    render(<BlogBackLink />)
    fireEvent.click(screen.getByTestId('blog-back-link'))

    expect(historyBackSpy).not.toHaveBeenCalled()

    historyBackSpy.mockRestore()
  })
})
