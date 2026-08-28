'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { FormFieldError } from '@/app/components/forms/FormFieldError'
import {
  sensitiveDataConsentField,
  sensitiveDataInformationField,
  sensitiveDataInformationMaxLength
} from '@/lib/legal/sensitive-data-consent'

type SensitiveDataConsentFieldsProps = {
  consent: boolean
  consentError?: string
  disabled?: boolean
  information: string
  informationError?: string
  onConsentChange: (consent: boolean) => void
  onInformationChange: (information: string) => void
  className?: string
}

export function SensitiveDataConsentFields({
  consent,
  consentError,
  disabled = false,
  information,
  informationError,
  onConsentChange,
  onInformationChange,
  className = ''
}: SensitiveDataConsentFieldsProps) {
  const hasInformation = information.trim().length > 0
  const consentInputRef = useRef<HTMLInputElement>(null)
  const informationDescriptionId = `${sensitiveDataInformationField}-description`
  const informationErrorId = `${sensitiveDataInformationField}-error`
  const consentErrorId = `${sensitiveDataConsentField}-error`

  const handleInformationChange = (value: string) => {
    onInformationChange(value)

    if (value.trim().length === 0 && consent) {
      onConsentChange(false)
    }
  }

  useEffect(() => {
    if (consentError && hasInformation) {
      consentInputRef.current?.focus()
    }
  }, [consentError, hasInformation])

  return (
    <fieldset
      className={`w-full rounded-box border border-base-300 bg-base-100 p-4 ${className}`.trim()}
    >
      <legend className='px-2 font-sans text-sm font-semibold text-base-content'>
        Dietary health information
      </legend>
      <div className='space-y-3'>
        <label
          className='block font-sans text-sm font-semibold text-base-content'
          htmlFor={sensitiveDataInformationField}
        >
          Allergy, intolerance or health-related dietary information{' '}
          <span className='font-normal text-base-content/70'>(Optional)</span>
        </label>
        <textarea
          id={sensitiveDataInformationField}
          name={sensitiveDataInformationField}
          className={`textarea textarea-bordered min-h-28 w-full rounded-box ${
            informationError ? 'textarea-error' : ''
          }`.trim()}
          value={information}
          maxLength={sensitiveDataInformationMaxLength}
          disabled={disabled}
          aria-describedby={[
            informationDescriptionId,
            informationError ? informationErrorId : ''
          ].filter(Boolean).join(' ')}
          aria-invalid={Boolean(informationError)}
          onChange={(event) => handleInformationChange(event.target.value)}
        />
        <p
          id={informationDescriptionId}
          className='font-sans text-sm leading-6 text-base-content/80'
        >
          Use this field only for information we need to assess whether we can supply safely.
          Please do not add health information to general message or requirements fields. Read our{' '}
          <Link href='/privacy' className='link link-primary font-semibold'>
            privacy policy
          </Link>
          .
        </p>
        <FormFieldError
          id={informationErrorId}
          message={informationError}
        />
      </div>
      <div
        data-testid='dietary-health-consent-disclosure'
        aria-hidden={!hasInformation}
        inert={!hasInformation}
        className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin-top] duration-200 ease-out motion-reduce:transition-none ${
          hasInformation
            ? 'mt-3 grid-rows-[1fr] opacity-100'
            : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className='min-h-0 overflow-hidden'>
          <div className='space-y-2'>
            <label
              className='flex cursor-pointer items-start gap-3'
              htmlFor={sensitiveDataConsentField}
            >
              <input
                ref={consentInputRef}
                id={sensitiveDataConsentField}
                name={sensitiveDataConsentField}
                type='checkbox'
                className={`checkbox mt-1 ${
                  consentError ? 'checkbox-error' : 'checkbox-primary'
                }`}
                checked={consent}
                required={hasInformation}
                disabled={disabled || !hasInformation}
                aria-describedby={[
                  `${sensitiveDataConsentField}-description`,
                  consentError ? consentErrorId : ''
                ].filter(Boolean).join(' ')}
                aria-invalid={Boolean(consentError)}
                onChange={(event) => onConsentChange(event.target.checked)}
              />
              <span
                id={`${sensitiveDataConsentField}-description`}
                className='font-sans text-sm leading-6 text-base-content'
              >
                I explicitly consent to Olgish Cakes using the health-related information above
                to assess and fulfil this request. I understand that I can withdraw consent, but
                Olgish Cakes may then be unable to supply safely.
              </span>
            </label>
            <FormFieldError
              id={consentErrorId}
              message={consentError}
            />
          </div>
        </div>
      </div>
    </fieldset>
  )
}
