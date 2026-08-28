export type PrivacyRetentionCategoryId =
  | 'expired-enquiry'
  | 'expired-enquiry-upload'
  | 'expired-order-upload'
  | 'expired-order'
  | 'expired-health-information'
  | 'expired-security-record'

export type PrivacyRetentionRunMode =
  | 'discovery'
  | 'manual'
  | 'owner-review'

export type PrivacyRetentionRunStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'partial'
  | 'failed'

export type PrivacyRetentionResultStatus =
  | 'deleted'
  | 'failed'
  | 'skipped'

export type PrivacyRetentionOwnerReviewStatus =
  | 'current'
  | 'due-soon'
  | 'overdue'
  | 'not-recorded'

export type PrivacyRetentionHoldReason =
  | 'active-complaint'
  | 'legal-claim'
  | 'regulatory-request'
  | 'fraud-investigation'
  | 'other-necessary-hold'

export const PRIVACY_RETENTION_SNAPSHOT_TOKEN_MAX_LENGTH = 1024
export const privacyRetentionSnapshotTokenPattern =
  /^[A-Za-z0-9_-]{1,960}\.[A-Za-z0-9_-]{43}$/

export interface PrivacyRetentionCategory {
  id: PrivacyRetentionCategoryId
  label: string
  description: string
}

export interface PrivacyRetentionCandidate {
  id: string
  category: PrivacyRetentionCategoryId
  recordType: string
  recordReference: string
  dueAt: string
  reason: string
  removes: string[]
  retains: string[]
  itemCount: number
  held: boolean
  /**
   * Internal-only digest used to bind a preview to the exact retained rows
   * and storage references observed during discovery. API serializers must
   * remove it before returning candidates to an administrator.
   */
  snapshotRevision?: string
  holdReason?: PrivacyRetentionHoldReason
  holdReviewAt?: string
}

export interface PrivacyRetentionRunHistoryItem {
  runReference: string
  mode: PrivacyRetentionRunMode
  status: PrivacyRetentionRunStatus
  startedAt: string
  completedAt?: string
  selectedCount: number
  succeededCount: number
  failedCount: number
}

export interface PrivacyRetentionOwnerReview {
  ownerLabel: string
  lastReviewedAt: string | null
  nextReviewDueAt: string | null
  status: PrivacyRetentionOwnerReviewStatus
}

export interface PrivacyRetentionSummary {
  due: number
  held: number
  needsLifecycleReview: number
  failedLastRun: number
}

export interface PrivacyRetentionCategoryCount {
  category: PrivacyRetentionCategoryId
  total: number
  due: number
  held: number
}

export interface PrivacyRetentionPagination {
  page: number
  pageSize: number
  totalCandidates: number
  totalPages: number
  hasPrevious: boolean
  hasMore: boolean
}

export interface PrivacyRetentionPreview {
  generatedAt: string
  runReference: string
  snapshotToken: string
  confirmationPhrase: string
  ownerReview: PrivacyRetentionOwnerReview
  summary: PrivacyRetentionSummary
  categoryCounts: PrivacyRetentionCategoryCount[]
  pagination: PrivacyRetentionPagination
  categories: PrivacyRetentionCategory[]
  candidates: PrivacyRetentionCandidate[]
  history: PrivacyRetentionRunHistoryItem[]
}

export interface PrivacyRetentionSelectionResult {
  candidateId: string
  status: PrivacyRetentionResultStatus
  message: string
}

export interface PrivacyRetentionRunResponse {
  status: Extract<PrivacyRetentionRunStatus, 'completed' | 'partial' | 'failed'>
  runReference: string
  completedAt: string
  selectedCount: number
  succeededCount: number
  failedCount: number
  results: PrivacyRetentionSelectionResult[]
}

export interface PrivacyRetentionReviewResponse {
  status: 'recorded'
  runReference: string
  reviewedAt: string
  nextReviewDueAt: string
}

export interface PrivacyRetentionHoldResponse {
  status: 'held' | 'released'
  candidateId: string
  updatedAt: string
}
