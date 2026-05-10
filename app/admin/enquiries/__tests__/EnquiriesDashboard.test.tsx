/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { EnquiriesDashboard } from '../EnquiriesDashboard'
import type { AdminEnquirySummary } from '@/lib/enquiries/supabase-enquiries'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

jest.mock('next/link', () => {
  return ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode
    href: string
  }) => (
    <a href={href} {...props}>{children}</a>
  )
})

const makeEnquiry = (overrides: Partial<AdminEnquirySummary>): AdminEnquirySummary => ({
  id: '1',
  type: 'custom-cake',
  typeLabel: 'Custom cake',
  href: '/admin/enquiries/custom-cake/1',
  customerName: 'Jane Customer',
  customerEmail: 'jane@example.com',
  customerPhone: '07123456789',
  topic: 'Birthday',
  dateValue: '2026-07-01',
  dateLabel: '01 Jul 2026',
  messagePreview: 'Blue floral cake.',
  createdAt: '2026-05-02T10:00:00.000Z',
  createdAtLabel: '02 May 2026, 11:00',
  hasAttachment: true,
  ...overrides
})

describe('EnquiriesDashboard', () => {
  it('renders enquiry stats, contact actions and detail links', () => {
    render(
      <EnquiriesDashboard
        enquiries={[
          makeEnquiry({ id: '1' }),
          makeEnquiry({
            id: '2',
            type: 'workshop',
            typeLabel: 'Workshop',
            href: '/admin/enquiries/workshop/2',
            customerName: 'Workshop Customer',
            customerEmail: 'workshop@example.com',
            customerPhone: undefined,
            topic: 'Team building',
            hasAttachment: false
          })
        ]}
      />
    )

    expect(screen.getByText('Total enquiries')).toBeInTheDocument()
    expect(screen.getAllByText('Custom cakes').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Email' })[0]).toHaveAttribute('href', 'mailto:jane@example.com')
    expect(screen.getByRole('link', { name: 'Call' })).toHaveAttribute('href', 'tel:07123456789')
    expect(screen.getAllByRole('link', { name: 'Open' })[0]).toHaveAttribute('href', '/admin/enquiries/custom-cake/1')
  })

  it('filters enquiries by type and search term', () => {
    render(
      <EnquiriesDashboard
        enquiries={[
          makeEnquiry({
            id: '2',
            type: 'workshop',
            typeLabel: 'Workshop',
            href: '/admin/enquiries/workshop/2',
            customerName: 'Workshop Customer',
            customerPhone: undefined,
            topic: 'Team building',
            hasAttachment: false
          }),
          makeEnquiry({ customerName: 'Jane Customer', topic: 'Birthday' })
        ]}
      />
    )

    fireEvent.change(screen.getByLabelText('Type'), {
      target: { value: 'workshop' }
    })

    expect(screen.getAllByText('Workshop Customer').length).toBeGreaterThan(0)
    expect(screen.queryByText('Jane Customer')).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'missing' }
    })

    expect(screen.getByText('No enquiries match these filters')).toBeInTheDocument()
  })

  it('renders an empty state when there are no enquiries', () => {
    render(<EnquiriesDashboard enquiries={[]} />)

    expect(screen.getByText('No enquiries found.')).toBeInTheDocument()
    expect(screen.getByText('No enquiries match these filters')).toBeInTheDocument()
  })
})
