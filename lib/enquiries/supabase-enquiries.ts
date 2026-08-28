import 'server-only'

import { logger } from '@/lib/logger'
import { toSafeOperationalError } from '@/lib/security/safe-operational-error'
import { getSupabaseAdminClient, type SupabaseAdminClient } from '@/lib/supabase-admin-client'

export const adminEnquiryTypes = ['custom-cake', 'contact', 'workshop'] as const

export type AdminEnquiryType = (typeof adminEnquiryTypes)[number]

const enquiryListOperations: Record<AdminEnquiryType, string> = {
  'custom-cake': 'enquiries.list.custom-cake',
  contact: 'enquiries.list.contact',
  workshop: 'enquiries.list.workshop'
}

const enquiryFetchOperations: Record<AdminEnquiryType, string> = {
  'custom-cake': 'enquiries.fetch.custom-cake',
  contact: 'enquiries.fetch.contact',
  workshop: 'enquiries.fetch.workshop'
}

const enquiryWithdrawalOperations: Record<AdminEnquiryType, string> = {
  'custom-cake': 'enquiries.health-withdrawal.custom-cake',
  contact: 'enquiries.health-withdrawal.contact',
  workshop: 'enquiries.health-withdrawal.workshop'
}

export interface AdminEnquiryField {
  label: string
  value: string
  href?: string
  multiline?: boolean
}

export interface AdminEnquirySection {
  title: string
  fields: AdminEnquiryField[]
}

export interface AdminEnquiryAttachment {
  label: string
  href?: string
  downloadHref?: string
  previewHref?: string
  mimeType?: string
  detail?: string
}

export interface AdminEnquirySummary {
  id: string
  type: AdminEnquiryType
  typeLabel: string
  href: string
  customerName: string
  customerEmail?: string
  customerPhone?: string
  topic: string
  dateValue?: string
  dateLabel: string
  messagePreview: string
  createdAt: string
  createdAtLabel: string
  hasAttachment: boolean
}

export interface AdminEnquiryDetail extends AdminEnquirySummary {
  sections: AdminEnquirySection[]
  attachments: AdminEnquiryAttachment[]
  summaryText: string
  retentionLifecycle: {
    status: 'open' | 'closed' | 'converted'
    lastContactedAt?: string
    closedAt?: string
    convertedOrderId?: string
    retentionDueAt?: string
    uploadRetentionDueAt?: string
    legalHold: boolean
    legalHoldReason?: 'active-complaint' | 'legal-claim' | 'regulatory-request' | 'fraud-investigation' | 'other-necessary-hold'
    legalHoldReviewAt?: string
  }
  dietaryHealthEvidence: {
    hasInformation: boolean
    consentVersion?: string
    consentedAt?: string
    withdrawnAt?: string
    retentionDueAt?: string
    erasedAt?: string
  }
}

type ContactEnquiryRow = {
  id: number | string
  full_name: string
  email: string
  phone: string | null
  address: string | null
  city: string | null
  postcode: string | null
  cake_interest: string | null
  date_needed: string | null
  message: string
  note: string | null
  gift_note: string | null
  referrer: string | null
  attachment_names: string[] | null
  dietary_health_information: string | null
  dietary_health_consent: boolean
  dietary_health_consent_version: string | null
  dietary_health_consented_at: string | null
  dietary_health_withdrawn_at: string | null
  dietary_health_retention_due_at: string | null
  dietary_health_erased_at: string | null
  lifecycle_status: 'open' | 'closed' | 'converted'
  last_contacted_at: string | null
  closed_at: string | null
  converted_order_id: string | null
  retention_due_at: string | null
  legal_hold: boolean
  legal_hold_reason: 'active-complaint' | 'legal-claim' | 'regulatory-request' | 'fraud-investigation' | 'other-necessary-hold' | null
  legal_hold_review_at: string | null
  created_at: string
  updated_at?: string | null
}

