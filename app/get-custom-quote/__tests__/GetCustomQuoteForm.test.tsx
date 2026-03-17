/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { type OccasionOption } from '../../components/homepage/formOptions'
import { GetCustomQuoteForm } from '../GetCustomQuoteForm'

describe('GetCustomQuoteForm', () => {
  const originalScrollIntoView = Element.prototype.scrollIntoView
  const scrollIntoViewMock = jest.fn()
  const collectionOccasionOptions: OccasionOption[] = [
    { label: 'Select from list', value: '', disabled: true },
    { label: 'Wedding Cakes', value: 'Wedding Cakes' },
    { label: 'Birthday Cakes', value: 'Birthday Cakes' },
    { label: 'Other', value: 'other' }
  ]

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

  const renderForm = async (props?: { occasionOptions?: OccasionOption[] }) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })

    await act(async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <GetCustomQuoteForm {...props} />
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
    occasion = 'birthday'
  }: { email?: string, phone?: string, occasion?: string } = {}) => {
    fireEvent.change(screen.getByLabelText(/^Full name$/i), { target: { value: 'Jane Doe' } })
    fireEvent.change(screen.getByLabelText(/^Email address$/i), { target: { value: email } })
    fireEvent.change(screen.getByLabelText(/^Phone number$/i), { target: { value: phone } })
    fireEvent.change(screen.getByLabelText(/^Date needed$/i), { target: { value: getDateInputValue(5) } })
    fireEvent.change(screen.getByLabelText(/^Approximate servings$/i), { target: { value: '24 guests' } })
    fireEvent.change(screen.getByRole('combobox', { name: /Occasion/i }), { target: { value: occasion } })
    fireEvent.change(screen.getByLabelText(/^Cake brief/i), {
      target: { value: 'Blue floral cake with vanilla raspberry flavour for a milestone birthday.' }
    })
  }

  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoViewMock
    global.fetch = jest.fn((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' })
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    }) as jest.Mock
  })

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView
    jest.restoreAllMocks()
  })

  it('renders only the simplified visible fields', async () => {
    await renderForm()

    expect(screen.getByLabelText(/^Full name$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Email address$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Phone number$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Date needed$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Approximate servings$/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /Occasion/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/^Cake brief/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Reference image/i)).toBeInTheDocument()
    expect(screen.getByText(/please add either an email address or a phone number so i can get back to you/i)).toBeInTheDocument()
    expect(screen.queryByText(/optional section 1/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/add design, budget and dietary detail/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/add fulfilment and location guidance/i)).not.toBeInTheDocument()
  })
  it('renders the top grid fields in the expected DOM order', async () => {
    await renderForm()

    const gridInputs = Array.from(document.querySelectorAll('input, select'))
      .map((element) => element.id)
      .filter((id) => ['fullName', 'email', 'phone', 'servings', 'date', 'occasion'].includes(id))

    expect(gridInputs).toEqual([
      'fullName',
      'email',
      'phone',
      'servings',
      'date',
      'occasion'
    ])
  })

  it('renders provided collection-based occasion options', async () => {
    await renderForm({ occasionOptions: collectionOccasionOptions })

    expect(screen.getByRole('option', { name: 'Wedding Cakes' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Birthday Cakes' })).toBeInTheDocument()
  })

  it('shows validation errors and focuses the first invalid field', async () => {
    await renderForm()

    fireEvent.change(screen.getByLabelText(/^Full name$/i), { target: { value: 'A' } })
    fireEvent.change(screen.getByLabelText(/^Email address$/i), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument()
      expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/^Full name$/i)).toHaveFocus()
    })
  })

  it('requires at least one contact method', async () => {
    await renderForm()
    fillRequiredFields({ email: '', phone: '' })

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/add an email address or phone number/i)).toHaveLength(2)
    })

    expect(global.fetch).not.toHaveBeenCalledWith('/api/custom-cake-enquiry', expect.anything())
  })

  it('accepts a short cake brief when it has at least 8 characters', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' })
        })
      }

      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true })
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/^Cake brief/i), {
      target: { value: 'test cake' }
    })

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/custom-cake-enquiry', expect.objectContaining({
        method: 'POST'
      }))
    })
  })

  it('shows the updated brief error when the cake brief is too short', async () => {
    await renderForm()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/^Cake brief/i), {
      target: { value: 'cake' }
    })

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(screen.getByText(/please add a few words about the cake/i)).toBeInTheDocument()
    })

    expect(global.fetch).not.toHaveBeenCalledWith('/api/custom-cake-enquiry', expect.anything())
  })

  it('submits successfully with email only', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' })
        })
      }

      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true })
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm({ occasionOptions: collectionOccasionOptions })
    fillRequiredFields({ email: 'jane@example.com', phone: '', occasion: 'Wedding Cakes' })

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/custom-cake-enquiry', expect.objectContaining({
        method: 'POST'
      }))
    })

    const submitCall = (global.fetch as jest.Mock).mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === '/api/custom-cake-enquiry'
    )

    if (!submitCall || !submitCall[1]?.body) {
      throw new Error('Expected quote submission body')
    }

    const body = submitCall[1].body as FormData
    const requirements = body.get('requirements')

    expect(body.get('csrfToken')).toBe('csrf-token-123')
    expect(body.get('email')).toBe('jane@example.com')
    expect(body.get('phone')).toBeNull()
    expect(body.get('city')).toBeNull()
    expect(body.get('postcode')).toBeNull()
    expect(requirements).toEqual(expect.any(String))
    expect(requirements).toContain('Quote brief')
    expect(requirements).toContain('Occasion: Wedding Cakes')
    expect(requirements).toContain('Servings: 24 guests')
    expect(requirements).toContain('Brief: Blue floral cake with vanilla raspberry flavour for a milestone birthday.')
  })

  it('submits successfully with phone only', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' })
        })
      }

      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true })
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields({ email: '', phone: '+44 7000 000 111', occasion: '' })

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/custom-cake-enquiry', expect.objectContaining({
        method: 'POST'
      }))
    })

    const submitCall = (global.fetch as jest.Mock).mock.calls.find(
      (call: unknown[]) => Array.isArray(call) && call[0] === '/api/custom-cake-enquiry'
    )

    if (!submitCall || !submitCall[1]?.body) {
      throw new Error('Expected quote submission body')
    }

    const body = submitCall[1].body as FormData
    const requirements = body.get('requirements') as string

    expect(body.get('email')).toBeNull()
    expect(body.get('phone')).toBe('+44 7000 000 111')
    expect(requirements).toBe([
      'Quote brief',
      'Servings: 24 guests',
      'Brief: Blue floral cake with vanilla raspberry flavour for a milestone birthday.'
    ].join('\n'))
  })

  it('shows the success state and clears the selected file after submission', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' })
        })
      }

      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true })
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields({ phone: '' })

    const fileInput = screen.getByLabelText(/^Reference image/i) as HTMLInputElement
    const file = new File(['cake'], 'cake.png', { type: 'image/png' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    expect(screen.getByText(/selected:\s*cake\.png/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /enquiry sent/i })).toBeInTheDocument()
    })

    expect(screen.queryByText(/selected:\s*cake\.png/i)).not.toBeInTheDocument()
    expect(fileInput.value).toBe('')
  })

  it('blocks submission when the upload is not a supported image type', async () => {
    await renderForm()
    fillRequiredFields({ phone: '' })

    const fileInput = screen.getByLabelText(/^Reference image/i)
    const file = new File(['file'], 'brief.pdf', { type: 'application/pdf' })
    fireEvent.change(fileInput, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(screen.getByText(/image must be a jpeg, png, or heic file/i)).toBeInTheDocument()
    })

    expect(global.fetch).not.toHaveBeenCalledWith('/api/custom-cake-enquiry', expect.anything())
  })

  it('shows a server-provided rate limit message when submission is rejected with 429', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' })
        })
      }

      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Too many requests. Please try again later.' })
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields({ phone: '' })

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(screen.getByText(/too many requests\. please try again later\./i)).toBeInTheDocument()
    })
  })

  it('shows a server-provided csrf error when submission is rejected with 403', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' })
        })
      }

      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Invalid CSRF token' })
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields({ phone: '' })

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid csrf token/i)).toBeInTheDocument()
    })
  })

  it('shows a server-provided email configuration error when submission is rejected with 500', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' })
        })
      }

      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'Email service not configured' })
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields({ phone: '' })

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(screen.getByText(/email service not configured/i)).toBeInTheDocument()
    })
  })

  it('shows the contact fallback message when submission fails without a usable server error', async () => {
    ;(global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/csrf-token') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ token: 'csrf-token-123' })
        })
      }

      if (url === '/api/custom-cake-enquiry') {
        return Promise.resolve({
          ok: false,
          json: async () => ({})
        })
      }

      return Promise.reject(new Error(`Unexpected fetch call: ${url}`))
    })

    await renderForm()
    fillRequiredFields({ phone: '' })

    fireEvent.click(screen.getByRole('button', { name: /send quote request/i }))

    await waitFor(() => {
      expect(screen.getByText(/something went wrong while sending your quote request/i)).toBeInTheDocument()
      expect(screen.getByText(/hello@olgishcakes\.co\.uk/i)).toBeInTheDocument()
      expect(screen.getByText(/\+44 786 721 8194/i)).toBeInTheDocument()
    })
  })
})



