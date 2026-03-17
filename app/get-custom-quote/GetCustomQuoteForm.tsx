'use client'

import { useRef, useState } from 'react'
import { useCustomCakeEnquiry } from '../hooks/useCustomCakeEnquiry'
import {
  buildCustomCakeEnquiryFormData,
  isSubmissionError
} from '../services/customCakeEnquiry'
import {
  dateMinErrorMessage,
  getReferenceImageError,
  getTodayDateInputValue,
  isDateOnOrAfterToday,
  referenceImageAccept
} from '../components/homepage/mobileForm.utils'
import {
  OCCASION_OPTIONS,
  type OccasionOption
} from '../components/homepage/formOptions'
import { ValidatorInput } from '../components/homepage/ValidatorInput'
import {
  buildGetCustomQuoteSubmission,
  getCustomQuoteFieldOrder,
  getCustomQuoteInitialValues,
  quoteFormSchema,
  type GetCustomQuoteFormValues
} from './getCustomQuoteForm.utils'

const optionalFieldOptions = (
  options: ReadonlyArray<{ label: string, value: string, disabled?: boolean }>
): Array<{ label: string, value: string, disabled?: boolean }> => (
  options.some((option) => option.disabled && option.value === '')
    ? [...options]
    : [{ label: 'Select from list', value: '', disabled: true }, ...options]
)

type GetCustomQuoteFormProps = {
  occasionOptions?: OccasionOption[]
}

const normalizeOccasionOptions = (options: ReadonlyArray<OccasionOption>) => options.map((option) => ({
  label: option.label,
  value: option.value ?? option.label,
  disabled: option.disabled
}))

