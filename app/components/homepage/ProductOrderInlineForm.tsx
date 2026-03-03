'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { EmailIcon } from '../icons/EmailIcon'
import { PhoneIcon } from '../icons/PhoneIcon'
import { AddressIcon } from '../icons/AddressIcon'
import { OCCASION_OPTIONS, type OccasionOption } from './formOptions'
import { ValidatorInput } from './ValidatorInput'
import {
  dateMinErrorMessage,
  formFieldOrder,
  getReferenceImageError,
  getTodayDateInputValue,
  isDateOnOrAfterToday,
  referenceImageAccept
} from './mobileForm.utils'
import { fetchOccasionOptions, occasionOptionsQueryKey, occasionOptionsStaleTimeMs } from '@/app/services/occasionOptions'

const ukPostcodePattern = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i

const inlineOrderSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  address: z.string().trim().refine((value) => value.length === 0 || value.length >= 5, {
    message: 'Address must be at least 5 characters'
  }),
  city: z.string().trim().refine((value) => value.length === 0 || value.length >= 2, {
    message: 'City must be at least 2 characters'
  }),
  postcode: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || ukPostcodePattern.test(value), {
      message: 'Invalid UK postcode'
    }),
  occasion: z.string().optional(),
  date: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || isDateOnOrAfterToday(value), {
      message: dateMinErrorMessage
    }),
  requirements: z.string().optional(),
  message: z.string().optional(),
  giftNote: z.string().trim().refine((value) => value.length <= 500, {
    message: 'Gift note must be 500 characters or fewer'
  })
})

type InlineOrderValues = z.infer<typeof inlineOrderSchema>
type InlineOrderRequestMode = 'message' | 'custom-design'
type InlineOrderDesignType = 'standard' | 'individual'

interface InlineOrderEmailContext {
  designType?: InlineOrderDesignType
  filling?: string
  servings?: string
}

const postalOrderFieldMessages = {
  address: 'Address is required for cakes by post orders',
  city: 'City is required for cakes by post orders',
  postcode: 'Postcode is required for cakes by post orders'
} as const

function validateInlineOrderValues(values: InlineOrderValues, isPostalOrder: boolean) {
  return inlineOrderSchema.superRefine((data, ctx) => {
    if (!isPostalOrder) {
      return
    }

    if (data.address.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address'],
        message: postalOrderFieldMessages.address
      })
    }

    if (data.city.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['city'],
        message: postalOrderFieldMessages.city
      })
    }

    if (data.postcode.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['postcode'],
        message: postalOrderFieldMessages.postcode
      })
    }
  }).safeParse(values)
}

interface ProductOrderInlineFormProps {
  productType: 'cake' | 'gift-hamper'
  productId: string
  productName: string
  totalPrice: number
  contextLines?: string[]
  className?: string
  occasionOptions?: OccasionOption[]
  showOccasionField?: boolean
  requestMode?: InlineOrderRequestMode
  orderEmailContext?: InlineOrderEmailContext
}

const initialFormState: InlineOrderValues = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postcode: '',
  occasion: '',
  date: '',
  requirements: '',
  message: '',
  giftNote: ''
}

