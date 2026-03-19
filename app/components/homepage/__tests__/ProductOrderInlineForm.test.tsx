/**
 * @jest-environment jsdom
 */
import React from 'react'
import { fireEvent, render as rtlRender, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProductOrderInlineForm } from '../ProductOrderInlineForm'
import { OCCASION_OPTIONS, type OccasionOption } from '../formOptions'
import { fetchOccasionOptions } from '@/app/services/occasionOptions'

jest.mock('@/app/services/occasionOptions', () => {
  const actual = jest.requireActual('@/app/services/occasionOptions') as typeof import('@/app/services/occasionOptions')

  return {
    ...actual,
    fetchOccasionOptions: jest.fn()
  }
})

const mockedFetchOccasionOptions = fetchOccasionOptions as jest.MockedFunction<typeof fetchOccasionOptions>

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0
      },
      mutations: {
        gcTime: 0
      }
    }
  })
}

function render(ui: React.ReactElement) {
  const queryClient = createTestQueryClient()

  return rtlRender(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('ProductOrderInlineForm', () => {
  const getDateInputValue = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const originalScrollIntoView = Element.prototype.scrollIntoView
  const scrollIntoViewMock = jest.fn()

  const fillRequiredFields = () => {
    fireEvent.change(screen.getByLabelText(/full name:/i), { target: { value: 'John Doe' } })
    fireEvent.change(screen.getByLabelText(/email address:/i), { target: { value: 'john@example.com' } })
    fireEvent.change(screen.getByLabelText(/phone number:/i), { target: { value: '07911123456' } })
  }

  const selectOccasion = (optionName: string) => {
    fireEvent.click(screen.getByLabelText(/what's the occasion\?/i))
    fireEvent.click(screen.getByRole('option', { name: optionName }))
  }

  beforeEach(() => {
    Element.prototype.scrollIntoView = scrollIntoViewMock
    mockedFetchOccasionOptions.mockReset()
    mockedFetchOccasionOptions.mockResolvedValue(OCCASION_OPTIONS)
    global.fetch = jest.fn().mockResolvedValue({
      ok: true
    })
  })

  afterEach(() => {
    Element.prototype.scrollIntoView = originalScrollIntoView
    jest.restoreAllMocks()
  })

  it('renders message field in default mode only', () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/requirements/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/upload a reference image/i)).not.toBeInTheDocument()
  })

  it('applies cursor-pointer class to the occasion dropdown', () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    expect(screen.getByLabelText(/what's the occasion\?/i)).toHaveClass('cursor-pointer')
  })

  it('applies cursor-pointer class to the date input', () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    expect(screen.getByLabelText(/when do you need it/i)).toHaveClass('cursor-pointer')
  })

  it('renders requirements and upload fields in custom-design mode', () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
        requestMode='custom-design'
      />
    )

    expect(screen.getByLabelText(/requirements/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/upload a reference image/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/message/i)).not.toBeInTheDocument()
  })

  it('shows optional labels in message mode', () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    expect(screen.getByLabelText(/address.*optional/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/city.*optional/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/postcode.*optional/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/when do you need it?.*optional/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/message.*optional/i)).toBeInTheDocument()
  })

  it('shows optional indicator for requirements in custom-design mode', () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
        requestMode='custom-design'
      />
    )

    expect(screen.getByLabelText(/requirements.*optional/i)).toBeInTheDocument()
  })

  it('shows submit check icon by default and toggles to spinner while submitting', async () => {
    let resolveRequest: ((value: { ok: boolean }) => void) | null = null
    ;(global.fetch as jest.Mock).mockImplementationOnce(() => {
      return new Promise((resolve) => {
        resolveRequest = resolve as (value: { ok: boolean }) => void
      })
    })

    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    fillRequiredFields()

    const submitButton = screen.getByRole('button', { name: /submit order/i })
    expect(submitButton).toBeEnabled()
    expect(submitButton.querySelector('svg')).not.toBeNull()
    expect(submitButton.querySelector('.loading-spinner')).toBeNull()

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveAttribute('aria-busy', 'true')
    })

    expect(submitButton.querySelector('.loading-spinner')).not.toBeNull()
    expect(submitButton.querySelector('svg')).toBeNull()

    if (resolveRequest) {
      resolveRequest({ ok: true })
    }

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /order sent/i })).toBeInTheDocument()
    })
  })

  it('shows required address labels for cakes by post orders', () => {
    render(
      <ProductOrderInlineForm
        productType='gift-hamper'
        productId='hamper-slug'
        productName='Hamper'
        totalPrice={12.5}
      />
    )

    expect(screen.getByLabelText(/^address:$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^city:$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^postcode:$/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/address.*optional/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/city.*optional/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/postcode.*optional/i)).not.toBeInTheDocument()
  })

  it('applies mobile and tablet height classes to the submit button', () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    const submitButton = screen.getByRole('button', { name: /submit order/i })
    expect(submitButton).toHaveClass('h-12')
    expect(submitButton).toHaveClass('tablet:h-12')
  })

  it('focuses full name when required fields are empty on submit', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByLabelText(/full name:/i))
    })

    expect(scrollIntoViewMock).toHaveBeenCalled()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits custom-design mode when date is not provided', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
        requestMode='custom-design'
      />
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/requirements/i), { target: { value: 'Heart shape, white icing' } })

    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST'
      }))
    })

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]
    const body = requestInit.body as FormData

    expect(body.get('dateNeeded')).toBeNull()
  })

  it('focuses upload field when custom-design image type is invalid', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
        requestMode='custom-design'
      />
    )

    fillRequiredFields()
    const invalidFile = new File(['file'], 'cake.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText(/upload a reference image/i), { target: { files: [invalidFile] } })

    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(screen.getByText(/image must be a jpeg, png, or heic file/i)).toBeInTheDocument()
      expect(document.activeElement).toBe(screen.getByLabelText(/upload a reference image/i))
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('maps server upload errors to upload field in custom-design mode', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Reference image must be a JPEG, PNG, or HEIC file' })
    })

    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
        requestMode='custom-design'
      />
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/requirements/i), { target: { value: 'Heart shape, white icing' } })
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(screen.getByText(/reference image must be a jpeg, png, or heic file/i)).toBeVisible()
      expect(document.activeElement).toBe(screen.getByLabelText(/upload a reference image/i))
    })

    expect(screen.queryByText(/failed to submit order. please try again./i)).not.toBeInTheDocument()
  })

  it('shows server non-image errors in submit alert', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to send email' })
    })

    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(screen.getByText('Failed to send email')).toBeInTheDocument()
    })

    expect(screen.queryByText(/reference image must be a jpeg, png, or heic file/i)).not.toBeInTheDocument()
  })

  it('falls back to generic submit error when server error json cannot be parsed', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error('Invalid JSON')
      }
    })

    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(screen.getByText('Failed to submit order. Please try again.')).toBeInTheDocument()
    })
  })

  it('submits with only full name, email, and phone', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST'
      }))
    })

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]
    const body = requestInit.body as FormData

    expect(body.get('address')).toBeNull()
    expect(body.get('city')).toBeNull()
    expect(body.get('postcode')).toBeNull()
    expect(body.get('dateNeeded')).toBeNull()
  })

  it('blocks submission when optional postcode is invalid', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: 'BAD' } })
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid uk postcode/i)).toBeVisible()
      expect(document.activeElement).toBe(screen.getByLabelText(/postcode/i))
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('blocks submission when optional date is in the past', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/when do you need it/i), { target: { value: getDateInputValue(-1) } })
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(screen.getByText(/please select today or a future date/i)).toBeVisible()
      expect(document.activeElement).toBe(screen.getByLabelText(/when do you need it/i))
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits compact v2 payload to /api/contact in default mode', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
        orderEmailContext={{
          designType: 'individual',
          filling: 'Sour cream',
          servings: 'Serves 8-12 people'
        }}
        contextLines={['Product: Honey Cake']}
      />
    )

    const neededDate = getDateInputValue(1)

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/^address:/i), { target: { value: '123 Test Street' } })
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: 'Leeds' } })
    fireEvent.change(screen.getByLabelText(/postcode/i), { target: { value: 'LS1 1AA' } })
    fireEvent.change(screen.getByLabelText(/when do you need it/i), { target: { value: neededDate } })
    selectOccasion('Birthday')
    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Please confirm collection time.' } })

    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST'
      }))
    })

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]
    const body = requestInit.body as FormData

    expect(body.get('isOrderForm')).toBe('true')
    expect(body.get('productType')).toBe('cake')
    expect(body.get('productId')).toBe('cake-slug')
    expect(body.get('productName')).toBe('Honey Cake')
    expect(body.get('totalPrice')).toBe('45')
    expect(body.get('address')).toBe('123 Test Street')
    expect(body.get('city')).toBe('Leeds')
    expect(body.get('postcode')).toBe('LS1 1AA')
    expect(body.get('dateNeeded')).toBe(neededDate)
    expect(body.get('message')).toBe('Product: Honey Cake\nMessage: Please confirm collection time.')
    expect(body.get('occasion')).toBe('birthday')
    expect(body.get('requestMode')).toBe('message')
    expect(body.get('customerMessage')).toBe('Please confirm collection time.')
    expect(body.get('designType')).toBe('individual')
    expect(body.get('filling')).toBe('Sour cream')
    expect(body.get('servings')).toBe('Serves 8-12 people')
    expect(body.get('designImage')).toBeNull()
    expect(body.get('orderType')).toBeNull()
    expect(body.get('quantity')).toBeNull()
  })

  it('shows success next steps after submit and keeps success button label', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST'
      }))
    })

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
    expect(screen.getByText('Order request received')).toBeInTheDocument()
    expect(screen.getByText("Thank you. We've received your request.")).toBeInTheDocument()
    expect(screen.getByText("We'll review your details within 24 hours.")).toBeInTheDocument()
    expect(screen.getByText("We'll contact you with a quote and final design details.")).toBeInTheDocument()
    expect(screen.getByText("We'll confirm delivery or collection once you approve.")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /order sent/i })).toBeInTheDocument()
  })

  it('clears success state when user edits a field after successful submit', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(screen.getByText('Order request received')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText(/full name:/i), { target: { value: 'Jane Doe' } })

    await waitFor(() => {
      expect(screen.queryByText('Order request received')).not.toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /submit order/i })).toBeInTheDocument()
  })

  it('blocks submission when custom-design upload type is invalid', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
        requestMode='custom-design'
      />
    )

    fillRequiredFields()
    const invalidFile = new File(['file'], 'cake.pdf', { type: 'application/pdf' })
    fireEvent.change(screen.getByLabelText(/upload a reference image/i), { target: { files: [invalidFile] } })

    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(screen.getByText(/image must be a jpeg, png, or heic file/i)).toBeInTheDocument()
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('blocks submission when custom-design upload size is larger than 5MB', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
        requestMode='custom-design'
      />
    )

    fillRequiredFields()
    const tooLargeFile = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'cake.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/upload a reference image/i), { target: { files: [tooLargeFile] } })

    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(screen.getByText(/image must be 5mb or smaller/i)).toBeVisible()
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('submits custom-design payload with requirements message and designImage', async () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
        orderEmailContext={{
          designType: 'individual',
          filling: 'Cherry cream',
          servings: 'Serves 12-20 people'
        }}
        contextLines={['Product: Honey Cake']}
        requestMode='custom-design'
      />
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/requirements/i), { target: { value: 'Make it heart-shaped' } })
    const imageFile = new File(['file'], 'cake.png', { type: 'image/png' })
    fireEvent.change(screen.getByLabelText(/upload a reference image/i), { target: { files: [imageFile] } })

    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST'
      }))
    })

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]
    const body = requestInit.body as FormData
    const designImage = body.get('designImage')

    expect(body.get('message')).toBe('Product: Honey Cake\nRequirements: Make it heart-shaped')
    expect(body.get('requestMode')).toBe('custom-design')
    expect(body.get('customerMessage')).toBe('Make it heart-shaped')
    expect(body.get('designType')).toBe('individual')
    expect(body.get('filling')).toBe('Cherry cream')
    expect(body.get('servings')).toBe('Serves 12-20 people')
    expect(body.get('occasion')).toBeNull()
    expect(designImage).toBeInstanceOf(File)
    expect((designImage as File).name).toBe('cake.png')
  })

  it('shows gift note field only for gift-hamper orders', () => {
    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    expect(screen.queryByLabelText(/gift note/i)).not.toBeInTheDocument()

    render(
      <ProductOrderInlineForm
        productType='gift-hamper'
        productId='hamper-slug'
        productName='Hamper'
        totalPrice={12.5}
      />
    )

    expect(screen.getByLabelText(/gift note/i)).toBeInTheDocument()
  })

  it('includes gift note in payload for gift-hamper orders when provided', async () => {
    render(
      <ProductOrderInlineForm
        productType='gift-hamper'
        productId='hamper-slug'
        productName='Hamper'
        totalPrice={12.5}
      />
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/^address:/i), { target: { value: '7 Sample Street' } })
    fireEvent.change(screen.getByLabelText(/^city:/i), { target: { value: 'Leeds' } })
    fireEvent.change(screen.getByLabelText(/^postcode:/i), { target: { value: 'LS1 1AA' } })
    fireEvent.change(screen.getByLabelText(/gift note/i), { target: { value: 'Happy birthday from us!' } })
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST'
      }))
    })

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]
    const body = requestInit.body as FormData
    expect(body.get('giftNote')).toBe('Happy birthday from us!')
  })

  it('omits gift note from payload for gift-hamper orders when empty', async () => {
    render(
      <ProductOrderInlineForm
        productType='gift-hamper'
        productId='hamper-slug'
        productName='Hamper'
        totalPrice={12.5}
      />
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/^address:/i), { target: { value: '7 Sample Street' } })
    fireEvent.change(screen.getByLabelText(/^city:/i), { target: { value: 'Leeds' } })
    fireEvent.change(screen.getByLabelText(/^postcode:/i), { target: { value: 'LS1 1AA' } })
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST'
      }))
    })

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]
    const body = requestInit.body as FormData
    expect(body.get('giftNote')).toBeNull()
  })

  it('blocks submission when gift note is longer than 500 characters', async () => {
    render(
      <ProductOrderInlineForm
        productType='gift-hamper'
        productId='hamper-slug'
        productName='Hamper'
        totalPrice={12.5}
      />
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/^address:/i), { target: { value: '7 Sample Street' } })
    fireEvent.change(screen.getByLabelText(/^city:/i), { target: { value: 'Leeds' } })
    fireEvent.change(screen.getByLabelText(/^postcode:/i), { target: { value: 'LS1 1AA' } })
    fireEvent.change(screen.getByLabelText(/gift note/i), { target: { value: 'a'.repeat(501) } })
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(screen.getByText('Gift note must be 500 characters or fewer')).toBeVisible()
      expect(document.activeElement).toBe(screen.getByLabelText(/gift note/i))
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })
  it('sends fetch requests with AbortSignal support', async () => {
    render(
      <ProductOrderInlineForm
        productType='gift-hamper'
        productId='hamper-slug'
        productName='Hamper'
        totalPrice={12.5}
      />
    )

    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/^address:/i), { target: { value: '7 Sample Street' } })
    fireEvent.change(screen.getByLabelText(/^city:/i), { target: { value: 'Leeds' } })
    fireEvent.change(screen.getByLabelText(/^postcode:/i), { target: { value: 'LS1 1AA' } })
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled()
    })

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]
    expect(requestInit.signal).toBeInstanceOf(AbortSignal)
  })

  it('hides occasion field when showOccasionField is false and still submits', async () => {
    render(
      <ProductOrderInlineForm
        productType='gift-hamper'
        productId='hamper-slug'
        productName='Hamper'
        totalPrice={12.5}
        showOccasionField={false}
      />
    )

    expect(screen.queryByLabelText(/what's the occasion\?/i)).not.toBeInTheDocument()
    fillRequiredFields()
    fireEvent.change(screen.getByLabelText(/^address:/i), { target: { value: '7 Sample Street' } })
    fireEvent.change(screen.getByLabelText(/^city:/i), { target: { value: 'Leeds' } })
    fireEvent.change(screen.getByLabelText(/^postcode:/i), { target: { value: 'LS1 1AA' } })
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST'
      }))
    })
  })
  it('fetches occasion options on mount when prop is omitted and showOccasionField is true', async () => {
    mockedFetchOccasionOptions.mockClear()

    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    await waitFor(() => {
      expect(mockedFetchOccasionOptions).toHaveBeenCalledTimes(1)
    })

    const requestSignal = mockedFetchOccasionOptions.mock.calls[0]?.[0]
    expect(requestSignal).toBeInstanceOf(AbortSignal)
  })

  it('blocks gift-hamper submission when postal address fields are empty', async () => {
    render(
      <ProductOrderInlineForm
        productType='gift-hamper'
        productId='hamper-slug'
        productName='Hamper'
        totalPrice={12.5}
      />
    )

    fillRequiredFields()
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(screen.getByText('Address is required for cakes by post orders')).toBeVisible()
      expect(document.activeElement).toBe(screen.getByLabelText(/^address:$/i))
    })

    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('keeps fallback occasion options while fetch is loading', () => {
    mockedFetchOccasionOptions.mockImplementationOnce(() => new Promise<never>(() => {}))

    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    fireEvent.click(screen.getByLabelText(/what's the occasion\?/i))
    expect(screen.getByRole('option', { name: 'Birthday' })).toBeInTheDocument()
  })

  it('keeps fallback occasion options when fetch fails', async () => {
    mockedFetchOccasionOptions.mockRejectedValueOnce(new Error('Occasion options fetch failed'))

    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    await waitFor(() => {
      expect(mockedFetchOccasionOptions).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByLabelText(/what's the occasion\?/i))
    expect(screen.getByRole('option', { name: 'Birthday' })).toBeInTheDocument()
  })

  it('replaces fallback options with fetched occasion options on success', async () => {
    mockedFetchOccasionOptions.mockResolvedValueOnce([
      { label: 'Select from list', value: '', disabled: true },
      { label: 'Wedding Cakes', value: 'Wedding Cakes' },
      { label: 'Other', value: 'other' }
    ])

    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    await waitFor(() => {
      expect(mockedFetchOccasionOptions).toHaveBeenCalled()
    })

    fireEvent.click(screen.getByLabelText(/what's the occasion\?/i))
    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Wedding Cakes' })).toBeInTheDocument()
    })
    expect(screen.queryByRole('option', { name: 'Birthday' })).not.toBeInTheDocument()
  })

  it('preserves the selected fallback occasion when fetched options replace the list', async () => {
    let resolveOccasionOptions: ((options: OccasionOption[]) => void) | null = null
    mockedFetchOccasionOptions.mockImplementationOnce(() => {
      return new Promise((resolve) => {
        resolveOccasionOptions = resolve
      })
    })

    render(
      <ProductOrderInlineForm
        productType='cake'
        productId='cake-slug'
        productName='Honey Cake'
        totalPrice={45}
      />
    )

    fillRequiredFields()
    selectOccasion('Birthday')

    expect(screen.getByLabelText(/what's the occasion\?/i)).toHaveTextContent('Birthday')

    resolveOccasionOptions?.([
      { label: 'Select from list', value: '', disabled: true },
      { label: 'Wedding Cakes', value: 'Wedding Cakes' },
      { label: 'Other', value: 'other' }
    ])

    await waitFor(() => {
      expect(mockedFetchOccasionOptions).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/what's the occasion\?/i)).toHaveTextContent('Birthday')
    })

    fireEvent.click(screen.getByLabelText(/what's the occasion\?/i))
    expect(screen.getByRole('option', { name: 'Birthday' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText(/message/i), { target: { value: 'Please confirm collection time.' } })
    fireEvent.click(screen.getByRole('button', { name: /submit order/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/contact', expect.objectContaining({
        method: 'POST'
      }))
    })

    const [, requestInit] = (global.fetch as jest.Mock).mock.calls[0]
    const body = requestInit.body as FormData

    expect(body.get('occasion')).toBe('birthday')
  })
})
