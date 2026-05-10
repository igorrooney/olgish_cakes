'use client'

import { useEffect, useState } from 'react'
import { ValidatorInput } from '../components/homepage/ValidatorInput'
import {
  buildContactPageEnquiryFormData,
  isCsrfTokenLoadError,
  isSubmissionError
} from './contactPageEnquiry'
import {
  buildContactPageSubmission,
  contactPageFormSchema,
  enquiryTypeOptions,
  getContactPageFieldOrder,
  getContactPageInitialValues,
  getContactPageMinDate,
  type ContactPageFormValues
} from './contactPageForm.utils'
import { contactMessageExample } from './contactPageContent'
import styles from './contactPage.module.css'
import { useContactPageEnquiry } from './useContactPageEnquiry'

export function ContactPageForm() {
  const [formData, setFormData] = useState<ContactPageFormValues>(getContactPageInitialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState(false)
  const [minDate, setMinDate] = useState('')

  useEffect(() => {
    setMinDate(getContactPageMinDate())
  }, [])

  const focusFirstErrorField = (fieldErrors: Record<string, string>) => {
    const firstErrorField = getContactPageFieldOrder.find((field) => fieldErrors[field])

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

  const resetSuccessState = () => {
    if (!hasSubmittedSuccessfully) {
      return
    }

    setHasSubmittedSuccessfully(false)
    submitMutation.reset()
  }

  const updateField = (
    field: keyof ContactPageFormValues,
    value: string,
    shouldClearError = false
  ) => {
    setFormData((current) => ({ ...current, [field]: value }))
    resetSuccessState()

    if (shouldClearError) {
      clearFieldError(field)
    }
  }

  const { isCsrfLoading, refreshCsrfToken, submitMutation, submit } = useContactPageEnquiry({
    onSuccess: () => {
      setErrors({})
      setHasAttemptedSubmit(false)
      setHasSubmittedSuccessfully(true)
      setFormData(getContactPageInitialValues)
    },
    onError: (error) => {
      if (isSubmissionError(error) && error.fieldErrors) {
        setErrors(error.fieldErrors)
        focusFirstErrorField(error.fieldErrors)
        return
      }

      setErrors({
        submit: error instanceof Error ? error.message : 'Failed to send the message.'
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
      const nextCsrfToken = await refreshCsrfToken()

      if (!nextCsrfToken) {
        throw new Error('CSRF token not loaded. Please refresh the page and try again.')
      }

      const parsed = contactPageFormSchema.safeParse({
        ...formData,
        csrfToken: nextCsrfToken
      })
      const fieldErrors: Record<string, string> = {}

      if (!parsed.success) {
        parsed.error.errors.forEach((error) => {
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

      const submission = buildContactPageSubmission(formData, nextCsrfToken)
      const submissionData = buildContactPageEnquiryFormData(submission)

      submit(submissionData)
    } catch (error) {
      setErrors({
        submit: isCsrfTokenLoadError(error)
          ? 'CSRF token not loaded. Please refresh the page and try again.'
          : error instanceof Error
            ? error.message
            : 'Failed to send the message.'
      })
    }
  }

  const submitLabel = hasSubmittedSuccessfully ? 'Message sent' : 'Send your message'
  const submitClassName = hasSubmittedSuccessfully ? 'btn-success' : 'btn-primary'

  return (
    <form
      id='contact-form'
      onSubmit={handleSubmit}
      noValidate
      className='flex flex-col gap-5'
      aria-describedby={errors.submit ? 'contact-page-form-submit-error' : undefined}
    >
      <div className={styles.formFieldGrid}>
        <ValidatorInput
          id='name'
          type='text'
          placeholder='Your name'
          value={formData.name}
          label='Full name'
          autoComplete='name'
          showValidation={hasAttemptedSubmit}
          error={errors.name}
          hintText='Name for the reply'
          required
          onValueChange={(value) => updateField('name', value, true)}
        />
        <ValidatorInput
          id='email'
          type='email'
          placeholder='name@example.com'
          value={formData.email}
          label='Email address'
          autoComplete='email'
          showValidation={hasAttemptedSubmit}
          error={errors.email}
          hintText='Best email for my reply'
          required
          onValueChange={(value) => updateField('email', value, true)}
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
          hintText='Optional, but useful if a quick call or WhatsApp reply would help.'
          onValueChange={(value) => updateField('phone', value, true)}
        />
        <ValidatorInput
          fieldType='select'
          id='enquiryType'
          value={formData.enquiryType}
          label='What are you asking about?'
          options={enquiryTypeOptions}
          hintText='Pick the closest match'
          error={errors.enquiryType}
          required
          onValueChange={(value) => updateField('enquiryType', value, true)}
        />
        <div className='md:col-span-2'>
          <ValidatorInput
            id='dateNeeded'
            type='date'
            min={minDate}
            placeholder='Select a date'
            value={formData.dateNeeded}
            label='If you have a date, add it'
            labelAlt='(Optional)'
            labelPlacement='outside'
            showValidation={hasAttemptedSubmit}
            error={errors.dateNeeded}
            hintText='Leave this blank if the date is still up in the air'
            onValueChange={(value) => updateField('dateNeeded', value, true)}
          />
        </div>
      </div>

      <ValidatorInput
        fieldType='textarea'
        id='message'
        value={formData.message}
        label='Message'
        labelAlt='(Required)'
        labelLayout='stacked'
        placeholder={`For example: ${contactMessageExample}`}
        inputClassName='min-h-40'
        error={errors.message}
        hintText='A short note is fine. Include the main details so I can answer properly first time.'
        required
        onValueChange={(value) => updateField('message', value, true)}
      />

      {errors.submit ? (
        <div
          id='contact-page-form-submit-error'
          className='alert alert-error text-sm'
          role='alert'
        >
          <span>{errors.submit}</span>
        </div>
      ) : null}

      {hasSubmittedSuccessfully ? (
        <div className='alert alert-success text-sm' role='status'>
          <span>Thanks. I&apos;ve got your message and I&apos;ll be back in touch soon.</span>
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
      </div>
    </form>
  )
}
