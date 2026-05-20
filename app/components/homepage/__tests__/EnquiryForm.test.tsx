/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EnquiryForm } from '../EnquiryForm'
import { getTodayDateInputValue } from '../mobileForm.utils'

describe('EnquiryForm', () => {
  const originalScrollIntoView = Element.prototype.scrollIntoView
  const scrollIntoViewMock = jest.fn()
  const calendarAriaFormatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const getDateInputValue = (daysFromNow = 0) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return getTodayDateInputValue(date)
  }

  const parseDateInputValue = (value: string) => {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const selectDate = (value: string) => {
    fireEvent.click(screen.getByRole('button', { name: /when do you need it/i }))
    fireEvent.click(screen.getByRole('button', {
      name: new RegExp(`select ${escapeRegExp(calendarAriaFormatter.format(parseDateInputValue(value)))}`, 'i')
    }))
  }

  const fillValidForm = () => {
    fireEvent.change(screen.getByLabelText(/full name:/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email address:/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/phone number:/i), { target: { value: '+44(0)7123456789' } })
    fireEvent.change(screen.getByLabelText(/^address:$/i), { target: { value: '123 Test Street' } })
    fireEvent.change(screen.getByLabelText(/^city:$/i), { target: { value: 'Leeds' } })
    fireEvent.change(screen.getByLabelText(/^postcode:$/i), { target: { value: 'LS1 1AA' } })
    selectDate(getDateInputValue(1))
  }

  const renderWithCsrf = async (occasionOptions?: Array<{ label: string, value?: string, disabled?: boolean }>) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })

    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EnquiryForm occasionOptions={occasionOptions} />
        </QueryClientProvider>
      )
      await Promise.resolve()
      await Promise.resolve()
    })

    await waitFor(() => {
      const csrfCall = (global.fetch as jest.Mock).mock.calls.find(
        (call: unknown[]) => Array.isArray(call) && call[0] === '/api/csrf-token'
      )
      expect(csrfCall).toBeTruthy()
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send enquiry/i })).toBeEnabled()
    })
  }

  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoViewMock

    // Mock fetch with CSRF token handler
    global.fetch = jest.fn((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' })
        })
      }
      // For other URLs, return a rejected promise (tests will override this)
      return Promise.reject(new Error('Unexpected fetch call'))
    })
  })

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('renders all form fields', async () => {
    await renderWithCsrf()

    expect(screen.getByLabelText(/full name:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/phone number:/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^address:$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^city:$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^postcode:$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/when do you need it/i)).toBeInTheDocument()
  })


  it('applies cursor-pointer class to the date input', async () => {
    await renderWithCsrf()

    expect(screen.getByLabelText(/when do you need it/i)).toHaveClass('cursor-pointer')
  })

  it('renders Sanity-driven occasion options when provided', async () => {
    await renderWithCsrf([
      { label: 'Select from list', value: '', disabled: true },
      { label: 'Wedding Cakes', value: 'Wedding Cakes' },
      { label: 'Other', value: 'other' }
    ])

    fireEvent.click(screen.getByLabelText(/what's the occasion\?/i))
    expect(screen.getByRole('option', { name: 'Wedding Cakes' })).toBeInTheDocument()
    expect(screen.getByLabelText(/what's the occasion\?/i)).toHaveAttribute('aria-controls', 'occasion-listbox')
    expect(screen.queryByRole('option', { name: 'Birthday' })).not.toBeInTheDocument()
  })

  it('uses fallback occasion options when custom options are not provided', async () => {
    await renderWithCsrf()

    fireEvent.click(screen.getByLabelText(/what's the occasion\?/i))
    expect(screen.getByRole('option', { name: 'Birthday' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Other' })).toBeInTheDocument()
  })
  it('sets the minimum date to today for the date picker', async () => {
    const expectedMinDate = getDateInputValue()

    await renderWithCsrf()

    expect(screen.getByLabelText(/when do you need it/i)).toHaveAttribute('data-min-date', expectedMinDate)
  })

  it('does not depend on a server-supplied min date prop', async () => {
    await renderWithCsrf()

    expect(screen.getByLabelText(/when do you need it/i)).toHaveAttribute('data-min-date', getDateInputValue())
  })

  it('applies tablet layout classes to the container and heading', async () => {
    await renderWithCsrf()

    const heading = screen.getByRole('heading', { level: 2, name: /custom cake enquiry form/i })
    const container = heading.closest('div')

    if (!container) {
      throw new Error('Expected heading container to be present')
    }

    expect(container).toHaveClass('tablet:max-w-[696px]')
    expect(heading).toHaveClass('scroll-mt-24')
    expect(heading).toHaveClass('tablet:scroll-mt-36')
    expect(heading).toHaveClass('tablet:text-[36px]')
    expect(heading).toHaveClass('tablet:leading-[52px]')
    expect(heading).toHaveClass('tablet:max-w-[331px]')
    expect(heading).toHaveClass('tablet:mx-auto')
  })

  it('applies mobile and tablet height classes to the submit button', async () => {
    await renderWithCsrf()

    const submitButton = screen.getByRole('button', { name: /send enquiry/i })
    expect(submitButton).toHaveClass('h-12')
    expect(submitButton).toHaveClass('tablet:h-12')
  })

  it('shows the date input label and empty value when untouched', async () => {
    await renderWithCsrf()

    const datePickerTrigger = screen.getByLabelText(/when do you need it/i)
    expect(datePickerTrigger).toBeInTheDocument()
    expect(datePickerTrigger).toHaveTextContent(/select a date/i)
  })

  it('disables past dates in the calendar', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-18T12:00:00.000Z'))

    await renderWithCsrf()

    fireEvent.click(screen.getByRole('button', { name: /when do you need it/i }))

    expect(screen.getByRole('button', { name: /17 March 2026 is not available/i })).toBeDisabled()
  })

  it('rejects a date that becomes past after the form stays open across midnight', async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-18T23:55:00.000Z'))

    await renderWithCsrf()

    const dateInput = screen.getByLabelText(/when do you need it/i)
    expect(dateInput).toHaveAttribute('data-min-date', '2026-03-18')

    jest.setSystemTime(new Date('2026-03-19T00:05:00.000Z'))

    selectDate('2026-03-18')

    expect(dateInput).toHaveTextContent(/select a date/i)
    expect(screen.getByText(/please select today or a future date/i)).toBeInTheDocument()
  })

  it('shows validation errors for invalid input', async () => {
    // Mock CSRF token fetch (already mocked in beforeEach, but ensure it's available)
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' })
        })
      }
      return Promise.reject(new Error('Unexpected fetch call'))
    })

    await renderWithCsrf()

    fireEvent.change(screen.getByLabelText(/full name:/i), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText(/email address:/i), { target: { value: 'not-an-email' } })
    fireEvent.change(screen.getByLabelText(/phone number:/i), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText(/^address:$/i), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText(/^city:$/i), { target: { value: 'L' } })
    fireEvent.change(screen.getByLabelText(/^postcode:$/i), { target: { value: 'BAD' } })
    selectDate(getDateInputValue(1))

    const submitButton = screen.getByRole('button', { name: /send enquiry/i })
    const form = submitButton.closest('form')
    if (form) {
      form.noValidate = true
      fireEvent.submit(form)
    } else {
      fireEvent.click(submitButton)
    }

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })
  })

  it('focuses the first invalid field after submit', async () => {
    await renderWithCsrf()

    fireEvent.change(screen.getByLabelText(/full name:/i), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText(/email address:/i), { target: { value: 'not-an-email' } })

    const submitButton = screen.getByRole('button', { name: /send enquiry/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      const fullNameInput = screen.getByLabelText(/full name:/i)
      expect(document.activeElement).toBe(fullNameInput)
    })
  })

  it('shows selected filename when a file is chosen', async () => {
    await renderWithCsrf()

    const fileInput = screen.getByLabelText(/upload a reference image/i)
    const file = new File(['file'], 'cake.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(screen.getByText(/selected:\s*cake\.png/i)).toBeInTheDocument()
  })

  it('blocks submission when upload type is invalid', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' })
        })
      }
      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Success' })
        })
      }
      return Promise.reject(new Error('Unexpected fetch call'))
    })

    await renderWithCsrf()

    fillValidForm()

    const fileInput = screen.getByLabelText(/upload a reference image/i)
    const file = new File(['file'], 'cake.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }))

    await waitFor(() => {
      expect(screen.getByText(/image must be a jpeg, png, or heic file/i)).toBeInTheDocument()
    })

    expect(global.fetch).not.toHaveBeenCalledWith('/api/custom-cake-enquiry', expect.anything())
  })

  it('blocks submission when upload size is too large', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' })
        })
      }
      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Success' })
        })
      }
      return Promise.reject(new Error('Unexpected fetch call'))
    })

    await renderWithCsrf()

    fillValidForm()

    const fileInput = screen.getByLabelText(/upload a reference image/i)
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'cake.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }))

    await waitFor(() => {
      expect(screen.getByText(/image must be 5mb or smaller/i)).toBeInTheDocument()
    })

    expect(global.fetch).not.toHaveBeenCalledWith('/api/custom-cake-enquiry', expect.anything())
  })

  it('clears selected filename after successful submission', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' })
        })
      }
      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Success' })
        })
      }
      return Promise.reject(new Error('Unexpected fetch call'))
    })

    await renderWithCsrf()

    fillValidForm()

    const fileInput = screen.getByLabelText(/upload a reference image/i) as HTMLInputElement
    const file = new File(['file'], 'cake.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(screen.getByText(/selected:\s*cake\.png/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/enquiry sent/i)
    })

    expect(screen.getByText(/your cake enquiry has arrived safely/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send enquiry/i })).toBeInTheDocument()

    expect(screen.queryByText(/selected:\s*cake\.png/i)).not.toBeInTheDocument()
    expect(fileInput.value).toBe('')
  })

  it('submits form with valid data', async () => {
    // Mock form submission (CSRF token is already mocked in beforeEach)
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' })
        })
      }
      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Success' })
        })
      }
      return Promise.reject(new Error('Unexpected fetch call'))
    })

    await renderWithCsrf()

    fillValidForm()

    const submitButton = screen.getByRole('button', { name: /send enquiry/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/custom-cake-enquiry', expect.objectContaining({
        method: 'POST'
      }))
    })

    // Verify CSRF token is included in the request
    const formSubmitCall = (global.fetch as jest.Mock).mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === '/api/custom-cake-enquiry'
    )

    if (formSubmitCall && formSubmitCall[1]?.body) {
      const body = formSubmitCall[1].body as FormData
      expect(body.get('csrfToken')).toBe('test-csrf-token-123')
    }
  })

  it('shows success message after successful submission', async () => {
    // Mock form submission (CSRF token is already mocked in beforeEach)
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' })
        })
      }
      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Success' })
        })
      }
      return Promise.reject(new Error('Unexpected fetch call'))
    })

    await renderWithCsrf()

    // Fill form
    fillValidForm()

    const submitButton = screen.getByRole('button', { name: /send enquiry/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/enquiry sent/i)
    })
  })

  it('clears validator styling after successful submission', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' })
        })
      }
      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ message: 'Success' })
        })
      }
      return Promise.reject(new Error('Unexpected fetch call'))
    })

    await renderWithCsrf()
    fillValidForm()

    fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/enquiry sent/i)
    })

    const fullNameInput = screen.getByLabelText(/full name:/i)
    const fullNameLabel = fullNameInput.closest('label')
    expect(fullNameLabel?.className).not.toContain('validator')
  })

  it('disables submit button while submitting', async () => {
    let resolveFetch: (value: unknown) => void
    const fetchPromise = new Promise(resolve => {
      resolveFetch = resolve
    })

    // Mock form submission with delayed response (CSRF token is already mocked in beforeEach)
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' })
        })
      }
      if (url === '/api/custom-cake-enquiry') {
        return fetchPromise.then(() => ({ ok: true, json: async () => ({}) }))
      }
      return Promise.reject(new Error('Unexpected fetch call'))
    })

    await renderWithCsrf()

    // Fill form with valid data matching the regex patterns
    // Phone regex: /^\+44\s?\(?0\)?\s?\d{4}\s?\d{3}\s?\d{3}$/
    // Valid formats: +44(0)7123456789, +447123456789, +44 0 7123 456789
    fillValidForm()

    const submitButton = screen.getByRole('button', { name: /send enquiry/i })

    // Submit form - use fireEvent.submit on the form element for more realistic behavior
    const form = submitButton.closest('form')
    if (form) {
      fireEvent.submit(form)
    } else {
      fireEvent.click(submitButton)
    }

    await waitFor(() => {
      const disabledButton = screen.getByRole('button', { name: /send enquiry/i })
      expect(disabledButton).toBeDisabled()
      expect(disabledButton).toHaveAttribute('aria-busy', 'true')
    }, { timeout: 3000 })

    // Resolve the fetch to complete the test
    resolveFetch!({})

    // Wait for submission to complete and button to be enabled again
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(/enquiry sent/i)
    })

    expect(screen.getByRole('button', { name: /send enquiry/i })).not.toBeDisabled()
  })

  it('shows a server-provided message when submission fails on the server', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'test-csrf-token-123' })
        })
      }

      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Internal server error' })
        })
      }

      return Promise.reject(new Error('Unexpected fetch call'))
    })

    await renderWithCsrf()
    fillValidForm()

    fireEvent.click(screen.getByRole('button', { name: /send enquiry/i }))

    await waitFor(() => {
      expect(screen.getByText(/internal server error/i)).toBeInTheDocument()
      expect(screen.getByText(/hello@olgishcakes\.co\.uk/i)).toBeInTheDocument()
      expect(screen.getByText(/\+44 786 721 8194/i)).toBeInTheDocument()
    })
  })
})

