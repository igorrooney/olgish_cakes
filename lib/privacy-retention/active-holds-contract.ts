import type { PrivacyRetentionHoldReason } from './types'

export type PrivacyRetentionActiveHoldRecordType =
  | 'contact-enquiry'
  | 'custom-cake-enquiry'
  | 'workshop-enquiry'
  | 'event-photo-request'
  | 'order'
  | 'security-batch'

export interface PrivacyRetentionActiveHold {
  candidateId: string
  recordType: PrivacyRetentionActiveHoldRecordType
  recordReference: string
  reason: PrivacyRetentionHoldReason
  reviewAt: string
  overdue: boolean
  detailHref?: string
}

export interface PrivacyRetentionActiveHoldPage {
  holds: PrivacyRetentionActiveHold[]
  page: number
  pageSize: number
  hasMore: boolean
}
