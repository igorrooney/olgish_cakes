'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { DesignSystemDatePicker } from '@/app/components/forms/DesignSystemDatePicker'
import type { EmailTemplateId, RenderedEmail } from '@/lib/email/types'
import { listTemplateScenarioOptions } from '@/lib/email/scenarios'

type PreviewTab = 'text' | 'html' | 'metadata'

type EditableFieldKey =
  | 'customerName'
  | 'customerEmail'
  | 'customerPhone'
  | 'headingOverride'
  | 'message'
  | 'note'
  | 'orderNumber'
  | 'orderType'
  | 'productName'
  | 'productId'
  | 'productType'
  | 'quantity'
  | 'unitPrice'
  | 'totalPrice'
  | 'dateNeeded'
  | 'cakeInterest'
  | 'status'
  | 'trackingNumber'
  | 'address'
  | 'city'
  | 'postcode'
  | 'occasion'
  | 'designType'
  | 'filling'
  | 'servings'
  | 'customerMessage'
  | 'deliveryMethod'
  | 'deliveryCourier'
  | 'deliveryAddress'
  | 'paymentMethod'
  | 'paymentStatus'
  | 'referrer'
  | 'giftNote'
  | 'approximateSubmittedFrom'
  | 'adminUrl'
  | 'attachmentNames'
  | 'nextSteps'

type InputFieldType = 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'list' | 'select'

type EmailTestFormValues = Record<EditableFieldKey, string>

interface PreviewResponse {
  templateId: EmailTemplateId
  input: Record<string, unknown>
  rendered: RenderedEmail
}

interface RealSendResponse {
  accepted: boolean
  reason?: string
  mode?: string
  transportId?: string | null
  subject?: string
}

interface FieldOption {
  label: string
  value: string
}

interface FieldDefinition {
  key: EditableFieldKey
  label: string
  type: InputFieldType
  placeholder: string
  helper?: string
  options?: FieldOption[]
}

interface FieldSection {
  id: string
  title: string
  description: string
  fields: FieldDefinition[]
}

interface PreviewMutationInput {
  useCurrentInput: boolean
  syncFormValues: boolean
  scenarioId?: string
}

type EmailRequestId =
  | 'contact-enquiry'
  | 'homepage-custom-cake-enquiry'
  | 'get-custom-quote-enquiry'
  | 'cakes-by-post-order'
  | 'cake-product-order'
  | 'workshop-enquiry'

interface RequestScenarioOption {
  id: string
  label: string
  templateId: EmailTemplateId
  scenarioId: string
  advanced?: boolean
  statusGroup?: 'cake-product' | 'cakes-by-post'
}

interface EmailRequestOption {
  id: EmailRequestId
  label: string
  scenarios: RequestScenarioOption[]
}

const defaultRecipient = ''

