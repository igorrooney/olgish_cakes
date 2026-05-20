import 'server-only'

import { logger } from '@/lib/logger'
import { getSupabaseAdminClient, type SupabaseAdminClient } from '@/lib/supabase-admin-client'

export const adminEnquiryTypes = ['custom-cake', 'contact', 'workshop'] as const

export type AdminEnquiryType = (typeof adminEnquiryTypes)[number]

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
  reference_image_bucket: string | null
  reference_image_path: string | null
  reference_image_name: string | null
  reference_image_type: string | null
  reference_image_size: number | null
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
    'reference_image_bucket',
    'reference_image_path',
    'reference_image_name',
    'reference_image_type',
    'reference_image_size',
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
    'created_at'
  ].join(',')
}

export function isAdminEnquiryType(value: string): value is AdminEnquiryType {
  return adminEnquiryTypes.includes(value as AdminEnquiryType)
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
    logger.error(`Failed to list ${type} enquiries`, error)
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
    logger.error(`Failed to fetch ${type} enquiry`, error)
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
    logger.error('Failed to create enquiry attachment signed URL', error)
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
  const detail = {
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
      ])
    ]),
    attachments
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
  const detail = {
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
      ])
    ]),
    attachments
  }

  return {
    ...detail,
    summaryText: buildSummaryText(detail)
  }
}

function mapWorkshopDetail(row: WorkshopEnquiryRow): AdminEnquiryDetail {
  const summary = mapWorkshopSummary(row)
  const detail = {
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
      ])
    ]),
    attachments: []
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
