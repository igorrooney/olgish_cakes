/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import {
  consentChangedEventName,
  consentCookieName
} from '@/app/lib/consent-config'
import { ConsentPreferencesDialog } from '../ConsentPreferencesDialog'

describe('ConsentPreferencesDialog', () => {
  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '')
    }
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open')
    }
  })

  beforeEach(() => {
    document.cookie = `${consentCookieName}=; Max-Age=0; Path=/`
    document.body.dataset.consentDialogOpen = 'false'
  })

  it('uses native dialog semantics and three direct service switches', () => {
    render(<ConsentPreferencesDialog isOpen onRequestClose={jest.fn()} />)

    const dialog = screen.getByRole('dialog', { name: 'Cookie preferences' })
    expect(dialog).toHaveAttribute('aria-describedby', 'cookie-preferences-description')
    expect(screen.getByText('Google Analytics')).toBeInTheDocument()
    expect(screen.getByText('Page and journey analytics.')).toBeInTheDocument()
    expect(screen.getByText('Microsoft Clarity')).toBeInTheDocument()
    expect(screen.getByText('Heatmaps and session recordings.')).toBeInTheDocument()
    expect(screen.getByText('Google Ads')).toBeInTheDocument()
    expect(screen.getByText('Advertising measurement and personalisation.')).toBeInTheDocument()
    expect(screen.getAllByRole('checkbox')).toHaveLength(3)
    expect(screen.queryByText(/master/i)).not.toBeInTheDocument()
  })

  it('saves an independent choice and emits the canonical update', () => {
    const listener = jest.fn()
    window.addEventListener(consentChangedEventName, listener)
    render(<ConsentPreferencesDialog isOpen onRequestClose={jest.fn()} />)

    fireEvent.click(screen.getByRole('checkbox', { name: /Microsoft Clarity/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Save choices' }))

    expect(document.cookie).toContain(`${consentCookieName}=`)
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({
      detail: expect.objectContaining({
        source: 'preferences',
        choices: {
          googleAnalytics: false,
          microsoftClarity: true,
          googleAds: false
        }
      })
    }))
    window.removeEventListener(consentChangedEventName, listener)
  })

  it('rejects and accepts all optional services with equally styled actions', () => {
    const onRequestClose = jest.fn()
    const { unmount } = render(
      <ConsentPreferencesDialog isOpen onRequestClose={onRequestClose} />
    )
    const rejectButton = screen.getByRole('button', { name: 'Reject optional' })
    const acceptButton = screen.getByRole('button', { name: 'Accept optional' })

    expect(rejectButton).toHaveClass('btn-outline')
    expect(acceptButton).toHaveClass('btn-outline')
    fireEvent.click(acceptButton)
    expect(onRequestClose).toHaveBeenCalledTimes(1)

    unmount()
    render(<ConsentPreferencesDialog isOpen onRequestClose={onRequestClose} />)
    fireEvent.click(screen.getByRole('button', { name: 'Reject optional' }))
    expect(onRequestClose).toHaveBeenCalledTimes(2)
  })

  it('handles Escape as an unsaved close without creating a record', () => {
    const onRequestClose = jest.fn()
    render(<ConsentPreferencesDialog isOpen onRequestClose={onRequestClose} />)

    fireEvent(screen.getByRole('dialog'), new Event('cancel', {
      bubbles: false,
      cancelable: true
    }))

    expect(onRequestClose).toHaveBeenCalledTimes(1)
    expect(document.cookie).not.toContain(`${consentCookieName}=`)
    expect(document.body.dataset.consentDialogOpen).toBe('false')
  })
})
