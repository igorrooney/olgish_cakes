/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MobileForm } from '../MobileForm'

describe('MobileForm', () => {
  const originalScrollIntoView = Element.prototype.scrollIntoView
  const scrollIntoViewMock = jest.fn()

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getDateInputValue = (daysFromNow = 0) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return formatDateForInput(date)
  }

  const fillValidForm = () => {
    fireEvent.change(screen.getByLabelText(/full name:/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email address:/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/phone number:/i), { target: { value: '+44(0)7123456789' } })
    fireEvent.change(screen.getByLabelText(/^address:$/i), { target: { value: '123 Test Street' } })
    fireEvent.change(screen.getByLabelText(/^city:$/i), { target: { value: 'Leeds' } })
    fireEvent.change(screen.getByLabelText(/^postcode:$/i), { target: { value: 'LS1 1AA' } })
    fireEvent.change(screen.getByLabelText(/when do you need it/i), { target: { value: getDateInputValue(1) } })
  }

  const renderWithCsrf = async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })

    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MobileForm />
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

  it('sets the minimum date to today for the date picker', async () => {
    const expectedMinDate = getDateInputValue()

    await renderWithCsrf()

    expect(screen.getByLabelText(/when do you need it/i)).toHaveAttribute('min', expectedMinDate)
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
    fireEvent.change(screen.getByLabelText(/when do you need it/i), { target: { value: getDateInputValue(1) } })

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
      expect(screen.getByRole('button', { name: /enquiry sent/i })).toBeInTheDocument()
    })

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
      expect(screen.getByRole('button', { name: /enquiry sent/i })).toBeInTheDocument()
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
      expect(screen.getByRole('button', { name: /enquiry sent/i })).toBeInTheDocument()
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
      const enabledButton = screen.getByRole('button', { name: /enquiry sent/i })
      expect(enabledButton).not.toBeDisabled()
    })
  })
})
