interface CarouselNavButtonProps {
  ariaControls: string
  ariaLabel: string
  direction: 'previous' | 'next'
  disabled?: boolean
  onClick: () => void
}

const navButtonClassName = 'flex h-8 w-8 items-center justify-center cursor-pointer'

export function CarouselNavButton({
  ariaControls,
  ariaLabel,
  direction,
  disabled = false,
  onClick
}: CarouselNavButtonProps) {
  const transform = direction === 'previous'
    ? 'translate(16, 16) scale(-1, 1) translate(-10, -10)'
    : 'translate(6, 6)'
  const strokeColor = disabled ? '#9CA3AF' : '#2E3192'
  const fillColor = disabled ? '#9CA3AF' : '#2E3192'
  const disabledClasses = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
  const handleClick = () => {
    if (disabled) return
    onClick()
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-disabled={disabled}
      aria-controls={ariaControls}
      disabled={disabled}
      className={`${navButtonClassName} ${disabledClasses}`.trim()}
      onClick={handleClick}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="15.5" stroke={strokeColor} />
        <g transform={transform}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.20938 14.7698C6.92228 14.4713 6.93159 13.9965 7.23017 13.7094L11.1679 10L7.23017 6.29062C6.93159 6.00353 6.92228 5.52875 7.20938 5.23017C7.49647 4.93159 7.97125 4.92228 8.26983 5.20937L12.7698 9.45937C12.9169 9.60078 13 9.79599 13 10C13 10.204 12.9169 10.3992 12.7698 10.5406L8.26983 14.7906C7.97125 15.0777 7.49647 15.0684 7.20938 14.7698Z"
            fill={fillColor}
          />
        </g>
      </svg>
    </button>
  )
}