type CustomCakeEnquiryRow = {
  id: number | string
  full_name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  postcode: string | null
  occasion: string | null
  date_needed: string | null
  requirements: string | null
  dietary_health_information: string | null
  dietary_health_consent: boolean
  dietary_health_consent_version: string | null
  dietary_health_consented_at: string | null
  dietary_health_withdrawn_at: string | null
  dietary_health_retention_due_at: string | null
  dietary_health_erased_at: string | null
  reference_image_bucket: string | null
  reference_image_path: string | null
  reference_image_name: string | null
  reference_image_type: string | null
  reference_image_size: number | null
  lifecycle_status: 'open' | 'closed' | 'converted'
  last_contacted_at: string | null
  closed_at: string | null
  converted_order_id: string | null
  retention_due_at: string | null
  upload_retention_due_at: string | null
  legal_hold: boolean
  legal_hold_reason: 'active-complaint' | 'legal-claim' | 'regulatory-request' | 'fraud-investigation' | 'other-necessary-hold' | null
  legal_hold_review_at: string | null
  created_at: string
  updated_at?: string | null
}

type WorkshopEnquiryRow = {
  id: number | string
  full_name: string
  email: string
  phone: string | null
  event_type: string
  group_size: string
  location: string
  preferred_date: string
  decoration_theme: string | null
  brief: string
  dietary_health_information: string | null
  dietary_health_consent: boolean
  dietary_health_consent_version: string | null
  dietary_health_consented_at: string | null
  dietary_health_withdrawn_at: string | null
  dietary_health_retention_due_at: string | null
  dietary_health_erased_at: string | null
  lifecycle_status: 'open' | 'closed' | 'converted'
  last_contacted_at: string | null
  closed_at: string | null
  converted_order_id: string | null
  retention_due_at: string | null
  legal_hold: boolean
  legal_hold_reason: 'active-complaint' | 'legal-claim' | 'regulatory-request' | 'fraud-investigation' | 'other-necessary-hold' | null
  legal_hold_review_at: string | null
  created_at: string
  updated_at?: string | null
}

type EnquiryRowByType = {
  contact: ContactEnquiryRow
  'custom-cake': CustomCakeEnquiryRow
  workshop: WorkshopEnquiryRow
}

const typeLabels: Record<AdminEnquiryType, string> = {
  'custom-cake': 'Custom cake',
  contact: 'Contact',
  workshop: 'Workshop'
}

const tableByType: Record<AdminEnquiryType, string> = {
  'custom-cake': 'custom_cake_enquiries',
  contact: 'contact_enquiries',
  workshop: 'workshop_enquiries'
}

const selectByType: Record<AdminEnquiryType, string> = {
  'custom-cake': [
    'id',
    'full_name',
    'email',
    'phone',
    'address',
    'city',
    'postcode',
    'occasion',
    'date_needed',
    'requirements',
    'dietary_health_information',
    'dietary_health_consent',
    'dietary_health_consent_version',
    'dietary_health_consented_at',
    'dietary_health_withdrawn_at',
    'dietary_health_retention_due_at',
    'dietary_health_erased_at',
    'reference_image_bucket',
    'reference_image_path',
    'reference_image_name',
    'reference_image_type',
    'reference_image_size',
    'lifecycle_status',
    'last_contacted_at',
    'closed_at',
    'converted_order_id',
    'retention_due_at',
    'upload_retention_due_at',
    'legal_hold',
    'legal_hold_reason',
    'legal_hold_review_at',
    'created_at'
  ].join(','),
  contact: [
    'id',
    'full_name',
    'email',
    'phone',
    'address',
    'city',
    'postcode',
    'cake_interest',
    'date_needed',
    'message',
    'note',
    'gift_note',
    'referrer',
    'attachment_names',
    'dietary_health_information',
    'dietary_health_consent',
    'dietary_health_consent_version',
    'dietary_health_consented_at',
    'dietary_health_withdrawn_at',
    'dietary_health_retention_due_at',
    'dietary_health_erased_at',
    'lifecycle_status',
    'last_contacted_at',
    'closed_at',
    'converted_order_id',
    'retention_due_at',
    'legal_hold',
    'legal_hold_reason',
    'legal_hold_review_at',
    'created_at'
  ].join(','),
  workshop: [
    'id',
    'full_name',
    'email',
    'phone',
    'event_type',
    'group_size',
    'location',
    'preferred_date',
    'decoration_theme',
    'brief',
    'dietary_health_information',
    'dietary_health_consent',
    'dietary_health_consent_version',
    'dietary_health_consented_at',
    'dietary_health_withdrawn_at',
    'dietary_health_retention_due_at',
    'dietary_health_erased_at',
    'lifecycle_status',
    'last_contacted_at',
    'closed_at',
    'converted_order_id',
    'retention_due_at',
    'legal_hold',
    'legal_hold_reason',
    'legal_hold_review_at',
    'created_at'
  ].join(',')
}

