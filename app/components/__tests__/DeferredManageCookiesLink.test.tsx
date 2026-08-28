/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { consentOpenEventName } from '@/app/lib/consent-config'
import { DeferredManageCookiesLink } from '../DeferredManageCookiesLink'

describe('DeferredManageCookiesLink', () => {
  it('requests the lazy preferences dialog', () => {
    const listener = jest.fn()
    window.addEventListener(consentOpenEventName, listener)

    render(<DeferredManageCookiesLink />)
    fireEvent.click(screen.getByRole('button', { name: 'Manage cookies' }))

    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(consentOpenEventName, listener)
  })
})
