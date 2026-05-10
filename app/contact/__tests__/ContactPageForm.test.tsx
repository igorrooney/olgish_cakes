/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { getTodayDateInputValue } from '@/app/components/homepage/mobileForm.utils'
import { ContactPageForm } from '../ContactPageForm'
import { contactMessageExample } from '../contactPageContent'
import styles from '../contactPage.module.css'

describe('ContactPageForm', () => {
  const originalScrollIntoView = Element.prototype.scrollIntoView
  const scrollIntoViewMock = jest.fn()

  const getDateInputValue = (daysFromNow = 0) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return getTodayDateInputValue(date)
  }

  const getDateInput = () => {
    const input = document.getElementById('dateNeeded')

    if (!(input instanceof HTMLInputElement)) {
      throw new Error('Expected date input')
    }

    return input
  }

  const getMessageField = () => screen.getByRole('textbox', { name: /^Message/i })

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
          <ContactPageForm />
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
    phone = '+44 7123 456 789',
    enquiryType = 'General question',
    dateNeeded = getDateInputValue(5),
  }: {
    email?: string
    phone?: string
    enquiryType?: string
    dateNeeded?: string
  } = {}) => {
    fireEvent.change(screen.getByLabelText(/^Full name$/i), { target: { value: 'Jane Doe' } })
    fireEvent.change(screen.getByLabelText(/^Email address$/i), { target: { value: email } })
    fireEvent.change(screen.getByLabelText(/^Phone number/i), { target: { value: phone } })

    if (enquiryType) {
      fireEvent.click(screen.getByLabelText(/^What are you asking about\?$/i))
      fireEvent.click(screen.getByRole('option', { name: enquiryType }))
    }

    fireEvent.change(getDateInput(), {
      target: { value: dateNeeded },
    })
    fireEvent.change(getMessageField(), {
      target: {
        value:
          'I need a quick answer about the best route for this order and whether I should use the quote form instead.',
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

  it('renders the route-specific general enquiry fields', async () => {
    const todayDate = getDateInputValue()
    await renderForm()
    const fieldGrid = document.querySelector('#contact-form > div')

    expect(screen.getByLabelText(/^Full name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email address$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Phone number/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^What are you asking about\?$/i)).toBeInTheDocument()
    expect(getDateInput()).toBeInTheDocument()
    expect(getMessageField()).toBeInTheDocument()
    expect(getMessageField()).toHaveAttribute('placeholder', `For example: ${contactMessageExample}`)
    expect(screen.getByLabelText(/^Full name$/i)).toHaveAttribute('autocomplete', 'name')
    expect(screen.getByLabelText(/^Email address$/i)).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText(/^Phone number/i)).toHaveAttribute('autocomplete', 'tel')
    expect(getDateInput()).toHaveAttribute('min', todayDate)
    expect(
      screen.getByText(/optional, but useful if a quick call or whatsapp reply would help\./i)
    ).toBeInTheDocument()
    expect(screen.getByText(/pick the closest match/i)).toBeInTheDocument()
    expect(screen.getByText(/leave this blank if the date is still up in the air/i)).toBeInTheDocument()
    expect(fieldGrid).toHaveClass(styles.formFieldGrid)
    expect(
      screen.queryByText(/the most helpful next step/i)
    ).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/^Reference image$/i)).not.toBeInTheDocument()
  })

  it('shows validation errors and focuses the first invalid field', async () => {
    await renderForm()

    fireEvent.change(screen.getByLabelText(/^Full name$/i), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText(/^Email address$/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /send your message/i }))

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/^Full name$/i)).toHaveFocus()
    })
  })

  it('shows a phone validation error when a value is provided but invalid', async () => {
    await renderForm()
    fillRequiredFields({ phone: '123' })

    fireEvent.click(screen.getByRole('button', { name: /send your message/i }))

    await waitFor(() => {
      expect(screen.getByText(/phone number must be at least 10 digits/i)).toBeInTheDocument()
    })
  })

  it('submits the mapped payload to the existing contact endpoint without a phone number when blank', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' }),
        })
      }

      if (url === '/api/contact') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true }),
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    const dateNeeded = getDateInputValue(10)

    await renderForm()
    fillRequiredFields({
      phone: '',
      enquiryType: 'Workshop question',
      dateNeeded,
    })

    fireEvent.click(screen.getByRole('button', { name: /send your message/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({
          method: 'POST',
          credentials: 'same-origin',
        })
      )
    })

    const submitCall = (global.fetch as jest.Mock).mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === '/api/contact'
    )

    if (!submitCall || !submitCall[1]?.body) {
      throw new Error('Expected contact submission body')
    }

    const body = submitCall[1].body as FormData

    expect(submitCall[1].signal).toBeInstanceOf(AbortSignal)
    expect(body.get('csrfToken')).toBe('csrf-token-123')
    expect(body.get('name')).toBe('Jane Doe')
    expect(body.get('email')).toBe('jane@example.com')
    expect(body.get('phone')).toBeNull()
    expect(body.get('cakeInterest')).toBe('Workshop question')
    expect(body.get('dateNeeded')).toBe(dateNeeded)
    expect(body.get('message')).toBe(
      'I need a quick answer about the best route for this order and whether I should use the quote form instead.'
    )
    expect(body.get('referrer')).toBe('/contact')
  })

  it('clears the form and shows the success state after a successful submission', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' }),
        })
      }

      if (url === '/api/contact') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true }),
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: /send your message/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /message sent/i })).toBeInTheDocument()
      expect(
        screen.getByText(/thanks\. i've got your message and i'll be back in touch soon\./i)
      ).toBeInTheDocument()
    })

    expect(screen.getByLabelText(/^Full name$/i)).toHaveValue('')
    expect(screen.getByLabelText(/^Email address$/i)).toHaveValue('')
    expect(screen.getByLabelText(/^Phone number/i)).toHaveValue('')
    expect(getDateInput()).toHaveValue('')
    expect(getMessageField()).toHaveValue('')
    expect(screen.getByLabelText(/^What are you asking about\?$/i)).toHaveTextContent(
      'Select from list'
    )
  })

  it('maps server validation errors back onto the form fields', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' }),
        })
      }

      if (url === '/api/contact') {
        return Promise.resolve({
          ok: false,
          json: async () => ({
            error: 'Validation failed',
            details: [
              {
                path: ['cakeInterest'],
                message: 'Please choose the right kind of question.',
              },
            ],
          }),
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: /send your message/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/please choose the right kind of question\./i)
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/^What are you asking about\?$/i)).toHaveFocus()
    })
  })

  it('shows the fallback error when the server returns a masked failure message', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' }),
        })
      }

      if (url === '/api/contact') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Failed to send email' }),
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: /send your message/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/something went wrong while sending your message/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/hello@olgishcakes\.co\.uk/i)).toBeInTheDocument()
      expect(screen.getByText(/\+44 786 721 8194/i)).toBeInTheDocument()
    })
  })

  it('aborts the pending submit request when the form unmounts', async () => {
    let submitSignal: AbortSignal | undefined

    ;(global.fetch as jest.Mock).mockImplementation((url: string, init?: RequestInit) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' }),
        })
      }

      if (url === '/api/contact') {
        submitSignal = init?.signal

        return new Promise((_, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          })
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })

    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <ContactPageForm />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/csrf-token', expect.anything())
    })

    fillRequiredFields()

    fireEvent.click(screen.getByRole('button', { name: /send your message/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/contact',
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    unmount()

    await waitFor(() => {
      expect(submitSignal?.aborted).toBe(true)
    })
  })
})
