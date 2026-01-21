import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { validateCsrfToken } from '@/lib/csrf'
import { PHONE_UTILS } from '@/lib/constants'

const recipientEmail = process.env.CONTACT_EMAIL_TO || "hello@olgishcakes.co.uk";

type SupabaseAdminClient = ReturnType<typeof createClient>

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
    bucket: data.bucketId || bucket,
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
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().trim().min(1, "Phone number is required"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  postcode: z.string().regex(/^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i, "Invalid UK postcode"),
  occasion: z.string().optional(),
  date: z.string().min(1, "Please select a date"),
  requirements: z.string().optional(),
  csrfToken: z.string().min(1, "CSRF token is required"),
});

// Rate limiting: simple in-memory store
// NOTE: This in-memory implementation won't work across serverless instances.
// For production, use Redis or Vercel's built-in rate limiting.
// Example Redis implementation:
//   - Use @upstash/ratelimit or similar
//   - Or implement with Vercel Edge Config
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // 5 requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

const occasionLabels: Record<string, string> = {
  birthday: "Birthday",
  wedding: "Wedding",
  anniversary: "Anniversary",
  baby_shower: "Baby shower",
  corporate_event: "Corporate event",
  christening: "Christening",
  other: "Other",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.formData();
    const getString = (value: FormDataEntryValue | null) =>
      typeof value === "string" ? value : "";
    const fullName = getString(body.get("fullName"));
    const email = getString(body.get("email"));
    const phone = getString(body.get("phone"));
    const address = getString(body.get("address"));
    const city = getString(body.get("city"));
    const postcode = getString(body.get("postcode"));
    const date = getString(body.get("date"));
    const occasionValue = getString(body.get("occasion")).trim();
    const requirementsValue = getString(body.get("requirements")).trim();
    const csrfToken = getString(body.get("csrfToken"));
    const referenceImageEntry = body.get("referenceImage");
    const referenceImage =
      referenceImageEntry instanceof File && referenceImageEntry.size > 0
        ? referenceImageEntry
        : null;

    // CSRF Protection: Validate CSRF token
    const cookieToken = request.cookies.get('csrf-token')?.value || null;
    const submittedToken = csrfToken;

    if (!cookieToken || !submittedToken) {
      return NextResponse.json(
        { error: "CSRF token missing" },
        { status: 403 }
      );
    }

    if (!validateCsrfToken(submittedToken, cookieToken)) {
      return NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
    }

    // Validate input (includes csrfToken validation)
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
      csrfToken,
    });
    
    // Remove csrfToken from validated data before processing
    const { csrfToken: _, ...formData } = validated;

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

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const formattedDate = new Date(formData.date).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const rawOccasion = formData.occasion?.trim() || "";
    const normalizedOccasion = rawOccasion.toLowerCase();
    const resolvedOccasion =
      occasionLabels[normalizedOccasion] ||
      occasionLabels[normalizedOccasion.replace(/\s+/g, "_")] ||
      rawOccasion ||
      "Not specified";
    const resolvedRequirements = formData.requirements?.trim() || "Not specified";
    const referenceImageLine = referenceImage
      ? `• Reference image: ${referenceImage.name}`
      : "• Reference image: Not provided";
    const emailFrom = process.env.NEXT_PUBLIC_EMAIL_FROM || "Olgish Cakes <hello@olgishcakes.co.uk>";

    const adminEmailText = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         🎂 NEW CUSTOM CAKE ENQUIRY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CUSTOMER DETAILS
────────────────
• Name: ${formData.fullName}
• Email: ${formData.email}
• Phone: ${formData.phone}
• Address: ${formData.address}
• City: ${formData.city}
• Postcode: ${formData.postcode}

