/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getTodayDateInputValue } from '@/app/components/homepage/mobileForm.utils'
import { WorkshopEnquiryForm } from '../WorkshopEnquiryForm'

describe('WorkshopEnquiryForm', () => {
  const notificationFailureErrorMessage =
    'Enquiry saved but all operator notifications failed. Please contact Olgish Cakes directly.'
  const originalScrollIntoView = Element.prototype.scrollIntoView
  const scrollIntoViewMock = jest.fn()
  const getBriefField = () => screen.getByRole('textbox', { name: /event brief/i })

  const getDateInputValue = (daysFromNow = 0) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return getTodayDateInputValue(date)
  }

  const renderForm = async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <WorkshopEnquiryForm />
        </QueryClientProvider>
      )
      await Promise.resolve()
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/csrf-token', expect.anything())
    })
  }

  const fillRequiredFields = ({
    email = 'jane@example.com',
    phone = '',
    preferredDate = getDateInputValue(7),
  }: { email?: string; phone?: string; preferredDate?: string } = {}) => {
    fireEvent.change(screen.getByLabelText(/^Full name$/i), { target: { value: 'Jane Doe' } })
    fireEvent.change(screen.getByLabelText(/^Email address$/i), { target: { value: email } })
    fireEvent.change(screen.getByLabelText(/^Phone number$/i), { target: { value: phone } })
    fireEvent.click(screen.getByLabelText(/^Event type$/i))
    fireEvent.click(screen.getByRole('option', { name: 'Corporate event' }))
    fireEvent.change(screen.getByLabelText(/^Group size$/i), { target: { value: '18 guests' } })
    fireEvent.change(screen.getByLabelText(/^Location$/i), {
      target: { value: 'Shoreditch, London' },
    })
    fireEvent.change(screen.getByLabelText(/^Preferred date$/i), {
      target: { value: preferredDate },
    })
    fireEvent.change(screen.getByLabelText(/^Decoration theme$/i), {
      target: { value: 'Soft florals' },
    })
    fireEvent.change(getBriefField(), {
      target: {
        value:
          'Team social for a small office. We want a calm, easy session that feels properly put together.',
      },
    })
  }

  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoViewMock
    global.fetch = jest.fn((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' }),
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    }) as jest.Mock
  })

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView
    jest.restoreAllMocks()
  })

  it('renders the workshop-specific form fields', async () => {
    const tomorrowDate = getDateInputValue(1)
    await renderForm()

    expect(screen.getByLabelText(/^Full name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email address$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Phone number$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Event type$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Group size$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Location$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Preferred date$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Decoration theme$/i)).toBeInTheDocument()
    expect(getBriefField()).toBeInTheDocument()
    expect(screen.getByLabelText(/^Full name$/i)).toHaveAttribute('autocomplete', 'name')
    expect(screen.getByLabelText(/^Email address$/i)).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText(/^Phone number$/i)).toHaveAttribute('autocomplete', 'tel')
    expect(
      screen.getByPlaceholderText(/for example: 16 guests plus 2 organisers/i)
    ).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/whether people will stay at the table for the full session/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/i'll reply by email with the quote, travel cost and whether the venue and timings sound realistic/i)
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/^Preferred date$/i)).toHaveAttribute('min', tomorrowDate)
  })

  it('shows validation errors and focuses the first invalid field', async () => {
    await renderForm()

    fireEvent.change(screen.getByLabelText(/^Full name$/i), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText(/^Email address$/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /send workshop enquiry/i }))

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/^Full name$/i)).toHaveFocus()
    })
  })

  it('requires an email address even when a phone number is provided', async () => {
    await renderForm()
    fillRequiredFields({ email: '', phone: '+44 7000 000 111' })

    fireEvent.click(screen.getByRole('button', { name: /send workshop enquiry/i }))

    await waitFor(() => {
      expect(screen.getByText(/please add an email address/i)).toBeInTheDocument()
    })

    expect(global.fetch).not.toHaveBeenCalledWith('/api/workshop-enquiry', expect.anything())
  })

  it('rejects today and requires a future workshop date', async () => {
    const todayDate = getDateInputValue()

    await renderForm()
    fillRequiredFields({ preferredDate: todayDate })

    fireEvent.click(screen.getByRole('button', { name: /send workshop enquiry/i }))

    await waitFor(() => {
      expect(screen.getByText(/please select a future date/i)).toBeInTheDocument()
    })

    expect(global.fetch).not.toHaveBeenCalledWith('/api/workshop-enquiry', expect.anything())
  })

  it('submits successfully with email only', async () => {
    const tomorrowDate = getDateInputValue(1)

    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' }),
        })
      }

      if (url === '/api/workshop-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Workshop enquiry submitted successfully' }),
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields({ email: 'jane@example.com', phone: '', preferredDate: tomorrowDate })

    fireEvent.click(screen.getByRole('button', { name: /send workshop enquiry/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/workshop-enquiry',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    const submitCall = (global.fetch as jest.Mock).mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === '/api/workshop-enquiry'
    )

    if (!submitCall || !submitCall[1]?.body) {
      throw new Error('Expected workshop submission body')
    }

    const body = submitCall[1].body as FormData

    expect(submitCall[1].signal).toBeInstanceOf(AbortSignal)
    expect(body.get('csrfToken')).toBe('csrf-token-123')
    expect(body.get('email')).toBe('jane@example.com')
    expect(body.get('phone')).toBeNull()
    expect(body.get('eventType')).toBe('Corporate event')
    expect(body.get('groupSize')).toBe('18 guests')
    expect(body.get('location')).toBe('Shoreditch, London')
    expect(body.get('preferredDate')).toBe(tomorrowDate)
    expect(body.get('decorationTheme')).toBe('Soft florals')
  })

  it('clears the form after a successful email-only submission', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' }),
        })
      }

      if (url === '/api/workshop-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Workshop enquiry submitted successfully' }),
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields({ email: 'jane@example.com', phone: '' })

    fireEvent.click(screen.getByRole('button', { name: /send workshop enquiry/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enquiry sent/i })).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/^Full name$/i)).toHaveValue('')
    expect(screen.getByLabelText(/^Email address$/i)).toHaveValue('')
    expect(screen.getByLabelText(/^Phone number$/i)).toHaveValue('')
  })

  it('shows a server-provided rate limit message', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' }),
        })
      }

      if (url === '/api/workshop-enquiry') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Too many requests. Please try again later.' }),
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: /send workshop enquiry/i }))

    await waitFor(() => {
      expect(screen.getByText(/too many requests\. please try again later\./i)).toBeInTheDocument()
    })
  })

  it('shows the fallback contact message when the server does not provide a usable error', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' }),
        })
      }

      if (url === '/api/workshop-enquiry') {
        return Promise.resolve({
          ok: false,
          json: async () => ({}),
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: /send workshop enquiry/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/something went wrong while sending your workshop enquiry/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/hello@olgishcakes\.co\.uk/i)).toBeInTheDocument()
      expect(screen.getByText(/\+44 786 721 8194/i)).toBeInTheDocument()
    })
  })

  it('shows the fallback contact message when operator notifications fail after save', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' }),
        })
      }

      if (url === '/api/workshop-enquiry') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: notificationFailureErrorMessage }),
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: /send workshop enquiry/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/something went wrong while sending your workshop enquiry/i)
      ).toBeInTheDocument()
      expect(screen.queryByText(notificationFailureErrorMessage)).not.toBeInTheDocument()
    })
  })
})
