import type {
  ChangeEvent,
  CSSProperties,
  ElementType,
  HTMLAttributes,
  InputHTMLAttributes,
  OptionHTMLAttributes,
  ReactElement,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes
} from 'react'
import React, { Children, cloneElement, isValidElement } from 'react'
import dayjs, { type Dayjs } from 'dayjs'

type DaisyColor = 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
type SxValue = Record<string, unknown>

interface DaisyProps {
  children?: ReactNode
  className?: string
  sx?: SxValue | SxValue[]
  component?: ElementType
  color?: DaisyColor | 'inherit' | string
  variant?: string
  size?: string | number
  [key: string]: unknown
}

const cls = (...values: Array<string | number | false | null | undefined>) =>
  values.filter(Boolean).join(' ')

const StepActiveContext = React.createContext<boolean | null>(null)

const gridSpanClasses: Record<number, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
  4: 'col-span-4',
  5: 'col-span-5',
  6: 'col-span-6',
  7: 'col-span-7',
  8: 'col-span-8',
  9: 'col-span-9',
  10: 'col-span-10',
  11: 'col-span-11',
  12: 'col-span-12'
}

const smGridSpanClasses: Record<number, string> = {
  1: 'sm:col-span-1',
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
  4: 'sm:col-span-4',
  5: 'sm:col-span-5',
  6: 'sm:col-span-6',
  7: 'sm:col-span-7',
  8: 'sm:col-span-8',
  9: 'sm:col-span-9',
  10: 'sm:col-span-10',
  11: 'sm:col-span-11',
  12: 'sm:col-span-12'
}

const mdGridSpanClasses: Record<number, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12'
}

const lgGridSpanClasses: Record<number, string> = {
  1: 'lg:col-span-1',
  2: 'lg:col-span-2',
  3: 'lg:col-span-3',
  4: 'lg:col-span-4',
  5: 'lg:col-span-5',
  6: 'lg:col-span-6',
  7: 'lg:col-span-7',
  8: 'lg:col-span-8',
  9: 'lg:col-span-9',
  10: 'lg:col-span-10',
  11: 'lg:col-span-11',
  12: 'lg:col-span-12'
}

const gridGapClasses: Record<number, string> = {
  0: 'gap-0',
  1: 'gap-1',
  2: 'gap-2',
  3: 'gap-3',
  4: 'gap-4',
  5: 'gap-5',
  6: 'gap-6',
  7: 'gap-7',
  8: 'gap-8'
}

const collectTextParts = (value: ReactNode): string[] => {
  if (value == null || typeof value === 'boolean') return []
  if (typeof value === 'string' || typeof value === 'number') return [String(value)]
  if (Array.isArray(value)) return value.flatMap(collectTextParts)
  if (isValidElement<{ children?: ReactNode }>(value)) return collectTextParts(value.props.children)
  return []
}

const optionText = (value: ReactNode) => collectTextParts(value).join(' ').replace(/\s+/g, ' ').trim()

const hasEmptyOption = (value: ReactNode): boolean => {
  if (Array.isArray(value)) return value.some(hasEmptyOption)
  return isValidElement<{ value?: string | number }>(value) && value.props.value === ''
}

const spacingValue = (value: unknown): string | number | undefined => {
  if (typeof value === 'number') return `${value * 0.25}rem`
  if (typeof value === 'string') return value
  return undefined
}

const paletteValue = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined

  const palette: Record<string, string> = {
    'primary.main': 'hsl(var(--p))',
    'secondary.main': 'hsl(var(--s))',
    'success.main': 'hsl(var(--su))',
    'error.main': 'hsl(var(--er))',
    'warning.main': 'hsl(var(--wa))',
    'info.main': 'hsl(var(--in))',
    primary: 'hsl(var(--p))',
    secondary: 'hsl(var(--s))',
    success: 'hsl(var(--su))',
    error: 'hsl(var(--er))',
    warning: 'hsl(var(--wa))',
    info: 'hsl(var(--in))',
    'text.primary': 'hsl(var(--bc))',
    'text.secondary': 'hsl(var(--bc) / 0.72)',
    'background.paper': 'hsl(var(--b1))',
    'grey.50': 'hsl(var(--b2))',
    'grey.100': 'hsl(var(--b2))',
    'grey.200': 'hsl(var(--b3))',
    'grey.300': 'hsl(var(--b3))'
  }

  return palette[value] ?? value
}

