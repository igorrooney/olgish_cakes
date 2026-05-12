'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent
} from 'react'
import { createPortal } from 'react-dom'

type CalendarPanelPosition = {
  top: number
  left: number
  width: number
  maxHeight: number
}

export type DatePickerLabelPlacement = 'inside' | 'outside'
export type DatePickerLabelLayout = 'between' | 'stacked'

export type DesignSystemDatePickerProps = {
  id: string
  min?: string
  placeholder?: string
  value: string
  label?: string
  labelAlt?: string
  labelPlacement?: DatePickerLabelPlacement
  labelLayout?: DatePickerLabelLayout
  error?: string
  required?: boolean
  hintText?: string
  disabled?: boolean
  formControlClassName?: string
  triggerClassName?: string
  onValueChange: (value: string) => void
}

const calendarWeekdayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

const calendarMonthFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric'
})

const calendarDisplayFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
})

const calendarAriaFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
})

const hintTextClassName = 'mt-2 text-xs leading-5 text-base-content/70'
const errorCardClassName =
  'mt-2 flex items-start gap-2 rounded-md border border-error/30 bg-error/10 px-3 py-2 text-sm text-error'

const cls = (...values: Array<string | false | null | undefined>) =>
  values.filter(Boolean).join(' ')

const tokenizedInputStyle = (hasError: boolean) => ({
  borderRadius: 'var(--d-borderRadius-box)',
  borderWidth: 'var(--d-borderWidth-btn)',
  borderStyle: 'solid',
  borderColor: hasError
    ? 'var(--color-error)'
    : 'color-mix(in srgb, var(--d-color-base-content) calc(var(--u-opacity-stroke-20) * 100%), transparent)'
})

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

