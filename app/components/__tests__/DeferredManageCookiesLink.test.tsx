/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { DeferredManageCookiesLink } from '../DeferredManageCookiesLink'

jest.mock('@/app/lib/consent-runtime', () => ({
  loadConsentRuntime: jest.fn(() => Promise.resolve())
}))

type KlaroManager = {
  show: (config?: unknown, modal?: boolean) => void
}

describe('DeferredManageCookiesLink', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    delete (window as Window & { klaro?: KlaroManager }).klaro
  })

  it('opens the Klaro modal immediately when the runtime is already available', () => {
    const show = jest.fn()
    ;(window as Window & { klaro?: KlaroManager }).klaro = { show }

    render(<DeferredManageCookiesLink />)

    fireEvent.click(screen.getByRole('button', { name: /manage cookies/i }))

    expect(show).toHaveBeenCalledWith(undefined, true)
  })

  it('loads the consent runtime on demand when Klaro is not ready', async () => {
    const { loadConsentRuntime } = await import('@/app/lib/consent-runtime')

    render(<DeferredManageCookiesLink />)

    fireEvent.click(screen.getByRole('button', { name: /manage cookies/i }))

    await waitFor(() => {
      expect(loadConsentRuntime).toHaveBeenCalledWith({ openModal: true })
    })
  })
})