export function isAdminEnquiryType(value: string): value is AdminEnquiryType {
  return adminEnquiryTypes.includes(value as AdminEnquiryType)
}

const maximumPostgresBigint = '9223372036854775807'
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidAdminEnquiryRecordReference(
  type: AdminEnquiryType,
  value: string
): boolean {
  if (type === 'custom-cake') {
    return uuidPattern.test(value)
  }

  if (!/^\d{1,19}$/.test(value)) {
    return false
  }

  const normalized = value.replace(/^0+/, '')
  return normalized.length > 0 && (
    normalized.length < maximumPostgresBigint.length ||
    (
      normalized.length === maximumPostgresBigint.length &&
      normalized <= maximumPostgresBigint
    )
  )
}

export function getAdminEnquiryHref(type: AdminEnquiryType, id: string | number) {
  return `/admin/enquiries/${type}/${String(id)}`
}

const toText = (value: string | number | null | undefined) =>
  typeof value === 'number' ? String(value) : value?.trim() || ''

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()

const getPreview = (value: string | null | undefined, maxLength = 140) => {
  const normalized = normalizeWhitespace(value || '')

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength - 1)}...`
}

const formatDate = (value: string | null | undefined) => {
  const text = toText(value)
  if (!text) {
    return ''
  }

  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) {
    return text
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(parsed)
}

const formatDateTime = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsed)
}

const formatFileSize = (value: number | null | undefined) => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return ''
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

const previewableImageTypes = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
])

const isPreviewableImage = (value: string | null | undefined) =>
  previewableImageTypes.has(toText(value).toLowerCase())

type SignedAttachmentUrlOptions = {
  download?: boolean
  transform?: {
    width: number
    height: number
    resize: 'cover' | 'contain'
  }
}

const createField = (
  label: string,
  value: string | number | null | undefined,
  options: {
    href?: string
    multiline?: boolean
  } = {}
): AdminEnquiryField | null => {
  const text = toText(value)

  if (!text) {
    return null
  }

  return {
    label,
    value: text,
    ...options
  }
}

const compactFields = (fields: Array<AdminEnquiryField | null>) =>
  fields.filter((field): field is AdminEnquiryField => Boolean(field))

const createSection = (title: string, fields: Array<AdminEnquiryField | null>): AdminEnquirySection | null => {
  const compactedFields = compactFields(fields)

  if (compactedFields.length === 0) {
    return null
  }

  return {
    title,
    fields: compactedFields
  }
}

const compactSections = (sections: Array<AdminEnquirySection | null>) =>
  sections.filter((section): section is AdminEnquirySection => Boolean(section))

const buildAddress = (row: { address: string | null, city: string | null, postcode: string | null }) =>
  [row.address, row.city, row.postcode]
    .map((item) => toText(item))
    .filter(Boolean)
    .join(', ')

const getMailHref = (email: string | null | undefined) => {
  const value = toText(email)
  return value ? `mailto:${value}` : undefined
}

const getPhoneHref = (phone: string | null | undefined) => {
  const value = toText(phone)
  return value ? `tel:${value.replace(/\s+/g, '')}` : undefined
}

const mapCustomCakeSummary = (row: CustomCakeEnquiryRow): AdminEnquirySummary => ({
  id: String(row.id),
  type: 'custom-cake',
  typeLabel: typeLabels['custom-cake'],
  href: getAdminEnquiryHref('custom-cake', row.id),
  customerName: row.full_name,
  customerEmail: row.email || undefined,
  customerPhone: row.phone || undefined,
  topic: row.occasion || 'Custom cake',
  dateValue: row.date_needed || undefined,
  dateLabel: formatDate(row.date_needed) || 'No date',
  messagePreview: getPreview(row.requirements) || 'No requirements added',
  createdAt: row.created_at,
  createdAtLabel: formatDateTime(row.created_at),
  hasAttachment: Boolean(row.reference_image_path)
})

const mapContactSummary = (row: ContactEnquiryRow): AdminEnquirySummary => ({
  id: String(row.id),
  type: 'contact',
  typeLabel: typeLabels.contact,
  href: getAdminEnquiryHref('contact', row.id),
  customerName: row.full_name,
  customerEmail: row.email,
  customerPhone: row.phone || undefined,
  topic: row.cake_interest || 'General enquiry',
  dateValue: row.date_needed || undefined,
  dateLabel: formatDate(row.date_needed) || 'No date',
  messagePreview: getPreview(row.message) || 'No message added',
  createdAt: row.created_at,
  createdAtLabel: formatDateTime(row.created_at),
  hasAttachment: Boolean(row.attachment_names && row.attachment_names.length > 0)
})

const mapWorkshopSummary = (row: WorkshopEnquiryRow): AdminEnquirySummary => ({
  id: String(row.id),
  type: 'workshop',
  typeLabel: typeLabels.workshop,
  href: getAdminEnquiryHref('workshop', row.id),
  customerName: row.full_name,
  customerEmail: row.email,
  customerPhone: row.phone || undefined,
  topic: row.event_type,
  dateValue: row.preferred_date,
  dateLabel: formatDate(row.preferred_date) || 'No date',
  messagePreview: getPreview(row.brief) || 'No brief added',
  createdAt: row.created_at,
  createdAtLabel: formatDateTime(row.created_at),
  hasAttachment: false
})

const getSummaryMapper = <TType extends AdminEnquiryType>(
  type: TType
): ((row: EnquiryRowByType[TType]) => AdminEnquirySummary) => {
  if (type === 'custom-cake') {
    return mapCustomCakeSummary as (row: EnquiryRowByType[TType]) => AdminEnquirySummary
  }

  if (type === 'contact') {
    return mapContactSummary as (row: EnquiryRowByType[TType]) => AdminEnquirySummary
  }

  return mapWorkshopSummary as (row: EnquiryRowByType[TType]) => AdminEnquirySummary
}

async function listRows<TType extends AdminEnquiryType>(
  supabase: SupabaseAdminClient,
  type: TType,
  limit: number
): Promise<AdminEnquirySummary[]> {
  const { data, error } = await supabase
    .from(tableByType[type])
    .select(selectByType[type])
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    logger.error(`Failed to list ${type} enquiries`, {
      operation: enquiryListOperations[type],
      ...toSafeOperationalError(error)
    })
    return []
  }

  const rows = Array.isArray(data) ? data as EnquiryRowByType[TType][] : []
  return rows.map(getSummaryMapper(type))
}

export async function listAdminEnquiries(limitPerType = 80): Promise<AdminEnquirySummary[]> {
  const supabase = getSupabaseAdminClient()
  const [customCakeEnquiries, contactEnquiries, workshopEnquiries] = await Promise.all([
    listRows(supabase, 'custom-cake', limitPerType),
    listRows(supabase, 'contact', limitPerType),
    listRows(supabase, 'workshop', limitPerType)
  ])

  return [...customCakeEnquiries, ...contactEnquiries, ...workshopEnquiries]
    .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
}

async function getRow<TType extends AdminEnquiryType>(
  supabase: SupabaseAdminClient,
  type: TType,
  id: string
): Promise<EnquiryRowByType[TType] | null> {
  const { data, error } = await supabase
    .from(tableByType[type])
    .select(selectByType[type])
    .eq('id', id)
    .maybeSingle()

  if (error) {
    logger.error(`Failed to fetch ${type} enquiry`, {
      operation: enquiryFetchOperations[type],
      ...toSafeOperationalError(error)
    })
    throw new Error('Failed to fetch enquiry')
  }

  return data ? data as EnquiryRowByType[TType] : null
}

async function getSignedAttachmentUrl(
  supabase: SupabaseAdminClient,
  bucket: string | null,
  path: string | null,
  options: SignedAttachmentUrlOptions = {}
) {
  const bucketName = toText(bucket)
  const filePath = toText(path)

  if (!bucketName || !filePath) {
    return undefined
  }

  const signedUrlOptions = {
    ...(options.download ? { download: true } : {}),
    ...(options.transform ? { transform: options.transform } : {})
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(
      filePath,
      60 * 60,
      options.download || options.transform ? signedUrlOptions : undefined
    )

  if (error) {
    logger.error('Failed to create enquiry attachment signed URL', {
      operation: 'enquiries.attachment-sign',
      ...toSafeOperationalError(error)
    })
    return undefined
  }

  return data?.signedUrl
}

const buildSummaryText = (detail: Omit<AdminEnquiryDetail, 'summaryText'>) => {
  const lines = [
    `${detail.typeLabel} enquiry #${detail.id}`,
    `Customer: ${detail.customerName}`,
    detail.customerEmail ? `Email: ${detail.customerEmail}` : '',
    detail.customerPhone ? `Phone: ${detail.customerPhone}` : '',
    detail.topic ? `Topic: ${detail.topic}` : '',
    detail.dateValue ? `Date needed: ${detail.dateLabel}` : '',
    `Submitted: ${detail.createdAtLabel}`,
    '',
    detail.sections
      .flatMap((section) => section.fields)
      .find((field) => field.multiline)?.value || detail.messagePreview
  ]

  return lines.filter((line) => line.length > 0).join('\n')
}

