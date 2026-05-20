import { render, screen } from '@testing-library/react'
import { PortableText } from '@portabletext/react'
import { portableTextComponents } from '../portableTextComponents'

describe('portableTextComponents', () => {
  it('renders authored h1 blocks as h2 headings inside product sections', () => {
    render(
      <PortableText
        value={[
          {
            _type: 'block',
            style: 'h1',
            children: [
              {
                _type: 'span',
                text: 'Section heading'
              }
            ]
          }
        ]}
        components={portableTextComponents}
      />
    )

    expect(screen.getByRole('heading', { level: 2, name: 'Section heading' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1, name: 'Section heading' })).not.toBeInTheDocument()
  })

  it('shifts the heading hierarchy down consistently', () => {
    render(
      <PortableText
        value={[
          {
            _type: 'block',
            style: 'h2',
            children: [
              {
                _type: 'span',
                text: 'Secondary heading'
              }
            ]
          },
          {
            _type: 'block',
            style: 'h5',
            children: [
              {
                _type: 'span',
                text: 'Minor heading'
              }
            ]
          },
          {
            _type: 'block',
            style: 'h6',
            children: [
              {
                _type: 'span',
                text: 'Micro heading'
              }
            ]
          }
        ]}
        components={portableTextComponents}
      />
    )

    expect(screen.getByRole('heading', { level: 3, name: 'Secondary heading' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 6, name: 'Minor heading' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 6, name: 'Micro heading' })).not.toBeInTheDocument()
    expect(screen.getByText('Micro heading')).toHaveClass('uppercase')
  })

  it('renders only safe link protocols', () => {
    const { rerender } = render(
      <PortableText
        value={[
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Safe link',
                marks: ['safe-link']
              }
            ],
            markDefs: [
              {
                _key: 'safe-link',
                _type: 'link',
                href: 'mailto:orders@example.com'
              }
            ]
          }
        ]}
        components={portableTextComponents}
      />
    )

    expect(screen.getByRole('link', { name: 'Safe link' })).toHaveAttribute('href', 'mailto:orders@example.com')

    rerender(
      <PortableText
        value={[
          {
            _type: 'block',
            children: [
              {
                _type: 'span',
                text: 'Unsafe link',
                marks: ['unsafe-link']
              }
            ],
            markDefs: [
              {
                _key: 'unsafe-link',
                _type: 'link',
                href: 'javascript:alert(1)'
              }
            ]
          }
        ]}
        components={portableTextComponents}
      />
    )

    expect(screen.queryByRole('link', { name: 'Unsafe link' })).not.toBeInTheDocument()
    expect(screen.getByText('Unsafe link')).toBeInTheDocument()
  })
})
