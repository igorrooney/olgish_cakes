/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { BlogArticleLink } from '../BlogArticleLink'
import { writeStoredBlogArchiveHref } from '../navigation'

jest.mock('../navigation', () => ({
  writeStoredBlogArchiveHref: jest.fn()
}))

const mockWriteStoredBlogArchiveHref =
  writeStoredBlogArchiveHref as jest.MockedFunction<typeof writeStoredBlogArchiveHref>

describe('BlogArticleLink', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('keeps the public href clean and stores archive state on a plain click', () => {
    render(
      <BlogArticleLink
        href='/blog/postal-cake-guide'
        archiveHref='/blog?topic=cake-by-post&page=2'
      >
        Postal cake guide
      </BlogArticleLink>
    )

    const link = screen.getByRole('link', { name: 'Postal cake guide' })
    expect(link).toHaveAttribute('href', '/blog/postal-cake-guide')

    fireEvent.click(link)

    expect(mockWriteStoredBlogArchiveHref).toHaveBeenCalledWith(
      '/blog?topic=cake-by-post&page=2'
    )
  })

  it.each([
    { ctrlKey: true },
    { metaKey: true },
    { shiftKey: true },
    { altKey: true },
    { button: 1 }
  ])('does not change return state for a modifier or non-primary click', eventInit => {
    render(
      <BlogArticleLink
        href='/blog/postal-cake-guide'
        archiveHref='/blog?page=2'
      >
        Postal cake guide
      </BlogArticleLink>
    )

    fireEvent.click(
      screen.getByRole('link', { name: 'Postal cake guide' }),
      eventInit
    )

    expect(mockWriteStoredBlogArchiveHref).not.toHaveBeenCalled()
  })

  it('respects an existing click handler that prevents navigation', () => {
    render(
      <BlogArticleLink
        href='/blog/postal-cake-guide'
        archiveHref='/blog?page=2'
        onClick={event => event.preventDefault()}
      >
        Postal cake guide
      </BlogArticleLink>
    )

    fireEvent.click(screen.getByRole('link', { name: 'Postal cake guide' }))

    expect(mockWriteStoredBlogArchiveHref).not.toHaveBeenCalled()
  })
})