const mapRetentionLifecycle = (row: {
  lifecycle_status: 'open' | 'closed' | 'converted'
  last_contacted_at: string | null
  closed_at: string | null
  converted_order_id: string | null
  retention_due_at: string | null
  upload_retention_due_at?: string | null
  legal_hold: boolean
  legal_hold_reason: 'active-complaint' | 'legal-claim' | 'regulatory-request' | 'fraud-investigation' | 'other-necessary-hold' | null
  legal_hold_review_at: string | null
}): AdminEnquiryDetail['retentionLifecycle'] => ({
  status: row.lifecycle_status,
  ...(row.last_contacted_at ? { lastContactedAt: row.last_contacted_at } : {}),
  ...(row.closed_at ? { closedAt: row.closed_at } : {}),
  ...(row.converted_order_id ? { convertedOrderId: row.converted_order_id } : {}),
  ...(row.retention_due_at ? { retentionDueAt: row.retention_due_at } : {}),
  ...(row.upload_retention_due_at ? { uploadRetentionDueAt: row.upload_retention_due_at } : {}),
  legalHold: row.legal_hold,
  ...(row.legal_hold_reason ? { legalHoldReason: row.legal_hold_reason } : {}),
  ...(row.legal_hold_review_at ? { legalHoldReviewAt: row.legal_hold_review_at } : {})
})

