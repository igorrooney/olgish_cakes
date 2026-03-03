import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { validateCsrfToken } from '@/lib/csrf'
import { getEmailTransportMode, requiresLiveEmailConfiguration, sendEmail } from '@/lib/email/service'

const recipientEmail = process.env.CONTACT_EMAIL_TO || 'hello@olgishcakes.co.uk'

const getSupabaseAdminClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase admin client not configured')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

type SupabaseAdminClient = ReturnType<typeof getSupabaseAdminClient>

const getReferenceImageBucket = () =>
  process.env.SUPABASE_ENQUIRY_BUCKET || 'custom-cake-enquiries'

const referenceImageConfig = {
  acceptedTypes: ['image/jpeg', 'image/png', 'image/heic'],
  maxBytes: 5 * 1024 * 1024
}

const getReferenceImageError = (file: File) => {
  if (!referenceImageConfig.acceptedTypes.includes(file.type)) {
    return 'Reference image must be a JPEG, PNG, or HEIC file'
  }

  if (file.size > referenceImageConfig.maxBytes) {
    return 'Reference image must be 5MB or smaller'
  }

  return null
}

const sanitizeFileName = (fileName: string) => {
  const cleanedName = fileName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')

  return cleanedName || 'reference-image'
}

const buildReferenceImagePath = (fileName: string) =>
  `enquiries/${Date.now()}-${crypto.randomUUID()}-${sanitizeFileName(fileName)}`

const uploadReferenceImage = async (supabase: SupabaseAdminClient, file: File) => {
  const bucket = getReferenceImageBucket()
  const filePath = buildReferenceImagePath(file.name)
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined
    })

  if (error || !data) {
    console.error('Supabase storage upload failed:', error)
    throw new Error('Failed to upload reference image')
  }

  return {
    bucket,
    path: data.path
  }
}

const removeReferenceImage = async (
  supabase: SupabaseAdminClient,
  bucket: string,
  path: string
) => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Supabase storage cleanup failed:', error)
  }
}

const formSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().trim().min(1, 'Phone number is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  postcode: z.string().regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, 'Invalid UK postcode'),
  occasion: z.string().optional(),
  date: z.string().min(1, 'Please select a date'),
  requirements: z.string().optional(),
  csrfToken: z.string().min(1, 'CSRF token is required')
})

const rateLimitMap = new Map<string, { count: number, resetTime: number }>()
const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW = 60 * 1000
const RATE_LIMIT_CLEANUP_INTERVAL = 5 * 60 * 1000
const RATE_LIMIT_MAX_ENTRIES = 10000
let lastRateLimitCleanup = 0

const cleanupRateLimitMap = (now: number) => {
  const shouldRunScheduledCleanup =
    now - lastRateLimitCleanup >= RATE_LIMIT_CLEANUP_INTERVAL
  const shouldRunSizeCleanup = rateLimitMap.size > RATE_LIMIT_MAX_ENTRIES

  if (!shouldRunScheduledCleanup && !shouldRunSizeCleanup) {
    return
  }

  for (const [storedIp, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(storedIp)
    }
  }

  if (rateLimitMap.size > RATE_LIMIT_MAX_ENTRIES) {
    const overflowCount = rateLimitMap.size - RATE_LIMIT_MAX_ENTRIES
    let removed = 0
    for (const storedIp of rateLimitMap.keys()) {
      rateLimitMap.delete(storedIp)
      removed += 1
      if (removed >= overflowCount) {
        break
      }
    }
  }

  lastRateLimitCleanup = now
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  cleanupRateLimitMap(now)
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    return false
  }

  record.count += 1
  return true
}

const getClientIp = (request: NextRequest) => {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim()
    if (firstIp) {
      return firstIp
    }
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  return realIp || 'unknown'
}