export function GetCustomQuoteForm({
  occasionOptions = OCCASION_OPTIONS
}: GetCustomQuoteFormProps) {
  const [formData, setFormData] = useState<GetCustomQuoteFormValues>(getCustomQuoteInitialValues)
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState(false)
  const referenceImageInputRef = useRef<HTMLInputElement | null>(null)
  const minDate = getTodayDateInputValue()

  const focusFirstErrorField = (fieldErrors: Record<string, string>) => {
    const firstErrorField = getCustomQuoteFieldOrder.find((field) => fieldErrors[field])

    if (!firstErrorField) {
      return
    }

    requestAnimationFrame(() => {
      const fieldElement = document.getElementById(firstErrorField)
      if (!fieldElement) {
        return
      }

      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      fieldElement.focus()
    })
  }

  const clearFieldError = (field: string) => {
    setErrors((current) => {
      if (!current[field]) {
        return current
      }

      return { ...current, [field]: '' }
    })
  }

  const clearContactErrors = () => {
    clearFieldError('email')
    clearFieldError('phone')
  }

  const resetSuccessState = () => {
    if (!hasSubmittedSuccessfully) {
      return
    }

    setHasSubmittedSuccessfully(false)
    submitMutation.reset()
  }

  const updateField = (field: keyof GetCustomQuoteFormValues, value: string, shouldClearError = false) => {
    setFormData((current) => ({ ...current, [field]: value }))
    resetSuccessState()

    if (!shouldClearError) {
      return
    }

    if (field === 'email' || field === 'phone') {
      clearContactErrors()
      return
    }

    clearFieldError(field)
  }

  const handleDateChange = (value: string) => {
    if (value && !isDateOnOrAfterToday(value)) {
      setErrors((current) => ({ ...current, date: dateMinErrorMessage }))
      updateField('date', '', false)
      return
    }

    updateField('date', value, true)
  }

  const { csrfToken, isCsrfLoading, submitMutation, submit } = useCustomCakeEnquiry({
    onSuccess: () => {
      setErrors({})
      setHasAttemptedSubmit(false)
      setHasSubmittedSuccessfully(true)
      setFormData(getCustomQuoteInitialValues)
      setReferenceImage(null)
      if (referenceImageInputRef.current) {
        referenceImageInputRef.current.value = ''
      }
    },
    onError: (error) => {
      if (isSubmissionError(error) && error.fieldErrors) {
        setErrors(error.fieldErrors)
        focusFirstErrorField(error.fieldErrors)
        return
      }

      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to submit form. Please try again.'
      })
    }
  })

  const isSubmitting = submitMutation.isPending

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasAttemptedSubmit(true)
    setErrors({})
    submitMutation.reset()

    try {
      if (isCsrfLoading || !csrfToken) {
        throw new Error('CSRF token not loaded. Please refresh the page and try again.')
      }

      const parsed = quoteFormSchema.safeParse({ ...formData, csrfToken })
      const fieldErrors: Record<string, string> = {}

      if (!parsed.success) {
        parsed.error.errors.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[error.path[0].toString()] = error.message
          }
        })
      }

      const referenceImageError = getReferenceImageError(referenceImage)
      if (referenceImageError) {
        fieldErrors.referenceImage = referenceImageError
      }

      if (!parsed.success || Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
        focusFirstErrorField(fieldErrors)
        return
      }

      const submission = buildGetCustomQuoteSubmission(parsed.data, csrfToken)
      const submissionData = buildCustomCakeEnquiryFormData(submission, referenceImage)

      submit(submissionData)
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to submit form. Please try again.'
      })
    }
  }

  const handleFileChange = (files: FileList | null) => {
    const selectedFile = files?.[0] ?? null
    const nextError = getReferenceImageError(selectedFile)

    resetSuccessState()
    setReferenceImage(selectedFile)
    setErrors((current) => ({
      ...current,
      referenceImage: nextError ?? ''
    }))
  }

  const submitLabel = hasSubmittedSuccessfully ? 'Enquiry sent' : 'Send quote request'
  const submitClassName = hasSubmittedSuccessfully
    ? 'btn-success'
    : 'btn-primary'
  const normalizedOccasionOptions = optionalFieldOptions(normalizeOccasionOptions(occasionOptions))

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className='flex flex-col gap-5'
      aria-describedby={errors.submit ? 'quote-form-submit-error' : undefined}
    >
      <div className='grid gap-4 tablet:grid-cols-2'>
        <ValidatorInput
          id='fullName'
          type='text'
          placeholder='Enter your full name'
          value={formData.fullName}
          label='Full name'
          showValidation={hasAttemptedSubmit}
          error={errors.fullName}
          required
          hintText='Enter your full name'
          onValueChange={(value) => updateField('fullName', value, true)}
        />
        <ValidatorInput
          id='email'
          type='email'
          placeholder='your@email.com'
          value={formData.email}
          label='Email address'
          labelAlt='(Optional)'
          showValidation={hasAttemptedSubmit}
          error={errors.email}
          hintText='Add an email address or leave this blank if you prefer a phone reply'
          onValueChange={(value) => updateField('email', value, true)}
        />
        <ValidatorInput
          id='phone'
          type='tel'
          placeholder='+44 7123 456 789'
          value={formData.phone}
          label='Phone number'
          labelAlt='(Optional)'
          showValidation={hasAttemptedSubmit}
          error={errors.phone}
          hintText='Add a phone number or leave this blank if email is enough'
          onValueChange={(value) => updateField('phone', value, true)}
        />
        <ValidatorInput
          id='servings'
          type='text'
          placeholder='For example: 20 guests'
          value={formData.servings}
          label='Approximate servings'
          showValidation={hasAttemptedSubmit}
          error={errors.servings}
          required
          hintText='Enter approximate servings'
          onValueChange={(value) => updateField('servings', value, true)}
        />
        <ValidatorInput
          id='date'
          type='date'
          min={minDate}
          placeholder='Select a date'
          value={formData.date}
          label='Date needed'
          labelPlacement='outside'
          showValidation={hasAttemptedSubmit}
          error={errors.date}
          required
          hintText='Select a date'
          onValueChange={handleDateChange}
        />
        <ValidatorInput
          fieldType='select'
          id='occasion'
          value={formData.occasion}
          label='Occasion'
          labelAlt='(Optional)'
          options={normalizedOccasionOptions}
          hintText='Select an occasion if you want to'
          error={errors.occasion}
          onValueChange={(value) => updateField('occasion', value, true)}
        />
      </div>

      <ValidatorInput
        fieldType='textarea'
        id='brief'
        value={formData.brief}
        label='Cake brief'
        labelAlt='(Required)'
        labelLayout='stacked'
        placeholder='Tell me the main idea, style, colours, flavour direction, dietary notes, delivery or collection preference, and anything else that matters.'
        hintText='Describe the cake briefly, including any extra detail that would help the first reply'
        inputClassName='min-h-40'
        error={errors.brief}
        required
        onValueChange={(value) => updateField('brief', value, true)}
      />

      <ValidatorInput
        fieldType='upload'
        id='referenceImage'
        label='Reference image'
        labelAlt='(Optional)'
        accept={referenceImageAccept}
        infoLeft='JPEG, PNG or HEIC'
        infoRight='5MB max'
        selectedFileName={referenceImage?.name}
        inputRef={referenceImageInputRef}
        error={errors.referenceImage}
        hintText='Upload a reference image if you already have one'
        onFileChange={handleFileChange}
      />

      {errors.submit ? (
        <div
          id='quote-form-submit-error'
          className='alert alert-error text-sm'
          role='alert'
        >
          <span>{errors.submit}</span>
        </div>
      ) : null}

      <div className='bottom-3'>
        <button
          type='submit'
          className={`btn btn-block h-12 border-none px-6 text-sm font-semibold normal-case tablet:h-14 tablet:text-base ${submitClassName}`}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Sending...' : submitLabel}
        </button>
        <p className='mt-3 text-center text-sm leading-6 text-base-content/70'>
          I&apos;ll review your enquiry and reply within 24 hours. Please add either an email address or a phone number so I can get back to you.
        </p>
      </div>
    </form>
  )
}
