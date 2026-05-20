/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ManageCookiesLink } from '../ManageCookiesLink'
import { loadConsentRuntime } from '@/app/lib/consent-runtime'

jest.mock('@/app/lib/consent-runtime', () => ({
  loadConsentRuntime: jest.fn(() => Promise.resolve())
}))

type KlaroManager = {
  show: (config?: unknown, modal?: boolean) => void
}

type WindowWithKlaro = Window & {
  klaro?: KlaroManager
}

describe('ManageCookiesLink', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const windowWithKlaro = window as WindowWithKlaro
    delete windowWithKlaro.klaro
  })

  it('opens the Klaro modal immediately when the runtime is available', () => {
    const show = jest.fn()
    const windowWithKlaro = window as WindowWithKlaro
    windowWithKlaro.klaro = { show }

    render(<ManageCookiesLink />)

    fireEvent.click(screen.getByRole('button', { name: /manage cookies/i }))

    expect(show).toHaveBeenCalledWith(undefined, true)
    expect(loadConsentRuntime).not.toHaveBeenCalled()
  })

  it('loads the consent runtime before opening the modal when Klaro is not ready', async () => {
    render(<ManageCookiesLink />)

    fireEvent.click(screen.getByRole('button', { name: /manage cookies/i }))

    await waitFor(() => {
      expect(loadConsentRuntime).toHaveBeenCalledWith({ openModal: true })
    })
  })
})
