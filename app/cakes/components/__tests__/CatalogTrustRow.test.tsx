/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { CatalogTrustRow } from '../CatalogTrustRow'

describe('CatalogTrustRow', () => {
  it('renders a flatter editorial assurance strip without nested cards or decorative icons', () => {
    const { container } = render(
      <CatalogTrustRow
        eyebrow='Why customers choose Olgish Cakes'
        items={[
          {
            title: 'Handmade in Leeds',
            detail: 'Prepared to order with careful finishing and clear communication from first enquiry.'
          },
          {
            title: 'Designed around your brief',
            detail: 'Flavour, finish and styling can be shaped around the occasion.'
          }
        ]}
      />
    )

    expect(screen.getByText('Why customers choose Olgish Cakes')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Handmade in Leeds')).toBeInTheDocument()
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
    expect(screen.queryByRole('article')).not.toBeInTheDocument()
  })

  it('returns null when there are no trust items', () => {
    const { container } = render(<CatalogTrustRow items={[]} />)

    expect(container.firstChild).toBeNull()
  })
})