const sxToStyle = (sx?: SxValue | SxValue[], allowArbitraryCss = true): CSSProperties => {
  const entries = Array.isArray(sx) ? sx : sx ? [sx] : []
  const style: CSSProperties = {}

  entries.forEach(item => {
    Object.entries(item).forEach(([key, value]) => {
      if (key.startsWith('&') || key.startsWith('@') || value == null || typeof value === 'object') return

      if (key === 'm') style.margin = spacingValue(value)
      else if (key === 'mt') style.marginTop = spacingValue(value)
      else if (key === 'mr') style.marginRight = spacingValue(value)
      else if (key === 'mb') style.marginBottom = spacingValue(value)
      else if (key === 'ml') style.marginLeft = spacingValue(value)
      else if (key === 'mx') {
        style.marginLeft = spacingValue(value)
        style.marginRight = spacingValue(value)
      } else if (key === 'my') {
        style.marginTop = spacingValue(value)
        style.marginBottom = spacingValue(value)
      } else if (key === 'p') style.padding = spacingValue(value)
      else if (key === 'pt') style.paddingTop = spacingValue(value)
      else if (key === 'pr') style.paddingRight = spacingValue(value)
      else if (key === 'pb') style.paddingBottom = spacingValue(value)
      else if (key === 'pl') style.paddingLeft = spacingValue(value)
      else if (key === 'px') {
        style.paddingLeft = spacingValue(value)
        style.paddingRight = spacingValue(value)
      } else if (key === 'py') {
        style.paddingTop = spacingValue(value)
        style.paddingBottom = spacingValue(value)
      } else if (key === 'bgcolor' || key === 'backgroundColor') style.backgroundColor = paletteValue(value)
      else if (key === 'borderColor') style.borderColor = paletteValue(value)
      else if (key === 'color') style.color = paletteValue(value)
      else if (key === 'boxShadow' && typeof value === 'number') style.boxShadow = `var(--shadow-${value})`
      else if (allowArbitraryCss) (style as Record<string, string | number | undefined>)[key] = value as string | number | undefined
    })
  })

  return style
}

const displayClasses: Record<string, string> = {
  none: 'hidden',
  block: 'block',
  flex: 'flex',
  'inline-flex': 'inline-flex',
  grid: 'grid',
  inline: 'inline',
  'inline-block': 'inline-block'
}

const responsiveDisplayClasses: Record<string, Record<string, string>> = {
  xs: displayClasses,
  sm: {
    none: 'sm:hidden',
    block: 'sm:block',
    flex: 'sm:flex',
    'inline-flex': 'sm:inline-flex',
    grid: 'sm:grid',
    inline: 'sm:inline',
    'inline-block': 'sm:inline-block'
  },
  md: {
    none: 'md:hidden',
    block: 'md:block',
    flex: 'md:flex',
    'inline-flex': 'md:inline-flex',
    grid: 'md:grid',
    inline: 'md:inline',
    'inline-block': 'md:inline-block'
  },
  lg: {
    none: 'lg:hidden',
    block: 'lg:block',
    flex: 'lg:flex',
    'inline-flex': 'lg:inline-flex',
    grid: 'lg:grid',
    inline: 'lg:inline',
    'inline-block': 'lg:inline-block'
  },
  xl: {
    none: 'xl:hidden',
    block: 'xl:block',
    flex: 'xl:flex',
    'inline-flex': 'xl:inline-flex',
    grid: 'xl:grid',
    inline: 'xl:inline',
    'inline-block': 'xl:inline-block'
  }
}

const sxToClassName = (sx?: SxValue | SxValue[]): string => {
  const entries = Array.isArray(sx) ? sx : sx ? [sx] : []
  const classNames: string[] = []

  entries.forEach(item => {
    Object.entries(item).forEach(([key, value]) => {
      if (key !== 'display') return

      if (typeof value === 'string') {
        const className = displayClasses[value]
        if (className) classNames.push(className)
        return
      }

      if (!value || typeof value !== 'object' || Array.isArray(value)) return

      Object.entries(value as Record<string, unknown>).forEach(([breakpoint, displayValue]) => {
        if (typeof displayValue !== 'string') return
        const className = responsiveDisplayClasses[breakpoint]?.[displayValue]
        if (className) classNames.push(className)
      })
    })
  })

  return cls(...classNames)
}

const splitProps = <T extends DaisyProps>(props: T) => {
  const { sx, component, className, color, variant, size, children, ...rest } = props
  const layoutStyle = sxToStyle(rest as SxValue, false)
  const layoutClassName = sxToClassName(rest as SxValue)
  const sxClassName = sxToClassName(sx)
  const blockedProps = [
    'display',
    'flexDirection',
    'alignItems',
    'justifyContent',
    'minHeight',
    'gap',
    'm',
    'mt',
    'mr',
    'mb',
    'ml',
    'mx',
    'my',
    'p',
    'pt',
    'pr',
    'pb',
    'pl',
    'px',
    'py',
    'bgcolor'
  ]
  blockedProps.forEach(prop => {
    delete (rest as Record<string, unknown>)[prop]
  })
  return {
    rest: rest as Record<string, unknown>,
    style: { ...layoutStyle, ...sxToStyle(sx) },
    component,
    className: cls(layoutClassName, sxClassName, className),
    color,
    variant,
    size,
    children
  }
}

export function Box(props: DaisyProps & HTMLAttributes<HTMLElement>) {
  const { rest, style, component: Component = 'div', className, children } = splitProps(props)
  return <Component className={className} style={{ ...(rest.style as CSSProperties), ...style }} {...rest}>{children}</Component>
}

export function Container(props: DaisyProps & HTMLAttributes<HTMLElement> & { maxWidth?: string | false }) {
  const { rest, style, component: Component = 'div', className, children } = splitProps(props)
  return <Component className={cls('mx-auto w-full px-4', props.maxWidth !== false && 'max-w-6xl', className)} style={{ ...(rest.style as CSSProperties), ...style }} {...rest}>{children}</Component>
}

