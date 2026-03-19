/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { getCustomQuoteFaqItems, GetCustomQuoteFaq } from '../GetCustomQuoteFaq'

describe('GetCustomQuoteFaq', () => {
  it('renders the approved practical faq set', () => {
    render(<GetCustomQuoteFaq />)

    expect(screen.getByRole('heading', { level: 2, name: 'A few practical answers' })).toBeInTheDocument()
    expect(screen.getByText(getCustomQuoteFaqItems[0].question)).toBeInTheDocument()
    expect(screen.getByText(getCustomQuoteFaqItems[1].question)).toBeInTheDocument()
    expect(screen.getByText(getCustomQuoteFaqItems[2].question)).toBeInTheDocument()
    expect(screen.getByText(getCustomQuoteFaqItems[3].question)).toBeInTheDocument()
  })

  it('includes UK delivery by agreement in the fulfilment answer', () => {
    render(<GetCustomQuoteFaq />)

    fireEvent.click(screen.getByRole('button', { name: /do you offer collection, local delivery or uk delivery/i }))
    expect(screen.getByText(/UK delivery is possible by agreement/i)).toBeInTheDocument()
  })
})