const cakeProductStatusScenarios: FieldOption[] = [
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In progress', value: 'in-progress' },
  { label: 'Ready', value: 'ready' },
  { label: 'Out for delivery', value: 'out-for-delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

const cakesByPostStatusScenarios: FieldOption[] = [
  { label: 'Confirmed', value: 'cakes-by-post-confirmed' },
  { label: 'In progress', value: 'cakes-by-post-in-progress' },
  { label: 'Ready', value: 'cakes-by-post-ready' },
  { label: 'Dispatched', value: 'cakes-by-post-out-for-delivery' },
  { label: 'Delivered', value: 'cakes-by-post-delivered' },
  { label: 'Completed', value: 'cakes-by-post-completed' },
  { label: 'Cancelled', value: 'cakes-by-post-cancelled' }
]

function createScenarioOptions(
  templateId: EmailTemplateId,
  prefix: string,
  scenarioIds?: string[],
  advanced = false
): RequestScenarioOption[] {
  const allowedScenarioIds = scenarioIds ? new Set(scenarioIds) : null

  return listTemplateScenarioOptions(templateId)
    .filter((scenario) => allowedScenarioIds === null || allowedScenarioIds.has(scenario.id))
    .map((scenario) => ({
      id: `${templateId}:${scenario.id}`,
      label: `${prefix}: ${scenario.label}`,
      templateId,
      scenarioId: scenario.id,
      advanced
    }))
}

function createStatusScenarioOption(params: {
  id: string
  label: string
  statusGroup: 'cake-product' | 'cakes-by-post'
  scenarioId: string
}): RequestScenarioOption {
  return {
    id: `orders-status-update:${params.id}`,
    label: params.label,
    templateId: 'orders-status-update',
    scenarioId: params.scenarioId,
    statusGroup: params.statusGroup
  }
}

const requestOptions: EmailRequestOption[] = [
  {
    id: 'contact-enquiry',
    label: 'Contact page enquiry',
    scenarios: createScenarioOptions('contact-admin-inquiry', 'Admin')
  },
  {
    id: 'homepage-custom-cake-enquiry',
    label: 'Homepage custom cake enquiry',
    scenarios: [
      ...createScenarioOptions('custom-cake-enquiry-admin', 'Admin', ['homepage-default']),
      ...createScenarioOptions('custom-cake-enquiry-customer', 'Customer', ['homepage-default', 'homepage-minimal']),
      ...createScenarioOptions('custom-cake-enquiry-failure-alert', 'Failure alert', undefined, true)
    ]
  },
  {
    id: 'get-custom-quote-enquiry',
    label: 'Get custom quote enquiry',
    scenarios: [
      ...createScenarioOptions('custom-cake-enquiry-admin', 'Admin', ['quote-default']),
      ...createScenarioOptions('custom-cake-enquiry-customer', 'Customer', ['quote-default', 'quote-minimal']),
      ...createScenarioOptions('custom-cake-enquiry-failure-alert', 'Failure alert', undefined, true)
    ]
  },
  {
    id: 'cakes-by-post-order',
    label: 'Cakes by post order',
    scenarios: [
      ...createScenarioOptions('contact-inline-order-customer', 'Customer', ['cakes-by-post']),
      ...createScenarioOptions('contact-inline-order-admin', 'Admin', ['cakes-by-post']),
      createStatusScenarioOption({
        id: 'cakes-by-post-status',
        label: 'Customer: order status update',
        statusGroup: 'cakes-by-post',
        scenarioId: 'cakes-by-post-confirmed'
      }),
      ...createScenarioOptions('contact-inline-order-fallback-customer', 'Fallback', ['cakes-by-post'], true),
      ...createScenarioOptions('contact-inline-order-fallback-admin', 'Fallback', ['cakes-by-post'], true)
    ]
  },
  {
    id: 'cake-product-order',
    label: 'Cake product order',
    scenarios: [
      ...createScenarioOptions('contact-inline-order-customer', 'Customer', ['default', 'minimal']),
      ...createScenarioOptions('contact-inline-order-admin', 'Admin', ['default', 'with-attachment']),
      createStatusScenarioOption({
        id: 'cake-product-status',
        label: 'Customer: order status update',
        statusGroup: 'cake-product',
        scenarioId: 'confirmed'
      }),
      ...createScenarioOptions('contact-inline-order-fallback-customer', 'Fallback', ['default'], true),
      ...createScenarioOptions('contact-inline-order-fallback-admin', 'Fallback', ['default'], true)
    ]
  },
  {
    id: 'workshop-enquiry',
    label: 'Workshop enquiry',
    scenarios: [
      ...createScenarioOptions('workshop-enquiry-admin', 'Admin'),
      ...createScenarioOptions('workshop-enquiry-customer', 'Customer'),
      ...createScenarioOptions('workshop-enquiry-failure-alert', 'Failure alert', undefined, true)
    ]
  }
]

const initialRequest = requestOptions[0]
const initialScenario = initialRequest.scenarios[0]

const commonFields: EditableFieldKey[] = [
  'customerName',
  'customerEmail',
  'customerPhone',
  'headingOverride',
  'message',
  'note'
]

const orderFields: EditableFieldKey[] = [
  'orderNumber',
  'orderType',
  'productName',
  'productId',
  'productType',
  'quantity',
  'unitPrice',
  'totalPrice',
  'dateNeeded'
]

const instagramTokenAlertFields: EditableFieldKey[] = [
  'customerName',
  'customerEmail',
  'message',
  'note',
  'orderType',
  'productName',
  'dateNeeded'
]

const statusFields: EditableFieldKey[] = ['status', 'trackingNumber']

const preferenceFields: EditableFieldKey[] = [
  'address',
  'city',
  'postcode',
  'cakeInterest',
  'occasion',
  'designType',
  'filling',
  'servings',
  'customerMessage',
  'deliveryMethod',
  'deliveryCourier',
  'deliveryAddress',
  'paymentMethod',
  'paymentStatus',
  'referrer',
  'giftNote',
  'approximateSubmittedFrom',
  'adminUrl'
]

const listFields: EditableFieldKey[] = ['attachmentNames', 'nextSteps']

const allFieldKeys: EditableFieldKey[] = [
  ...commonFields,
  ...orderFields,
  ...statusFields,
  ...preferenceFields,
  ...listFields
]

const numericFields: EditableFieldKey[] = ['quantity', 'unitPrice', 'totalPrice']

const orderStatusOptions: FieldOption[] = [
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In progress', value: 'in-progress' },
  { label: 'Ready', value: 'ready' },
  { label: 'Out for delivery', value: 'out-for-delivery' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' }
]

function isDeliveryTrackingStatus(statusValue: string): boolean {
  const normalized = statusValue.trim().toLowerCase()
  return normalized === 'out-for-delivery' || normalized === 'out-delivery'
}

function shouldIncludeTrackingNumber(templateId: EmailTemplateId, statusValue: string): boolean {
  return templateId === 'orders-status-update' && isDeliveryTrackingStatus(statusValue)
}

const templateFieldMap: Record<EmailTemplateId, EditableFieldKey[]> = {
  'contact-admin-inquiry': [
    ...commonFields,
    'address',
    'city',
    'postcode',
    'cakeInterest',
    'dateNeeded',
    'referrer',
    'giftNote',
    'attachmentNames'
  ],
  'contact-inline-order-customer': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    ...listFields
  ],
  'contact-inline-order-admin': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    'attachmentNames'
  ],
  'contact-inline-order-fallback-customer': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    ...listFields
  ],
  'contact-inline-order-fallback-admin': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    'attachmentNames'
  ],
  'orders-customer-confirmation': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    ...listFields
  ],
  'orders-admin-notification': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    'attachmentNames'
  ],
  'orders-status-update': [
    ...commonFields,
    ...orderFields,
    ...statusFields,
    ...preferenceFields,
    'nextSteps'
  ],
  'quote-admin-request': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    'attachmentNames'
  ],
  'custom-cake-enquiry-admin': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    'attachmentNames'
  ],
  'custom-cake-enquiry-customer': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    ...listFields
  ],
  'custom-cake-enquiry-failure-alert': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    'attachmentNames'
  ],
  'workshop-enquiry-admin': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    'attachmentNames'
  ],
  'workshop-enquiry-customer': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    ...listFields
  ],
  'workshop-enquiry-failure-alert': [
    ...commonFields,
    ...orderFields,
    ...preferenceFields,
    'attachmentNames'
  ],
  'instagram-token-refresh-alert': instagramTokenAlertFields
}