export function Typography(props: DaisyProps & HTMLAttributes<HTMLElement> & {
  variant?: string
  gutterBottom?: boolean
  align?: CSSProperties['textAlign']
  fontWeight?: CSSProperties['fontWeight']
}) {
  const { children, gutterBottom, align, fontWeight } = props
  const { rest, style, component, className, color, variant } = splitProps(props)
  delete rest.gutterBottom
  delete rest.align
  delete rest.fontWeight
  const tag = component ?? (variant?.startsWith('h') ? variant : 'p')
  const variantClass = variant === 'h1' ? 'text-4xl font-bold' :
    variant === 'h2' ? 'text-3xl font-semibold' :
      variant === 'h3' ? 'text-2xl font-semibold' :
        variant === 'h4' ? 'text-xl font-semibold' :
          variant === 'h5' ? 'text-lg font-semibold' :
            variant === 'h6' || variant === 'subtitle1' ? 'font-semibold' :
              variant === 'caption' ? 'text-xs' :
                variant === 'body2' ? 'text-sm opacity-80' : ''

  return React.createElement(tag, {
    ...rest,
    className: cls(variantClass, gutterBottom && 'mb-2', className),
    style: { ...(rest.style as CSSProperties), color: style.color ?? paletteValue(color), ...style, textAlign: align, fontWeight }
  }, children)
}

export function Button(props: DaisyProps & HTMLAttributes<HTMLButtonElement> & {
  disabled?: boolean
  fullWidth?: boolean
  href?: string
  type?: 'button' | 'submit' | 'reset'
  startIcon?: ReactNode
  endIcon?: ReactNode
}) {
  const { children, startIcon, endIcon, href, type = 'button', disabled, fullWidth } = props
  const { rest, style, component, className, color, variant, size } = splitProps(props)
  delete rest.fullWidth
  delete rest.startIcon
  delete rest.endIcon
  delete rest.href
  const Component = component ?? (href ? 'a' : 'button')
  const colorClass = color === 'error' ? 'btn-error' :
    color === 'success' ? 'btn-success' :
      color === 'warning' ? 'btn-warning' :
        color === 'secondary' ? 'btn-secondary' :
          color === 'info' ? 'btn-info' : 'btn-primary'
  const variantClass = variant === 'outlined' ? 'btn-outline' :
    variant === 'text' ? 'btn-ghost' : colorClass

  return <Component className={cls('btn', variantClass, fullWidth && 'w-full', size === 'small' && 'btn-sm', className)} disabled={disabled} href={href} type={Component === 'button' ? type : undefined} style={{ ...(rest.style as CSSProperties), ...style }} {...rest}>
    {startIcon && <span className='inline-flex'>{startIcon}</span>}
    {children}
    {endIcon && <span className='inline-flex'>{endIcon}</span>}
  </Component>
}

export function Card(props: DaisyProps & HTMLAttributes<HTMLElement>) {
  const { rest, style, component: Component = 'div', className, children } = splitProps(props)
  return <Component className={cls('card bg-base-100 shadow-sm border border-base-300', className)} style={{ ...(rest.style as CSSProperties), ...style }} {...rest}>{children}</Component>
}

export function CardContent(props: DaisyProps & HTMLAttributes<HTMLDivElement>) {
  const { rest, style, className, children } = splitProps(props)
  return <div className={cls('card-body', className)} style={{ ...(rest.style as CSSProperties), ...style }} {...rest}>{children}</div>
}

export function CardMedia(props: DaisyProps & HTMLAttributes<HTMLElement> & { image?: string; alt?: string }) {
  const { rest, style, component: Component = 'div', className, children } = splitProps(props)
  if (Component === 'img') {
    return <img src={props.image} alt={props.alt ?? ''} className={className} style={{ ...(rest.style as CSSProperties), ...style }} {...rest} />
  }
  return <Component className={className} style={{ ...(rest.style as CSSProperties), backgroundImage: props.image ? `url(${props.image})` : undefined, ...style }} {...rest}>{children}</Component>
}

export function Paper(props: DaisyProps & HTMLAttributes<HTMLDivElement>) {
  return <Card {...props} className={cls('p-4', props.className)} />
}

export function Grid(props: DaisyProps & HTMLAttributes<HTMLDivElement> & {
  container?: boolean
  item?: boolean
  spacing?: number | string
  xs?: number
  sm?: number
  md?: number
  lg?: number
}) {
  const { rest, style, className, children } = splitProps(props)
  delete rest.container
  delete rest.item
  delete rest.spacing
  delete rest.xs
  delete rest.sm
  delete rest.md
  delete rest.lg
  const widthClass = props.item ? 'w-full' : ''
  const gapClass = typeof props.spacing === 'number'
    ? gridGapClasses[Math.max(0, Math.min(props.spacing, 8))]
    : undefined
  const spanClasses = props.item
    ? [
        typeof props.xs === 'number' ? gridSpanClasses[props.xs] : undefined,
        typeof props.sm === 'number' ? smGridSpanClasses[props.sm] : undefined,
        typeof props.md === 'number' ? mdGridSpanClasses[props.md] : undefined,
        typeof props.lg === 'number' ? lgGridSpanClasses[props.lg] : undefined
      ]
    : []

  return <div className={cls(props.container && 'grid grid-cols-12', gapClass, ...spanClasses, widthClass, className)} style={{ ...(rest.style as CSSProperties), ...style }} {...rest}>{children}</div>
}

