/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { consentOpenEventName } from '@/app/lib/consent-config'
import { ManageCookiesLink } from '../ManageCookiesLink'

describe('ManageCookiesLink', () => {
  it('requests the first-party preferences dialog', () => {
    const listener = jest.fn()
    window.addEventListener(consentOpenEventName, listener)

    render(<ManageCookiesLink />)
    fireEvent.click(screen.getByRole('button', { name: 'Manage cookies' }))

    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(consentOpenEventName, listener)
  })
})