const mapDietaryHealthEvidence = (row: {
  dietary_health_information: string | null
  dietary_health_consent_version: string | null
  dietary_health_consented_at: string | null
  dietary_health_withdrawn_at: string | null
  dietary_health_retention_due_at: string | null
  dietary_health_erased_at: string | null
}): AdminEnquiryDetail['dietaryHealthEvidence'] => ({
  hasInformation: Boolean(row.dietary_health_information),
  ...(row.dietary_health_consent_version
    ? { consentVersion: row.dietary_health_consent_version }
    : {}),
  ...(row.dietary_health_consented_at
    ? { consentedAt: row.dietary_health_consented_at }
    : {}),
  ...(row.dietary_health_withdrawn_at
    ? { withdrawnAt: row.dietary_health_withdrawn_at }
    : {}),
  ...(row.dietary_health_retention_due_at
    ? { retentionDueAt: row.dietary_health_retention_due_at }
    : {}),
  ...(row.dietary_health_erased_at
    ? { erasedAt: row.dietary_health_erased_at }
    : {})
})

async function mapCustomCakeDetail(
  supabase: SupabaseAdminClient,
  row: CustomCakeEnquiryRow
): Promise<AdminEnquiryDetail> {
  const summary = mapCustomCakeSummary(row)
  const canPreviewAttachment = isPreviewableImage(row.reference_image_type)
  const [signedUrl, signedDownloadUrl, signedPreviewUrl] = await Promise.all([
    getSignedAttachmentUrl(
      supabase,
      row.reference_image_bucket,
      row.reference_image_path
    ),
    getSignedAttachmentUrl(
      supabase,
      row.reference_image_bucket,
      row.reference_image_path,
      { download: true }
    ),
    canPreviewAttachment
      ? getSignedAttachmentUrl(
          supabase,
          row.reference_image_bucket,
          row.reference_image_path,
          {
            transform: {
              width: 900,
              height: 675,
              resize: 'cover'
            }
          }
        )
      : Promise.resolve(undefined)
  ])
  const attachments: AdminEnquiryAttachment[] = row.reference_image_path
    ? [{
        label: row.reference_image_name || 'Reference image',
        href: signedUrl,
        downloadHref: signedDownloadUrl,
        previewHref: signedPreviewUrl,
        mimeType: row.reference_image_type || undefined,
        detail: [
          row.reference_image_type,
          formatFileSize(row.reference_image_size)
        ].filter(Boolean).join(' - ') || undefined
      }]
    : []
  const detail: Omit<AdminEnquiryDetail, 'summaryText'> = {
    ...summary,
    sections: compactSections([
      createSection('Customer', [
        createField('Name', row.full_name),
        createField('Email', row.email, { href: getMailHref(row.email) }),
        createField('Phone', row.phone, { href: getPhoneHref(row.phone) })
      ]),
      createSection('Request', [
        createField('Occasion', row.occasion),
        createField('Date needed', formatDate(row.date_needed)),
        createField('Submitted', formatDateTime(row.created_at))
      ]),
      createSection('Address', [
        createField('Address', buildAddress(row))
      ]),
      createSection('Requirements', [
        createField('Customer message', row.requirements, { multiline: true })
      ]),
      createSection('Protected dietary health information', [
        createField('Information supplied', row.dietary_health_information, { multiline: true }),
        row.dietary_health_information
          ? createField('Explicit consent', row.dietary_health_consent ? 'Yes' : 'No')
          : null,
        createField('Consent version', row.dietary_health_consent_version),
        createField(
          'Consented at',
          row.dietary_health_consented_at ? formatDateTime(row.dietary_health_consented_at) : null
        ),
        createField(
          'Withdrawn at',
          row.dietary_health_withdrawn_at ? formatDateTime(row.dietary_health_withdrawn_at) : null
        )
      ])
    ]),
    attachments,
    retentionLifecycle: mapRetentionLifecycle(row),
    dietaryHealthEvidence: mapDietaryHealthEvidence(row)
  }

  return {
    ...detail,
    summaryText: buildSummaryText(detail)
  }
}