export function Chip(props: DaisyProps & HTMLAttributes<HTMLSpanElement> & { label?: ReactNode }) {
  const { rest, style, className, color } = splitProps(props)
  const colorClass = color === 'success' ? 'badge-success' : color === 'error' ? 'badge-error' : color === 'warning' ? 'badge-warning' : color === 'secondary' ? 'badge-secondary' : 'badge-primary'
  return <span className={cls('badge', colorClass, className)} style={{ ...(rest.style as CSSProperties), ...style }} {...rest}>{props.label ?? props.children}</span>
}

export function Alert(props: DaisyProps & HTMLAttributes<HTMLDivElement> & { severity?: DaisyColor; onClose?: () => void }) {
  const { rest, style, className } = splitProps(props)
  const severity = props.severity ?? 'info'
  const alertClass = severity === 'error' ? 'alert-error' : severity === 'success' ? 'alert-success' : severity === 'warning' ? 'alert-warning' : 'alert-info'
  return <div role='alert' className={cls('alert', alertClass, className)} style={{ ...(rest.style as CSSProperties), ...style }} {...rest}>
    <span>{props.children}</span>
    {props.onClose && <button type='button' className='btn btn-ghost btn-xs' onClick={props.onClose}>x</button>}
  </div>
}

export function AlertTitle(props: DaisyProps & HTMLAttributes<HTMLDivElement>) {
  return <strong {...props}>{props.children}</strong>
}

export function CircularProgress(props: DaisyProps & HTMLAttributes<HTMLSpanElement>) {
  return <span className={cls('loading loading-spinner', props.className)} aria-label='Loading' />
}

export function IconButton(props: DaisyProps & HTMLAttributes<HTMLButtonElement> & { disabled?: boolean, href?: string }) {
  const { rest, style, className, children } = splitProps(props)
  const Component = props.component ?? (props.href ? 'a' : 'button')
  delete rest.component

  if (Component === 'button') {
    delete rest.href
  }

  return React.createElement(Component, {
    type: Component === 'button' ? 'button' : undefined,
    className: cls('btn btn-ghost btn-square btn-sm', className),
    style: { ...(rest.style as CSSProperties), ...style },
    ...rest
  }, children)
}

export function Tooltip(props: DaisyProps & { title?: ReactNode }) {
  return <span className={props.className} title={typeof props.title === 'string' ? props.title : undefined}>{props.children}</span>
}

export function Divider(props: DaisyProps & HTMLAttributes<HTMLHRElement>) {
  const { rest, style, className } = splitProps(props)
  return <hr className={cls('border-base-300', className)} style={{ ...(rest.style as CSSProperties), ...style }} {...rest} />
}

export function FormControl(props: DaisyProps & HTMLAttributes<HTMLDivElement>) {
  return <div className={cls('form-control w-full', props.className)} style={sxToStyle(props.sx)}>{props.children}</div>
}

export function InputLabel(props: DaisyProps & HTMLAttributes<HTMLLabelElement>) {
  return <label className={cls('label', props.className)}><span className='label-text'>{props.children}</span></label>
}

export function MenuItem(props: DaisyProps & OptionHTMLAttributes<HTMLOptionElement> & { value?: string | number }) {
  const { rest, style, className, children } = splitProps(props)
  return (
    <option
      className={className}
      style={{ ...(rest.style as CSSProperties), ...style }}
      {...rest}
    >
      {optionText(children)}
    </option>
  )
}

export function Select(props: DaisyProps & SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  const { rest, style, className, children } = splitProps(props)
  delete rest.label
  const options = Children.map(children, child => child)

  return (
    <select
      className={cls('select select-bordered w-full', className)}
      style={{ ...(rest.style as CSSProperties), ...style }}
      aria-label={props.label}
      {...rest}
    >
      {props.label && !hasEmptyOption(children) ? <option value='' disabled>{props.label}</option> : null}
      {options}
    </select>
  )
}

