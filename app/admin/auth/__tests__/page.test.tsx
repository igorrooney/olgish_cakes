/**
 * @jest-environment jsdom
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AdminLoginPage from '../page'

const push = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push })
}))

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false }
    }
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AdminLoginPage />
    </QueryClientProvider>
  )
}

const submitCredentials = () => {
  fireEvent.change(screen.getByLabelText('Username'), {
    target: { value: 'admin' }
  })
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'secret' }
  })
  fireEvent.submit(screen.getByRole('button', { name: 'Sign In' }).closest('form') as HTMLFormElement)
}

describe('AdminLoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('uses a POST-only native fallback so pre-hydration credentials cannot enter the URL', () => {
    renderPage()

    const form = screen.getByRole('button', { name: 'Sign In' }).closest('form')

    expect(form).toHaveAttribute('method', 'post')
    expect(form).toHaveAttribute('action', '/api/admin/auth')
    expect(form?.getAttribute('action')).not.toContain('?')
    expect(screen.getByRole('button', { name: 'Sign In' })).toHaveAttribute('type', 'submit')
  })

  it('submits through an abortable React Query mutation', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true })
    })

    renderPage()
    submitCredentials()

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/admin')
    })
    expect(global.fetch).toHaveBeenCalledWith('/api/admin/auth', expect.objectContaining({
      method: 'POST',
      signal: expect.any(AbortSignal)
    }))
  })

  it('shows the server-safe authentication error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' })
    })

    renderPage()
    submitCredentials()

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials')
    expect(push).not.toHaveBeenCalled()
  })

  it('aborts an in-flight login when the page unmounts', async () => {
    let signal: AbortSignal | undefined

    ;(global.fetch as jest.Mock).mockImplementation((_url: string, init: RequestInit) => {
      signal = init.signal as AbortSignal

      return new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'))
        })
      })
    })

    const { unmount } = renderPage()
    submitCredentials()

    await waitFor(() => {
      expect(signal).toBeInstanceOf(AbortSignal)
    })

    unmount()

    expect(signal?.aborted).toBe(true)
  })
})
