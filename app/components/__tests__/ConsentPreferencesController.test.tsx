/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { consentOpenEventName } from '@/app/lib/consent-config'
import { ConsentPreferencesController } from '../ConsentPreferencesController'

describe('ConsentPreferencesController', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open')
    }
  })

  it('lazy-opens from the footer event and restores focus after close', async () => {
    render(
      <>
        <button type='button'>Manage cookies</button>
        <ConsentPreferencesController />
      </>
    )
    const trigger = screen.getByRole('button', { name: 'Manage cookies' })
    trigger.focus()
    act(() => {
      window.dispatchEvent(new CustomEvent(consentOpenEventName))
    })

    expect(await screen.findByRole('dialog', { name: 'Cookie preferences' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close cookie preferences' }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(trigger).toHaveFocus()
    })
  })
})