function mapContactDetail(row: ContactEnquiryRow): AdminEnquiryDetail {
  const summary = mapContactSummary(row)
  const attachments = (row.attachment_names || [])
    .filter((name) => toText(name).length > 0)
    .map((name) => ({
      label: name
    }))
  const detail: Omit<AdminEnquiryDetail, 'summaryText'> = {
    ...summary,
    sections: compactSections([
      createSection('Customer', [
        createField('Name', row.full_name),
        createField('Email', row.email, { href: getMailHref(row.email) }),
        createField('Phone', row.phone, { href: getPhoneHref(row.phone) })
      ]),
      createSection('Request', [
        createField('Cake interest', row.cake_interest),
        createField('Date needed', formatDate(row.date_needed)),
        createField('Referrer', row.referrer),
        createField('Submitted', formatDateTime(row.created_at))
      ]),
      createSection('Address', [
        createField('Address', buildAddress(row))
      ]),
      createSection('Message', [
        createField('Message', row.message, { multiline: true }),
        createField('Note', row.note, { multiline: true }),
        createField('Gift note', row.gift_note, { multiline: true })
      ]),
      createSection('Protected dietary health information', [
        createField('Information supplied', row.dietary_health_information, { multiline: true }),
        row.dietary_health_information
          ? createField('Explicit consent', row.dietary_health_consent ? 'Yes' : 'No')
          : null,
        createField('Consent version', row.dietary_health_consent_version),
        createField(
          'Consented at',
          row.dietary_health_consented_at ? formatDateTime(row.dietary_health_consented_at) : null
        ),
        createField(
          'Withdrawn at',
          row.dietary_health_withdrawn_at ? formatDateTime(row.dietary_health_withdrawn_at) : null
        )
      ])
    ]),
    attachments,
    retentionLifecycle: mapRetentionLifecycle(row),
    dietaryHealthEvidence: mapDietaryHealthEvidence(row)
  }

  return {
    ...detail,
    summaryText: buildSummaryText(detail)
  }
}

