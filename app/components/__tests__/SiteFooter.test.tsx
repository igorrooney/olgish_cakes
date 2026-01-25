import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import React from 'react'
import { SiteFooter } from '../SiteFooter'

interface LinkProps {
  children: ReactNode
  href: string
  [key: string]: unknown
}

interface ImageProps {
  alt?: string
  src?: string | { src?: string }
  [key: string]: unknown
}

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: LinkProps) => (
    <a href={href} {...props}>{children}</a>
  )
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: ImageProps) => {
    const resolvedSrc = typeof src === 'string' ? src : src?.src || ''
    return <img alt={alt} src={resolvedSrc} {...props} />
  }
}))

describe('SiteFooter', () => {
  it('renders the divider image', () => {
    render(<SiteFooter />)

    const divider = screen.getByAltText('Decorative yellow wavy divider with dots')
    expect(divider).toHaveAttribute('src', '/design/mobile-home/footer-image.png')
  })

  it('renders navigation links', () => {
    render(<SiteFooter />)

    expect(screen.getByRole('link', { name: 'Cakes by post' })).toHaveAttribute('href', '/cakes')
    expect(screen.getByRole('link', { name: 'Custom cakes' })).toHaveAttribute('href', '/custom-cakes')
    expect(screen.getByRole('link', { name: 'Learn hub' })).toHaveAttribute('href', '/learn')
  })

  it('renders contact links', () => {
    render(<SiteFooter />)

    expect(screen.getByRole('link', { name: '+44 786 721 8194' })).toHaveAttribute('href', 'tel:+447867218194')
    expect(screen.getByRole('link', { name: 'hello@olgishcakes.co.uk' })).toHaveAttribute('href', 'mailto:hello@olgishcakes.co.uk')
    expect(screen.getByText('Allerton Grange')).toBeInTheDocument()
    expect(screen.getByText('Leeds, LS17')).toBeInTheDocument()
  })

  it('renders social links with safe external attributes', () => {
    render(<SiteFooter />)

    const facebookLink = screen.getByLabelText('Facebook')
    const youtubeLink = screen.getByLabelText('YouTube')
    const instagramLink = screen.getByLabelText('Instagram')

    expect(facebookLink).toHaveAttribute('target', '_blank')
    expect(facebookLink).toHaveAttribute('rel', 'noreferrer noopener')
    expect(youtubeLink).toHaveAttribute('target', '_blank')
    expect(youtubeLink).toHaveAttribute('rel', 'noreferrer noopener')
    expect(youtubeLink).toHaveAttribute(
      'href',
      'https://www.youtube.com/channel/UCxv3i6tL5v5KZNjT1z1Rx1Q?cbrd=1'
    )
    expect(instagramLink).toHaveAttribute('target', '_blank')
    expect(instagramLink).toHaveAttribute('rel', 'noreferrer noopener')
  })

  it('renders a single contentinfo landmark', () => {
    render(<SiteFooter />)

    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
  })
})
