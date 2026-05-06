/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { AttachmentPreview } from '../AttachmentPreview'

describe('AttachmentPreview', () => {
  it('renders a safe image attachment preview with manager actions', () => {
    render(
      <AttachmentPreview
        attachment={{
          label: 'reference.jpg',
          href: 'https://signed.example/reference.jpg',
          downloadHref: 'https://signed.example/reference.jpg?download=',
          previewHref: 'https://signed.example/reference.jpg',
          mimeType: 'image/jpeg',
          detail: 'image/jpeg - 2 KB'
        }}
      />
    )

    expect(screen.getByRole('img', { name: 'Reference attachment: reference.jpg' })).toHaveAttribute(
      'src',
      'https://signed.example/reference.jpg'
    )
    expect(screen.getByRole('link', { name: 'Open reference.jpg' })).toHaveAttribute(
      'href',
      'https://signed.example/reference.jpg'
    )
    expect(screen.getByRole('link', { name: 'Open full size' })).toHaveAttribute(
      'href',
      'https://signed.example/reference.jpg'
    )
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      'https://signed.example/reference.jpg?download='
    )
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute('download', 'reference.jpg')
    expect(screen.getByText('image/jpeg - 2 KB')).toBeInTheDocument()
  })

  it('falls back to a file card when an inline preview is not available', () => {
    render(
      <AttachmentPreview
        attachment={{
          label: 'brief.pdf',
          href: 'https://signed.example/brief.pdf',
          mimeType: 'application/pdf',
          detail: 'application/pdf'
        }}
      />
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Preview unavailable')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open full size' })).toHaveAttribute(
      'href',
      'https://signed.example/brief.pdf'
    )
  })
})
