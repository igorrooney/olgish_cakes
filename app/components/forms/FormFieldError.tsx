type FormFieldErrorProps = {
  className?: string
  id: string
  message?: string
}

export function FormFieldError({
  className = '',
  id,
  message
}: FormFieldErrorProps) {
  if (!message) {
    return null
  }

  return (
    <div
      id={id}
      className={`alert w-full items-start border border-error/30 bg-error/10 px-3 py-2 text-sm text-error ${className}`.trim()}
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
      <span>{message}</span>
    </div>
  )
}