function formatPrice(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

export function ProductOrderInlineForm({
  productType,
  productId,
  productName,
  totalPrice,
  contextLines = [],
  className = '',
  occasionOptions,
  showOccasionField = true,
  requestMode = 'message',
  orderEmailContext
}: ProductOrderInlineFormProps) {
  const isPostalOrder = productType === 'gift-hamper'
  const [formData, setFormData] = useState<InlineOrderValues>(initialFormState)
  const [designImage, setDesignImage] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const designImageInputRef = useRef<HTMLInputElement | null>(null)
  const minDate = getTodayDateInputValue()
  const shouldFetchOccasionOptions = showOccasionField && occasionOptions === undefined
  const occasionOptionsQuery = useQuery({
    queryKey: occasionOptionsQueryKey,
    queryFn: ({ signal }) => fetchOccasionOptions(signal),
    enabled: shouldFetchOccasionOptions,
    staleTime: occasionOptionsStaleTimeMs
  })
  const resolvedOccasionOptions = useMemo(() => {
    if (!showOccasionField) {
      return []
    }

    if (occasionOptions !== undefined) {
      return occasionOptions
    }

    if (occasionOptionsQuery.isSuccess && occasionOptionsQuery.data && occasionOptionsQuery.data.length > 0) {
      return occasionOptionsQuery.data
    }

    return OCCASION_OPTIONS
  }, [occasionOptions, occasionOptionsQuery.data, occasionOptionsQuery.isSuccess, showOccasionField])
  const buttonClassName = hasSubmittedSuccessfully
    ? 'bg-[var(--d-color-status-success-bg)] hover:bg-[var(--d-color-status-success-bg)]'
    : 'bg-primary-500 hover:bg-primary-700'
  const buttonLabel = hasSubmittedSuccessfully ? 'Order sent' : 'Submit order'
  const userRequestDetails = useMemo(() => {
    const value = requestMode === 'custom-design'
      ? formData.requirements?.trim()
      : formData.message?.trim()

    return value && value.length > 0 ? value : ''
  }, [formData.message, formData.requirements, requestMode])
  const fullMessage = useMemo(() => {
    const requestDetailsLabel = requestMode === 'custom-design' ? 'Requirements' : 'Message'
    const sections = [
      ...contextLines,
      userRequestDetails.length > 0
        ? `${requestDetailsLabel}: ${userRequestDetails}`
        : ''
    ].filter((line) => line.length > 0)

    return sections.join('\n')
  }, [contextLines, requestMode, userRequestDetails])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const focusFirstErrorField = (fieldErrors: Record<string, string>) => {
    const firstErrorField = formFieldOrder.find((field) => fieldErrors[field])
    if (!firstErrorField) {
      return
    }

    const fieldElement = document.getElementById(firstErrorField)
    if (!fieldElement) {
      return
    }

    fieldElement.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
    fieldElement.focus()
  }

  const clearFieldError = (field: string) => {
    setErrors((current) => {
      if (!current[field]) {
        return current
      }

      return {
        ...current,
        [field]: ''
      }
    })
  }

  const updateField = (field: keyof InlineOrderValues, value: string, clearError = false) => {
    if (hasSubmittedSuccessfully) {
      setHasSubmittedSuccessfully(false)
    }

    setFormData((current) => ({
      ...current,
      [field]: value
    }))

    if (clearError) {
      clearFieldError(field)
    }
  }

  const handleDateChange = (value: string) => {
    if (value && !isDateOnOrAfterToday(value)) {
      setErrors((current) => ({
        ...current,
        date: dateMinErrorMessage
      }))
      updateField('date', value)
      return
    }

    updateField('date', value, true)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasAttemptedSubmit(true)
    setErrors({})
    setIsSubmitting(true)

    const parsed = validateInlineOrderValues(formData, isPostalOrder)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      parsed.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0].toString()] = error.message
        }
      })
      setErrors(fieldErrors)
      focusFirstErrorField(fieldErrors)
      setIsSubmitting(false)
      return
    }

    const designImageError = requestMode === 'custom-design'
      ? getReferenceImageError(designImage)
      : null
    if (designImageError) {
      const fieldErrors = {
        referenceImage: designImageError
      }
      setErrors(fieldErrors)
      focusFirstErrorField(fieldErrors)
      setIsSubmitting(false)
      return
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const payload = new FormData()
      payload.append('name', parsed.data.fullName)
      payload.append('email', parsed.data.email)
      payload.append('phone', parsed.data.phone)
      const normalizedAddress = parsed.data.address.trim()
      if (normalizedAddress.length > 0) {
        payload.append('address', normalizedAddress)
      }
      const normalizedCity = parsed.data.city.trim()
      if (normalizedCity.length > 0) {
        payload.append('city', normalizedCity)
      }
      const normalizedPostcode = parsed.data.postcode.trim()
      if (normalizedPostcode.length > 0) {
        payload.append('postcode', normalizedPostcode)
      }
      const normalizedDate = parsed.data.date.trim()
      if (normalizedDate.length > 0) {
        payload.append('dateNeeded', normalizedDate)
      }
      payload.append('message', fullMessage)
      payload.append('requestMode', requestMode)
      payload.append('customerMessage', userRequestDetails)
      const normalizedGiftNote = parsed.data.giftNote.trim()
      if (normalizedGiftNote.length > 0) {
        payload.append('giftNote', normalizedGiftNote)
      }
      const normalizedOccasion = (parsed.data.occasion ?? '').trim()
      if (normalizedOccasion.length > 0) {
        payload.append('occasion', normalizedOccasion)
      }
      const normalizedDesignType = (orderEmailContext?.designType ?? '').trim()
      if (normalizedDesignType.length > 0) {
        payload.append('designType', normalizedDesignType)
      }
      const normalizedFilling = (orderEmailContext?.filling ?? '').trim()
      if (normalizedFilling.length > 0) {
        payload.append('filling', normalizedFilling)
      }
      const normalizedServings = (orderEmailContext?.servings ?? '').trim()
      if (normalizedServings.length > 0) {
        payload.append('servings', normalizedServings)
      }
      payload.append('isOrderForm', 'true')
      payload.append('productType', productType)
      payload.append('productId', productId)
      payload.append('productName', productName)
      payload.append('totalPrice', formatPrice(totalPrice))
      if (requestMode === 'custom-design' && designImage) {
        payload.append('designImage', designImage)
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        body: payload,
        signal: controller.signal
      })

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string }
        const serverMessage = typeof errorData.error === 'string' ? errorData.error : ''

        if (serverMessage.includes('Reference image')) {
          const fieldErrors = {
            referenceImage: serverMessage
          }
          setErrors(fieldErrors)
          focusFirstErrorField(fieldErrors)
          return
        }

        throw new Error(serverMessage || 'Failed to submit order. Please try again.')
      }

      setHasSubmittedSuccessfully(true)
      setHasAttemptedSubmit(false)
      setFormData(initialFormState)
      setDesignImage(null)
      if (designImageInputRef.current) {
        designImageInputRef.current.value = ''
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      const submitError = error instanceof Error && error.message.trim().length > 0
        ? error.message
        : 'Failed to submit order. Please try again.'

      setErrors({
        submit: submitError
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`flex w-full flex-col items-center gap-5 ${className}`}>
      <ValidatorInput
        id='fullName'
        type='text'
        placeholder='Enter name'
        value={formData.fullName}
        label='Full Name:'
        error={errors.fullName}
        required
        hintText='Enter your full name'
        onValueChange={(value) => updateField('fullName', value, true)}
      />
      <ValidatorInput
        id='email'
        type='email'
        placeholder='johndoe@xyz.com'
        value={formData.email}
        label='Email address:'
        icon={<EmailIcon />}
        error={errors.email}
        required
        hintText='Enter valid email address'
        onValueChange={(value) => updateField('email', value, true)}
      />
      <ValidatorInput
        id='phone'
        type='tel'
        placeholder='+44 7123 456 789'
        value={formData.phone}
        label='Phone number:'
        icon={<PhoneIcon />}
        error={errors.phone}
        required
        hintText='Enter valid phone number'
        onValueChange={(value) => updateField('phone', value, true)}
      />
      <ValidatorInput
        id='address'
        type='text'
        placeholder='Enter address line 1'
        value={formData.address}
        label={isPostalOrder ? 'Address:' : 'Address: (Optional)'}
        icon={<AddressIcon />}
        error={errors.address}
        required={isPostalOrder}
        hintText='Enter your address'
        onValueChange={(value) => updateField('address', value, true)}
      />
      <ValidatorInput
        id='city'
        type='text'
        placeholder='Enter city'
        value={formData.city}
        label={isPostalOrder ? 'City:' : 'City: (Optional)'}
        icon={<AddressIcon />}
        error={errors.city}
        required={isPostalOrder}
        hintText='Enter your city'
        onValueChange={(value) => updateField('city', value, true)}
      />
      <ValidatorInput
        id='postcode'
        type='text'
        placeholder='Enter postcode'
        value={formData.postcode}
        label={isPostalOrder ? 'Postcode:' : 'Postcode: (Optional)'}
        icon={<AddressIcon />}
        error={errors.postcode}
        required={isPostalOrder}
        hintText='Enter your postcode'
        onValueChange={(value) => updateField('postcode', value, true)}
      />
      {showOccasionField ? (
        <ValidatorInput
          fieldType='select'
          id='occasion'
          value={formData.occasion ?? ''}
          label="What's the occasion?"
          labelAlt='(Optional)'
          options={resolvedOccasionOptions}
          hintText='Select an occasion'
          onValueChange={(value) => updateField('occasion', value)}
        />
      ) : null}
      <ValidatorInput
        id='date'
        type='date'
        placeholder='Select a date'
        value={formData.date}
        label='When do you need it?'
        labelAlt='(Optional)'
        error={errors.date}
        hintText='Select a date'
        labelPlacement='outside'
        min={minDate}
        onValueChange={handleDateChange}
      />
      <ValidatorInput
        fieldType='textarea'
        id={requestMode === 'custom-design' ? 'requirements' : 'message'}
        value={requestMode === 'custom-design' ? formData.requirements ?? '' : formData.message ?? ''}
        label={requestMode === 'custom-design' ? 'Requirements' : 'Message'}
        labelAlt={requestMode === 'custom-design' ? '(Optional) Shape, flavour, icing, filling etc.' : '(Optional)'}
        labelLayout={requestMode === 'custom-design' ? 'stacked' : undefined}
        placeholder={requestMode === 'custom-design' ? 'Enter requirements' : 'Enter message'}
        hintText={requestMode === 'custom-design' ? 'Enter requirements' : 'Enter message'}
        onValueChange={(value) => {
          if (requestMode === 'custom-design') {
            updateField('requirements', value)
            return
          }

          updateField('message', value)
        }}
      />
      {isPostalOrder ? (
        <ValidatorInput
          fieldType='textarea'
          id='giftNote'
          value={formData.giftNote ?? ''}
          label='Gift note'
          labelAlt='(Optional)'
          placeholder='Add a personal message to include with your gift'
          hintText='Enter gift note'
          error={errors.giftNote}
          onValueChange={(value) => updateField('giftNote', value, true)}
        />
      ) : null}
      {requestMode === 'custom-design' ? (
        <ValidatorInput
          fieldType='upload'
          id='referenceImage'
          label='Upload a reference image'
          labelAlt='(Optional)'
          accept={referenceImageAccept}
          infoLeft='JPEG, PNG, HEIC'
          infoRight='5MB max'
          selectedFileName={designImage?.name}
          inputRef={designImageInputRef}
          error={errors.referenceImage}
          hintText='Upload a reference image'
          onFileChange={(files) => {
            const selectedFile = files?.[0] ?? null
            const nextError = getReferenceImageError(selectedFile)
            setDesignImage(selectedFile)
            if (hasSubmittedSuccessfully) {
              setHasSubmittedSuccessfully(false)
            }

            if (nextError) {
              setErrors((current) => ({
                ...current,
                referenceImage: nextError
              }))
              return
            }

            clearFieldError('referenceImage')
          }}
        />
      ) : null}
      {errors.submit ? (
        <div className='alert alert-error w-full' role='alert'>
          <span>{errors.submit}</span>
        </div>
      ) : null}
      {hasSubmittedSuccessfully ? (
        <div
          className='alert alert-success w-full items-start'
          role='status'
          aria-live='polite'
        >
          <div className='space-y-2'>
            <p className='font-semibold'>Order request received</p>
            <p>Thank you. We've received your request.</p>
            <ul className='list-disc space-y-1 pl-5'>
              <li>We'll review your details within 24 hours.</li>
              <li>We'll contact you with a quote and final design details.</li>
              <li>We'll confirm delivery or collection once you approve.</li>
            </ul>
          </div>
        </div>
      ) : null}
      <button
        type='submit'
        className={`btn h-12 w-full rounded-full text-white shadow-btn tablet:h-12 ${buttonClassName}`}
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        <span className='flex items-center justify-center gap-2 font-sans text-sm font-semibold'>
          {buttonLabel}
          {isSubmitting ? (
            <span className='loading loading-spinner' aria-hidden='true'></span>
          ) : (
            <svg
              aria-hidden='true'
              focusable='false'
              width='11'
              height='10'
              viewBox='0 0 11 10'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              className='text-primary-100'
            >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M10.7774 0.084028C11.0071 0.237204 11.0692 0.547639 10.916 0.777403L4.91603 9.7774C4.83293 9.90204 4.69834 9.98286 4.54927 9.99762C4.4002 10.0124 4.25237 9.95953 4.14645 9.85361L0.146447 5.85361C-0.0488155 5.65834 -0.0488155 5.34176 0.146447 5.1465C0.341709 4.95124 0.658291 4.95124 0.853553 5.1465L4.42229 8.71523L10.084 0.222703C10.2372 -0.0070613 10.5476 -0.0691482 10.7774 0.084028Z'
                fill='currentColor'
              />
            </svg>
          )}
        </span>
      </button>
    </form>
  )
}

