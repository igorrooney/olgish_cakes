/**
 * @jest-environment jsdom
 */
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import React from 'react'
import NotFound from '../not-found'

type MockLinkProps = {
  children: ReactNode
  href: string
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: MockLinkProps) => <a href={href} {...props}>{children}</a>
}))

describe('NotFound', () => {
  it('renders the 404 content and returns home via internal navigation', () => {
    render(<NotFound />)

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /return home/i })).toHaveAttribute('href', '/')
  })
})
