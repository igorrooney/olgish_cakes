import type { PrivacyRetentionCategoryId } from './types'

export type RetentionEnquiryType =
  | 'contact'
  | 'custom-cake'
  | 'workshop'
  | 'event-photo'

export type RetentionSecurityRecordType =
  | 'enquiry-rate-limits'
  | 'admin-login-attempts'
  | 'event-photo-rate-limits'

export type RetentionHealthEnquiryType = Extract<
  RetentionEnquiryType,
  'contact' | 'custom-cake' | 'workshop'
>

export type ParsedPrivacyRetentionCandidateId =
  | {
      kind: 'enquiry'
      category: Extract<PrivacyRetentionCategoryId, 'expired-enquiry'>
      enquiryType: RetentionEnquiryType
      recordId: string
    }
  | {
      kind: 'enquiry-upload'
      category: Extract<PrivacyRetentionCategoryId, 'expired-enquiry-upload'>
      enquiryType: Extract<RetentionEnquiryType, 'custom-cake' | 'event-photo'>
      recordId: string
    }
  | {
      kind: 'order-upload'
      category: Extract<PrivacyRetentionCategoryId, 'expired-order-upload'>
      orderId: string
    }
  | {
      kind: 'order'
      category: Extract<PrivacyRetentionCategoryId, 'expired-order'>
      orderId: string
    }
  | {
      kind: 'security'
      category: Extract<PrivacyRetentionCategoryId, 'expired-security-record'>
      recordType: RetentionSecurityRecordType
    }
  | {
      kind: 'health-enquiry'
      category: Extract<PrivacyRetentionCategoryId, 'expired-health-information'>
      enquiryType: RetentionHealthEnquiryType
      recordId: string
    }
  | {
      kind: 'health-order'
      category: Extract<PrivacyRetentionCategoryId, 'expired-health-information'>
      orderId: string
    }

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const numericIdPattern = /^\d{1,20}$/

const isEnquiryType = (value: string): value is RetentionEnquiryType =>
  value === 'contact' ||
  value === 'custom-cake' ||
  value === 'workshop' ||
  value === 'event-photo'

const isValidEnquiryId = (
  type: RetentionEnquiryType,
  value: string
) => type === 'event-photo' || type === 'custom-cake'
  ? uuidPattern.test(value)
  : numericIdPattern.test(value)

const isSecurityRecordType = (
  value: string
): value is RetentionSecurityRecordType =>
  value === 'enquiry-rate-limits' ||
  value === 'admin-login-attempts' ||
  value === 'event-photo-rate-limits'

const isHealthEnquiryType = (
  value: string
): value is RetentionHealthEnquiryType =>
  value === 'contact' || value === 'custom-cake' || value === 'workshop'

export const buildEnquiryCandidateId = (
  type: RetentionEnquiryType,
  recordId: string
) => `enquiry:${type}:${recordId}`

export const buildEnquiryUploadCandidateId = (
  type: Extract<RetentionEnquiryType, 'custom-cake' | 'event-photo'>,
  recordId: string
) => `enquiry-upload:${type}:${recordId}`

export const buildOrderUploadCandidateId = (orderId: string) =>
  `order-upload:${orderId}`

export const buildOrderCandidateId = (orderId: string) =>
  `order:${orderId}`

export const buildSecurityCandidateId = (type: RetentionSecurityRecordType) =>
  `security:${type}`

export const buildHealthEnquiryCandidateId = (
  type: RetentionHealthEnquiryType,
  recordId: string
) => `health:enquiry:${type}:${recordId}`

export const buildHealthOrderCandidateId = (orderId: string) =>
  `health:order:${orderId}`

export const parsePrivacyRetentionCandidateId = (
  value: string
): ParsedPrivacyRetentionCandidateId | null => {
  if (value.length === 0 || value.length > 160) {
    return null
  }

  const parts = value.split(':')

  if (parts[0] === 'enquiry' && parts.length === 3) {
    const [, enquiryType, recordId] = parts
    if (isEnquiryType(enquiryType) && isValidEnquiryId(enquiryType, recordId)) {
      return {
        kind: 'enquiry',
        category: 'expired-enquiry',
        enquiryType,
        recordId
      }
    }
  }

  if (parts[0] === 'enquiry-upload' && parts.length === 3) {
    const [, enquiryType, recordId] = parts
    if (
      (enquiryType === 'custom-cake' || enquiryType === 'event-photo') &&
      isValidEnquiryId(enquiryType, recordId)
    ) {
      return {
        kind: 'enquiry-upload',
        category: 'expired-enquiry-upload',
        enquiryType,
        recordId
      }
    }
  }

  if (parts[0] === 'order-upload' && parts.length === 2 && uuidPattern.test(parts[1])) {
    return {
      kind: 'order-upload',
      category: 'expired-order-upload',
      orderId: parts[1]
    }
  }

  if (parts[0] === 'order' && parts.length === 2 && uuidPattern.test(parts[1])) {
    return {
      kind: 'order',
      category: 'expired-order',
      orderId: parts[1]
    }
  }

  if (parts[0] === 'security' && parts.length === 2 && isSecurityRecordType(parts[1])) {
    return {
      kind: 'security',
      category: 'expired-security-record',
      recordType: parts[1]
    }
  }

  if (parts[0] === 'health' && parts[1] === 'enquiry' && parts.length === 4) {
    const [, , enquiryType, recordId] = parts
    if (
      isHealthEnquiryType(enquiryType) &&
      isValidEnquiryId(enquiryType, recordId)
    ) {
      return {
        kind: 'health-enquiry',
        category: 'expired-health-information',
        enquiryType,
        recordId
      }
    }
  }

  if (
    parts[0] === 'health' &&
    parts[1] === 'order' &&
    parts.length === 3 &&
    uuidPattern.test(parts[2])
  ) {
    return {
      kind: 'health-order',
      category: 'expired-health-information',
      orderId: parts[2]
    }
  }

  return null
}