const occasionLabels: Record<string, string> = {
  birthday: 'Birthday',
  wedding: 'Wedding',
  anniversary: 'Anniversary',
  baby_shower: 'Baby shower',
  corporate_event: 'Corporate event',
  christening: 'Christening',
  other: 'Other'
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.formData()
    const getString = (value: FormDataEntryValue | null) =>
      typeof value === 'string' ? value : ''

    const fullName = getString(body.get('fullName'))
    const email = getString(body.get('email'))
    const phone = getString(body.get('phone'))
    const address = getString(body.get('address'))
    const city = getString(body.get('city'))
    const postcode = getString(body.get('postcode'))
    const date = getString(body.get('date'))
    const occasionValue = getString(body.get('occasion')).trim()
    const requirementsValue = getString(body.get('requirements')).trim()
    const csrfToken = getString(body.get('csrfToken'))
    const referenceImageEntry = body.get('referenceImage')
    const referenceImage =
      referenceImageEntry instanceof File && referenceImageEntry.size > 0
        ? referenceImageEntry
        : null

    const cookieToken = request.cookies.get('csrf-token')?.value || null
    const submittedToken = csrfToken

    if (!cookieToken || !submittedToken) {
      return NextResponse.json(
        { error: 'CSRF token missing' },
        { status: 403 }
      )
    }

    if (!validateCsrfToken(submittedToken, cookieToken)) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    const validated = formSchema.parse({
      fullName,
      email,
      phone,
      address,
      city,
      postcode,
      occasion: occasionValue || undefined,
      date,
      requirements: requirementsValue || undefined,
      csrfToken
    })

    const { csrfToken: _, ...formData } = validated

    const referenceImageError = referenceImage ? getReferenceImageError(referenceImage) : null
    if (referenceImageError) {
      return NextResponse.json(
        { error: referenceImageError },
        { status: 400 }
      )
    }

    const supabase = getSupabaseAdminClient()
    let referenceImageBucket: string | null = null
    let referenceImagePath: string | null = null

    if (referenceImage) {
      const uploaded = await uploadReferenceImage(supabase, referenceImage)
      referenceImageBucket = uploaded.bucket
      referenceImagePath = uploaded.path
    }

    const { error: insertError } = await supabase
      .from('custom_cake_enquiries')
      .insert({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        occasion: occasionValue || null,
        date_needed: formData.date,
        requirements: requirementsValue || null,
        reference_image_bucket: referenceImageBucket,
        reference_image_path: referenceImagePath,
        reference_image_name: referenceImage?.name || null,
        reference_image_type: referenceImage?.type || null,
        reference_image_size: referenceImage ? referenceImage.size : null
      })

    if (insertError) {
      if (referenceImageBucket && referenceImagePath) {
        await removeReferenceImage(
          supabase,
          referenceImageBucket,
          referenceImagePath
        )
      }

      console.error('Supabase insert failed:', insertError)
      throw new Error('Failed to save enquiry')
    }

    const emailMode = getEmailTransportMode()

    if (requiresLiveEmailConfiguration(emailMode) && !process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const formattedDate = new Date(formData.date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const rawOccasion = formData.occasion?.trim() || ''
    const normalizedOccasion = rawOccasion.toLowerCase()
    const resolvedOccasion =
      occasionLabels[normalizedOccasion] ||
      occasionLabels[normalizedOccasion.replace(/\s+/g, '_')] ||
      rawOccasion ||
      'Not specified'
    const resolvedRequirements = formData.requirements?.trim() || 'Not specified'
    const emailFrom = process.env.NEXT_PUBLIC_EMAIL_FROM || 'Olgish Cakes <hello@olgishcakes.co.uk>'

    const attachmentBuffer = referenceImage
      ? Buffer.from(await referenceImage.arrayBuffer())
      : null

    const adminEmailResponse = await sendEmail({
      templateId: 'custom-cake-enquiry-admin',
      input: {
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: formData.address,
        city: formData.city,
        postcode: formData.postcode,
        dateNeeded: formData.date,
        occasion: resolvedOccasion,
        customerMessage: resolvedRequirements,
        attachmentNames: referenceImage ? [referenceImage.name] : []
      },
      modeOverride: emailMode,
      message: {
        from: emailFrom,
        to: recipientEmail,
        bcc: process.env.ADMIN_BCC_EMAIL || undefined,
        replyTo: formData.email,
        attachments: referenceImage && attachmentBuffer
          ? [
              {
                filename: referenceImage.name,
                content: attachmentBuffer,
                contentType: referenceImage.type || undefined
              }
            ]
          : []
      }
    })

    if (!adminEmailResponse.accepted || adminEmailResponse.error) {
      throw new Error(adminEmailResponse.error?.message || 'Transport did not accept admin email')
    }

    const customerEmailResponse = await sendEmail({
      templateId: 'custom-cake-enquiry-customer',
      input: {
        customerName: formData.fullName,
        customerEmail: formData.email,
        dateNeeded: formData.date,
        occasion: resolvedOccasion,
        customerMessage: resolvedRequirements,
        message: `Date needed: ${formattedDate}`
      },
      modeOverride: emailMode,
      message: {
        from: emailFrom,
        to: formData.email,
        bcc: process.env.ADMIN_BCC_EMAIL || undefined,
        replyTo: recipientEmail,
        attachments: referenceImage && attachmentBuffer
          ? [
              {
                filename: referenceImage.name,
                content: attachmentBuffer,
                contentType: referenceImage.type || undefined
              }
            ]
          : []
      }
    })

    if (!customerEmailResponse.accepted || customerEmailResponse.error) {
      throw new Error(customerEmailResponse.error?.message || 'Transport did not accept customer email')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Custom cake enquiry received:', {
        fullName: formData.fullName,
        email: formData.email,
        date: formData.date
      })
    }

    return NextResponse.json(
      { message: 'Enquiry submitted successfully' },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error processing enquiry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
