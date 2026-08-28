/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'
import type {
  AdminEnquiryDetail,
  AdminEnquiryType
} from '@/lib/enquiries/supabase-enquiries'
import AdminEnquiryDetailsPage from '../page'

const mockRedirect = jest.fn()
const mockNotFound = jest.fn()
const mockIsAdminAuthenticated = jest.fn()
const mockGetAdminEnquiryDetail = jest.fn()
const mockIsAdminEnquiryType = jest.fn()
const mockIsValidAdminEnquiryRecordReference = jest.fn()
const mockLegacyHealthRetentionScheduleForm = jest.fn((props: {
  recordKind: 'enquiry'
  enquiryType: AdminEnquiryType
  recordReference: string
}) => (
  <div
    data-testid='legacy-health-retention-schedule-form'
    data-kind={props.recordKind}
    data-type={props.enquiryType}
    data-reference={props.recordReference}
  />
))
const mockRetentionLifecycleForm = jest.fn(({
  type,
  recordReference,
  lifecycle
}: {
  type: AdminEnquiryType
  recordReference: string
  lifecycle: AdminEnquiryDetail['retentionLifecycle']
}) => (
  <div
    data-testid='retention-lifecycle-form'
    data-type={type}
    data-reference={recordReference}
    data-status={lifecycle.status}
  />
))

jest.mock('next/navigation', () => ({
  redirect: (...args: unknown[]) => mockRedirect(...args),
  notFound: (...args: unknown[]) => mockNotFound(...args)
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    children: ReactNode
    href: string
  }) => <a href={href} {...props}>{children}</a>
}))

jest.mock('@/lib/admin/auth.server', () => ({
  isAdminAuthenticated: (...args: unknown[]) => mockIsAdminAuthenticated(...args)
}))

jest.mock('@/lib/enquiries/supabase-enquiries', () => ({
  getAdminEnquiryDetail: (...args: unknown[]) => mockGetAdminEnquiryDetail(...args),
  isAdminEnquiryType: (...args: unknown[]) => mockIsAdminEnquiryType(...args),
  isValidAdminEnquiryRecordReference: (...args: unknown[]) => mockIsValidAdminEnquiryRecordReference(...args)
}))

jest.mock('@/components/AdminAuthGuard', () => ({
  AdminAuthGuard: ({ children }: { children: ReactNode }) => (
    <div data-testid='admin-auth-guard'>{children}</div>
  )
}))

jest.mock('../AttachmentPreview', () => ({
  AttachmentPreview: () => <div data-testid='attachment-preview' />
}))

jest.mock('../CopyEnquirySummaryButton', () => ({
  CopyEnquirySummaryButton: () => <button type='button'>Copy summary</button>
}))

jest.mock('@/app/admin/privacy-retention/PrivacyRetentionLegalHoldForm', () => ({
  PrivacyRetentionLegalHoldForm: () => <div data-testid='privacy-retention-legal-hold-form' />
}))

jest.mock('../EnquiryRetentionLifecycleForm', () => ({
  EnquiryRetentionLifecycleForm: (props: {
    type: AdminEnquiryType
    recordReference: string
    lifecycle: AdminEnquiryDetail['retentionLifecycle']
  }) => mockRetentionLifecycleForm(props)
}))

jest.mock('../WithdrawHealthConsentForm', () => ({
  WithdrawHealthConsentForm: () => <div data-testid='withdraw-health-form' />
}))

jest.mock('@/app/admin/LegacyHealthRetentionScheduleForm', () => ({
  LegacyHealthRetentionScheduleForm: (props: {
    recordKind: 'enquiry'
    enquiryType: AdminEnquiryType
    recordReference: string
  }) => mockLegacyHealthRetentionScheduleForm(props)
}))

const enquiry: AdminEnquiryDetail = {
  id: '42',
  type: 'contact',
  typeLabel: 'Contact',
  href: '/admin/enquiries/contact/42',
  customerName: 'Jane Customer',
  customerEmail: 'jane@example.com',
  customerPhone: '07123456789',
  topic: 'Birthday cake',
  dateLabel: 'Not specified',
  messagePreview: 'Birthday enquiry',
  createdAt: '2026-08-20T10:00:00.000Z',
  createdAtLabel: '20 Aug 2026, 11:00',
  hasAttachment: false,
  sections: [],
  attachments: [],
  summaryText: 'Contact enquiry #42',
  retentionLifecycle: {
    status: 'closed',
    lastContactedAt: '2026-08-24T10:00:00.000Z',
    closedAt: '2026-08-25T10:00:00.000Z',
    retentionDueAt: '2028-08-25T10:00:00.000Z',
    legalHold: false
  },
  dietaryHealthEvidence: {
    hasInformation: false
  }
}

