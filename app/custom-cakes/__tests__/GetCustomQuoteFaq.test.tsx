/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { getCustomQuoteFaqItems, GetCustomQuoteFaq } from '../GetCustomQuoteFaq'

describe('GetCustomQuoteFaq', () => {
  it('renders the approved practical faq set', () => {
    render(<GetCustomQuoteFaq />)

    expect(screen.getByRole('heading', { level: 2, name: 'Need help before requesting your quote?' })).toBeInTheDocument()
    expect(screen.getByText('Everything you need before requesting your cake quote.')).toBeInTheDocument()
    expect(screen.getByText(getCustomQuoteFaqItems[0].question)).toBeInTheDocument()
    expect(screen.getByText(getCustomQuoteFaqItems[1].question)).toBeInTheDocument()
    expect(screen.getByText(getCustomQuoteFaqItems[2].question)).toBeInTheDocument()
    expect(screen.getByText(getCustomQuoteFaqItems[3].question)).toBeInTheDocument()
  })

  it('explains the available collection and delivery options', () => {
    render(<GetCustomQuoteFaq />)

    const deliveryQuestion = screen.getByRole('button', { name: /do you offer collection, local delivery or uk delivery/i })
    const deliveryAnswer = screen.getByText(/We also offer local delivery and UK delivery by agreement/i).closest('[role="region"]')

    expect(deliveryAnswer).toHaveAttribute('hidden')

    fireEvent.click(deliveryQuestion)

    expect(deliveryAnswer).not.toHaveAttribute('hidden')
    expect(screen.getByText(/We'll recommend the best option for your cake/i)).toBeInTheDocument()
  })

  it('keeps every answer in the document before interaction', () => {
    render(<GetCustomQuoteFaq />)

    getCustomQuoteFaqItems.forEach((item) => {
      expect(screen.getByText(item.answer)).toBeInTheDocument()
    })
  })

  it('directs health information to the protected field', () => {
    render(<GetCustomQuoteFaq />)

    expect(screen.getByText(/Use the separate dietary health information field only for allergies, intolerances or health-related information/i)).toBeInTheDocument()
  })
})
