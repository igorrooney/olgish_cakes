/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { OrderModal } from '../OrderModal'
import { csrfTokenLoadErrorMessage, fetchCsrfToken } from '@/app/services/csrfToken'

jest.mock('@/app/services/csrfToken', () => ({
  csrfTokenLoadErrorMessage: 'CSRF token not loaded. Please refresh the page and try again.',
  fetchCsrfToken: jest.fn()
}))

jest.mock('../OrderModalStructuredData', () => ({
  OrderModalStructuredData: () => null
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode, href: string }) => (
    <a href={href} {...props}>{children}</a>
  )
}))

jest.mock('@/app/components/ContactForm', () => ({
  ContactForm: ({ onSubmit }: { onSubmit: (value: Record<string, unknown>) => Promise<void> }) => (
    <button
      type='button'
      onClick={() => void onSubmit({
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '07123456789',
        dateNeeded: null,
        message: 'Please call before delivery'
      })}
    >
      Submit mocked form
    </button>
  )
}))

jest.mock('@/lib/daisy-ui', () => ({
  AdapterDayjs: {},
  Box: ({ children, ...props }: { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  Button: ({ children, ...props }: { children?: React.ReactNode }) => <button {...props}>{children}</button>,
  CheckCircleIcon: () => <span>Success</span>,
  Dialog: ({ children, open }: { children?: React.ReactNode, open?: boolean }) => open ? <div>{children}</div> : null,
  DialogActions: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Divider: () => <hr />,
  ErrorIcon: () => <span>Error</span>,
  FormControl: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  InputLabel: ({ children }: { children?: React.ReactNode }) => <label>{children}</label>,
  LocalizationProvider: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
  MenuItem: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Paper: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Select: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Typography: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Chip: ({ label }: { label: string }) => <div>{label}</div>,
  Alert: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  AlertTitle: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  CircularProgress: () => <div>Loading</div>
}))

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => children,
  motion: {
    div: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
    create: (component: React.ElementType) => component
  }
}))

describe('OrderModal', () => {
  const mockedFetchCsrfToken = fetchCsrfToken as jest.MockedFunction<typeof fetchCsrfToken>

  const cake = {
    name: 'Honey Cake',
    size: 'Medium',
    category: 'Celebration',
    slug: { current: 'honey-cake' },
    pricing: {
      standard: 25,
      individual: 35
    }
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedFetchCsrfToken.mockResolvedValue('csrf-token-123')
    global.fetch = jest.fn().mockResolvedValue({ ok: true }) as jest.Mock
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('appends csrfToken and posts with same-origin credentials', async () => {
    render(
      <OrderModal
        open
        onClose={jest.fn()}
        cake={cake as never}
        designType='standard'
        onDesignTypeChange={jest.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /submit mocked form/i }))

    await waitFor(() => {
      expect(mockedFetchCsrfToken).toHaveBeenCalledWith(expect.any(AbortSignal))
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST',
        credentials: 'same-origin',
        signal: expect.any(AbortSignal)
      }))
    })

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]
    const body = requestInit.body as FormData

    expect(body.get('csrfToken')).toBe('csrf-token-123')
  })

  it('shows the refresh message and skips /api/contact when csrf cannot be loaded', async () => {
    mockedFetchCsrfToken.mockRejectedValue(new Error('Failed to fetch CSRF token'))

    render(
      <OrderModal
        open
        onClose={jest.fn()}
        cake={cake as never}
        designType='standard'
        onDesignTypeChange={jest.fn()}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /submit mocked form/i }))

    await waitFor(() => {
      expect(screen.getByText(csrfTokenLoadErrorMessage)).toBeInTheDocument()
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })
})