export function TextField(props: DaisyProps & InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  helperText?: ReactNode
  multiline?: boolean
  rows?: number
  fullWidth?: boolean
  inputProps?: InputHTMLAttributes<HTMLInputElement>
  InputProps?: {
    readOnly?: boolean
    [key: string]: unknown
  }
}) {
  const { rest, style, className } = splitProps(props)
  const inputProps = props.inputProps ?? {}
  const inputComponentProps = props.InputProps ?? {}

  delete rest.label
  delete rest.helperText
  delete rest.multiline
  delete rest.rows
  delete rest.fullWidth
  delete rest.inputProps
  delete rest.InputProps
  delete rest.margin
  delete rest.variant

  return <label className={cls('form-control', props.fullWidth && 'w-full')}>
    {props.label && <span className='label'><span className='label-text'>{props.label}</span></span>}
    {props.multiline
      ? <textarea
        {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        className={cls('textarea textarea-bordered', props.fullWidth && 'w-full', className)}
        value={props.value as string | number | readonly string[] | undefined}
        onChange={props.onChange as React.ChangeEventHandler<HTMLTextAreaElement> | undefined}
        required={props.required}
        placeholder={props.placeholder ?? props.label}
        disabled={props.disabled}
        name={props.name}
        id={props.id}
        rows={props.rows}
        readOnly={Boolean(inputComponentProps.readOnly || props.readOnly)}
        style={{ ...(rest.style as CSSProperties), ...style }}
      />
      : <input
        {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        {...inputProps}
        className={cls('input input-bordered', props.fullWidth && 'w-full', className, inputProps.className)}
        value={props.value}
        onChange={props.onChange}
        required={props.required}
        placeholder={props.placeholder ?? props.label}
        disabled={props.disabled}
        min={inputProps.min ?? props.min}
        max={inputProps.max ?? props.max}
        step={inputProps.step ?? props.step}
        name={props.name}
        id={props.id}
        type={props.type ?? 'text'}
        readOnly={Boolean(inputComponentProps.readOnly || props.readOnly)}
        style={{ ...(rest.style as CSSProperties), ...style, ...(inputProps.style as CSSProperties) }}
      />}
    {props.helperText && <span className='label'><span className='label-text-alt'>{props.helperText}</span></span>}
  </label>
}

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} type='checkbox' className={cls('checkbox checkbox-primary', props.className)} />
}

export function FormControlLabel(props: { control: ReactElement; label: ReactNode }) {
  return <label className='label cursor-pointer justify-start gap-2'>
    {props.control}
    <span className='label-text'>{props.label}</span>
  </label>
}

export function Snackbar(props: DaisyProps & {
  open?: boolean
  onClose?: (event?: Event | React.SyntheticEvent, reason?: string) => void
  autoHideDuration?: number
  anchorOrigin?: unknown
}) {
  const { open, onClose, autoHideDuration, children } = props

  React.useEffect(() => {
    if (!open || !onClose || typeof autoHideDuration !== 'number' || autoHideDuration <= 0) {
      return undefined
    }

    const timeout = window.setTimeout(() => {
      onClose(undefined, 'timeout')
    }, autoHideDuration)

    return () => {
      window.clearTimeout(timeout)
    }
  }, [open, onClose, autoHideDuration])

  if (!open) return null
  return <div className='toast toast-top toast-center z-50'>{children}</div>
}

export function Stack(props: DaisyProps & HTMLAttributes<HTMLDivElement> & { direction?: string | Record<string, string>; spacing?: number | string }) {
  const direction = typeof props.direction === 'string' ? props.direction : 'column'
  const gapClass = typeof props.spacing === 'number' ? `gap-${Math.min(props.spacing, 8)}` : undefined
  return <div className={cls(direction === 'row' ? 'flex flex-row' : 'flex flex-col', gapClass, props.className)} style={sxToStyle(props.sx)}>{props.children}</div>
}

export function Dialog(props: DaisyProps & { open?: boolean; onClose?: () => void; fullWidth?: boolean; maxWidth?: string }) {
  if (!props.open) return null
  const maxWidthClass = props.maxWidth === 'sm' ? '!max-w-lg' :
    props.maxWidth === 'md' ? '!max-w-3xl' :
      props.maxWidth === 'lg' ? '!max-w-5xl' :
        props.maxWidth === 'xl' ? '!max-w-6xl' : '!max-w-3xl'
  const maxWidthValue = props.maxWidth === 'sm' ? '32rem' :
    props.maxWidth === 'md' ? '48rem' :
      props.maxWidth === 'lg' ? '64rem' :
        props.maxWidth === 'xl' ? '72rem' : '48rem'

  return <div className='modal modal-open' role='dialog' aria-modal='true'>
    <div
      className={cls('modal-box flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden p-0', props.fullWidth ? 'w-11/12' : 'w-11/12 sm:w-auto', maxWidthClass, props.className)}
      style={{
        width: props.fullWidth ? 'calc(100vw - 2rem)' : undefined,
        maxWidth: maxWidthValue,
        ...(props.style as CSSProperties)
      }}
    >
      {props.children}
    </div>
    <button className='modal-backdrop' type='button' aria-label='Close dialog' onClick={props.onClose}>close</button>
  </div>
}

export function DialogTitle(props: DaisyProps & HTMLAttributes<HTMLHeadingElement>) {
  const { rest, style, className, children } = splitProps(props)
  return <h2 className={cls('border-b border-base-300 px-5 py-4 text-xl font-semibold sm:px-6', className)} style={{ ...(rest.style as CSSProperties), ...style }} {...rest}>{children}</h2>
}

export function DialogContent(props: DaisyProps & HTMLAttributes<HTMLDivElement>) {
  const { rest, style, className, children } = splitProps(props)
  return <div className={cls('flex-1 overflow-y-auto px-5 py-4 sm:px-6', className)} style={{ ...(rest.style as CSSProperties), ...style }} {...rest}>{children}</div>
}

export function DialogActions(props: DaisyProps & HTMLAttributes<HTMLDivElement>) {
  const { rest, style, className, children } = splitProps(props)
  return <div className={cls('modal-action mt-0 border-t border-base-300 bg-base-100 px-5 py-4 sm:px-6', className)} style={{ ...(rest.style as CSSProperties), ...style }} {...rest}>{children}</div>
}