const sections: FieldSection[] = [
  {
    id: 'common',
    title: 'Common fields',
    description: 'Used across customer and admin templates.',
    fields: [
      { key: 'customerName', label: 'Customer name', type: 'text', placeholder: 'Test Customer' },
      { key: 'customerEmail', label: 'Customer email', type: 'email', placeholder: 'test@example.com' },
      { key: 'customerPhone', label: 'Customer phone', type: 'tel', placeholder: '+44 7123 456789' },
      { key: 'headingOverride', label: 'Email heading', type: 'text', placeholder: 'Order confirmed' },
      { key: 'message', label: 'Submitted message', type: 'textarea', placeholder: 'Original message from the form' },
      { key: 'note', label: 'Internal note', type: 'textarea', placeholder: 'Optional operational note' }
    ]
  },
  {
    id: 'order',
    title: 'Order fields',
    description: 'Order identity, pricing, and schedule details.',
    fields: [
      { key: 'orderNumber', label: 'Order number', type: 'text', placeholder: 'OC-2026-1001' },
      { key: 'orderType', label: 'Order type', type: 'text', placeholder: 'browse-catalog' },
      { key: 'productName', label: 'Product name', type: 'text', placeholder: 'Kyiv Cake' },
      { key: 'productId', label: 'Product ID', type: 'text', placeholder: 'kyiv-cake' },
      { key: 'productType', label: 'Product type', type: 'text', placeholder: 'cake' },
      { key: 'quantity', label: 'Quantity', type: 'number', placeholder: '1' },
      { key: 'unitPrice', label: 'Unit price', type: 'number', placeholder: '45' },
      { key: 'totalPrice', label: 'Total price', type: 'number', placeholder: '45' },
      { key: 'dateNeeded', label: 'Date needed', type: 'date', placeholder: '' },
      {
        key: 'status',
        label: 'Status',
        type: 'select',
        placeholder: '',
        options: orderStatusOptions
      },
      {
        key: 'trackingNumber',
        label: 'Tracking number',
        type: 'text',
        placeholder: 'TRACK-123456',
        helper: 'Used for out-for-delivery status updates.'
      }
    ]
  },
  {
    id: 'preferences',
    title: 'Preferences and delivery',
    description: 'Design requests, delivery details, and attribution.',
    fields: [
      { key: 'address', label: 'Address', type: 'text', placeholder: '123 Example Street' },
      { key: 'city', label: 'City', type: 'text', placeholder: 'London' },
      { key: 'postcode', label: 'Postcode', type: 'text', placeholder: 'SW1A 1AA' },
      { key: 'cakeInterest', label: 'Cake interest', type: 'text', placeholder: 'Honey cake' },
      { key: 'occasion', label: 'Occasion', type: 'text', placeholder: 'Birthday' },
      { key: 'designType', label: 'Design type', type: 'text', placeholder: 'Individual design' },
      { key: 'filling', label: 'Filling', type: 'text', placeholder: 'Sour cream' },
      { key: 'servings', label: 'Servings', type: 'text', placeholder: 'Serves 8-12 people' },
      { key: 'customerMessage', label: 'Customer requirements', type: 'textarea', placeholder: 'Please keep it less sweet and no nuts.' },
      { key: 'deliveryMethod', label: 'Delivery method', type: 'text', placeholder: 'collection' },
      {
        key: 'deliveryCourier',
        label: 'Courier',
        type: 'select',
        placeholder: '',
        options: [
          { label: 'Evri', value: 'evri' },
          { label: 'Royal Mail', value: 'royal-mail' }
        ]
      },
      { key: 'deliveryAddress', label: 'Delivery address', type: 'textarea', placeholder: '123 Example Street, London, SW1A 1AA' },
      { key: 'paymentMethod', label: 'Payment method', type: 'text', placeholder: 'cash-collection' },
      { key: 'paymentStatus', label: 'Payment status', type: 'text', placeholder: 'pending' },
      { key: 'referrer', label: 'Referrer', type: 'text', placeholder: 'instagram' },
      { key: 'giftNote', label: 'Gift note', type: 'textarea', placeholder: 'Happy Birthday!' },
      { key: 'approximateSubmittedFrom', label: 'Approx. submitted from', type: 'text', placeholder: 'Leeds, ENG, GB' },
      { key: 'adminUrl', label: 'Admin URL', type: 'text', placeholder: 'https://olgishcakes.co.uk/admin/orders/26051220022842' }
    ]
  },
  {
    id: 'lists',
    title: 'Lists',
    description: 'Comma-separated values are shown as chips.',
    fields: [
      {
        key: 'attachmentNames',
        label: 'Attachment names',
        type: 'list',
        placeholder: 'design-reference.jpg, inspiration-2.png',
        helper: 'Used in admin-side templates that list uploaded files.'
      },
      {
        key: 'nextSteps',
        label: 'Next steps',
        type: 'list',
        placeholder: 'We\'ll review within 24 hours, We\'ll contact you with a quote',
        helper: 'Used mostly for customer-facing confirmations.'
      }
    ]
  }
]