function parseDateInputValue(value?: string) {
  if (!value) {
    return null
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

function formatDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

function addMonths(date: Date, months: number) {
  const nextDate = new Date(date)
  nextDate.setMonth(nextDate.getMonth() + months)
  return nextDate
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function getCalendarDates(visibleMonth: Date) {
  const monthStart = getMonthStart(visibleMonth)
  const mondayOffset = (monthStart.getDay() + 6) % 7
  const gridStart = addDays(monthStart, -mondayOffset)

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

function getInitialCalendarDate(value: string, min?: string) {
  return parseDateInputValue(value) ?? parseDateInputValue(min) ?? new Date()
}

function getFocusableDateValue(value: string, min?: string) {
  if (value && (!min || value >= min)) {
    return value
  }

  if (min) {
    return min
  }

  return formatDateInputValue(new Date())
}

function getCalendarPanelPosition(trigger: HTMLButtonElement | null): CalendarPanelPosition | null {
  if (!trigger) {
    return null
  }

  const triggerRect = trigger.getBoundingClientRect()
  const viewportMargin = 16
  const calendarGap = 8
  const estimatedCalendarHeight = 428
  const minimumUsableHeight = 320
  const availableBelow = window.innerHeight - triggerRect.bottom - calendarGap - viewportMargin
  const availableAbove = triggerRect.top - calendarGap - viewportMargin
  const shouldOpenBelow = availableBelow >= minimumUsableHeight || availableBelow >= availableAbove
  const availableHeight = shouldOpenBelow ? availableBelow : availableAbove
  const maxHeight = Math.min(
    estimatedCalendarHeight,
    Math.max(minimumUsableHeight, availableHeight)
  )
  const width = Math.min(triggerRect.width, window.innerWidth - (viewportMargin * 2))
  const left = Math.min(
    Math.max(triggerRect.left, viewportMargin),
    window.innerWidth - width - viewportMargin
  )
  const top = shouldOpenBelow
    ? Math.min(triggerRect.bottom + calendarGap, window.innerHeight - maxHeight - viewportMargin)
    : Math.max(viewportMargin, triggerRect.top - maxHeight - calendarGap)

  return {
    top,
    left,
    width,
    maxHeight
  }
}

function getFirstEnabledDateInMonth(monthDate: Date, min?: string) {
  const monthStart = getMonthStart(monthDate)
  const monthStartValue = formatDateInputValue(monthStart)

  if (!min || monthStartValue >= min) {
    return monthStartValue
  }

  const minDate = parseDateInputValue(min)

  if (
    minDate &&
    minDate.getFullYear() === monthStart.getFullYear() &&
    minDate.getMonth() === monthStart.getMonth()
  ) {
    return min
  }

  return monthStartValue
}

function getDayAriaLabel(date: Date, options: {
  isDisabled: boolean
  isSelected: boolean
  isToday: boolean
}) {
  const formattedDate = calendarAriaFormatter.format(date)

  if (options.isDisabled) {
    return `${formattedDate} is not available`
  }

  return [
    `Select ${formattedDate}`,
    options.isSelected ? 'selected' : null,
    options.isToday ? 'today' : null
  ]
    .filter(Boolean)
    .join(', ')
}

function CalendarIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      className='h-5 w-5'
      aria-hidden='true'
      focusable='false'
    >
      <path
        d='M7 3.5V6M17 3.5V6M4.75 9.25H19.25M6.75 5H17.25C18.3546 5 19.25 5.89543 19.25 7V17.25C19.25 18.3546 18.3546 19.25 17.25 19.25H6.75C5.64543 19.25 4.75 18.3546 4.75 17.25V7C4.75 5.89543 5.64543 5 6.75 5Z'
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function ChevronIcon({ direction }: { direction: 'previous' | 'next' }) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      className='h-4 w-4'
      aria-hidden='true'
      focusable='false'
    >
      <path
        d={direction === 'previous' ? 'M12.5 5L7.5 10L12.5 15' : 'M7.5 5L12.5 10L7.5 15'}
        stroke='currentColor'
        strokeWidth='1.75'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
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

export function DesignSystemDatePicker({
  id,
  min,
  placeholder = 'Select a date',
  value,
  label,
  labelAlt,
  labelPlacement = 'inside',
  labelLayout,
  error,
  required = false,
  hintText,
  disabled = false,
  formControlClassName,
  triggerClassName,
  onValueChange
}: DesignSystemDatePickerProps) {
  const hasError = Boolean(error)
  const [isOpen, setIsOpen] = useState(false)
  const [calendarPosition, setCalendarPosition] = useState<CalendarPanelPosition | null>(null)
  const [visibleMonth, setVisibleMonth] = useState(() => getMonthStart(getInitialCalendarDate(value, min)))
  const [focusedDate, setFocusedDate] = useState(() => getFocusableDateValue(value, min))
  const containerRef = useRef<HTMLDivElement | null>(null)
  const calendarPanelRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const dayButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const selectedDate = parseDateInputValue(value)
  const todayValue = formatDateInputValue(new Date())
  const calendarId = `${id}-calendar`
  const calendarTitleId = `${id}-calendar-title`
  const resolvedLabelClassName =
    labelLayout === 'stacked'
      ? 'label w-full flex flex-col items-start gap-1'
      : 'label w-full justify-between'
  const resolvedLabelAltClassName =
    labelLayout === 'stacked'
      ? 'label-text-alt text-xs text-base-content opacity-100 mb-2'
      : 'label-text-alt text-xs text-base-content opacity-100 ml-auto'
  const displayValue = selectedDate ? calendarDisplayFormatter.format(selectedDate) : placeholder
  const calendarDates = useMemo(() => getCalendarDates(visibleMonth), [visibleMonth])
  const previousMonth = addMonths(visibleMonth, -1)
  const isPreviousMonthDisabled = min
    ? formatDateInputValue(getMonthEnd(previousMonth)) < min
    : false
  const triggerClassNames = cls(
    'input w-full cursor-pointer bg-white text-base-content opacity-100 relative justify-between',
    hasError ? '' : 'focus-visible:ring-1 focus-visible:ring-primary/30',
    disabled ? 'cursor-not-allowed opacity-60' : '',
    triggerClassName
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target
      if (!(target instanceof Node)) {
        return
      }

      if (
        !containerRef.current?.contains(target) &&
        !calendarPanelRef.current?.contains(target)
      ) {
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

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const updateCalendarPosition = () => {
      setCalendarPosition(getCalendarPanelPosition(triggerRef.current))
    }

    window.addEventListener('resize', updateCalendarPosition)
    window.addEventListener('scroll', updateCalendarPosition, true)

    return () => {
      window.removeEventListener('resize', updateCalendarPosition)
      window.removeEventListener('scroll', updateCalendarPosition, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const nextFocusedDate = getFocusableDateValue(value, min)
    const nextFocusedDateParsed = parseDateInputValue(nextFocusedDate)

    setFocusedDate(nextFocusedDate)

    if (nextFocusedDateParsed) {
      setVisibleMonth(getMonthStart(nextFocusedDateParsed))
    }
  }, [isOpen, min, value])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    dayButtonRefs.current[focusedDate]?.focus()
  }, [focusedDate, isOpen, visibleMonth])

  const closeCalendar = () => {
    setIsOpen(false)
  }

  const focusTrigger = () => {
    triggerRef.current?.focus()
  }

  const openCalendar = () => {
    if (disabled) {
      return
    }

    setCalendarPosition(getCalendarPanelPosition(triggerRef.current))
    setIsOpen(true)
  }

  const selectDate = (dateValue: string) => {
    if (min && dateValue < min) {
      return
    }

    onValueChange(dateValue)
    closeCalendar()
    focusTrigger()
  }

  const moveVisibleMonth = (direction: 'previous' | 'next') => {
    const nextMonth = addMonths(visibleMonth, direction === 'previous' ? -1 : 1)
    const nextFocusedDate = getFirstEnabledDateInMonth(nextMonth, min)

    setVisibleMonth(getMonthStart(nextMonth))
    setFocusedDate(nextFocusedDate)
  }

  const moveFocusedDate = (days: number) => {
    const currentDate = parseDateInputValue(focusedDate) ?? getInitialCalendarDate(value, min)
    const nextDate = addDays(currentDate, days)
    const nextDateValue = formatDateInputValue(nextDate)
    const clampedDateValue = min && nextDateValue < min ? min : nextDateValue
    const clampedDate = parseDateInputValue(clampedDateValue)

    setFocusedDate(clampedDateValue)

    if (clampedDate) {
      setVisibleMonth(getMonthStart(clampedDate))
    }
  }

  const handleCalendarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        moveFocusedDate(1)
        return
      case 'ArrowLeft':
        event.preventDefault()
        moveFocusedDate(-1)
        return
      case 'ArrowDown':
        event.preventDefault()
        moveFocusedDate(7)
        return
      case 'ArrowUp':
        event.preventDefault()
        moveFocusedDate(-7)
        return
      case 'Home': {
        event.preventDefault()
        const currentDate = parseDateInputValue(focusedDate) ?? getInitialCalendarDate(value, min)
        moveFocusedDate(-((currentDate.getDay() + 6) % 7))
        return
      }
      case 'End': {
        event.preventDefault()
        const currentDate = parseDateInputValue(focusedDate) ?? getInitialCalendarDate(value, min)
        moveFocusedDate(6 - ((currentDate.getDay() + 6) % 7))
        return
      }
      case 'PageUp':
        event.preventDefault()
        if (!isPreviousMonthDisabled) {
          moveVisibleMonth('previous')
        }
        return
      case 'PageDown':
        event.preventDefault()
        moveVisibleMonth('next')
        return
      case 'Escape':
        event.preventDefault()
        closeCalendar()
        focusTrigger()
        return
      default:
        return
    }
  }

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      openCalendar()
    }
  }

  const calendarPanelStyle: CSSProperties | undefined = calendarPosition
    ? {
        top: calendarPosition.top,
        left: calendarPosition.left,
        width: calendarPosition.width,
        maxHeight: calendarPosition.maxHeight
      }
    : undefined

  return (
    <div className={cls('form-control w-full', formControlClassName)} ref={containerRef}>
      {labelPlacement === 'outside' && label ? (
        <label className={resolvedLabelClassName} htmlFor={id}>
          <span className='label-text font-sans text-sm text-base-content opacity-100'>{label}</span>
          {labelAlt ? <span className={resolvedLabelAltClassName}>{labelAlt}</span> : null}
        </label>
      ) : null}
      <div className='relative'>
        <button
          id={id}
          type='button'
          ref={triggerRef}
          className={triggerClassNames}
          style={tokenizedInputStyle(hasError)}
          disabled={disabled}
          aria-haspopup='dialog'
          aria-expanded={isOpen}
          aria-controls={calendarId}
          aria-invalid={hasError}
          aria-describedby={getDescribedBy(id, hintText, error)}
          aria-required={required}
          data-min-date={min}
          data-value={value}
          onClick={() => {
            if (isOpen) {
              closeCalendar()
              return
            }

            openCalendar()
          }}
          onKeyDown={handleTriggerKeyDown}
        >
          {labelPlacement === 'inside' && label ? (
            <span className='text-base-content opacity-100'>{label}</span>
          ) : null}
          <span
            className={`min-w-0 flex-1 truncate text-left text-sm ${selectedDate ? 'text-base-content' : 'text-base-content/55'}`}
          >
            {displayValue}
          </span>
          <span className='ml-3 flex h-5 w-5 shrink-0 items-center justify-center text-primary-700'>
            <CalendarIcon />
          </span>
        </button>
        {isOpen && calendarPanelStyle && typeof document !== 'undefined' ? createPortal((
          <div
            id={calendarId}
            role='dialog'
            ref={calendarPanelRef}
            aria-modal='false'
            aria-labelledby={calendarTitleId}
            className='fixed z-[10010] overflow-y-auto rounded-box border border-base-300 bg-base-100 p-4 shadow-[0_18px_38px_color-mix(in_srgb,var(--color-primary-800)_16%,transparent)]'
            style={calendarPanelStyle}
          >
            <div className='mb-3 flex items-center justify-between gap-3'>
              <button
                type='button'
                className='btn btn-ghost btn-sm btn-circle text-primary-700'
                aria-label='Previous month'
                disabled={isPreviousMonthDisabled}
                onClick={() => moveVisibleMonth('previous')}
              >
                <ChevronIcon direction='previous' />
              </button>
              <p
                id={calendarTitleId}
                className='m-0 text-center font-oldenburg text-lg leading-6 text-primary-800'
              >
                {calendarMonthFormatter.format(visibleMonth)}
              </p>
              <button
                type='button'
                className='btn btn-ghost btn-sm btn-circle text-primary-700'
                aria-label='Next month'
                onClick={() => moveVisibleMonth('next')}
              >
                <ChevronIcon direction='next' />
              </button>
            </div>
            <div className='grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase leading-5 text-primary-700'>
              {calendarWeekdayLabels.map(dayLabel => (
                <span key={dayLabel}>{dayLabel}</span>
              ))}
            </div>
            <div
              role='grid'
              aria-labelledby={calendarTitleId}
              className='mt-2 grid grid-cols-7 gap-1'
              onKeyDown={handleCalendarKeyDown}
            >
              {calendarDates.map((date) => {
                const dateValue = formatDateInputValue(date)
                const isSelected = dateValue === value
                const isToday = dateValue === todayValue
                const isOutsideMonth = date.getMonth() !== visibleMonth.getMonth()
                const isDisabled = Boolean(min && dateValue < min)
                const dayButtonClassName = [
                  'btn btn-sm h-10 min-h-10 w-full rounded-full border-none px-0 text-sm font-semibold',
                  isSelected
                    ? 'btn-primary text-primary-content shadow-btn'
                    : 'btn-ghost bg-base-100 text-base-content hover:bg-primary-50 hover:text-primary-700',
                  isToday && !isSelected ? 'ring-1 ring-primary/40' : '',
                  isOutsideMonth && !isSelected ? 'text-base-content/45' : '',
                  isDisabled ? 'btn-disabled bg-transparent text-base-content/25 opacity-50' : ''
                ]
                  .filter(Boolean)
                  .join(' ')

                return (
                  <div key={dateValue} role='gridcell' aria-selected={isSelected}>
                    <button
                      type='button'
                      ref={(element) => {
                        dayButtonRefs.current[dateValue] = element
                      }}
                      className={dayButtonClassName}
                      disabled={isDisabled}
                      tabIndex={dateValue === focusedDate ? 0 : -1}
                      aria-label={getDayAriaLabel(date, { isDisabled, isSelected, isToday })}
                      onClick={() => selectDate(dateValue)}
                      onFocus={() => {
                        setFocusedDate(dateValue)
                      }}
                    >
                      {date.getDate()}
                    </button>
                  </div>
                )
              })}
            </div>
            <div className='mt-4 flex items-center justify-between gap-2 border-t border-base-300 pt-3'>
              <button
                type='button'
                className='btn btn-ghost btn-sm rounded-full text-primary-700'
                disabled={!value}
                onClick={() => {
                  onValueChange('')
                  closeCalendar()
                  focusTrigger()
                }}
              >
                Clear
              </button>
              <button
                type='button'
                className='btn btn-primary btn-sm rounded-full'
                disabled={Boolean(min && todayValue < min)}
                onClick={() => selectDate(todayValue)}
              >
                Today
              </button>
            </div>
          </div>
        ), document.body) : null}
      </div>
      {renderHintText(id, hintText)}
      {renderErrorCard(id, error)}
    </div>
  )
}
