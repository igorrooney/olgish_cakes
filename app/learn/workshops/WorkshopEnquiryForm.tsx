'use client'

import { useState } from 'react'
import { ValidatorInput } from '@/app/components/homepage/ValidatorInput'
import { getTodayDateInputValue } from '@/app/components/homepage/mobileForm.utils'
import { useWorkshopEnquiry } from '@/app/hooks/useWorkshopEnquiry'
import {
  buildWorkshopEnquiryFormData,
  isCsrfTokenLoadError,
  isSubmissionError
} from '@/app/services/workshopEnquiry'
import { workshopEnquirySchema } from '@/lib/validation'
import {
  buildWorkshopEnquirySubmission,
  getWorkshopEnquiryInitialValues,
  workshopEnquiryFieldOrder,
  workshopEventTypeOptions,
  type WorkshopEnquiryFormValues,
} from './workshopEnquiryForm.utils'

export function WorkshopEnquiryForm() {
  const [formData, setFormData] = useState<WorkshopEnquiryFormValues>(
    getWorkshopEnquiryInitialValues
  )
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState(false)
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const minDate = getTodayDateInputValue(tomorrowDate)

  const focusFirstErrorField = (fieldErrors: Record<string, string>) => {
    const firstErrorField = workshopEnquiryFieldOrder.find(field => fieldErrors[field])

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
    setErrors(current => {
      if (!current[field]) {
        return current
      }

      return { ...current, [field]: '' }
    })
  }

  const resetSuccessState = () => {
    if (!hasSubmittedSuccessfully) {
      return
    }

    setHasSubmittedSuccessfully(false)
    submitMutation.reset()
  }

  const updateField = (
    field: keyof WorkshopEnquiryFormValues,
    value: string,
    shouldClearError = false
  ) => {
    setFormData(current => ({ ...current, [field]: value }))
    resetSuccessState()

    if (!shouldClearError) {
      return
    }

    clearFieldError(field)
  }

  const { isCsrfLoading, refreshCsrfToken, submitMutation, submit } = useWorkshopEnquiry({
    onSuccess: () => {
      setErrors({})
      setHasAttemptedSubmit(false)
      setHasSubmittedSuccessfully(true)
      setFormData(getWorkshopEnquiryInitialValues)
    },
    onError: error => {
      if (isSubmissionError(error) && error.fieldErrors) {
        setErrors(error.fieldErrors)
        focusFirstErrorField(error.fieldErrors)
        return
      }

      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to submit the workshop enquiry.',
      })
    },
  })

  const isSubmitting = submitMutation.isPending

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setHasAttemptedSubmit(true)
    setErrors({})
    submitMutation.reset()

    try {
      const nextCsrfToken = await refreshCsrfToken()

      if (!nextCsrfToken) {
        throw new Error('CSRF token not loaded. Please refresh the page and try again.')
      }

      const parsed = workshopEnquirySchema.safeParse({ ...formData, csrfToken: nextCsrfToken })
      const fieldErrors: Record<string, string> = {}

      if (!parsed.success) {
        parsed.error.errors.forEach(error => {
          if (error.path[0]) {
            fieldErrors[error.path[0].toString()] = error.message
          }
        })
      }

      if (!parsed.success) {
        setErrors(fieldErrors)
        focusFirstErrorField(fieldErrors)
        return
      }

      const submission = buildWorkshopEnquirySubmission(
        {
          ...parsed.data,
          decorationTheme: parsed.data.decorationTheme ?? '',
        },
        nextCsrfToken
      )
      const submissionData = buildWorkshopEnquiryFormData(submission)
      submit(submissionData)
    } catch (error) {
      setErrors({
        submit: isCsrfTokenLoadError(error)
          ? 'CSRF token not loaded. Please refresh the page and try again.'
          : error instanceof Error
            ? error.message
            : 'Failed to submit the workshop enquiry.',
      })
    }
  }

  const submitLabel = hasSubmittedSuccessfully ? 'Enquiry sent' : 'Send workshop enquiry'
  const submitClassName = hasSubmittedSuccessfully ? 'btn-success' : 'btn-primary'

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className='flex flex-col gap-3 tablet:gap-5'
      aria-describedby={errors.submit ? 'workshop-form-submit-error' : undefined}
    >
      <div className='grid gap-2.5 tablet:grid-cols-2 tablet:gap-4'>
        <ValidatorInput
          id='fullName'
          type='text'
          placeholder='Who should I send the quote to?'
          value={formData.fullName}
          label='Full name'
          autoComplete='name'
          showValidation={hasAttemptedSubmit}
          error={errors.fullName}
          required
          hintText='Name for the quote and follow-up'
          onValueChange={value => updateField('fullName', value, true)}
        />
        <ValidatorInput
          id='email'
          type='email'
          placeholder='name@example.com'
          value={formData.email}
          label='Email address'
          labelAlt='(Required)'
          autoComplete='email'
          showValidation={hasAttemptedSubmit}
          error={errors.email}
          required
          hintText='Best email for the quote and replies'
          onValueChange={value => updateField('email', value, true)}
        />
        <ValidatorInput
          id='phone'
          type='tel'
          placeholder='+44 7123 456 789'
          value={formData.phone}
          label='Phone number'
          labelAlt='(Optional)'
          autoComplete='tel'
          showValidation={hasAttemptedSubmit}
          error={errors.phone}
          hintText='Optional. Helpful if access or timings are quicker to sort by phone'
          onValueChange={value => updateField('phone', value, true)}
        />
        <ValidatorInput
          fieldType='select'
          id='eventType'
          value={formData.eventType}
          label='Event type'
          options={workshopEventTypeOptions}
          hintText='Pick the closest match'
          error={errors.eventType}
          required
          onValueChange={value => updateField('eventType', value, true)}
        />
        <ValidatorInput
          id='groupSize'
          type='text'
          placeholder='For example: 16 guests plus 2 organisers'
          value={formData.groupSize}
          label='Group size'
          showValidation={hasAttemptedSubmit}
          error={errors.groupSize}
          required
          hintText='Approximate numbers are enough to start with'
          onValueChange={value => updateField('groupSize', value, true)}
        />
        <ValidatorInput
          id='location'
          type='text'
          placeholder='For example: Clerkenwell, London EC1'
          value={formData.location}
          label='Location'
          showValidation={hasAttemptedSubmit}
          error={errors.location}
          required
          hintText='Venue name plus postcode or area'
          onValueChange={value => updateField('location', value, true)}
        />
        <ValidatorInput
          fieldType='datePicker'
          id='preferredDate'
          min={minDate}
          placeholder='Select a date'
          value={formData.preferredDate}
          label='Preferred date'
          labelPlacement='outside'
          error={errors.preferredDate}
          required
          hintText='Choose the date you want me to check first'
          onValueChange={value => updateField('preferredDate', value, true)}
        />
        <ValidatorInput
          id='decorationTheme'
          type='text'
          placeholder='For example: modern neutrals, pink birthday piping'
          value={formData.decorationTheme ?? ''}
          label='Decoration theme'
          labelAlt='(Optional)'
          showValidation={hasAttemptedSubmit}
          error={errors.decorationTheme}
          hintText='Optional. Add colours or style if you already know them'
          onValueChange={value => updateField('decorationTheme', value, true)}
        />
      </div>

      <ValidatorInput
        fieldType='textarea'
        id='brief'
        value={formData.brief}
        label='Event brief'
        labelAlt='(Required)'
        labelLayout='stacked'
        placeholder='Tell me the venue, start time, access details and whether people will stay at the table for the full session.'
        hintText='Practical details tell me if I can quote this properly and run it cleanly on the day'
        inputClassName='min-h-32 tablet:min-h-40'
        error={errors.brief}
        required
        onValueChange={value => updateField('brief', value, true)}
      />

      {errors.submit ? (
        <div id='workshop-form-submit-error' className='alert alert-error text-sm' role='alert'>
          <span>{errors.submit}</span>
        </div>
      ) : null}

      <div>
        <button
          type='submit'
          className={`btn btn-block h-12 border-none px-6 text-sm font-semibold normal-case tablet:h-14 tablet:text-base ${submitClassName}`}
          disabled={isSubmitting || isCsrfLoading}
          aria-busy={isSubmitting || isCsrfLoading}
        >
          {isSubmitting ? 'Sending...' : submitLabel}
        </button>
        <p className='mt-2 text-center text-sm leading-6 text-base-content/70'>
          I&apos;ll reply by email with the quote, travel cost and whether the venue and timings
          sound realistic for this setup. Add a phone number if access or timings would be quicker
          to sort that way.
        </p>
      </div>
    </form>
  )
}