export function Modal(props: DaisyProps & { open?: boolean; onClose?: () => void }) {
  return <Dialog open={props.open} onClose={props.onClose}>{props.children}</Dialog>
}

export const List = (props: DaisyProps & HTMLAttributes<HTMLUListElement>) => <ul className={cls('menu bg-base-100 rounded-box', props.className)}>{props.children}</ul>
export const ListItem = (props: DaisyProps & HTMLAttributes<HTMLLIElement>) => <li className={props.className}>{props.children}</li>
export const ListItemIcon = (props: DaisyProps) => <span className='mr-2 inline-flex'>{props.children}</span>
export const ListItemAvatar = ListItemIcon
export const ListItemText = (props: { primary?: ReactNode; secondary?: ReactNode }) => <span><span className='block'>{props.primary}</span>{props.secondary && <span className='block text-sm opacity-70'>{props.secondary}</span>}</span>
export const ListItemSecondaryAction = (props: DaisyProps) => <span className='ml-auto'>{props.children}</span>
export const ListItemButton = (props: DaisyProps & HTMLAttributes<HTMLButtonElement>) => <button type='button' className='flex w-full items-center gap-2 p-2 text-left'>{props.children}</button>
export const Avatar = (props: DaisyProps & { src?: string; alt?: string }) => <div className='avatar'><div className='w-10 rounded-full'>{props.src ? <img src={props.src} alt={props.alt ?? ''} /> : props.children}</div></div>
export const Rating = (props: DaisyProps & { value?: number; readOnly?: boolean }) => <span aria-label={`${props.value ?? 0} stars`} className={props.className}>{'*'.repeat(Math.round(props.value ?? 0))}</span>
export const Skeleton = (props: DaisyProps) => <div className={cls('skeleton', props.className)} style={sxToStyle(props.sx)} />
export const Collapse = (props: DaisyProps & { in?: boolean }) => props.in === false ? null : <>{props.children}</>
export const Drawer = (props: DaisyProps) => <div className={props.className}>{props.children}</div>
export const AppBar = (props: DaisyProps) => <div className={cls('navbar bg-base-100 shadow-sm', props.className)}>{props.children}</div>
export const Toolbar = (props: DaisyProps) => <div className={cls('flex items-center gap-2', props.className)}>{props.children}</div>
export const Accordion = (props: DaisyProps) => <div className={cls('collapse collapse-arrow bg-base-200', props.className)}>{props.children}</div>
export const AccordionSummary = (props: DaisyProps) => <div className='collapse-title'>{props.children}</div>
export const AccordionDetails = (props: DaisyProps) => <div className='collapse-content'>{props.children}</div>

export const Stepper = (props: DaisyProps & { activeStep?: number }) => {
  const activeStep = props.activeStep ?? 0

  return <div className='space-y-4'>{Children.map(props.children, (child, index) => isValidElement(child) ? cloneElement(child, { active: index === activeStep } as { active: boolean }) : child)}</div>
}
export const Step = (props: DaisyProps & { active?: boolean }) => <StepActiveContext.Provider value={Boolean(props.active)}><section className={cls('border-l-2 pl-4', props.active ? 'border-primary' : 'border-base-300')}>{props.children}</section></StepActiveContext.Provider>
export const StepLabel = (props: DaisyProps & { StepIconComponent?: ElementType }) => <div className='flex items-center gap-3'>{props.StepIconComponent && <props.StepIconComponent />}<div>{props.children}</div></div>
export const StepContent = (props: DaisyProps) => {
  const active = React.useContext(StepActiveContext)

  if (active === false) return null

  return <div className='mt-3'>{props.children}</div>
}