const numericFieldLabels: Record<EditableFieldKey, string> = {
  customerName: 'Customer name',
  customerEmail: 'Customer email',
  customerPhone: 'Customer phone',
  headingOverride: 'Email heading',
  message: 'Submitted message',
  note: 'Internal note',
  orderNumber: 'Order number',
  orderType: 'Order type',
  productName: 'Product name',
  productId: 'Product ID',
  productType: 'Product type',
  quantity: 'Quantity',
  unitPrice: 'Unit price',
  totalPrice: 'Total price',
  dateNeeded: 'Date needed',
  cakeInterest: 'Cake interest',
  status: 'Status',
  trackingNumber: 'Tracking number',
  address: 'Address',
  city: 'City',
  postcode: 'Postcode',
  occasion: 'Occasion',
  designType: 'Design type',
  filling: 'Filling',
  servings: 'Servings',
  customerMessage: 'Customer requirements',
  deliveryMethod: 'Delivery method',
  deliveryCourier: 'Courier',
  deliveryAddress: 'Delivery address',
  paymentMethod: 'Payment method',
  paymentStatus: 'Payment status',
  referrer: 'Referrer',
  giftNote: 'Gift note',
  approximateSubmittedFrom: 'Approx. submitted from',
  adminUrl: 'Admin URL',
  attachmentNames: 'Attachment names',
  nextSteps: 'Next steps'
}

function createEmptyFormValues(): EmailTestFormValues {
  return allFieldKeys.reduce((accumulator, key) => {
    accumulator[key] = ''
    return accumulator
  }, {} as EmailTestFormValues)
}

function splitCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function toFormString(key: EditableFieldKey, value: unknown): string {
  if (value === undefined || value === null) {
    return ''
  }

  if (key === 'attachmentNames' || key === 'nextSteps') {
    if (!Array.isArray(value)) {
      return ''
    }

    return value
      .filter((entry): entry is string => typeof entry === 'string')
      .join(', ')
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : ''
  }

  return typeof value === 'string' ? value : ''
}

function toFormValues(input: Record<string, unknown>): EmailTestFormValues {
  const nextValues = createEmptyFormValues()

  allFieldKeys.forEach((key) => {
    nextValues[key] = toFormString(key, input[key])
  })

  return nextValues
}

