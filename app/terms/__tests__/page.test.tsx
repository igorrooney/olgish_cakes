/**
 * @jest-environment jsdom
 */
import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import TermsOfServicePage from '../page'
import {
  REFUND_AFTER_WORK_POLICY,
  REFUND_BEFORE_WORK_POLICY,
  STATUTORY_RIGHTS_POLICY
} from '@/lib/public-policies'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode
    href: string
  }) => <a href={href} {...props}>{children}</a>
}))

describe('TermsOfServicePage cancellation policy', () => {
  it('uses the shared cancellation and statutory-rights wording', () => {
    const { container } = render(<TermsOfServicePage />)

    expect(
      screen.getByRole('heading', { level: 2, name: '5. Cancellations and refunds' })
    ).toBeInTheDocument()
    expect(container.textContent).toContain(REFUND_BEFORE_WORK_POLICY)
    expect(container.textContent).toContain(REFUND_AFTER_WORK_POLICY)
    expect(container.textContent).toContain(STATUTORY_RIGHTS_POLICY)
    expect(container.textContent).toMatch(/usual 14-day change-of-mind cancellation right/i)
    expect(
      screen.getByRole('heading', { level: 2, name: '10. Statutory rights' })
    ).toBeInTheDocument()
  })
})
