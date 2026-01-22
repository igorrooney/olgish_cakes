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

export function ValidatorInput(props: ValidatorInputProps) {
  const hasError = Boolean(props.error)
  const labelLayout = props.labelLayout ?? 'between'
  const labelClassName =
    labelLayout === 'stacked'
      ? 'label w-full flex flex-col items-start gap-1'
      : 'label w-full justify-between'
  const labelAltClassName =
    labelLayout === 'stacked'
      ? 'label-text-alt text-xs text-base-content mb-2'
      : 'label-text-alt text-xs text-base-content ml-auto'

  if (props.fieldType === 'select') {
    const {
      id,
      value,
      label,
      labelAlt,
      labelLayout: selectLabelLayout,
      options,
      error,
      required = false,
      hintText,
      onValueChange
    } = props
    const resolvedLabelClassName = selectLabelLayout
      ? selectLabelLayout === 'stacked'
        ? 'label w-full flex flex-col items-start gap-1'
        : 'label w-full justify-between'
      : labelClassName
    const resolvedLabelAltClassName = selectLabelLayout
      ? selectLabelLayout === 'stacked'
        ? 'label-text-alt text-xs text-base-content mb-2'
        : 'label-text-alt text-xs text-base-content ml-auto'
      : labelAltClassName

    return (
      <div className="form-control w-full">
        <label className={resolvedLabelClassName} htmlFor={id}>
          <span className="label-text font-sans text-sm text-base-content">
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
          className={`select w-full bg-white focus:!outline-none focus:!outline-offset-0 ${hasError ? '' : 'focus:ring-1 focus:ring-primary/30'}`}
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
        <div
          className={`validator-hint text-error ${hasError ? '' : 'hidden'}`}
          id={`${id}-error`}
          role="alert"
        >
          {error || hintText}
        </div>
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
      hintText,
      onValueChange
    } = props
    const resolvedLabelClassName = textAreaLabelLayout
      ? textAreaLabelLayout === 'stacked'
        ? 'label w-full flex flex-col items-start gap-1'
        : 'label w-full justify-between'
      : labelClassName
    const resolvedLabelAltClassName = textAreaLabelLayout
      ? textAreaLabelLayout === 'stacked'
        ? 'label-text-alt text-xs text-base-content mb-2'
        : 'label-text-alt text-xs text-base-content ml-auto'
      : labelAltClassName
    const baseTextAreaClassName =
      'textarea w-full bg-white min-h-32 outline-none focus:!outline-none focus:!outline-offset-0 focus:ring-1 focus:ring-primary/30'
    const mergedTextAreaClassName = inputClassName
      ? `${baseTextAreaClassName} ${inputClassName}`
      : baseTextAreaClassName

    return (
      <div className="form-control w-full">
        <label className={resolvedLabelClassName} htmlFor={id}>
          <span className="label-text font-sans text-sm text-base-content">
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
        <div
          className={`validator-hint text-error ${hasError ? '' : 'hidden'}`}
          id={`${id}-error`}
          role="alert"
        >
          {error || hintText}
        </div>
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
      onFileChange
    } = props
    const resolvedLabelClassName = uploadLabelLayout
      ? uploadLabelLayout === 'stacked'
        ? 'label w-full flex flex-col items-start gap-1'
        : 'label w-full justify-between'
      : labelClassName
    const resolvedLabelAltClassName = uploadLabelLayout
      ? uploadLabelLayout === 'stacked'
        ? 'label-text-alt text-xs text-base-content mb-2'
        : 'label-text-alt text-xs text-base-content ml-auto'
      : labelAltClassName

    return (
      <div className="form-control w-full">
        <label className={resolvedLabelClassName} htmlFor={id}>
          <span className="label-text font-sans text-sm text-base-content">
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
          type="file"
          className="file-input file-input-primary w-full file-input-theme"
          accept={accept}
          ref={inputRef}
          onChange={(event) => onFileChange?.(event.target.files)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {selectedFileName ? (
          <div className="label w-full">
            <span className="label-text-alt text-xs text-base-content truncate">
              Selected: {selectedFileName}
            </span>
          </div>
        ) : null}
        {(infoLeft || infoRight) && (
          <div className="label w-full justify-between">
            <span className="label-text-alt text-xs text-base-content">
              {infoLeft}
            </span>
            <span className="label-text-alt text-xs text-base-content">
              {infoRight}
            </span>
          </div>
        )}
        <div
          className={`validator-hint text-error ${error ? '' : 'hidden'}`}
          id={`${id}-error`}
          role="alert"
        >
          {error || hintText}
        </div>
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
    hintText,
    onValueChange
  } = props
  const resolvedLabelClassName = inputLabelLayout
    ? inputLabelLayout === 'stacked'
      ? 'label w-full flex flex-col items-start gap-1'
      : 'label w-full justify-between'
    : labelClassName
  const resolvedLabelAltClassName = inputLabelLayout
    ? inputLabelLayout === 'stacked'
      ? 'label-text-alt text-xs text-base-content mb-2'
      : 'label-text-alt text-xs text-base-content ml-auto'
    : labelAltClassName
  const baseInputClassName =
    'flex-1 bg-transparent outline-none !outline-none !outline-offset-0 focus:!outline-none focus:!outline-offset-0'
  const mergedInputClassName = inputClassName
    ? `${baseInputClassName} ${inputClassName}`
    : baseInputClassName
  const shouldShowTrailingIcon = Boolean(trailingIcon)
  const shouldShowValidation = props.showValidation ?? true
  const shouldShowDatePlaceholder = type === 'date' && !value && labelPlacement === 'outside'
  const placeholderOffsetClassName = icon ? 'left-9' : 'left-3'

  return (
    <div className="form-control w-full">
      {labelPlacement === 'outside' ? (
        <label className={resolvedLabelClassName} htmlFor={id}>
          <span className="label-text font-sans text-sm text-base-content">
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
        className={`input w-full bg-white relative ${shouldShowValidation ? 'validator' : ''} ${hasError ? '' : 'focus-within:ring-1 focus-within:ring-primary/30'}`}
        style={tokenizedInputStyle(hasError)}
      >
        {icon ? icon : null}
        {shouldShowDatePlaceholder ? (
          <span
            className={`pointer-events-none absolute ${placeholderOffsetClassName} top-1/2 -translate-y-1/2 text-sm font-sans text-base-content opacity-60`}
            aria-hidden="true"
            data-testid="date-placeholder"
          >
            {placeholder}
          </span>
        ) : null}
        {labelPlacement === 'inside' ? (
          <span className={icon ? 'ml-2' : ''}>{label}</span>
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
          <span className="ml-2 flex items-center pointer-events-none">
            {trailingIcon}
          </span>
        ) : null}
      </label>
      <div
        className={`validator-hint text-error ${hasError ? '' : 'hidden'}`}
        id={`${id}-error`}
        role="alert"
      >
        {error || hintText}
      </div>
    </div>
  )
}
