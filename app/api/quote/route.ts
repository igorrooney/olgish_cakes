import { NextRequest, NextResponse } from 'next/server'
import { serverClient } from '@/sanity/lib/client'
import { quoteFormSchema, validateRequest, formatValidationErrors } from '@/lib/validation'
import { getEmailTransportMode, requiresLiveEmailConfiguration, sendEmail } from '@/lib/email/service'

const recipientEmail = process.env.CONTACT_EMAIL_TO || 'hello@olgishcakes.co.uk'

interface SanityImageReference {
  _type: 'image'
  asset: {
    _type: 'reference'
    _ref: string
  }
}

function buildQuoteSummary(params: {
  guestCount?: string
  designStyle?: string
  flavors?: string
  dietaryRequirements?: string
  budget?: string
  specialRequests?: string
}): string {
  const lines: string[] = []

  if (params.guestCount && params.guestCount.trim().length > 0) {
    lines.push(`Guest count: ${params.guestCount.trim()}`)
  }

  if (params.designStyle && params.designStyle.trim().length > 0) {
    lines.push(`Design style: ${params.designStyle.trim()}`)
  }

  if (params.flavors && params.flavors.trim().length > 0) {
    lines.push(`Flavors: ${params.flavors.trim()}`)
  }

  if (params.dietaryRequirements && params.dietaryRequirements.trim().length > 0) {
    lines.push(`Dietary requirements: ${params.dietaryRequirements.trim()}`)
  }

  if (params.budget && params.budget.trim().length > 0) {
    lines.push(`Budget: ${params.budget.trim()}`)
  }

  if (params.specialRequests && params.specialRequests.trim().length > 0) {
    lines.push(`Special requests: ${params.specialRequests.trim()}`)
  }

  return lines.join('\n')
}

export async function POST(request: NextRequest) {
  if (!recipientEmail) {
    return NextResponse.json(
      { error: 'Internal server error: Email configuration missing.' },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const occasion = formData.get('occasion') as string
    const dateNeeded = formData.get('dateNeeded') as string
    const guestCount = formData.get('guestCount') as string
    const cakeType = formData.get('cakeType') as string
    const designStyle = formData.get('designStyle') as string
    const flavors = formData.get('flavors') as string
    const dietaryRequirements = formData.get('dietaryRequirements') as string
    const budget = formData.get('budget') as string
    const specialRequests = formData.get('specialRequests') as string
    const designImage = formData.get('designImage') as File | null

    const validationResult = await validateRequest(quoteFormSchema, {
      name,
      email,
      phone,
      occasion,
      dateNeeded,
      guestCount: guestCount || undefined,
      cakeType,
      designStyle: designStyle || undefined,
      flavors: flavors || undefined,
      dietaryRequirements: dietaryRequirements || undefined,
      budget,
      specialRequests: specialRequests || undefined
    })

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: formatValidationErrors(validationResult.errors) },
        { status: 400 }
      )
    }

    let imageBuffer: ArrayBuffer | null = null
    if (designImage) {
      imageBuffer = await designImage.arrayBuffer()
    }

    const emailMode = getEmailTransportMode()

    if (requiresLiveEmailConfiguration(emailMode) && !process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      )
    }

    const quoteSummary = buildQuoteSummary({
      guestCount,
      designStyle,
      flavors,
      dietaryRequirements,
      budget,
      specialRequests
    })

    const emailResponse = await sendEmail({
      templateId: 'quote-admin-request',
      input: {
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        occasion,
        dateNeeded,
        productName: cakeType,
        customerMessage: specialRequests || undefined,
        message: quoteSummary,
        note: quoteSummary,
        attachmentNames: designImage ? [designImage.name] : []
      },
      modeOverride: emailMode,
      message: {
        from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: recipientEmail,
        bcc: process.env.ADMIN_BCC_EMAIL || undefined,
        replyTo: email,
        attachments: designImage && imageBuffer
          ? [
              {
                filename: designImage.name,
                content: Buffer.from(imageBuffer)
              }
            ]
          : []
      }
    })

    if (!emailResponse.accepted || emailResponse.error) {
      throw new Error(emailResponse.error?.message || 'Transport did not accept quote email')
    }

    try {
      let attachmentImages: SanityImageReference[] = []
      if (designImage) {
        try {
          const arrayBuffer = await designImage.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)

          const uploaded = await serverClient.assets.upload('image', buffer, {
            filename: designImage.name,
            contentType: designImage.type
          })

          attachmentImages = [
            {
              _type: 'image',
              asset: { _type: 'reference', _ref: uploaded._id }
            }
          ]
        } catch (uploadError) {
          console.error('Failed to upload quote design image to Sanity:', uploadError)
        }
      }

      const orderData = {
        name,
        email,
        phone,
        address: '',
        city: '',
        postcode: '',
        message: [
          'Quote Request Details:',
          `Occasion: ${occasion}`,
          `Date Needed: ${dateNeeded}`,
          `Guest Count: ${guestCount}`,
          `Cake Type: ${cakeType}`,
          `Design Style: ${designStyle}`,
          `Flavors: ${flavors}`,
          `Dietary Requirements: ${dietaryRequirements}`,
          `Budget: ${budget}`,
          `Special Requests: ${specialRequests}`
        ].join('\n'),
        dateNeeded,
        orderType: 'custom-quote',
        productType: 'cake',
        productId: '',
        productName: cakeType,
        designType: 'individual',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        size: guestCount ? `${guestCount} guests` : '',
        flavor: flavors || '',
        specialInstructions: specialRequests || '',
        deliveryMethod: 'collection',
        deliveryAddress: '',
        deliveryNotes: '',
        paymentMethod: 'cash-collection',
        referrer: '',
        attachments: attachmentImages
      }

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      try {
        const orderResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData),
          signal: controller.signal
        })

        if (!orderResponse.ok) {
          console.error('Failed to create quote request order:', await orderResponse.text())
        }
      } finally {
        clearTimeout(timeout)
      }
    } catch (orderError) {
      console.error('Error creating quote request order:', orderError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Quote API Error:', error)
    return NextResponse.json({ error: 'Failed to send quote request' }, { status: 500 })
  }
}
