import { type ReactNode, type RefObject } from 'react'

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
    : 'color-mix(in srgb, var(--d-color-base-content) calc(var(--u-opacity-stroke-20) * 100%), transparent)'
})

const errorCardClassName =
  'mt-2 flex items-start gap-2 rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error'

function renderErrorCard(id: string, error?: string) {
  if (!error) {
    return null
  }

  return (
    <div
      className={errorCardClassName}
      id={`${id}-error`}
      role='alert'
      aria-live='assertive'
    >
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
    const {
      id,
      value,
      label,
      labelAlt,
      labelLayout: selectLabelLayout,
      selectClassName,
      options,
      error,
      required = false,
      onValueChange
    } = props
    const resolvedLabelClassName = selectLabelLayout
      ? selectLabelLayout === 'stacked'
        ? 'label w-full flex flex-col items-start gap-1'
        : 'label w-full justify-between'
      : labelClassName
    const resolvedLabelAltClassName = selectLabelLayout
      ? selectLabelLayout === 'stacked'
        ? 'label-text-alt text-xs text-base-content opacity-100 mb-2'
        : 'label-text-alt text-xs text-base-content opacity-100 ml-auto'
      : labelAltClassName
    const resolvedSelectClassName = `select w-full bg-white text-base-content opacity-100 focus:!outline-none focus:!outline-offset-0 ${hasError ? '' : 'focus:ring-1 focus:ring-primary/30'} ${selectClassName ?? ''}`.trim()

    return (
      <div className='form-control w-full'>
        <label className={resolvedLabelClassName} htmlFor={id}>
          <span className={labelTextClassName}>
            {label}
          </span>
          {labelAlt ? (
            <span className={resolvedLabelAltClassName}>
              {labelAlt}
            </span>
          ) : null}
        </label>
        <select
          id={id}
          className={resolvedSelectClassName}
          style={tokenizedInputStyle(hasError)}
          value={value}
          required={required}
          onChange={(e) => onValueChange(e.target.value)}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        >
          {options.map((option) => {
            const optionValue = option.value ?? option.label
            const optionKey = optionValue || option.label
            return (
              <option key={optionKey} value={optionValue} disabled={option.disabled}>
                {option.label}
              </option>
            )
          })}
        </select>
        {renderErrorCard(id, error)}
      </div>
    )
  }

  if (props.fieldType === 'textarea') {
    const {
      id,
      value,
      label,
      labelAlt,
      labelLayout: textAreaLabelLayout,
      placeholder,
      inputClassName,
      error,
      required = false,
      onValueChange
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
          <span className={labelTextClassName}>
            {label}
          </span>
          {labelAlt ? (
            <span className={resolvedLabelAltClassName}>
              {labelAlt}
            </span>
          ) : null}
        </label>
        <textarea
          id={id}
          className={mergedTextAreaClassName}
          style={tokenizedInputStyle(hasError)}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
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
      inputRef,
      onFileChange
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
          <span className={labelTextClassName}>
            {label}
          </span>
          {labelAlt ? (
            <span className={resolvedLabelAltClassName}>
              {labelAlt}
            </span>
          ) : null}
        </label>
        <input
          id={id}
          type='file'
          className='file-input file-input-primary w-full file-input-theme text-base-content opacity-100'
          accept={accept}
          ref={inputRef}
          onChange={(event) => onFileChange?.(event.target.files)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {selectedFileName ? (
          <div className='label w-full'>
            <span className='label-text-alt text-xs text-base-content opacity-100 truncate'>
              Selected: {selectedFileName}
            </span>
          </div>
        ) : null}
        {(infoLeft || infoRight) && (
          <div className='label w-full justify-between'>
            <span className='label-text-alt text-xs text-base-content opacity-100'>
              {infoLeft}
            </span>
            <span className='label-text-alt text-xs text-base-content opacity-100'>
              {infoRight}
            </span>
          </div>
        )}
        {renderErrorCard(id, error)}
      </div>
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
    icon,
    trailingIcon,
    inputClassName,
    error,
    required = false,
    onValueChange
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
          <span className={labelTextClassName}>
            {label}
          </span>
          {labelAlt ? (
            <span className={resolvedLabelAltClassName}>
              {labelAlt}
            </span>
          ) : null}
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
          className={mergedInputClassName}
          required={required}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${id}-error` : undefined}
        />
        {shouldShowTrailingIcon ? (
          <span className='ml-2 flex items-center pointer-events-none'>
            {trailingIcon}
          </span>
        ) : null}
      </label>
      {renderErrorCard(id, error)}
    </div>
  )
}
