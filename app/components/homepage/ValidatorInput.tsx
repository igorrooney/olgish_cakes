'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import { DesignSystemDatePicker } from '@/app/components/forms/DesignSystemDatePicker'

type SelectOption = {
  label: string
  value?: string
  disabled?: boolean
}

type ValidatorInputProps =
  | {
      fieldType?: 'input'
      id: string
      type: string
      min?: string
      placeholder: string
      value: string
      label: string
      labelAlt?: string
      labelPlacement?: 'inside' | 'outside'
      labelLayout?: 'between' | 'stacked'
      autoComplete?: string
      icon?: ReactNode
      trailingIcon?: ReactNode
      inputClassName?: string
      showValidation?: boolean
      error?: string
      required?: boolean
      hintText: string
      onValueChange: (value: string) => void
    }
  | {
      fieldType: 'datePicker'
      id: string
      min?: string
      placeholder: string
      value: string
      label: string
      labelAlt?: string
      labelPlacement?: 'inside' | 'outside'
      labelLayout?: 'between' | 'stacked'
      error?: string
      required?: boolean
      hintText: string
      onValueChange: (value: string) => void
    }
  | {
      fieldType: 'select'
      id: string
      value: string
      label: string
      labelAlt?: string
      labelLayout?: 'between' | 'stacked'
      selectClassName?: string
      options: SelectOption[]
      error?: string
      required?: boolean
      hintText: string
      onValueChange: (value: string) => void
    }
  | {
      fieldType: 'textarea'
      id: string
      value: string
      label: string
      labelAlt?: string
      labelLayout?: 'between' | 'stacked'
      autoComplete?: string
      placeholder: string
      inputClassName?: string
      error?: string
      required?: boolean
      hintText: string
      onValueChange: (value: string) => void
    }
  | {
      fieldType: 'upload'
      id: string
      label: string
      labelAlt?: string
      labelLayout?: 'between' | 'stacked'
      accept?: string
      infoLeft?: string
      infoRight?: string
      selectedFileName?: string
      error?: string
      hintText: string
      inputRef?: RefObject<HTMLInputElement | null>
      onFileChange?: (files: FileList | null) => void
    }

const tokenizedInputStyle = (hasError: boolean) => ({
  borderRadius: 'var(--d-borderRadius-box)',
  borderWidth: 'var(--d-borderWidth-btn)',
  borderStyle: 'solid',
  borderColor: hasError
    ? 'var(--color-error)'
    : 'color-mix(in srgb, var(--d-color-base-content) calc(var(--u-opacity-stroke-20) * 100%), transparent)',
})

const errorCardClassName =
  'mt-2 flex items-start gap-2 rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error'

const selectPanelClassName =
  'absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[1060] overflow-hidden rounded-[24px] border border-base-300 bg-[linear-gradient(180deg,_#FFFBEB_0%,_#FFFFFF_100%)] p-2 shadow-[0px_12px_30px_rgba(15,23,42,0.12)]'

const selectOptionBaseClassName =
  'w-full rounded-[18px] px-4 py-3 text-left text-sm leading-6 transition-colors duration-150'
const hintTextClassName = 'mt-2 text-xs leading-5 text-base-content/70'

function getEnabledOptionIndexes(options: SelectOption[]) {
  return options.reduce<number[]>((indexes, option, index) => {
    if (!option.disabled) {
      indexes.push(index)
    }

    return indexes
  }, [])
}

function getOptionValue(option: SelectOption) {
  return option.value ?? option.label
}

function getInitialHighlightedIndex(options: SelectOption[], value: string) {
  const selectedIndex = options.findIndex(
    option => getOptionValue(option) === value && !option.disabled
  )

  if (selectedIndex !== -1) {
    return selectedIndex
  }

  return options.findIndex(option => !option.disabled)
}

type SelectFieldProps = Extract<ValidatorInputProps, { fieldType: 'select' }>

function getHintId(id: string) {
  return `${id}-hint`
}