describe('AdminEnquiryDetailsPage retention lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsAdminAuthenticated.mockResolvedValue(true)
    mockIsAdminEnquiryType.mockReturnValue(true)
    mockIsValidAdminEnquiryRecordReference.mockReturnValue(true)
    mockGetAdminEnquiryDetail.mockResolvedValue(enquiry)
  })

  it('renders the lifecycle controls with the exact enquiry identity and state', async () => {
    render(await AdminEnquiryDetailsPage({
      params: Promise.resolve({ type: 'contact', id: '42' })
    }))

    expect(screen.getByTestId('admin-auth-guard')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Retention lifecycle' })).toBeInTheDocument()
    expect(screen.getByTestId('retention-lifecycle-form')).toHaveAttribute('data-type', 'contact')
    expect(screen.getByTestId('retention-lifecycle-form')).toHaveAttribute('data-reference', '42')
    expect(screen.getByTestId('retention-lifecycle-form')).toHaveAttribute('data-status', 'closed')
    expect(mockRetentionLifecycleForm).toHaveBeenCalledWith({
      type: 'contact',
      recordReference: '42',
      lifecycle: enquiry.retentionLifecycle
    })
  })

  it('shows scheduled health-data erasure evidence without labelling it as consent withdrawal', async () => {
    mockGetAdminEnquiryDetail.mockResolvedValue({
      ...enquiry,
      dietaryHealthEvidence: {
        hasInformation: false,
        consentVersion: '2026-07-29',
        consentedAt: '2026-08-20T10:15:00.000Z',
        retentionDueAt: '2027-02-20T10:15:00.000Z',
        erasedAt: '2027-02-20T10:30:00.000Z'
      }
    })

    render(await AdminEnquiryDetailsPage({
      params: Promise.resolve({ type: 'contact', id: '42' })
    }))

    expect(screen.getByRole('heading', { name: 'Health-data consent and retention' })).toBeInTheDocument()
    expect(screen.getByText('Scheduled retention erasure recorded')).toBeInTheDocument()
    expect(screen.getByText(/This is not a consent-withdrawal record\./)).toBeInTheDocument()
    expect(screen.getByText('Health-information retention deadline')).toBeInTheDocument()
    expect(screen.getByText('Retention erasure completed at')).toBeInTheDocument()
    expect(screen.queryByText('Consent withdrawal recorded')).not.toBeInTheDocument()
    expect(screen.queryByTestId('withdraw-health-form')).not.toBeInTheDocument()
  })

  it('keeps withdrawal available while protected information is awaiting its retention deadline', async () => {
    mockGetAdminEnquiryDetail.mockResolvedValue({
      ...enquiry,
      dietaryHealthEvidence: {
        hasInformation: true,
        consentVersion: '2026-07-29',
        consentedAt: '2026-08-20T10:15:00.000Z',
        retentionDueAt: '2027-02-20T10:15:00.000Z'
      }
    })

    render(await AdminEnquiryDetailsPage({
      params: Promise.resolve({ type: 'contact', id: '42' })
    }))

    expect(screen.getByTestId('withdraw-health-form')).toBeInTheDocument()
    expect(screen.getByText('Health-information retention deadline')).toBeInTheDocument()
    expect(screen.queryByText('Scheduled retention erasure recorded')).not.toBeInTheDocument()
  })

  it('offers the server-now schedule only for terminal active legacy health information', async () => {
    mockGetAdminEnquiryDetail.mockResolvedValue({
      ...enquiry,
      dietaryHealthEvidence: {
        hasInformation: true,
        consentVersion: '2026-07-29',
        consentedAt: '2026-08-20T10:15:00.000Z'
      }
    })

    render(await AdminEnquiryDetailsPage({
      params: Promise.resolve({ type: 'contact', id: '42' })
    }))

    expect(screen.getByTestId('legacy-health-retention-schedule-form')).toHaveAttribute(
      'data-reference',
      '42'
    )
    expect(mockLegacyHealthRetentionScheduleForm).toHaveBeenCalledWith({
      recordKind: 'enquiry',
      enquiryType: 'contact',
      recordReference: '42'
    })
  })

  it('does not offer a legacy health schedule while the enquiry is open', async () => {
    mockGetAdminEnquiryDetail.mockResolvedValue({
      ...enquiry,
      retentionLifecycle: {
        ...enquiry.retentionLifecycle,
        status: 'open',
        closedAt: undefined,
        retentionDueAt: undefined
      },
      dietaryHealthEvidence: {
        hasInformation: true,
        consentVersion: '2026-07-29',
        consentedAt: '2026-08-20T10:15:00.000Z'
      }
    })

    render(await AdminEnquiryDetailsPage({
      params: Promise.resolve({ type: 'contact', id: '42' })
    }))

    expect(screen.queryByTestId('legacy-health-retention-schedule-form')).not.toBeInTheDocument()
  })

  it('rejects an invalid record reference before loading enquiry data', async () => {
    mockIsValidAdminEnquiryRecordReference.mockReturnValue(false)
    mockNotFound.mockImplementation(() => {
      throw new Error('NEXT_NOT_FOUND')
    })

    await expect(AdminEnquiryDetailsPage({
      params: Promise.resolve({ type: 'contact', id: 'invalid' })
    })).rejects.toThrow('NEXT_NOT_FOUND')

    expect(mockGetAdminEnquiryDetail).not.toHaveBeenCalled()
  })
})
