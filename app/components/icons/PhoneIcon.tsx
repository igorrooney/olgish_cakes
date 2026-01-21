import type { SVGProps } from 'react'

type PhoneIconProps = SVGProps<SVGSVGElement>

export function PhoneIcon({ className, ...props }: PhoneIconProps) {
  return (
    <svg
      className={className ?? 'h-[1em] opacity-70'}
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <g>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0.875 2.625C0.875 1.6585 1.6585 0.875 2.625 0.875H3.42512C3.927 0.875 4.36448 1.21657 4.48621 1.70348L5.13126 4.28367C5.23799 4.71059 5.07846 5.1599 4.72641 5.42394L3.9718 5.9899C3.89344 6.04867 3.87641 6.13473 3.89842 6.19482C4.5608 8.00303 5.99697 9.4392 7.80518 10.1016C7.86527 10.1236 7.95133 10.1066 8.0101 10.0282L8.57606 9.27359C8.8401 8.92154 9.28941 8.76201 9.71633 8.86874L12.2965 9.51379C12.7834 9.63552 13.125 10.073 13.125 10.5749V11.375C13.125 12.3415 12.3415 13.125 11.375 13.125H10.0625C4.98838 13.125 0.875 9.01162 0.875 3.9375V2.625Z"
          fill="currentColor"
        />
      </g>
    </svg>
  )
}
