/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import Loading from '../loading'

describe('Cake detail loading state', () => {
  it('renders the public loading skeleton without MUI', () => {
    render(<Loading />)

    expect(screen.getByTestId('cake-loading-skeleton')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByLabelText('Loading cake details')).toBeInTheDocument()
    expect(screen.getByTestId('cake-loading-main-image')).toBeInTheDocument()
    expect(screen.getAllByTestId('cake-loading-thumbnail')).toHaveLength(3)
    expect(screen.getByTestId('cake-loading-title')).toBeInTheDocument()
    expect(screen.getByTestId('cake-loading-meta')).toBeInTheDocument()
    expect(screen.getByTestId('cake-loading-description')).toBeInTheDocument()
    expect(screen.getByTestId('cake-loading-ingredients')).toBeInTheDocument()
    expect(screen.getByTestId('cake-loading-price')).toBeInTheDocument()
  })
})