function buildInputFromFormValues(
  formValues: EmailTestFormValues,
  activeFields: EditableFieldKey[],
  templateId: EmailTemplateId
): Record<string, unknown> {
  const input: Record<string, unknown> = {}

  activeFields.forEach((key) => {
    const rawValue = formValues[key]?.trim() || ''
    if (rawValue.length === 0) {
      return
    }

    if (key === 'trackingNumber' && !shouldIncludeTrackingNumber(templateId, formValues.status || '')) {
      return
    }

    if (key === 'attachmentNames' || key === 'nextSteps') {
      const parsedList = splitCsv(rawValue)
      if (parsedList.length > 0) {
        input[key] = parsedList
      }
      return
    }

    if (key === 'quantity' || key === 'unitPrice' || key === 'totalPrice') {
      const parsedNumber = Number(rawValue)
      if (!Number.isNaN(parsedNumber)) {
        input[key] = parsedNumber
      }
      return
    }

    input[key] = rawValue
  })

  return input
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const json = await response.json()
  if (!response.ok) {
    const message = typeof json?.error === 'string'
      ? json.error
      : typeof json?.reason === 'string'
        ? json.reason
        : `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return json as T
}

export function EmailTestPageClient() {
  const [selectedRequest, setSelectedRequest] = useState<EmailRequestId>(initialRequest.id)
  const [selectedScenarioKey, setSelectedScenarioKey] = useState(initialScenario.id)
  const [recipient, setRecipient] = useState(defaultRecipient)
  const [formValues, setFormValues] = useState<EmailTestFormValues>(() => createEmptyFormValues())
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null)
  const [realSendData, setRealSendData] = useState<RealSendResponse | null>(null)
  const [previewTab, setPreviewTab] = useState<PreviewTab>('html')
  const [showAdvancedScenarios, setShowAdvancedScenarios] = useState(false)
  const [selectedOrderStatusScenario, setSelectedOrderStatusScenario] = useState(cakeProductStatusScenarios[0].value)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)

  const previewAbortRef = useRef<AbortController | null>(null)
  const sendAbortRef = useRef<AbortController | null>(null)
  const previewRequestIdRef = useRef(0)

  const selectedRequestOption = useMemo(() => {
    return requestOptions.find((option) => option.id === selectedRequest) || initialRequest
  }, [selectedRequest])

  const scenarioOptions = useMemo(() => {
    if (showAdvancedScenarios) {
      return selectedRequestOption.scenarios
    }

    return selectedRequestOption.scenarios.filter((scenario) => scenario.advanced !== true)
  }, [selectedRequestOption, showAdvancedScenarios])

  const selectedScenarioOption = useMemo(() => {
    return scenarioOptions.find((scenario) => scenario.id === selectedScenarioKey) || scenarioOptions[0] || initialScenario
  }, [scenarioOptions, selectedScenarioKey])

  const selectedTemplate = selectedScenarioOption.templateId
  const orderStatusScenarioOptions = useMemo(() => {
    if (selectedScenarioOption.statusGroup === 'cakes-by-post') {
      return cakesByPostStatusScenarios
    }

    if (selectedScenarioOption.statusGroup === 'cake-product') {
      return cakeProductStatusScenarios
    }

    return []
  }, [selectedScenarioOption.statusGroup])
  const selectedScenario = selectedScenarioOption.statusGroup
    ? selectedOrderStatusScenario
    : selectedScenarioOption.scenarioId
  const activeFields = useMemo(() => templateFieldMap[selectedTemplate], [selectedTemplate])
  const activeFieldSet = useMemo(() => new Set(activeFields), [activeFields])

  const shouldShowTrackingField = useMemo(() => {
    return shouldIncludeTrackingNumber(selectedTemplate, formValues.status || '')
  }, [formValues.status, selectedTemplate])
  const shouldShowCourierSelector = selectedScenarioOption.statusGroup === 'cakes-by-post'

  const visibleSections = useMemo(() => {
    return sections
      .map((section) => ({
        ...section,
        fields: section.fields.filter((field) => {
          if (!activeFieldSet.has(field.key)) {
            return false
          }

          if (field.key === 'trackingNumber') {
            return shouldShowTrackingField
          }

          if (field.key === 'deliveryCourier' && shouldShowCourierSelector) {
            return false
          }

          return true
        })
      }))
      .filter((section) => section.fields.length > 0)
  }, [activeFieldSet, shouldShowCourierSelector, shouldShowTrackingField])

  const previewInput = useMemo(() => {
    return buildInputFromFormValues(formValues, activeFields, selectedTemplate)
  }, [activeFields, formValues, selectedTemplate])

  const numericValidationErrors = useMemo(() => {
    const errors: string[] = []

    numericFields.forEach((key) => {
      if (!activeFieldSet.has(key)) {
        return
      }

      const value = formValues[key]?.trim() || ''
      if (value.length === 0) {
        return
      }

      if (Number.isNaN(Number(value))) {
        errors.push(`${numericFieldLabels[key]} must be a valid number`)
      }
    })

    return errors
  }, [activeFieldSet, formValues])

  const metadataText = useMemo(() => {
    if (!previewData?.rendered.metadata) {
      return 'No metadata returned for this template.'
    }

    return JSON.stringify(previewData.rendered.metadata, null, 2)
  }, [previewData])

  const {
    mutate: runPreviewMutation,
    isPending: isPreviewPending,
    error: previewError
  } = useMutation({
    mutationFn: async (params: PreviewMutationInput) => {
      const requestId = ++previewRequestIdRef.current

      if (previewAbortRef.current) {
        previewAbortRef.current.abort()
      }

      const controller = new AbortController()
      previewAbortRef.current = controller

      const response = await fetch('/api/dev/email-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          scenarioId: params.scenarioId || selectedScenario || undefined,
          input: params.useCurrentInput ? previewInput : undefined
        }),
        signal: controller.signal
      })

      const data = await parseApiResponse<PreviewResponse>(response)

      return {
        data,
        requestId
      }
    },
    onSuccess: ({ data, requestId }, variables) => {
      if (requestId !== previewRequestIdRef.current) {
        return
      }

      setPreviewData(data)
      setPreviewTab('html')
      if (variables.syncFormValues) {
        setFormValues(toFormValues(data.input))
      }
    },
    onError: () => {
      setPreviewData(null)
    }
  })

  const {
    mutate: runRealSendMutation,
    isPending: isRealSendPending,
    error: realSendError
  } = useMutation({
    mutationFn: async () => {
      if (sendAbortRef.current) {
        sendAbortRef.current.abort()
      }

      const controller = new AbortController()
      sendAbortRef.current = controller

      const response = await fetch('/api/dev/email-test-send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          to: recipient.trim(),
          scenarioId: selectedScenario || undefined,
          input: previewInput
        }),
        signal: controller.signal
      })

      return parseApiResponse<RealSendResponse>(response)
    },
    onSuccess: (data) => {
      setRealSendData(data)
    },
    onError: () => {
      setRealSendData(null)
    }
  })

  useEffect(() => {
    return () => {
      previewAbortRef.current?.abort()
      sendAbortRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (scenarioOptions.some((scenario) => scenario.id === selectedScenarioKey)) {
      return
    }

    const firstScenario = scenarioOptions[0] || initialScenario
    setSelectedScenarioKey(firstScenario.id)
  }, [scenarioOptions, selectedScenarioKey])

  useEffect(() => {
    if (!selectedScenarioOption.statusGroup) {
      return
    }

    if (orderStatusScenarioOptions.some((option) => option.value === selectedOrderStatusScenario)) {
      return
    }

    const firstStatusScenario = orderStatusScenarioOptions[0]
    if (firstStatusScenario) {
      setSelectedOrderStatusScenario(firstStatusScenario.value)
    }
  }, [orderStatusScenarioOptions, selectedOrderStatusScenario, selectedScenarioOption.statusGroup])

  const loadTemplateDefaults = useCallback((scenarioIdOverride?: string) => {
    setPreviewData(null)
    setRealSendData(null)
    runPreviewMutation({
      useCurrentInput: false,
      syncFormValues: true,
      scenarioId: scenarioIdOverride || selectedScenario || undefined
    })
  }, [runPreviewMutation, selectedScenario])

  useEffect(() => {
    loadTemplateDefaults()
  }, [loadTemplateDefaults, selectedScenarioKey, selectedTemplate])
  const hasInvalidForm = numericValidationErrors.length > 0
  const hasRecipient = recipient.trim().length > 0

  const handleRequestChange = (requestId: EmailRequestId) => {
    const requestOption = requestOptions.find((option) => option.id === requestId) || initialRequest
    const firstScenario = requestOption.scenarios.find((scenario) => scenario.advanced !== true) || requestOption.scenarios[0] || initialScenario
    setSelectedRequest(requestOption.id)
    setSelectedScenarioKey(firstScenario.id)
    if (firstScenario.statusGroup === 'cakes-by-post') {
      setSelectedOrderStatusScenario(cakesByPostStatusScenarios[0].value)
    } else if (firstScenario.statusGroup === 'cake-product') {
      setSelectedOrderStatusScenario(cakeProductStatusScenarios[0].value)
    }
  }

  const handleScenarioChange = (scenarioKey: string) => {
    const nextScenario = scenarioOptions.find((scenario) => scenario.id === scenarioKey)
    setSelectedScenarioKey(scenarioKey)
    if (nextScenario?.statusGroup === 'cakes-by-post') {
      setSelectedOrderStatusScenario(cakesByPostStatusScenarios[0].value)
    } else if (nextScenario?.statusGroup === 'cake-product') {
      setSelectedOrderStatusScenario(cakeProductStatusScenarios[0].value)
    }
  }

  const handleFieldChange = (key: EditableFieldKey, value: string) => {
    if (key === 'status' && !isDeliveryTrackingStatus(value)) {
      setFormValues((previous) => ({
        ...previous,
        status: value,
        trackingNumber: ''
      }))
      return
    }

    setFormValues((previous) => ({
      ...previous,
      [key]: value
    }))
  }

  const handlePreview = () => {
    setRealSendData(null)
    runPreviewMutation({
      useCurrentInput: true,
      syncFormValues: true
    })
  }

  const handleRequestRealSend = () => {
    setIsConfirmModalOpen(true)
  }

  const handleConfirmRealSend = () => {
    setIsConfirmModalOpen(false)
    runRealSendMutation()
  }

  const handleCancelRealSend = () => {
    setIsConfirmModalOpen(false)
  }

  return (
    <section className='flex flex-col gap-6'>
      <div className='flex w-full flex-col gap-6'>
        <header className='rounded-md border border-base-300 bg-base-100 p-4 shadow-sm'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-wrap items-center gap-3'>
              <h1 className='text-3xl font-semibold text-base-content'>
                Email Test Console
              </h1>
              <span className='badge badge-primary'>Admin only</span>
            </div>
            <p className='max-w-3xl text-sm leading-6 text-base-content/75'>
              Preview every template with static defaults from the renderer, then adjust fields to test edge cases before any live smoke send.
            </p>
            <div className='alert alert-info w-full text-sm' role='status' aria-live='polite'>
              <span>
                Real send still requires allowlisted recipients, feature flag, and rate-limit checks.
              </span>
            </div>
          </div>
        </header>

        <div className='grid gap-6 xl:grid-cols-[420px_1fr]'>
          <section className='card border border-base-300 bg-base-100 shadow-sm'>
            <div className='card-body gap-5'>
              <div className='flex flex-wrap items-center justify-between gap-2'>
                <h2 className='text-lg font-semibold text-primary-800'>Setup</h2>
                <button
                  type='button'
                  className='btn btn-ghost btn-sm'
                  onClick={() => loadTemplateDefaults()}
                  disabled={isPreviewPending}
                >
                  Reset to defaults
                </button>
              </div>

              <label className='form-control gap-2'>
                <span className='label-text font-semibold'>Request</span>
                <select
                  className='select select-bordered w-full'
                  value={selectedRequest}
                  onChange={(event) => handleRequestChange(event.target.value as EmailRequestId)}
                >
                  {requestOptions.map((request) => (
                    <option key={request.id} value={request.id}>{request.label}</option>
                  ))}
                </select>
              </label>

              <label className='form-control gap-2'>
                <span className='label-text font-semibold'>Scenario</span>
                <select
                  className='select select-bordered w-full'
                  value={selectedScenarioKey}
                  onChange={(event) => handleScenarioChange(event.target.value)}
                >
                  {scenarioOptions.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>{scenario.label}</option>
                  ))}
                </select>
              </label>

              {selectedScenarioOption.statusGroup ? (
                <label className='form-control gap-2'>
                  <span className='label-text font-semibold'>Order status</span>
                  <select
                    className='select select-bordered w-full'
                    value={selectedOrderStatusScenario}
                    onChange={(event) => setSelectedOrderStatusScenario(event.target.value)}
                  >
                    {orderStatusScenarioOptions.map((statusOption) => (
                      <option key={statusOption.value} value={statusOption.value}>{statusOption.label}</option>
                    ))}
                  </select>
                </label>
              ) : null}

              {shouldShowCourierSelector ? (
                <label className='form-control gap-2'>
                  <span className='label-text font-semibold'>Courier</span>
                  <select
                    className='select select-bordered w-full'
                    value={formValues.deliveryCourier || 'evri'}
                    onChange={(event) => handleFieldChange('deliveryCourier', event.target.value)}
                  >
                    <option value='evri'>Evri</option>
                    <option value='royal-mail'>Royal Mail</option>
                  </select>
                </label>
              ) : null}

              <label className='flex cursor-pointer items-start gap-3 rounded-md border border-base-300 bg-base-200/40 p-3'>
                <input
                  type='checkbox'
                  className='toggle toggle-primary mt-1'
                  checked={showAdvancedScenarios}
                  onChange={(event) => setShowAdvancedScenarios(event.target.checked)}
                />
                <span className='grid gap-1 text-sm'>
                  <span className='font-semibold text-base-content'>Show advanced/error scenarios</span>
                  <span className='text-xs leading-5 text-base-content/65'>
                    Includes fallback emails sent only if order save or notification handling fails.
                  </span>
                </span>
              </label>

              <label className='form-control gap-2'>
                <span className='label-text font-semibold'>Real-send recipient</span>
                <input
                  type='email'
                  className='input input-bordered w-full'
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder='allowlisted@example.com'
                  aria-describedby='email-test-recipient-help'
                />
                <span id='email-test-recipient-help' className='text-xs text-base-content/65'>
                  Recipient must be in `EMAIL_TEST_RECIPIENT_ALLOWLIST`.
                </span>
              </label>

              <div className='space-y-4'>
                {visibleSections.map((section) => (
                  <div key={section.id} className='rounded-md border border-base-300 bg-base-200/40 p-4'>
                    <h3 className='text-sm font-semibold uppercase tracking-wide text-base-content/70'>
                      {section.title}
                    </h3>
                    <p className='mt-1 text-xs text-base-content/70'>{section.description}</p>

                    <div className='mt-3 grid gap-3'>
                      {section.fields.map((field) => (
                        <label key={field.key} className='form-control gap-2'>
                          <span className='label-text text-xs font-semibold text-base-content/80'>{field.label}</span>
                          {field.type === 'textarea' ? (
                            <textarea
                              className='textarea textarea-bordered min-h-[92px] w-full text-sm'
                              value={formValues[field.key]}
                              onChange={(event) => handleFieldChange(field.key, event.target.value)}
                              placeholder={field.placeholder}
                            />
                          ) : field.type === 'select' ? (
                            <select
                              className='select select-bordered w-full text-sm'
                              value={formValues[field.key]}
                              onChange={(event) => handleFieldChange(field.key, event.target.value)}
                            >
                              {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                              ))}
                            </select>
                          ) : field.type === 'date' ? (
                            <DesignSystemDatePicker
                              id={`email-test-${field.key}`}
                              placeholder={field.placeholder || 'Select a date'}
                              value={formValues[field.key]}
                              onValueChange={(value) => handleFieldChange(field.key, value)}
                            />
                          ) : (
                            <input
                              type={field.type === 'list' || field.type === 'number' ? 'text' : field.type}
                              inputMode={field.type === 'number' ? 'decimal' : undefined}
                              className='input input-bordered w-full text-sm'
                              value={formValues[field.key]}
                              onChange={(event) => handleFieldChange(field.key, event.target.value)}
                              placeholder={field.placeholder}
                            />
                          )}
                          {field.helper ? (
                            <span className='text-xs text-base-content/60'>{field.helper}</span>
                          ) : null}

                          {field.type === 'list' ? (
                            <div className='flex flex-wrap gap-2 pt-1'>
                              {splitCsv(formValues[field.key]).length === 0 ? (
                                <span className='text-xs text-base-content/55'>No list items added yet.</span>
                              ) : (
                                splitCsv(formValues[field.key]).map((value) => (
                                  <span key={`${field.key}-${value}`} className='badge badge-outline badge-primary'>
                                    {value}
                                  </span>
                                ))
                              )}
                            </div>
                          ) : null}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {numericValidationErrors.length > 0 ? (
                <div className='alert alert-error' role='alert'>
                  <span>{numericValidationErrors[0]}</span>
                </div>
              ) : null}

              {previewError ? (
                <div className='alert alert-error' role='alert'>
                  <span>{previewError.message}</span>
                </div>
              ) : null}

              {realSendError ? (
                <div className='alert alert-error' role='alert'>
                  <span>{realSendError.message}</span>
                </div>
              ) : null}

              {realSendData ? (
                <div
                  className={`alert ${realSendData.accepted ? 'alert-success' : 'alert-error'}`}
                  role={realSendData.accepted ? 'status' : 'alert'}
                  aria-live='polite'
                >
                  <span>
                    {realSendData.accepted
                      ? `Accepted (${realSendData.mode ?? 'live'})${realSendData.transportId ? `, id: ${realSendData.transportId}` : ''}`
                      : realSendData.reason || 'Real send rejected'}
                  </span>
                </div>
              ) : null}

              <div className='grid gap-3'>
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={handlePreview}
                  disabled={isPreviewPending || hasInvalidForm}
                  aria-busy={isPreviewPending}
                >
                  {isPreviewPending ? 'Loading preview...' : 'Preview email'}
                </button>
                <button
                  type='button'
                  className='btn btn-outline btn-warning'
                  onClick={handleRequestRealSend}
                  disabled={isRealSendPending || hasInvalidForm || !hasRecipient}
                  aria-busy={isRealSendPending}
                >
                  {isRealSendPending ? 'Sending...' : 'Send real test email'}
                </button>
              </div>
            </div>
          </section>

          <section className='card border border-base-300 bg-base-100 shadow-sm'>
            <div className='card-body gap-4'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <h2 className='text-lg font-semibold text-primary-800'>Rendered preview</h2>
                {previewData ? (
                  <span className='badge badge-primary'>{previewData.templateId}</span>
                ) : null}
              </div>

              {!previewData ? (
                <div className='rounded-md border border-dashed border-base-300 bg-base-200/40 px-6 py-12 text-center text-sm text-base-content/70'>
                  {isPreviewPending
                    ? 'Loading template defaults...'
                    : 'Select a template and run preview to view the designed email, text, and metadata.'}
                </div>
              ) : (
                <>
                  <div className='rounded-md border border-base-300 bg-base-200/60 p-4'>
                    <p className='text-xs uppercase tracking-wide text-base-content/60'>Subject</p>
                    <p className='mt-1 font-medium text-base-content'>{previewData.rendered.subject}</p>
                  </div>

                  <div role='tablist' aria-label='Email preview tabs' className='tabs tabs-boxed bg-base-200 p-1'>
                    <button
                      type='button'
                      role='tab'
                      className={`tab ${previewTab === 'text' ? 'tab-active' : ''}`}
                      aria-selected={previewTab === 'text'}
                      onClick={() => setPreviewTab('text')}
                    >
                      Text
                    </button>
                    <button
                      type='button'
                      role='tab'
                      className={`tab ${previewTab === 'html' ? 'tab-active' : ''}`}
                      aria-selected={previewTab === 'html'}
                      onClick={() => setPreviewTab('html')}
                    >
                      Design
                    </button>
                    <button
                      type='button'
                      role='tab'
                      className={`tab ${previewTab === 'metadata' ? 'tab-active' : ''}`}
                      aria-selected={previewTab === 'metadata'}
                      onClick={() => setPreviewTab('metadata')}
                    >
                      Metadata
                    </button>
                  </div>

                  {previewTab === 'text' ? (
                    <div role='tabpanel' className='rounded-md border border-base-300 bg-base-100 p-4'>
                      <pre className='max-h-[500px] overflow-auto whitespace-pre-wrap text-xs leading-6'>{previewData.rendered.text}</pre>
                    </div>
                  ) : null}

                  {previewTab === 'html' ? (
                    <div role='tabpanel' className='rounded-md border border-base-300 bg-base-100 p-2'>
                      <iframe
                        className='h-[500px] w-full rounded-md border border-base-300 bg-white'
                        sandbox='allow-same-origin'
                        srcDoc={previewData.rendered.html}
                        title='Rendered email preview'
                      />
                    </div>
                  ) : null}

                  {previewTab === 'metadata' ? (
                    <div role='tabpanel' className='rounded-md border border-base-300 bg-base-100 p-4'>
                      <pre className='max-h-[500px] overflow-auto whitespace-pre-wrap text-xs leading-6'>{metadataText}</pre>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </section>
        </div>
      </div>

      <dialog
        className={`modal ${isConfirmModalOpen ? 'modal-open' : ''}`}
        open={isConfirmModalOpen}
        aria-labelledby='real-send-modal-title'
        aria-describedby='real-send-modal-description'
        onCancel={handleCancelRealSend}
      >
        <div className='modal-box border border-warning/30 bg-base-100'>
          <h3 id='real-send-modal-title' className='text-lg font-semibold text-primary-800'>
            Confirm real test send
          </h3>
          <p id='real-send-modal-description' className='mt-3 text-sm text-base-content/75'>
            This action sends a real email via live transport and counts against provider limits.
          </p>
          <div className='alert alert-warning alert-soft mt-4 text-sm'>
            <span>Use this only after preview output is approved.</span>
          </div>
          <p className='mt-4 text-sm'>
            Recipient: <span className='font-semibold'>{recipient.trim() || 'No recipient set'}</span>
          </p>
          <div className='modal-action'>
            <button
              type='button'
              className='btn btn-ghost'
              onClick={handleCancelRealSend}
            >
              Cancel
            </button>
            <button
              type='button'
              className='btn btn-warning'
              onClick={handleConfirmRealSend}
              disabled={isRealSendPending || hasInvalidForm || !hasRecipient}
            >
              Confirm and send
            </button>
          </div>
        </div>
        <form method='dialog' className='modal-backdrop'>
          <button type='button' onClick={handleCancelRealSend} aria-label='Close confirmation modal'>
            close
          </button>
        </form>
      </dialog>
    </section>
  )
}
