import type { SVGProps } from 'react'

type EmailIconProps = SVGProps<SVGSVGElement>

export function EmailIcon({ className, ...props }: EmailIconProps) {
  return (
    <svg
      className={className ?? 'h-[1em] opacity-70'}
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="10"
      viewBox="0 0 13 10"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path
        d="M0 2.86947V7.875C0 8.8415 0.783502 9.625 1.75 9.625H10.5C11.4665 9.625 12.25 8.8415 12.25 7.875V2.86947L7.04217 6.07429C6.47971 6.42042 5.77029 6.42042 5.20783 6.07429L0 2.86947Z"
        fill="currentColor"
      />
      <path
        d="M12.25 1.84207V1.75C12.25 0.783502 11.4665 0 10.5 0H1.75C0.783502 0 0 0.783501 0 1.75V1.84207L5.66642 5.32909C5.94765 5.50216 6.30235 5.50215 6.58359 5.32909L12.25 1.84207Z"
        fill="currentColor"
      />
    </svg>
  )
}