function mapWorkshopDetail(row: WorkshopEnquiryRow): AdminEnquiryDetail {
  const summary = mapWorkshopSummary(row)
  const detail: Omit<AdminEnquiryDetail, 'summaryText'> = {
    ...summary,
    sections: compactSections([
      createSection('Customer', [
        createField('Name', row.full_name),
        createField('Email', row.email, { href: getMailHref(row.email) }),
        createField('Phone', row.phone, { href: getPhoneHref(row.phone) })
      ]),
      createSection('Workshop', [
        createField('Event type', row.event_type),
        createField('Group size', row.group_size),
        createField('Preferred date', formatDate(row.preferred_date)),
        createField('Location', row.location),
        createField('Decoration theme', row.decoration_theme),
        createField('Submitted', formatDateTime(row.created_at))
      ]),
      createSection('Brief', [
        createField('Customer brief', row.brief, { multiline: true })
      ]),
      createSection('Protected dietary health information', [
        createField('Information supplied', row.dietary_health_information, { multiline: true }),
        row.dietary_health_information
          ? createField('Explicit consent', row.dietary_health_consent ? 'Yes' : 'No')
          : null,
        createField('Consent version', row.dietary_health_consent_version),
        createField(
          'Consented at',
          row.dietary_health_consented_at ? formatDateTime(row.dietary_health_consented_at) : null
        ),
        createField(
          'Withdrawn at',
          row.dietary_health_withdrawn_at ? formatDateTime(row.dietary_health_withdrawn_at) : null
        )
      ])
    ]),
    attachments: [],
    retentionLifecycle: mapRetentionLifecycle(row),
    dietaryHealthEvidence: mapDietaryHealthEvidence(row)
  }

  return {
    ...detail,
    summaryText: buildSummaryText(detail)
  }
}

export async function getAdminEnquiryDetail(
  type: AdminEnquiryType,
  id: string
): Promise<AdminEnquiryDetail | null> {
  const supabase = getSupabaseAdminClient()

  if (type === 'custom-cake') {
    const row = await getRow(supabase, type, id)
    return row ? mapCustomCakeDetail(supabase, row) : null
  }

  if (type === 'contact') {
    const row = await getRow(supabase, type, id)
    return row ? mapContactDetail(row) : null
  }

  const row = await getRow(supabase, type, id)
  return row ? mapWorkshopDetail(row) : null
}

export type WithdrawDietaryHealthInformationResult =
  | { status: 'withdrawn', withdrawnAt: string }
  | { status: 'already-withdrawn', withdrawnAt: string }
  | { status: 'not-found' }
  | { status: 'no-active-information' }

export async function withdrawAdminEnquiryDietaryHealthInformation(
  type: AdminEnquiryType,
  id: string
): Promise<WithdrawDietaryHealthInformationResult> {
  const supabase = getSupabaseAdminClient()
  const row = await getRow(supabase, type, id)

  if (!row) {
    return { status: 'not-found' }
  }

  if (row.dietary_health_withdrawn_at) {
    return {
      status: 'already-withdrawn',
      withdrawnAt: row.dietary_health_withdrawn_at
    }
  }

  if (!row.dietary_health_information || !row.dietary_health_consent) {
    return { status: 'no-active-information' }
  }

  const withdrawnAt = new Date().toISOString()
  const { data, error } = await supabase
    .from(tableByType[type])
    .update({
      dietary_health_information: null,
      dietary_health_consent: false,
      dietary_health_withdrawn_at: withdrawnAt
    })
    .eq('id', id)
    .is('dietary_health_withdrawn_at', null)
    .select('dietary_health_withdrawn_at')
    .maybeSingle()

  if (error) {
    logger.error('Failed to withdraw enquiry dietary-health consent', {
      operation: enquiryWithdrawalOperations[type],
      recordReference: id,
      ...toSafeOperationalError(error)
    })
    throw new Error('Failed to withdraw dietary-health consent')
  }

  if (data?.dietary_health_withdrawn_at) {
    return {
      status: 'withdrawn',
      withdrawnAt: String(data.dietary_health_withdrawn_at)
    }
  }

  const currentRow = await getRow(supabase, type, id)
  if (currentRow?.dietary_health_withdrawn_at) {
    return {
      status: 'already-withdrawn',
      withdrawnAt: currentRow.dietary_health_withdrawn_at
    }
  }

  throw new Error('Failed to withdraw dietary-health consent')
}