export function Breadcrumbs(props: DaisyProps & HTMLAttributes<HTMLElement> & { separator?: ReactNode }) {
  const { rest, style, className, children } = splitProps(props)
  const separator = props.separator ?? '/'

  delete rest.separator

  const items = Children.toArray(children)

  return (
    <nav
      {...rest}
      className={cls('text-sm', className)}
      style={{ ...(rest.style as CSSProperties), ...style }}
    >
      <ol className='flex flex-wrap items-center gap-1'>
        {items.map((child, index) => (
          <li key={index}>
            {child}
            {index < items.length - 1 ? <span className='mx-1 opacity-60'>{separator}</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function Link(props: DaisyProps & HTMLAttributes<HTMLAnchorElement> & { href?: string }) {
  const { rest, style, className, children } = splitProps(props)

  return (
    <a
      {...rest}
      href={props.href}
      className={cls('link link-hover', className)}
      style={{ ...(rest.style as CSSProperties), ...style }}
    >
      {children}
    </a>
  )
}

export const TableContainer = (props: DaisyProps) => <div className={cls('overflow-x-auto', props.className)} style={sxToStyle(props.sx)}>{props.children}</div>
export const Table = (props: DaisyProps) => <table className={cls('table', props.className)}>{props.children}</table>
export const TableHead = (props: DaisyProps) => <thead>{props.children}</thead>
export const TableBody = (props: DaisyProps) => <tbody>{props.children}</tbody>
export const TableRow = (props: DaisyProps & HTMLAttributes<HTMLTableRowElement>) => <tr className={props.className}>{props.children}</tr>
export const TableCell = (props: DaisyProps & HTMLAttributes<HTMLTableCellElement> & { align?: CSSProperties['textAlign'] }) => <td className={props.className} style={{ textAlign: props.align, ...sxToStyle(props.sx) }}>{props.children}</td>
export const TableSortLabel = (props: DaisyProps & { active?: boolean; direction?: string; onClick?: () => void }) => <button type='button' className='btn btn-ghost btn-xs' onClick={props.onClick}>{props.children}{props.active ? props.direction === 'desc' ? ' v' : ' ^' : ''}</button>
export function TablePagination(props: {
  count: number
  page: number
  rowsPerPage: number
  onPageChange?: (event: unknown, page: number) => void
  onRowsPerPageChange?: (event: ChangeEvent<HTMLInputElement>) => void
  labelDisplayedRows?: (pagination: { from: number; to: number; count: number; page: number }) => string
  rowsPerPageOptions?: number[]
  component?: string
  labelRowsPerPage?: string
}) {
  const totalPages = Math.max(1, Math.ceil(props.count / props.rowsPerPage))
  const from = props.count === 0 ? 0 : props.page * props.rowsPerPage + 1
  const to = Math.min(props.count, (props.page + 1) * props.rowsPerPage)
  const rowsPerPageOptions = props.rowsPerPageOptions ?? []

  return <div className='flex flex-wrap items-center justify-end gap-3 p-2'>
    {rowsPerPageOptions.length > 0 && props.onRowsPerPageChange ? (
      <label className='flex items-center gap-2 text-sm'>
        <span>{props.labelRowsPerPage ?? 'Rows per page:'}</span>
        <select
          className='select select-bordered select-sm w-20'
          value={props.rowsPerPage}
          onChange={event => props.onRowsPerPageChange?.(event as unknown as ChangeEvent<HTMLInputElement>)}
        >
          {rowsPerPageOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </label>
    ) : null}
    <button className='btn btn-sm' disabled={props.page <= 0} onClick={event => props.onPageChange?.(event, props.page - 1)}>Previous</button>
    <span className='text-sm'>{props.labelDisplayedRows ? props.labelDisplayedRows({ from, to, count: props.count, page: props.page }) : `Page ${props.page + 1} of ${totalPages}`}</span>
    <button className='btn btn-sm' disabled={props.page >= totalPages - 1} onClick={event => props.onPageChange?.(event, props.page + 1)}>Next</button>
  </div>
}

export function DatePicker(props: {
  label?: string
  value?: Dayjs | null
  onChange?: (value: Dayjs | null) => void
  slotProps?: { textField?: { fullWidth?: boolean; required?: boolean; placeholder?: string; sx?: SxValue; [key: string]: unknown } }
  format?: string
  disablePast?: boolean
  [key: string]: unknown
}) {
  const textFieldProps = props.slotProps?.textField

  return <TextField
    label={props.label}
    type='date'
    disabled={Boolean(props.disabled)}
    fullWidth={textFieldProps?.fullWidth}
    min={props.disablePast ? dayjs().format('YYYY-MM-DD') : undefined}
    placeholder={textFieldProps?.placeholder}
    required={textFieldProps?.required}
    sx={textFieldProps?.sx}
    value={props.value ? props.value.format('YYYY-MM-DD') : ''}
    onChange={event => props.onChange?.(event.currentTarget.value ? dayjs(event.currentTarget.value) : null)}
  />
}

export function LocalizationProvider(props: DaisyProps) {
  return <>{props.children}</>
}

export const AdapterDayjs = {}

export type SelectChangeEvent<T = string> = ChangeEvent<HTMLSelectElement> & {
  target: EventTarget & HTMLSelectElement & { value: T }
}
export type Theme = Record<string, unknown>

export const useTheme = () => ({ breakpoints: { up: () => '' } })
export const useMediaQuery = () => false
export const ThemeProvider = (props: DaisyProps) => <>{props.children}</>
export const CssBaseline = () => null

function IconBase(props: DaisyProps & { label?: string }) {
  return <span aria-hidden='true' className={cls('inline-flex h-[1em] w-[1em] items-center justify-center leading-none', props.className)} style={sxToStyle(props.sx)}>{props.label ?? '.'}</span>
}

export const ArrowBackIcon = (props: DaisyProps) => <IconBase {...props} label='<' />
export const ArrowForwardIcon = (props: DaisyProps) => <IconBase {...props} label='>' />
export const CloseIcon = (props: DaisyProps) => <IconBase {...props} label='x' />
export const Close = CloseIcon
export const KeyboardArrowDownIcon = (props: DaisyProps) => <IconBase {...props} label='v' />
export const MenuIcon = (props: DaisyProps) => <IconBase {...props} label='menu' />
export const ExpandMoreIcon = KeyboardArrowDownIcon
export const CloudUploadIcon = (props: DaisyProps) => <IconBase {...props} label='upload' />
export const CloudUpload = CloudUploadIcon
export const DeleteIcon = (props: DaisyProps) => <IconBase {...props} label='x' />
export const InstagramIcon = (props: DaisyProps) => <IconBase {...props} label='ig' />
export const FacebookIcon = (props: DaisyProps) => <IconBase {...props} label='f' />
export const YouTubeIcon = (props: DaisyProps) => <IconBase {...props} label='play' />
export const GoogleIcon = (props: DaisyProps) => <IconBase {...props} label='G' />
export const CakeOutlinedIcon = (props: DaisyProps) => <IconBase {...props} label='cake' />
export const CakeIcon = CakeOutlinedIcon
export const ZoomInIcon = (props: DaisyProps) => <IconBase {...props} label='+' />
export const PhoneIcon = (props: DaisyProps) => <IconBase {...props} label='tel' />
export const EmailIcon = (props: DaisyProps) => <IconBase {...props} label='@' />
export const WhatsAppIcon = (props: DaisyProps) => <IconBase {...props} label='wa' />
export const CheckCircleIcon = (props: DaisyProps) => <IconBase {...props} label='ok' />
export const LocalShippingIcon = (props: DaisyProps) => <IconBase {...props} label='ship' />
export const PaymentIcon = (props: DaisyProps) => <IconBase {...props} label='GBP' />
export const SettingsIcon = (props: DaisyProps) => <IconBase {...props} label='set' />
export const RefreshIcon = (props: DaisyProps) => <IconBase {...props} label='ref' />
export const ClearIcon = CloseIcon
export const StarIcon = (props: DaisyProps) => <IconBase {...props} label='*' />
export const FavoriteIcon = (props: DaisyProps) => <IconBase {...props} label='fav' />
export const CelebrationIcon = (props: DaisyProps) => <IconBase {...props} label='celebrate' />
export const VerifiedIcon = CheckCircleIcon
export const LocationOnIcon = (props: DaisyProps) => <IconBase {...props} label='loc' />
export const DesignServicesIcon = (props: DaisyProps) => <IconBase {...props} label='edit' />
export const ScheduleIcon = (props: DaisyProps) => <IconBase {...props} label='time' />
export const EmojiEventsIcon = (props: DaisyProps) => <IconBase {...props} label='award' />
export const SchoolIcon = (props: DaisyProps) => <IconBase {...props} label='learn' />
export const InfoIcon = (props: DaisyProps) => <IconBase {...props} label='i' />
export const SecurityIcon = (props: DaisyProps) => <IconBase {...props} label='sec' />
export const ErrorIcon = (props: DaisyProps) => <IconBase {...props} label='!' />
export const ShoppingCartIcon = (props: DaisyProps) => <IconBase {...props} label='cart' />
export const CalendarTodayIcon = (props: DaisyProps) => <IconBase {...props} label='date' />
export const AccessTimeIcon = ScheduleIcon
export const LocalOfferIcon = (props: DaisyProps) => <IconBase {...props} label='%' />
export const EventIcon = CalendarTodayIcon
export const KitchenIcon = (props: DaisyProps) => <IconBase {...props} label='kit' />
export const LocalDiningIcon = (props: DaisyProps) => <IconBase {...props} label='eat' />
export const OpacityIcon = (props: DaisyProps) => <IconBase {...props} label='drop' />

export const Add = (props: DaisyProps) => <IconBase {...props} label='+' />
export const AddIcon = Add
export const Remove = (props: DaisyProps) => <IconBase {...props} label='-' />
export const RemoveIcon = Remove
export const Cancel = CloseIcon
export const Edit = (props: DaisyProps) => <IconBase {...props} label='edit' />
export const Image = (props: DaisyProps) => <IconBase {...props} label='img' />
export const Search = (props: DaisyProps) => <IconBase {...props} label='search' />
export const Visibility = (props: DaisyProps) => <IconBase {...props} label='view' />
export const ZoomIn = ZoomInIcon
export const ShoppingCart = ShoppingCartIcon
export const TrendingUp = (props: DaisyProps) => <IconBase {...props} label='up' />
export const Article = (props: DaisyProps) => <IconBase {...props} label='doc' />
export const Email = EmailIcon
export const Analytics = (props: DaisyProps) => <IconBase {...props} label='chart' />
export const ContentPaste = (props: DaisyProps) => <IconBase {...props} label='paste' />
export const Store = (props: DaisyProps) => <IconBase {...props} label='store' />
export const LocalShipping = LocalShippingIcon
export const Refresh = RefreshIcon
export const OpenInNew = (props: DaisyProps) => <IconBase {...props} label='open' />
export const CheckCircle = CheckCircleIcon
export const Lock = (props: DaisyProps) => <IconBase {...props} label='lock' />
export const LocalAtm = (props: DaisyProps) => <IconBase {...props} label='GBP' />
export const TrendingDown = (props: DaisyProps) => <IconBase {...props} label='down' />
export const AttachMoney = (props: DaisyProps) => <IconBase {...props} label='GBP' />
export const CalendarMonth = CalendarTodayIcon
export const Download = (props: DaisyProps) => <IconBase {...props} label='v' />
export const Badge = Chip
export const ImageList = (props: DaisyProps) => <div className={cls('grid gap-2', props.className)} style={sxToStyle(props.sx)}>{props.children}</div>
export const ImageListItem = (props: DaisyProps) => <div className={props.className} style={sxToStyle(props.sx)}>{props.children}</div>
