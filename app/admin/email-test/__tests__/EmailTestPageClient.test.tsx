/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { EmailTestPageClient } from '../EmailTestPageClient'

function buildPreviewResponse(overrides?: Partial<{ templateId: string, subject: string, input: Record<string, unknown> }>) {
  const input = overrides?.input ?? {
    customerName: 'Preview User',
    customerEmail: 'preview@example.com',
    quantity: 1,
    attachmentNames: ['design-reference.jpg']
  }

  return {
    templateId: overrides?.templateId ?? 'contact-inline-order-customer',
    input,
    rendered: {
      subject: overrides?.subject ?? 'Order request received',
      text: 'Preview text',
      html: '<html><body>Preview html</body></html>',
      metadata: {
        templateId: 'contact-inline-order-customer'
      }
    }
  }
}

function renderWithQueryClient() {
  const queryClient = new QueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <EmailTestPageClient />
    </QueryClientProvider>
  )
}

describe('EmailTestPageClient', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => buildPreviewResponse()
    } as Response) as jest.Mock
  })

  it('renders setup and preview sections without token/json controls', async () => {
    renderWithQueryClient()

    await waitFor(() => {
      expect(screen.getByText('Order request received')).toBeInTheDocument()
    })

    expect(screen.getByRole('heading', { name: 'Email Test Console' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Setup' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Rendered preview' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preview email' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Design' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByTitle('Rendered email preview')).toBeInTheDocument()
    expect(screen.queryByPlaceholderText('EMAIL_TEST_ADMIN_TOKEN')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Template payload (JSON)')).not.toBeInTheDocument()
  })

  it('offers cakes-by-post scenarios for customer, admin, and status emails', async () => {
    renderWithQueryClient()

    await waitFor(() => {
      expect(screen.getByLabelText('Request')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Request'), {
      target: { value: 'cakes-by-post-order' }
    })

    expect(screen.getByRole('option', { name: 'Customer: Cakes by post customer' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Admin: Cakes by post admin' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Fallback: Cakes by post customer email if order save fails' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('checkbox', { name: /Show advanced\/error scenarios/ }))

    expect(screen.getByRole('option', { name: 'Fallback: Cakes by post customer email if order save fails' })).toBeInTheDocument()

    expect(screen.getByRole('option', { name: 'Customer: order status update' })).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Scenario'), {
      target: { value: 'orders-status-update:cakes-by-post-status' }
    })

    expect(screen.getByLabelText('Order status')).toBeInTheDocument()
    expect(within(screen.getByLabelText('Order status')).getByRole('option', { name: 'Dispatched' })).toBeInTheDocument()
    expect(screen.getByLabelText('Courier')).toHaveValue('evri')
    expect(within(screen.getByLabelText('Courier')).getByRole('option', { name: 'Evri' })).toBeInTheDocument()
  })

  it('loads default sample input and populates editable fields', async () => {
    const defaultResponse = buildPreviewResponse({
      input: {
        customerName: 'Default Name',
        customerEmail: 'default@example.com',
        attachmentNames: ['one.png', 'two.png']
      }
    })

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => defaultResponse
    } as Response) as jest.Mock

    renderWithQueryClient()

    await waitFor(() => {
      expect(screen.getByLabelText('Customer name')).toHaveValue('Default Name')
    })

    expect(screen.getByLabelText('Customer email')).toHaveValue('default@example.com')
    expect(screen.getByText('one.png')).toBeInTheDocument()
    expect(screen.getByText('two.png')).toBeInTheDocument()

    const firstCall = (global.fetch as jest.Mock).mock.calls[0]
    expect(firstCall?.[0]).toBe('/api/dev/email-preview')

    const firstBody = JSON.parse(String(firstCall?.[1]?.body))
    expect(firstBody).toEqual({
      templateId: 'contact-admin-inquiry',
      scenarioId: 'default'
    })
  })

  it('uses edited field values in preview payload input', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse({
          input: {
            customerName: 'Default Name',
            customerEmail: 'default@example.com'
          }
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse({
          subject: 'Edited preview',
          input: {
            customerName: 'Edited User',
            customerEmail: 'default@example.com'
          }
        })
      } as Response)

    renderWithQueryClient()

    await waitFor(() => {
      expect(screen.getByLabelText('Customer name')).toHaveValue('Default Name')
    })

    fireEvent.change(screen.getByLabelText('Customer name'), {
      target: { value: 'Edited User' }
    })


    fireEvent.click(screen.getByRole('button', { name: 'Preview email' }))

    await waitFor(() => {
      expect(screen.getByText('Edited preview')).toBeInTheDocument()
    })

    const previewCall = (global.fetch as jest.Mock).mock.calls[1]
    const previewBody = JSON.parse(String(previewCall?.[1]?.body))

    expect(previewBody).toMatchObject({
      templateId: 'contact-admin-inquiry',
      scenarioId: 'default',
      input: {
        customerName: 'Edited User',
        customerEmail: 'default@example.com'
      }
    })
  })
  it('shows status dropdown and toggles tracking input for orders status template', async () => {
    renderWithQueryClient()

    await waitFor(() => {
      expect(screen.getByLabelText('Request')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Request'), {
      target: { value: 'cake-product-order' }
    })

    fireEvent.change(screen.getByLabelText('Scenario'), {
      target: { value: 'orders-status-update:cake-product-status' }
    })

    const orderSection = screen.getByText('Order fields').closest('div')
    expect(orderSection).not.toBeNull()

    const scoped = within(orderSection as HTMLElement)

    await waitFor(() => {
      expect(scoped.getByLabelText('Status')).toBeInTheDocument()
    })

    const statusSelect = scoped.getByLabelText('Status')
    expect(scoped.getByRole('option', { name: 'Out for delivery' })).toBeInTheDocument()
    expect(scoped.queryByPlaceholderText('TRACK-123456')).not.toBeInTheDocument()

    fireEvent.change(statusSelect, { target: { value: 'out-for-delivery' } })

    await waitFor(() => {
      expect(scoped.getByPlaceholderText('TRACK-123456')).toBeInTheDocument()
    })

    fireEvent.change(scoped.getByPlaceholderText('TRACK-123456'), {
      target: { value: 'TRACK-XYZ-1' }
    })

    fireEvent.change(statusSelect, { target: { value: 'confirmed' } })

    await waitFor(() => {
      expect(scoped.queryByPlaceholderText('TRACK-123456')).not.toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Preview email' }))

    await waitFor(() => {
      expect((global.fetch as jest.Mock).mock.calls.length).toBeGreaterThan(2)
    })

    const previewCall = (global.fetch as jest.Mock).mock.calls.at(-1)
    const previewBody = JSON.parse(String(previewCall?.[1]?.body))

    expect(previewBody).toMatchObject({
      templateId: 'orders-status-update',
      scenarioId: 'confirmed',
      input: {
        status: 'confirmed'
      }
    })
    expect(previewBody.input.trackingNumber).toBeUndefined()
  })

  it('reloads defaults when scenario changes and passes scenarioId', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse({
          input: {
            customerName: 'Default Name',
            customerEmail: 'default@example.com'
          }
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse({
          templateId: 'orders-customer-confirmation',
          input: {
            status: 'confirmed'
          },
          subject: 'Customer confirmation'
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse({
          templateId: 'orders-status-update',
          input: {
            status: 'confirmed'
          },
          subject: 'Status confirmed'
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse({
          templateId: 'orders-status-update',
          input: {
            status: 'out-for-delivery',
            trackingNumber: 'TRACK-123456'
          },
          subject: 'Status out for delivery'
        })
      } as Response)

    renderWithQueryClient()

    await waitFor(() => {
      expect(screen.getByLabelText('Request')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Request'), {
      target: { value: 'cake-product-order' }
    })

    fireEvent.change(screen.getByLabelText('Scenario'), {
      target: { value: 'orders-status-update:cake-product-status' }
    })

    const orderSection = screen.getByText('Order fields').closest('div')
    expect(orderSection).not.toBeNull()

    const scoped = within(orderSection as HTMLElement)

    await waitFor(() => {
      expect(scoped.getByLabelText('Status')).toHaveValue('confirmed')
    })

    fireEvent.change(screen.getByLabelText('Order status'), {
      target: { value: 'out-for-delivery' }
    })

    await waitFor(() => {
      expect(scoped.getByLabelText('Status')).toHaveValue('out-for-delivery')
    })

    expect(scoped.getByPlaceholderText('TRACK-123456')).toHaveValue('TRACK-123456')

    const requestBodies = (global.fetch as jest.Mock).mock.calls
      .map((call) => JSON.parse(String(call[1]?.body)))

    expect(requestBodies).toEqual(expect.arrayContaining([
      {
        templateId: 'orders-status-update',
        scenarioId: 'out-for-delivery'
      }
    ]))
  })

  it('lets cakes-by-post status previews switch courier in the payload', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse()
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse({
          templateId: 'contact-inline-order-customer',
          input: {
            productType: 'gift-hamper'
          },
          subject: 'Cakes by post customer'
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse({
          templateId: 'orders-status-update',
          input: {
            productType: 'gift-hamper',
            status: 'confirmed',
            deliveryCourier: 'evri'
          },
          subject: 'Cakes by post confirmed'
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse({
          templateId: 'orders-status-update',
          input: {
            productType: 'gift-hamper',
            status: 'out-for-delivery',
            deliveryCourier: 'evri',
            trackingNumber: 'TRACK-123456'
          },
          subject: 'Cakes by post out for delivery'
        })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse({
          templateId: 'orders-status-update',
          input: {
            productType: 'gift-hamper',
            status: 'out-for-delivery',
            deliveryCourier: 'royal-mail',
            trackingNumber: 'TRACK-123456'
          },
          subject: 'Royal Mail preview'
        })
      } as Response)

    renderWithQueryClient()

    await waitFor(() => {
      expect(screen.getByLabelText('Request')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Request'), {
      target: { value: 'cakes-by-post-order' }
    })

    fireEvent.change(screen.getByLabelText('Scenario'), {
      target: { value: 'orders-status-update:cakes-by-post-status' }
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Order status')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Order status'), {
      target: { value: 'cakes-by-post-out-for-delivery' }
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Courier')).toHaveValue('evri')
    })

    fireEvent.change(screen.getByLabelText('Courier'), {
      target: { value: 'royal-mail' }
    })

    expect(screen.queryAllByLabelText('Courier')).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'Preview email' }))

    await waitFor(() => {
      expect(screen.getByText('Royal Mail preview')).toBeInTheDocument()
    })

    const previewCall = (global.fetch as jest.Mock).mock.calls.at(-1)
    const previewBody = JSON.parse(String(previewCall?.[1]?.body))

    expect(previewBody).toMatchObject({
      templateId: 'orders-status-update',
      scenarioId: 'cakes-by-post-out-for-delivery',
      input: {
        productType: 'gift-hamper',
        status: 'out-for-delivery',
        deliveryCourier: 'royal-mail',
        trackingNumber: 'TRACK-123456'
      }
    })
  })

  it('blocks actions with invalid numeric field values', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse()
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse()
      } as Response)

    renderWithQueryClient()

    await waitFor(() => {
      expect(screen.getByLabelText('Request')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Request'), {
      target: { value: 'cake-product-order' }
    })

    await waitFor(() => {
      expect(screen.getByLabelText('Quantity')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '-' }
    })

    expect(screen.getByText('Quantity must be a valid number')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preview email' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Send real test email' })).toBeDisabled()
  })

  it('disables real send when recipient is empty by default', async () => {
    renderWithQueryClient()

    await waitFor(() => {
      expect(screen.getByText('Order request received')).toBeInTheDocument()
    })

    const requestButton = screen.getByRole('button', { name: 'Send real test email' })
    expect(requestButton).toBeDisabled()

    fireEvent.click(requestButton)

    const confirmButton = screen.getByRole('button', { name: 'Confirm and send', hidden: true })
    expect(confirmButton).toBeDisabled()
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('requires modal confirmation before real send and sends on confirm', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => buildPreviewResponse()
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          accepted: true,
          mode: 'live',
          transportId: 'live-id-2'
        })
      } as Response)

    renderWithQueryClient()

    await waitFor(() => {
      expect(screen.getByText('Order request received')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('allowlisted@example.com'), {
      target: { value: 'allowlisted@example.com' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Send real test email' }))
    expect(screen.getByRole('heading', { name: 'Confirm real test send' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Confirm and send' }))

    await waitFor(() => {
      expect(screen.getByText(/Accepted \(live\)/)).toBeInTheDocument()
    })

    const sendCall = (global.fetch as jest.Mock).mock.calls[1]
    const sendBody = JSON.parse(String(sendCall?.[1]?.body))

    expect(sendCall?.[0]).toBe('/api/dev/email-test-send')
    expect(sendBody).toMatchObject({
      templateId: 'contact-admin-inquiry',
      to: 'allowlisted@example.com',
      scenarioId: 'default'
    })
  })

  it('does not send real email when modal is cancelled', async () => {
    renderWithQueryClient()

    await waitFor(() => {
      expect(screen.getByText('Order request received')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText('allowlisted@example.com'), {
      target: { value: 'allowlisted@example.com' }
    })

    fireEvent.click(screen.getByRole('button', { name: 'Send real test email' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Confirm real test send' })).not.toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