ENQUIRY DETAILS
──────────────
• Occasion: ${resolvedOccasion}
• Date Needed: ${formattedDate}
• Requirements: ${resolvedRequirements}
${referenceImageLine}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Olgish Cakes
olgishcakes.co.uk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Custom Cake Enquiry - Olgish Cakes Admin</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
          <tr>
            <td align="center" style="padding: 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <tr>
                  <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                      🆕 New Custom Cake Enquiry
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #fecaca; font-size: 14px; font-weight: 400;">
                      Enquiry from ${escapeHtml(formData.fullName)}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 30px;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                      <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                        Customer Information
                      </h2>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 120px;">Name</td>
                          <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${escapeHtml(formData.fullName)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Email</td>
                          <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;"><a href="mailto:${escapeHtml(formData.email)}" style="color: #2E3192; text-decoration: none;">${escapeHtml(formData.email)}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Phone</td>
                          <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;"><a href="tel:${escapeHtml(formData.phone)}" style="color: #2E3192; text-decoration: none;">${escapeHtml(formData.phone)}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Address</td>
                          <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${escapeHtml(formData.address)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">City</td>
                          <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${escapeHtml(formData.city)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Postcode</td>
                          <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${escapeHtml(formData.postcode)}</td>
                        </tr>
                      </table>
                    </div>
                    <div style="margin-bottom: 24px;">
                      <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                        Enquiry Details
                      </h3>
                      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                        <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;"><strong>Occasion:</strong> ${escapeHtml(resolvedOccasion)}</p>
                        <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;"><strong>Date needed:</strong> ${escapeHtml(formattedDate)}</p>
                        <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;"><strong>Requirements:</strong> ${escapeHtml(resolvedRequirements)}</p>
                        <p style="margin: 0; color: #1f2937; font-size: 14px;"><strong>Reference image:</strong> ${referenceImage ? escapeHtml(referenceImage.name) : "Not provided"}</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `.trim();

    const customerEmailText = `
Hi ${formData.fullName},

Thank you for your custom cake enquiry. I've received your details and will get back to you within 24 hours.

Your enquiry summary:
• Occasion: ${resolvedOccasion}
• Date needed: ${formattedDate}
• Requirements: ${resolvedRequirements}

If anything looks incorrect, just reply to this email and I'll update it for you.

Warm wishes,
Olgish Cakes
olgishcakes.co.uk
    `.trim();

    const customerEmailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Custom Cake Enquiry - Olgish Cakes</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
          <tr>
            <td align="center" style="padding: 40px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                <tr>
                  <td style="background: linear-gradient(135deg, #2E3192 0%, #1a237e 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                      🎂 Enquiry Received
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #e3f2fd; font-size: 16px; font-weight: 400;">
                      Thank you for choosing Olgish Cakes
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Dear <strong>${escapeHtml(formData.fullName)}</strong>,
                    </p>
                    <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      Thank you for your custom cake enquiry! I’ve received your details and will get back to you within 24 hours.
                    </p>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                        Enquiry Summary
                      </h2>
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Occasion</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(resolvedOccasion)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Date Needed</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(formattedDate)}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Requirements</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${escapeHtml(resolvedRequirements)}</td>
                        </tr>
                      </table>
                    </div>
                    <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                      <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">What happens next?</h3>
                      <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.6;">
                        <li>I’ll review your enquiry and confirm details within 24 hours</li>
                        <li>I’ll get in touch if I need any extra information</li>
                        <li>You’ll receive your quote and next steps by email</li>
                      </ul>
                    </div>
                    <div style="text-align: center; padding: 24px 0; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
                        Questions about your enquiry? I'm here to help!
                      </p>
                      <p style="margin: 0 0 20px 0; color: #374151; font-size: 14px;">
                        📧 <a href="mailto:hello@olgishcakes.co.uk" style="color: #2E3192; text-decoration: none; font-weight: 500;">hello@olgishcakes.co.uk</a><br>
                        📞 <a href="${PHONE_UTILS.telLink}" style="color: #2E3192; text-decoration: none; font-weight: 500;">${PHONE_UTILS.displayPhone}</a>
                      </p>
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        Reply to this email if anything needs updating.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `.trim();

    const resend = new Resend(process.env.RESEND_API_KEY);
    const attachmentBuffer = referenceImage
      ? Buffer.from(await referenceImage.arrayBuffer())
      : null;

    const adminEmailResponse = await resend.emails.send({
      from: emailFrom,
      to: recipientEmail,
      bcc: process.env.ADMIN_BCC_EMAIL || undefined,
      replyTo: formData.email,
      subject: `🎂 Custom Cake Enquiry: ${formData.fullName}`,
      text: adminEmailText,
      html: adminEmailHtml,
      attachments: referenceImage && attachmentBuffer
        ? [
            {
              filename: referenceImage.name,
              content: attachmentBuffer,
              contentType: referenceImage.type || undefined,
            },
          ]
        : [],
    });

    if (adminEmailResponse.error) {
      throw new Error(adminEmailResponse.error.message);
    }

    const customerEmailResponse = await resend.emails.send({
      from: emailFrom,
      to: formData.email,
      bcc: process.env.ADMIN_BCC_EMAIL || undefined,
      replyTo: recipientEmail,
      subject: "Thank you for your custom cake enquiry",
      text: customerEmailText,
      html: customerEmailHtml,
      attachments: referenceImage && attachmentBuffer
        ? [
            {
              filename: referenceImage.name,
              content: attachmentBuffer,
              contentType: referenceImage.type || undefined,
            },
          ]
        : [],
    });

    if (customerEmailResponse.error) {
      throw new Error(customerEmailResponse.error.message);
    }

    // Log the submission in development only
    if (process.env.NODE_ENV === 'development') {
      console.log("Custom cake enquiry received:", {
        fullName: formData.fullName,
        email: formData.email,
        date: formData.date,
      });
    }

    return NextResponse.json(
      { message: "Enquiry submitted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error processing enquiry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
