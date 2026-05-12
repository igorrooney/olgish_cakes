'use client'

import { useRef, useState } from 'react'
import { useCustomCakeEnquiry } from '@/app/hooks/useCustomCakeEnquiry'
import {
  buildCustomCakeEnquiryFormData,
  customCakeEnquiryFallbackErrorMessage,
  isCsrfTokenLoadError,
  isSubmissionError,
  withCustomCakeEnquiryContactFallback
} from '@/app/services/customCakeEnquiry'
import { AddressIcon } from '../icons/AddressIcon'
import { EmailIcon } from '../icons/EmailIcon'
import { PhoneIcon } from '../icons/PhoneIcon'
import { ValidatorInput } from './ValidatorInput'
import { OCCASION_OPTIONS, type OccasionOption } from './formOptions'
import {
  dateMinErrorMessage,
  formSchema,
  formFieldOrder,
  getTodayDateInputValue,
  getReferenceImageError,
  isDateOnOrAfterToday,
  referenceImageAccept,
  type FormValues
} from './mobileForm.utils'

const formInitialState: FormValues = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postcode: '',
  occasion: '',
  date: '',
  requirements: ''
}

interface EnquiryFormProps {
  occasionOptions?: OccasionOption[]
}

export function EnquiryForm({
  occasionOptions = OCCASION_OPTIONS
}: EnquiryFormProps) {
  const [formData, setFormData] = useState<FormValues>(formInitialState)
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const referenceImageInputRef = useRef<HTMLInputElement | null>(null)
  const minDate = getTodayDateInputValue()

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [hasSubmittedSuccessfully, setHasSubmittedSuccessfully] = useState(false)

  const focusFirstErrorField = (fieldErrors: Record<string, string>) => {
    const firstErrorField = formFieldOrder.find((field) => fieldErrors[field])

    if (!firstErrorField) {
      return
    }

    const fieldElement = document.getElementById(firstErrorField)

    if (!fieldElement) {
      return
    }

    fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    fieldElement.focus()
  }

  const { isCsrfLoading, refreshCsrfToken, submitMutation, submit } = useCustomCakeEnquiry({
    onSuccess: () => {
      setErrors({})
      setHasAttemptedSubmit(false)
      setHasSubmittedSuccessfully(true)
      setFormData(formInitialState)
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
        submit: error instanceof Error ? error.message : customCakeEnquiryFallbackErrorMessage
      })
    }
  })

  const isSubmitting = submitMutation.isPending

  const resetSuccessState = () => {
    if (hasSubmittedSuccessfully) {
      setHasSubmittedSuccessfully(false)
      submitMutation.reset()
    }
  }

  const updateField = (
    field: keyof FormValues,
    value: string,
    shouldClearError = false
  ) => {
    setFormData((current) => ({ ...current, [field]: value }))
    resetSuccessState()

    if (shouldClearError) {
      clearFieldError(field)
    }
  }

  const clearFieldError = (field: string) => {
    setErrors((current) => {
      if (!current[field]) {
        return current
      }

      return { ...current, [field]: '' }
    })
  }

  const handleDateChange = (value: string) => {
    if (value && !isDateOnOrAfterToday(value)) {
      setErrors((current) => ({ ...current, date: dateMinErrorMessage }))
      updateField('date', '', false)
      return
    }

    updateField('date', value, true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setHasAttemptedSubmit(true)
    setErrors({})
    submitMutation.reset()

    try {
      const nextCsrfToken = await refreshCsrfToken()

      if (!nextCsrfToken) {
        throw new Error('CSRF token not loaded. Please refresh the page and try again.')
      }

      const parsed = formSchema.safeParse({ ...formData, csrfToken: nextCsrfToken })
      const fieldErrors: Record<string, string> = {}

      if (!parsed.success) {
        parsed.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message
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

      const validated = parsed.data
      const submissionData = buildCustomCakeEnquiryFormData(validated, referenceImage)

      submit(submissionData)
    } catch (error) {
      setErrors({
        submit: isCsrfTokenLoadError(error)
          ? withCustomCakeEnquiryContactFallback('CSRF token not loaded. Please refresh the page.')
          : error instanceof Error
            ? error.message
            : customCakeEnquiryFallbackErrorMessage
      })
    }
  }

  return (
    <section id='custom-cake-enquiry-form' className='bg-base-100 px-4 py-8'>
      <div className='homepage-container flex flex-col items-center gap-6 tablet:max-w-[696px]'>
        <h2
          id='custom-cake-enquiry-heading'
          className='scroll-mt-24 tablet:scroll-mt-36 font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center tablet:text-[36px] tablet:leading-[52px] tablet:max-w-[331px] tablet:mx-auto'
        >
          Custom cake enquiry form
        </h2>
        <form onSubmit={handleSubmit} noValidate className='flex w-full flex-col items-center gap-5'>
          <ValidatorInput
            id='fullName'
            type='text'
            placeholder='Enter name'
            value={formData.fullName}
            label='Full Name:'
            showValidation={hasAttemptedSubmit}
            error={errors.fullName}
            required
            hintText='Enter your full name'
            onValueChange={(value) => {
              updateField('fullName', value, true)
            }}
          />
          <ValidatorInput
            id='email'
            type='email'
            placeholder='your@email.com'
            value={formData.email}
            label='Email address:'
            icon={<EmailIcon />}
            showValidation={hasAttemptedSubmit}
            error={errors.email}
            required
            hintText='Enter valid email address'
            onValueChange={(value) => {
              updateField('email', value, true)
            }}
          />
          <ValidatorInput
            id='phone'
            type='tel'
            placeholder='+44 7123 456 789'
            value={formData.phone}
            label='Phone number:'
            icon={<PhoneIcon />}
            showValidation={hasAttemptedSubmit}
            error={errors.phone}
            required
            hintText='Enter valid phone number'
            onValueChange={(value) => {
              updateField('phone', value, true)
            }}
          />
          <ValidatorInput
            id='address'
            type='text'
            placeholder='Enter address line 1'
            value={formData.address}
            label='Address:'
            icon={<AddressIcon />}
            showValidation={hasAttemptedSubmit}
            error={errors.address}
            required
            hintText='Enter your address'
            onValueChange={(value) => {
              updateField('address', value, true)
            }}
          />
          <ValidatorInput
            id='city'
            type='text'
            placeholder='Enter city'
            value={formData.city}
            label='City:'
            icon={<AddressIcon />}
            showValidation={hasAttemptedSubmit}
            error={errors.city}
            required
            hintText='Enter your city'
            onValueChange={(value) => {
              updateField('city', value, true)
            }}
          />
          <ValidatorInput
            id='postcode'
            type='text'
            placeholder='Enter postcode'
            value={formData.postcode}
            label='Postcode:'
            icon={<AddressIcon />}
            showValidation={hasAttemptedSubmit}
            error={errors.postcode}
            required
            hintText='Enter your postcode'
            onValueChange={(value) => {
              updateField('postcode', value, true)
            }}
          />
          <ValidatorInput
            fieldType='select'
            id='occasion'
            value={formData.occasion ?? ''}
            label="What's the occasion?"
            labelAlt='(Optional)'
            options={occasionOptions}
            hintText='Select an occasion'
            onValueChange={(value) => {
              updateField('occasion', value)
            }}
          />
          <ValidatorInput
            fieldType='datePicker'
            id='date'
            placeholder='Select a date'
            value={formData.date}
            label='When do you need it?'
            error={errors.date}
            required
            hintText='Select a date'
            labelPlacement='outside'
            min={minDate}
            onValueChange={handleDateChange}
          />
          <ValidatorInput
            fieldType='textarea'
            id='requirements'
            value={formData.requirements ?? ''}
            label='Requirements'
            labelAlt='(Size, shape, flavour, icing, filling etc.)'
            labelLayout='stacked'
            placeholder='Enter requirements'
            hintText='Enter requirements'
            onValueChange={(value) => {
              updateField('requirements', value)
            }}
          />
          <ValidatorInput
            fieldType='upload'
            id='referenceImage'
            label='Upload a reference image'
            labelAlt='(Optional)'
            accept={referenceImageAccept}
            infoLeft='JPEG, PNG, HEIC'
            infoRight='5MB max'
            selectedFileName={referenceImage?.name}
            inputRef={referenceImageInputRef}
            error={errors.referenceImage}
            hintText='Upload a reference image'
            onFileChange={(files) => {
              const selectedFile = files?.[0] ?? null
              const nextError = getReferenceImageError(selectedFile)

              setReferenceImage(selectedFile)
              resetSuccessState()

              if (nextError) {
                setErrors((current) => ({ ...current, referenceImage: nextError }))
                return
              }

              clearFieldError('referenceImage')
            }}
          />
          {errors.submit && (
            <div className='alert alert-error w-full' role='alert'>
              <span>{errors.submit}</span>
            </div>
          )}
          {hasSubmittedSuccessfully ? (
            <div
              className='alert alert-success w-full items-start text-sm'
              role='status'
              aria-live='polite'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 shrink-0 stroke-current'
                fill='none'
                viewBox='0 0 24 24'
                aria-hidden='true'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <div>
                <p className='font-semibold'>Enquiry sent</p>
                <p className='mt-1 leading-6'>
                  Thank you, your cake enquiry has arrived safely. I&apos;ll get back to you as soon as I can.
                </p>
              </div>
            </div>
          ) : null}
          <button
            type='submit'
            className='btn h-12 w-full rounded-full bg-primary-500 text-white shadow-btn hover:bg-primary-700 tablet:h-12'
            disabled={isSubmitting || isCsrfLoading}
            aria-busy={isSubmitting}
          >
            <span className='flex items-center justify-center gap-2 font-sans text-sm font-semibold'>
              Send enquiry
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
      </div>
    </section>
  )
}
