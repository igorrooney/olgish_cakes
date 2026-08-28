/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { SensitiveDataConsentFields } from '../SensitiveDataConsentFields'
import { sensitiveDataConsentRequiredMessage } from '@/lib/legal/sensitive-data-consent'

function ControlledConsentFields({
  consentError,
  informationError
}: {
  consentError?: string
  informationError?: string
}) {
  const [information, setInformation] = useState('')
  const [consent, setConsent] = useState(false)

  return (
    <SensitiveDataConsentFields
      information={information}
      consent={consent}
      consentError={consentError}
      informationError={informationError}
      onInformationChange={setInformation}
      onConsentChange={setConsent}
    />
  )
}

describe('SensitiveDataConsentFields', () => {
  it('starts with an optional empty textarea and no consent checkbox', () => {
    render(<ControlledConsentFields />)

    const information = screen.getByRole('textbox', {
      name: 'Allergy, intolerance or health-related dietary information (Optional)'
    })
    const disclosure = screen.getByTestId('dietary-health-consent-disclosure')
    const hiddenCheckbox = disclosure.querySelector('input[type="checkbox"]')

    expect(information).toHaveValue('')
    expect(information).toHaveClass('rounded-box')
    expect(screen.getByText(/use this field only/i)).toHaveClass(
      'text-sm',
      'leading-6',
      'text-base-content/80'
    )
    expect(disclosure).toHaveAttribute('aria-hidden', 'true')
    expect(disclosure).toHaveAttribute('inert')
    expect(disclosure).toHaveClass(
      'mt-0',
      'grid-rows-[0fr]',
      'opacity-0',
      'motion-reduce:transition-none'
    )
    expect(hiddenCheckbox).toBeDisabled()
    expect(hiddenCheckbox).not.toBeRequired()
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute('href', '/privacy')
  })

  it('shows an initially unticked required checkbox only after information is entered', () => {
    render(<ControlledConsentFields />)

    fireEvent.change(
      screen.getByLabelText(/allergy, intolerance or health-related/i),
      { target: { value: 'Severe nut allergy' } }
    )

    const disclosure = screen.getByTestId('dietary-health-consent-disclosure')
    const checkbox = screen.getByRole('checkbox')

    expect(disclosure).toHaveAttribute('aria-hidden', 'false')
    expect(disclosure).not.toHaveAttribute('inert')
    expect(disclosure).toHaveClass('mt-3', 'grid-rows-[1fr]', 'opacity-100')
    expect(checkbox).not.toBeChecked()
    expect(checkbox).not.toBeDisabled()
    expect(checkbox).toBeRequired()
    expect(checkbox).toHaveClass('checkbox-primary')
  })

  it('clears consent and hides the checkbox when the information is cleared', () => {
    render(<ControlledConsentFields />)
    const information = screen.getByLabelText(/allergy, intolerance or health-related/i)

    fireEvent.change(information, { target: { value: 'Lactose intolerance' } })
    fireEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('checkbox')).toBeChecked()

    fireEvent.change(information, { target: { value: '' } })
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()

    fireEvent.change(information, { target: { value: 'Lactose intolerance' } })
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('associates and focuses the conditional consent error', () => {
    const { rerender } = render(<ControlledConsentFields />)
    fireEvent.change(
      screen.getByLabelText(/allergy, intolerance or health-related/i),
      { target: { value: 'Coeliac disease' } }
    )

    rerender(<ControlledConsentFields consentError={sensitiveDataConsentRequiredMessage} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveFocus()
    expect(checkbox).toHaveAttribute('aria-invalid', 'true')
    expect(checkbox).toHaveClass('checkbox-error')
    expect(checkbox).not.toHaveClass('checkbox-primary')
    expect(checkbox.getAttribute('aria-describedby')).toContain('dietaryHealthConsent-error')
    expect(screen.getByRole('alert')).toHaveClass(
      'alert',
      'border-error/30',
      'bg-error/10',
      'text-error'
    )
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'assertive')
    expect(screen.getByRole('alert')).toHaveTextContent(sensitiveDataConsentRequiredMessage)
  })

  it('shows and associates a visible textarea error', () => {
    render(<ControlledConsentFields informationError='Health information is too long' />)

    const information = screen.getByRole('textbox', {
      name: 'Allergy, intolerance or health-related dietary information (Optional)'
    })
    const alert = screen.getByRole('alert')

    expect(information).toHaveClass('textarea-error')
    expect(information).toHaveAttribute('aria-invalid', 'true')
    expect(information.getAttribute('aria-describedby')).toContain(
      'dietaryHealthInformation-error'
    )
    expect(alert).toHaveTextContent('Health information is too long')
    expect(alert).toHaveClass('alert', 'text-error')
  })
})