function getErrorId(id: string) {
  return `${id}-error`
}

function getDescribedBy(id: string, hintText?: string, error?: string) {
  const ids = [
    hintText ? getHintId(id) : null,
    error ? getErrorId(id) : null
  ].filter(Boolean)

  return ids.length > 0 ? ids.join(' ') : undefined
}

function renderHintText(id: string, hintText?: string) {
  if (!hintText) {
    return null
  }

  return (
    <p id={getHintId(id)} className={hintTextClassName}>
      {hintText}
    </p>
  )
}

function SelectField({
  id,
  value,
  label,
  labelAlt,
  labelLayout,
  selectClassName,
  options,
  error,
  hintText,
  required = false,
  onValueChange,
}: SelectFieldProps) {
  const hasError = Boolean(error)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(() =>
    getInitialHighlightedIndex(options, value)
  )
  const containerRef = useRef<HTMLDivElement | null>(null)
  const listboxId = `${id}-listbox`
  const selectedOption = useMemo(
    () => options.find(option => getOptionValue(option) === value),
    [options, value]
  )
  const displayLabel = selectedOption?.label ?? options[0]?.label ?? ''
  const enabledOptionIndexes = useMemo(() => getEnabledOptionIndexes(options), [options])
  const resolvedLabelClassName =
    labelLayout === 'stacked'
      ? 'label w-full flex flex-col items-start gap-1'
      : 'label w-full justify-between'
  const resolvedLabelAltClassName =
    labelLayout === 'stacked'
      ? 'label-text-alt text-xs text-base-content opacity-100 mb-2'
      : 'label-text-alt text-xs text-base-content opacity-100 ml-auto'
  const resolvedSelectClassName =
    `input w-full cursor-pointer bg-white text-base-content opacity-100 relative justify-between ${hasError ? '' : 'focus-visible:ring-1 focus-visible:ring-primary/30'} ${selectClassName ?? ''}`.trim()
  const activeOptionId =
    isOpen && highlightedIndex !== -1 ? `${listboxId}-option-${highlightedIndex}` : undefined

  useEffect(() => {
    setHighlightedIndex(getInitialHighlightedIndex(options, value))
  }, [options, value])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }

      if (!containerRef.current?.contains(target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [isOpen])

  const openListbox = () => {
    setHighlightedIndex(getInitialHighlightedIndex(options, value))
    setIsOpen(true)
  }

  const closeListbox = () => {
    setIsOpen(false)
  }

  const focusTrigger = () => {
    const trigger = document.getElementById(id)

    if (trigger instanceof HTMLButtonElement) {
      trigger.focus()
    }
  }

  const commitSelection = (index: number) => {
    const selected = options[index]

    if (!selected || selected.disabled) {
      return
    }

    onValueChange(getOptionValue(selected))
    setHighlightedIndex(index)
    closeListbox()
    focusTrigger()
  }

  const moveHighlight = (direction: 'next' | 'previous' | 'first' | 'last') => {
    if (enabledOptionIndexes.length === 0) {
      return
    }

    if (direction === 'first') {
      setHighlightedIndex(enabledOptionIndexes[0])
      return
    }

    if (direction === 'last') {
      setHighlightedIndex(enabledOptionIndexes[enabledOptionIndexes.length - 1])
      return
    }

    const currentIndex = enabledOptionIndexes.indexOf(highlightedIndex)

    if (currentIndex === -1) {
      setHighlightedIndex(
        direction === 'next'
          ? enabledOptionIndexes[0]
          : enabledOptionIndexes[enabledOptionIndexes.length - 1]
      )
      return
    }

    const nextEnabledIndex =
      direction === 'next'
        ? Math.min(currentIndex + 1, enabledOptionIndexes.length - 1)
        : Math.max(currentIndex - 1, 0)

    setHighlightedIndex(enabledOptionIndexes[nextEnabledIndex])
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (!isOpen) {
          openListbox()
          return
        }
        moveHighlight('next')
        return
      case 'ArrowUp':
        event.preventDefault()
        if (!isOpen) {
          openListbox()
          return
        }
        moveHighlight('previous')
        return
      case 'Home':
        if (isOpen) {
          event.preventDefault()
          moveHighlight('first')
        }
        return
      case 'End':
        if (isOpen) {
          event.preventDefault()
          moveHighlight('last')
        }
        return
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (!isOpen) {
          openListbox()
          return
        }

        if (highlightedIndex !== -1) {
          commitSelection(highlightedIndex)
        }
        return
      case 'Escape':
        if (isOpen) {
          event.preventDefault()
          closeListbox()
        }
        return
      case 'Tab':
        if (isOpen) {
          closeListbox()
        }
        return
      default:
        return
    }
  }

  return (
    <div className='form-control w-full' ref={containerRef}>
      <label className={resolvedLabelClassName} htmlFor={id}>
        <span className='label-text font-sans text-sm text-base-content opacity-100'>{label}</span>
        {labelAlt ? <span className={resolvedLabelAltClassName}>{labelAlt}</span> : null}
      </label>
      <div className='relative'>
        <button
          id={id}
          type='button'
          role='combobox'
          className={resolvedSelectClassName}
          style={tokenizedInputStyle(hasError)}
          aria-haspopup='listbox'
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-invalid={hasError}
          aria-describedby={getDescribedBy(id, hintText, error)}
          aria-required={required}
          onClick={() => {
            if (isOpen) {
              closeListbox()
              return
            }

            openListbox()
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          <span className='min-w-0 truncate text-left text-sm text-base-content'>
            {displayLabel}
          </span>
          <span
            className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center text-primary-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            aria-hidden='true'
          >
            <svg viewBox='0 0 20 20' fill='none' className='h-4 w-4'>
              <path
                d='M5 7.5L10 12.5L15 7.5'
                stroke='currentColor'
                strokeWidth='1.75'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </span>
        </button>
        {isOpen ? (
          <div id={listboxId} role='listbox' aria-labelledby={id} className={selectPanelClassName}>
            <div className='max-h-64 overflow-y-auto'>
              {options.map((option, index) => {
                const optionValue = getOptionValue(option)
                const isSelected = optionValue === value
                const isHighlighted = index === highlightedIndex
                const optionClassName = [
                  selectOptionBaseClassName,
                  option.disabled
                    ? 'cursor-not-allowed text-base-content/45'
                    : 'cursor-pointer text-base-content',
                  isSelected ? 'bg-primary-50 text-primary-700' : '',
                  isHighlighted && !option.disabled ? 'bg-base-100/90 shadow-sm' : '',
                  !isSelected && !isHighlighted && !option.disabled ? 'hover:bg-base-100/80' : '',
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <button
                    id={`${listboxId}-option-${index}`}
                    key={optionValue || option.label}
                    type='button'
                    role='option'
                    aria-selected={isSelected}
                    disabled={option.disabled}
                    className={optionClassName}
                    onMouseEnter={() => {
                      if (!option.disabled) {
                        setHighlightedIndex(index)
                      }
                    }}
                    onClick={() => commitSelection(index)}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
      {renderHintText(id, hintText)}
      {renderErrorCard(id, error)}
    </div>
  )
}

function renderErrorCard(id: string, error?: string) {
  if (!error) {
    return null
  }

  return (
    <div className={errorCardClassName} id={getErrorId(id)} role='alert' aria-live='assertive'>
      <span
        className='mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center'
        aria-hidden='true'
      >
        <svg viewBox='0 0 20 20' fill='currentColor' className='h-4 w-4'>
          <path
            fillRule='evenodd'
            d='M10 2a8 8 0 100 16 8 8 0 000-16zm0 4a1 1 0 00-1 1v4a1 1 0 102 0V7a1 1 0 00-1-1zm0 9a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 15z'
            clipRule='evenodd'
          />
        </svg>
      </span>
      <span>{error}</span>
    </div>
  )
}

export function ValidatorInput(props: ValidatorInputProps) {
  const hasError = Boolean(props.error)
  const labelLayout = props.labelLayout ?? 'between'
  const labelTextClassName = 'label-text font-sans text-sm text-base-content opacity-100'
  const labelClassName =
    labelLayout === 'stacked'
      ? 'label w-full flex flex-col items-start gap-1'
      : 'label w-full justify-between'
  const labelAltClassName =
    labelLayout === 'stacked'
      ? 'label-text-alt text-xs text-base-content opacity-100 mb-2'
      : 'label-text-alt text-xs text-base-content opacity-100 ml-auto'

  if (props.fieldType === 'select') {
    return <SelectField {...props} />
  }

  if (props.fieldType === 'datePicker') {
    return <DesignSystemDatePicker {...props} />
  }

  if (props.fieldType === 'textarea') {
    const {
      id,
      value,
      label,
      labelAlt,
      labelLayout: textAreaLabelLayout,
      autoComplete,
      placeholder,
      inputClassName,
      error,
      hintText,
      required = false,
      onValueChange,
    } = props
    const resolvedLabelClassName = textAreaLabelLayout
      ? textAreaLabelLayout === 'stacked'
        ? 'label w-full flex flex-col items-start gap-1'
        : 'label w-full justify-between'
      : labelClassName
    const resolvedLabelAltClassName = textAreaLabelLayout
      ? textAreaLabelLayout === 'stacked'
        ? 'label-text-alt text-xs text-base-content opacity-100 mb-2'
        : 'label-text-alt text-xs text-base-content opacity-100 ml-auto'
      : labelAltClassName
    const baseTextAreaClassName =
      'textarea w-full bg-white text-base-content opacity-100 min-h-32 outline-none focus:!outline-none focus:!outline-offset-0 focus:ring-1 focus:ring-primary/30'
    const mergedTextAreaClassName = inputClassName
      ? `${baseTextAreaClassName} ${inputClassName}`
      : baseTextAreaClassName

    return (
      <div className='form-control w-full'>
        <label className={resolvedLabelClassName} htmlFor={id}>
          <span className={labelTextClassName}>{label}</span>
          {labelAlt ? <span className={resolvedLabelAltClassName}>{labelAlt}</span> : null}
        </label>
        <textarea
          id={id}
          className={mergedTextAreaClassName}
          style={tokenizedInputStyle(hasError)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={e => onValueChange(e.target.value)}
          aria-invalid={hasError}
          aria-describedby={getDescribedBy(id, hintText, error)}
        />
        {renderHintText(id, hintText)}
        {renderErrorCard(id, error)}
      </div>
    )
  }

  if (props.fieldType === 'upload') {
    const {
      id,
      label,
      labelAlt,
      labelLayout: uploadLabelLayout,
      accept,
      infoLeft,
      infoRight,
      selectedFileName,
      error,
      hintText,
      inputRef,
      onFileChange,
    } = props
    const resolvedLabelClassName = uploadLabelLayout
      ? uploadLabelLayout === 'stacked'
        ? 'label w-full flex flex-col items-start gap-1'
        : 'label w-full justify-between'
      : labelClassName
    const resolvedLabelAltClassName = uploadLabelLayout
      ? uploadLabelLayout === 'stacked'
        ? 'label-text-alt text-xs text-base-content opacity-100 mb-2'
        : 'label-text-alt text-xs text-base-content opacity-100 ml-auto'
      : labelAltClassName

    return (
      <div className='form-control w-full'>
        <label className={resolvedLabelClassName} htmlFor={id}>
          <span className={labelTextClassName}>{label}</span>
          {labelAlt ? <span className={resolvedLabelAltClassName}>{labelAlt}</span> : null}
        </label>
        <input
          id={id}
          type='file'
          className='file-input file-input-primary w-full file-input-theme text-base-content opacity-100'
          accept={accept}
          ref={inputRef}
          onChange={event => onFileChange?.(event.target.files)}
          aria-invalid={Boolean(error)}
          aria-describedby={getDescribedBy(id, hintText, error)}
        />
        {renderHintText(id, hintText)}
        {selectedFileName ? (
          <div className='label w-full'>
            <span className='label-text-alt text-xs text-base-content opacity-100 truncate'>
              Selected: {selectedFileName}
            </span>
          </div>
        ) : null}
        {(infoLeft || infoRight) && (
          <p className='mt-2 text-xs leading-5 text-base-content/70'>
            {[infoLeft, infoRight].filter(Boolean).join('. ')}
          </p>
        )}
        {renderErrorCard(id, error)}
      </div>
    )
  }

  if (props.type === 'date') {
    return (
      <DesignSystemDatePicker
        id={props.id}
        min={props.min}
        placeholder={props.placeholder}
        value={props.value}
        label={props.label}
        labelAlt={props.labelAlt}
        labelPlacement={props.labelPlacement}
        labelLayout={props.labelLayout}
        error={props.error}
        required={props.required}
        hintText={props.hintText}
        triggerClassName={props.inputClassName}
        onValueChange={props.onValueChange}
      />
    )
  }

  const {
    id,
    type,
    min,
    placeholder,
    value,
    label,
    labelAlt,
    labelPlacement = 'inside',
    labelLayout: inputLabelLayout,
    autoComplete,
    icon,
    trailingIcon,
    inputClassName,
    error,
    hintText,
    required = false,
    onValueChange,
  } = props
  const resolvedLabelClassName = inputLabelLayout
    ? inputLabelLayout === 'stacked'
      ? 'label w-full flex flex-col items-start gap-1'
      : 'label w-full justify-between'
    : labelClassName
  const resolvedLabelAltClassName = inputLabelLayout
    ? inputLabelLayout === 'stacked'
      ? 'label-text-alt text-xs text-base-content opacity-100 mb-2'
      : 'label-text-alt text-xs text-base-content opacity-100 ml-auto'
    : labelAltClassName
  const baseInputClassName =
    'flex-1 bg-transparent text-base-content opacity-100 outline-none !outline-none !outline-offset-0 focus:!outline-none focus:!outline-offset-0'
  const isDateInput = type === 'date'
  const dateInputClassName = isDateInput ? 'cursor-pointer' : ''
  const mergedInputClassName = inputClassName
    ? `${baseInputClassName} ${dateInputClassName} ${inputClassName}`.trim()
    : `${baseInputClassName} ${dateInputClassName}`.trim()
  const shouldShowTrailingIcon = Boolean(trailingIcon)
  const shouldShowValidation = props.showValidation ?? true

  return (
    <div className='form-control w-full'>
      {labelPlacement === 'outside' ? (
        <label className={resolvedLabelClassName} htmlFor={id}>
          <span className={labelTextClassName}>{label}</span>
          {labelAlt ? <span className={resolvedLabelAltClassName}>{labelAlt}</span> : null}
        </label>
      ) : null}
      <label
        className={`input w-full bg-white text-base-content opacity-100 relative ${shouldShowValidation ? 'validator' : ''} ${hasError ? '' : 'focus-within:ring-1 focus-within:ring-primary/30'} ${isDateInput ? 'cursor-pointer' : ''}`}
        style={tokenizedInputStyle(hasError)}
      >
        {icon ? icon : null}
        {labelPlacement === 'inside' ? (
          <span className={`${icon ? 'ml-2' : ''} text-base-content opacity-100`}>{label}</span>
        ) : null}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          min={min}
          autoComplete={autoComplete}
          className={mergedInputClassName}
          required={required}
          value={value}
          onChange={e => onValueChange(e.target.value)}
          aria-invalid={hasError}
          aria-describedby={getDescribedBy(id, hintText, error)}
        />
        {shouldShowTrailingIcon ? (
          <span className='ml-2 flex items-center pointer-events-none'>{trailingIcon}</span>
        ) : null}
      </label>
      {renderHintText(id, hintText)}
      {renderErrorCard(id, error)}
    </div>
  )
}
