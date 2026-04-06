/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { HoverPrefetchLink } from '../HoverPrefetchLink'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    prefetch,
    ...props
  }: {
    children: ReactNode
    href: string
    prefetch?: boolean | null
  }) => (
    <a
      data-prefetch={
        prefetch === null ? 'null' : typeof prefetch === 'boolean' ? String(prefetch) : 'undefined'
      }
      {...props}
    >
      {children}
    </a>
  )
}))

describe('HoverPrefetchLink', () => {
  it('keeps prefetch disabled until the link is hovered', () => {
    render(<HoverPrefetchLink href='/contact'>Contact</HoverPrefetchLink>)

    const link = screen.getByRole('link', { name: /contact/i })

    expect(link).toHaveAttribute('data-prefetch', 'false')

    fireEvent.mouseEnter(link)

    expect(link).toHaveAttribute('data-prefetch', 'null')
  })

  it('enables prefetch when the link receives focus', () => {
    render(<HoverPrefetchLink href='/cakes'>Cakes</HoverPrefetchLink>)

    const link = screen.getByRole('link', { name: /cakes/i })

    expect(link).toHaveAttribute('data-prefetch', 'false')

    fireEvent.focus(link)

    expect(link).toHaveAttribute('data-prefetch', 'null')
  })
})