export type AdminEnquiryRetentionLifecycleAction =
  | 'record-contact'
  | 'close'
  | 'reopen'
  | 'convert'

export interface UpdateAdminEnquiryRetentionLifecycleInput {
  action: AdminEnquiryRetentionLifecycleAction
  convertedOrderId?: string
}

export interface UpdateAdminEnquiryRetentionLifecycleResult {
  lifecycle: AdminEnquiryDetail['retentionLifecycle']
  updatedAt: string
}

export class AdminEnquiryRetentionLifecycleError extends Error {
  code: string
  status: number

  constructor(code: string, status: number) {
    super(code)
    this.name = 'AdminEnquiryRetentionLifecycleError'
    this.code = code
    this.status = status
  }
}

export async function updateAdminEnquiryRetentionLifecycle(
  type: AdminEnquiryType,
  id: string,
  input: UpdateAdminEnquiryRetentionLifecycleInput
): Promise<UpdateAdminEnquiryRetentionLifecycleResult | null> {
  if (!isValidAdminEnquiryRecordReference(type, id)) {
    return null
  }

  const supabase = getSupabaseAdminClient()
  const { data, error } = await supabase.rpc('update_enquiry_retention_lifecycle', {
    p_enquiry_type: type,
    p_record_id: id,
    p_action: input.action,
    p_converted_order_reference: input.action === 'convert'
      ? input.convertedOrderId?.trim() || null
      : null
  })

  if (error) {
    const message = typeof error.message === 'string' ? error.message : ''
    const knownErrors: Record<string, number> = {
      RETENTION_ENQUIRY_REQUEST_INVALID: 400,
      RETENTION_ENQUIRY_NOT_FOUND: 404,
      RETENTION_ORDER_REFERENCE_INVALID: 400,
      RETENTION_ORDER_NOT_FOUND: 404,
      RETENTION_LEGAL_HOLD_ACTIVE: 409,
      RETENTION_DELETION_CLAIM_ACTIVE: 409,
      RETENTION_CONVERTED_LINK_IMMUTABLE: 409,
      RETENTION_ENQUIRY_STATE_INVALID: 409
    }
    const code = Object.keys(knownErrors).find((value) => message.includes(value))
    if (code) {
      throw new AdminEnquiryRetentionLifecycleError(code, knownErrors[code])
    }

    logger.error('Failed to update enquiry retention lifecycle', {
      operation: 'enquiries.retention-lifecycle.update',
      recordReference: id,
      ...toSafeOperationalError(error)
    })
    throw new AdminEnquiryRetentionLifecycleError('RETENTION_LIFECYCLE_UPDATE_FAILED', 500)
  }

  const row: unknown = Array.isArray(data) ? data[0] : data
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    throw new AdminEnquiryRetentionLifecycleError('RETENTION_LIFECYCLE_UPDATE_FAILED', 500)
  }
  const result = row as Record<string, unknown>
  if (
    result.status !== 'updated' ||
    (result.lifecycle_status !== 'open' && result.lifecycle_status !== 'closed' && result.lifecycle_status !== 'converted') ||
    typeof result.last_contacted_at !== 'string' ||
    typeof result.legal_hold !== 'boolean' ||
    typeof result.updated_at !== 'string'
  ) {
    throw new AdminEnquiryRetentionLifecycleError('RETENTION_LIFECYCLE_UPDATE_FAILED', 500)
  }

  return {
    lifecycle: mapRetentionLifecycle({
      lifecycle_status: result.lifecycle_status,
      last_contacted_at: result.last_contacted_at,
      closed_at: typeof result.closed_at === 'string' ? result.closed_at : null,
      converted_order_id: typeof result.converted_order_id === 'string' ? result.converted_order_id : null,
      retention_due_at: typeof result.retention_due_at === 'string' ? result.retention_due_at : null,
      upload_retention_due_at: typeof result.upload_retention_due_at === 'string'
        ? result.upload_retention_due_at
        : null,
      legal_hold: result.legal_hold,
      legal_hold_reason: null,
      legal_hold_review_at: null
    }),
    updatedAt: result.updated_at
  }
}
