'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  consentServices,
  deniedConsentChoices,
  grantedConsentChoices,
  type ConsentChoices,
  type ConsentServiceKey
} from '@/app/lib/consent-config'
import {
  dispatchConsentDialogState,
  readCurrentConsentRecord,
  saveConsentChoices
} from '@/app/lib/consent-runtime'

type ConsentPreferencesDialogProps = {
  isOpen: boolean
  onRequestClose: () => void
}

export function ConsentPreferencesDialog({
  isOpen,
  onRequestClose
}: ConsentPreferencesDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [choices, setChoices] = useState<ConsentChoices>(() => (
    readCurrentConsentRecord()?.choices ?? { ...deniedConsentChoices }
  ))

  const closeDialog = useCallback(() => {
    dialogRef.current?.close()
    dispatchConsentDialogState(false)
    onRequestClose()
  }, [onRequestClose])

  const saveAndClose = useCallback((nextChoices: ConsentChoices) => {
    saveConsentChoices(nextChoices, 'preferences')
    closeDialog()
  }, [closeDialog])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !isOpen) {
      return
    }

    setChoices(readCurrentConsentRecord()?.choices ?? { ...deniedConsentChoices })
    if (!dialog.open) {
      dialog.showModal()
    }
    dispatchConsentDialogState(true)

    return () => {
      if (dialog.open) {
        dialog.close()
      }
      dispatchConsentDialogState(false)
    }
  }, [isOpen])

  const updateChoice = useCallback((serviceKey: ConsentServiceKey, checked: boolean) => {
    setChoices(currentChoices => ({
      ...currentChoices,
      [serviceKey]: checked
    }))
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className='modal modal-bottom tablet:modal-middle'
      aria-labelledby='cookie-preferences-title'
      aria-describedby='cookie-preferences-description'
      onCancel={event => {
        event.preventDefault()
        closeDialog()
      }}
    >
      <div className='modal-box max-h-[calc(100dvh-2rem)] max-w-2xl rounded-box border border-base-300 bg-base-100 p-0 text-base-content'>
        <div className='flex items-start justify-between gap-4 border-b border-base-300 p-5 tablet:p-6'>
          <div>
            <h2
              id='cookie-preferences-title'
              className='font-moreSugar text-xl font-normal text-primary-800 tablet:text-2xl'
            >
              Cookie preferences
            </h2>
            <p id='cookie-preferences-description' className='mt-2 text-sm leading-6 tablet:text-base'>
              Necessary cookies are always active. Choose which optional services we may use.
            </p>
          </div>
          <button
            type='button'
            className='btn btn-square btn-ghost min-h-11 min-w-11 rounded-field'
            aria-label='Close cookie preferences'
            onClick={closeDialog}
          >
            <svg aria-hidden='true' viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M6 6l12 12M18 6L6 18' />
            </svg>
          </button>
        </div>

        <div className='grid gap-3 overflow-y-auto p-5 tablet:p-6'>
          {consentServices.map(service => (
            <label
              key={service.key}
              className='flex min-h-20 cursor-pointer items-center justify-between gap-4 rounded-box border border-base-300 bg-base-100 p-4'
            >
              <span className='min-w-0'>
                <span className='block font-semibold text-primary-800'>{service.name}</span>
                <span className='mt-1 block text-sm leading-5'>{service.description}</span>
              </span>
              <input
                type='checkbox'
                className='toggle toggle-primary min-h-6 shrink-0'
                checked={choices[service.key]}
                onChange={event => updateChoice(service.key, event.target.checked)}
              />
            </label>
          ))}
        </div>

        <div className='grid gap-2 border-t border-base-300 p-5 tablet:grid-cols-3 tablet:p-6'>
          <button
            type='button'
            className='btn btn-outline min-h-11 rounded-field border-primary-500 text-primary-800'
            onClick={() => saveAndClose({ ...deniedConsentChoices })}
          >
            Reject optional
          </button>
          <button
            type='button'
            className='btn btn-primary min-h-11 rounded-field'
            onClick={() => saveAndClose(choices)}
          >
            Save choices
          </button>
          <button
            type='button'
            className='btn btn-outline min-h-11 rounded-field border-primary-500 text-primary-800'
            onClick={() => saveAndClose({ ...grantedConsentChoices })}
          >
            Accept optional
          </button>
        </div>
      </div>
    </dialog>
  )
}
