import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { serverClient } from "@/sanity/lib/client";
import { contactFormSchema, validateRequest, formatValidationErrors } from "@/lib/validation";
import { generateOrderNumber, generateUniqueKey } from "@/lib/order-utils";
import { PHONE_UTILS } from "@/lib/constants";
import { withRateLimit } from "@/lib/rate-limit";
const recipientEmail = process.env.CONTACT_EMAIL_TO || "hello@olgishcakes.co.uk";

async function handlePOST(request: NextRequest) {
  // Check for required environment variables at runtime
  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY environment variable is not set");
    return NextResponse.json(
      { error: "Internal server error: Email service not configured." },
      { status: 500 }
    );
  }

  if (!recipientEmail) {
    console.error("Recipient email address (CONTACT_EMAIL_TO) is not configured.");
    return NextResponse.json(
      { error: "Internal server error: Email configuration missing." },
      { status: 500 }
    );
  }

  // Initialize Resend at runtime
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const address = formData.get("address") as string | null;
    const city = formData.get("city") as string | null;
    const postcode = formData.get("postcode") as string | null;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;
    const dateNeeded = formData.get("dateNeeded") as string;
    const dateNeededDisplay = formData.get("dateNeededDisplay") as string;
    const designImage = formData.get("designImage") as File | null;
    const cakeInterest = formData.get("cakeInterest") as string;
    const isOrderForm = formData.get("isOrderForm") === "true";

    // Validate form data with Zod schema
    const validationResult = await validateRequest(contactFormSchema, {
      name,
      email,
      phone,
      message: message || '',
      address: address || undefined,
      city: city || undefined,
      postcode: postcode || undefined,
      dateNeeded: dateNeeded || undefined,
      cakeInterest: cakeInterest || undefined,
      isOrderForm: isOrderForm || undefined
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: formatValidationErrors(validationResult.errors) },
        { status: 400 }
      );
    }

    // Additional check for message when not an order form
    const isMessageRequired = !isOrderForm;
    if (isMessageRequired && (!message || message.trim().length < 10)) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters when not submitting an order" },
        { status: 400 }
      );
    }

    const attachments = [];
    let base64Image = "";
    let imageBuffer: ArrayBuffer | null = null;

    if (designImage) {
      imageBuffer = await designImage.arrayBuffer();
      base64Image = Buffer.from(imageBuffer).toString("base64");
      attachments.push({
        filename: designImage.name,
        content: Buffer.from(imageBuffer),
      });
    }

    // More precise detection of order inquiries
    const isOrderInquiry =
      isOrderForm || (message.includes("Cake:") && message.includes("Design Type:"));

    const formattedDate =
      dateNeededDisplay ||
      (dateNeeded
        ? new Date(dateNeeded).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : null);

    const emailContent = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                         ${isOrderInquiry ? "🎂 NEW CAKE ORDER INQUIRY" : "📨 NEW CONTACT MESSAGE"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CUSTOMER INFORMATION
──────────────────
• Name: ${name}
${address ? `• Address: ${address}` : ""}
• Email: ${email}
• Phone: ${phone}
${city ? `• City: ${city}` : ""}
${postcode ? `• Postcode: ${postcode}` : ""}
${formattedDate ? `• Required Date: ${formattedDate}` : ""}
${cakeInterest ? `• Cake Interest: ${cakeInterest}` : ""}

MESSAGE DETAILS
─────────────
${message}
${formData.get("note") ? `
ADDITIONAL NOTES
────────────────
${formData.get("note")}
` : ""}
${formData.get("giftNote") ? `
GIFT NOTE
─────────
${formData.get("giftNote")}
` : ""}

${
  designImage
    ? `
ATTACHMENTS
───────────
• Design Reference Image: ${designImage.name}
`
    : ""
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Best regards,
Olgish Cakes
        olgishcakes.co.uk
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`.trim();

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      padding: 20px;
      background-color: #f9f9f9;
      border-bottom: 2px solid #eee;
    }
    .content {
      padding: 20px;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #2c5282;
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    .info-item {
      margin: 8px 0;
    }
    .message {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      white-space: pre-wrap;
    }
    .design-image {
      max-width: 100%;
      margin: 20px 0;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .footer {
      text-align: center;
      padding: 20px;
      background-color: #f9f9f9;
      border-top: 2px solid #eee;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: #2c5282; margin: 0;">
      ${isOrderInquiry ? "🎂 New Cake Order Inquiry" : "📨 New Contact Message"}
    </h1>
  </div>

  <div class="content">
    <div class="section">
      <div class="section-title">Customer Information</div>
      <div class="info-item">• Name: ${name}</div>
      ${address ? `<div class="info-item">• Address: ${address}</div>` : ""}
      ${city ? `<div class="info-item">• City: ${city}</div>` : ""}
      <div class="info-item">• Email: ${email}</div>
      <div class="info-item">• Phone: ${phone}</div>
      ${postcode ? `<div class="info-item">• Postcode: ${postcode}</div>` : ""}
      ${formattedDate ? `<div class="info-item">• Required Date: ${formattedDate}</div>` : ""}
      ${cakeInterest ? `<div class="info-item">• Cake Interest: ${cakeInterest}</div>` : ""}
    </div>

    <div class="section">
      <div class="section-title">Message Details</div>
      <div class="message">${message.replace(/\n/g, "<br>")}</div>
    </div>

    ${formData.get("note") ? `
    <div class="section">
      <div class="section-title">Additional Notes</div>
      <div class="message">${(formData.get("note") as string).replace(/\n/g, "<br>")}</div>
    </div>
    ` : ""}

    ${formData.get("giftNote") ? `
    <div class="section">
      <div class="section-title">Gift Note</div>
      <div class="message">${(formData.get("giftNote") as string).replace(/\n/g, "<br>")}</div>
    </div>
    ` : ""}

    ${
      designImage
        ? `
    <div class="section">
      <div class="section-title">Design Reference</div>
      <img src="data:${designImage.type};base64,${base64Image}" alt="Design Reference" class="design-image">
    </div>
    `
        : ""
    }
  </div>

  <div class="footer">
    <strong>Best regards,</strong><br>
    Olgish Cakes<br>
            <a href="https://olgishcakes.co.uk" style="color: #2c5282; text-decoration: none;">olgishcakes.co.uk</a>
  </div>
</body>
</html>`;

    // Only send admin email for non-order inquiries
    // Order inquiries will be handled by the orders API
    let response;
    if (!isOrderInquiry) {
      response = await resend.emails.send({
        from: "Olgish Cakes <hello@olgishcakes.co.uk>",
        to: recipientEmail,
        bcc: process.env.ADMIN_BCC_EMAIL || undefined,
        replyTo: email,
        subject: `New Contact: ${name}`,
        html: htmlContent,
        text: emailContent, // Fallback plain text version
        attachments: designImage
          ? [
              {
                filename: designImage.name,
                content: Buffer.from(imageBuffer!),
              },
            ]
          : [],
      });
    } else {
      // For order inquiries, just create a mock response
      response = { error: null };
    }

    if (response.error) {
      console.error("Resend API Error:", response.error);
      throw new Error(response.error.message);
    }

    // If this is an order form, also create an order in the system
    if (isOrderInquiry) {
      let orderCreated = false;
      let orderError = null;
      
      try {
        // Upload design image to Sanity and pass image reference in attachments
        let attachmentImages: any[] = [];
        if (designImage) {
          try {
            // Convert File to Buffer for Sanity upload
            const arrayBuffer = await designImage.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploaded = await serverClient.assets.upload('image', buffer, {
              filename: designImage.name,
              contentType: designImage.type,
            });

            attachmentImages = [
              {
                _type: 'image',
                asset: { _type: 'reference', _ref: uploaded._id },
              },
            ];
          } catch (e: any) {
            console.error('❌ Failed to upload design image to Sanity:', e);
            console.error('Error details:', {
              message: e?.message,
              stack: e?.stack,
              name: e?.name
            });
            // Continue without image attachment - don't fail the entire order
          }
        }
        
        const orderData = {
          name,
          email,
          phone,
          address,
          city,
          postcode,
          message,
          dateNeeded,
          orderType: formData.get("orderType") as string || "custom-quote",
          productType: formData.get("productType") as string || "custom",
          productId: formData.get("productId") as string || "",
          productName: formData.get("productName") as string || "Custom Order",
          designType: formData.get("designType") as string || "individual",
          quantity: parseInt(formData.get("quantity") as string) || 1,
          unitPrice: parseFloat(formData.get("unitPrice") as string) || 0,
          totalPrice: parseFloat(formData.get("totalPrice") as string) || 0,
          size: formData.get("size") as string || "",
          flavor: formData.get("flavor") as string || "",
          specialInstructions: formData.get("specialInstructions") as string || "",
          deliveryMethod: formData.get("deliveryMethod") as string || "collection",
          deliveryAddress: formData.get("deliveryAddress") as string || "",
          deliveryNotes: formData.get("deliveryNotes") as string || "",
          giftNote: formData.get("giftNote") as string || "",
          note: formData.get("note") as string || "",
          paymentMethod: formData.get("paymentMethod") as string || "cash-collection",
          referrer: formData.get("referrer") as string || "",
          attachments: attachmentImages,
        };

        // Create order directly in Sanity (no internal HTTP call)
        // Generate unique numeric order number
        const orderNumber = generateOrderNumber()
        
        const orderDoc = {
          _type: 'order',
          orderNumber,
          status: 'new',
          customer: {
            name: orderData.name,
            email: orderData.email,
            phone: orderData.phone,
            address: orderData.address || '',
            city: orderData.city || '',
            postcode: orderData.postcode || '',
          },
          items: [
            {
              _key: generateUniqueKey('item'),
              productId: orderData.productId,
              productName: orderData.productName,
              productType: orderData.productType,
              designType: orderData.designType,
              quantity: orderData.quantity,
              unitPrice: orderData.unitPrice,
              totalPrice: orderData.totalPrice,
              size: orderData.size,
              flavor: orderData.flavor,
              specialInstructions: orderData.specialInstructions,
            },
          ],
          delivery: {
            method: orderData.deliveryMethod,
            address: orderData.deliveryAddress,
            notes: orderData.deliveryNotes,
          },
          payment: {
            method: orderData.paymentMethod,
            status: 'pending',
          },
          messages: [
            {
              _key: generateUniqueKey('msg'),
              message: orderData.message,
              from: 'customer',
              timestamp: new Date().toISOString(),
            },
          ],
          metadata: {
            orderType: orderData.orderType,
            dateNeeded: orderData.dateNeeded || null,
            giftNote: orderData.giftNote || '',
            note: orderData.note || '',
            referrer: orderData.referrer || '',
            attachments: orderData.attachments || [],
          },
        };

        const createdOrder = await serverClient.create(orderDoc);
        orderCreated = true;

        // AUTOMATIC EMAIL SENDING: Send confirmation email to customer immediately after order creation
        // This happens automatically for every order - no manual intervention needed
        try {
          // Check for Resend API key at runtime
          if (!process.env.RESEND_API_KEY) {
            console.error('❌ Contact API: RESEND_API_KEY not configured - skipping confirmation email');
            throw new Error('Email service not configured');
          }

          // Validate email address format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(orderData.email)) {
            console.error('❌ Contact API: Invalid email address format:', orderData.email);
            throw new Error(`Invalid email address format: ${orderData.email}`);
          }


          const customerEmailResult = await resend.emails.send({
            from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
            to: orderData.email,
            bcc: process.env.ADMIN_BCC_EMAIL || undefined,
            subject: `Order Confirmation #${orderNumber} - Olgish Cakes`,
            html: `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation - Olgish Cakes</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
                  <tr>
                    <td align="center" style="padding: 40px 20px;">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
                        <tr>
                          <td style="background: linear-gradient(135deg, #2E3192 0%, #1a237e 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                              🎂 Order Confirmed
                            </h1>
                            <p style="margin: 8px 0 0 0; color: #e3f2fd; font-size: 16px; font-weight: 400;">
                              Thank you for choosing Olgish Cakes
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                              Dear <strong>${orderData.name}</strong>,
                            </p>
                            <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                              Thank you for your order! We've received your request and will get back to you within 24 hours with confirmation and next steps. Our team is already preparing your delicious treats with love and care.
                            </p>
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                              <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">Order Summary</h2>
                              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Order Number</td>
                                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">#${orderNumber}</td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Status</td>
                                  <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">New Order</td>
                                </tr>
                                ${orderData.dateNeeded ? `
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Date Needed</td>
                                  <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${new Date(orderData.dateNeeded).toLocaleDateString('en-GB')}</td>
                                </tr>
                                ` : ''}
                                <tr>
                                  <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Total Amount</td>
                                  <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: 700; text-align: right;">£${orderData.totalPrice || 0}</td>
                                </tr>
                              </table>
                            </div>
                            <div style="margin-bottom: 32px;">
                              <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600;">Your Order</h3>
                              <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                                <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${orderData.productName || 'Custom Order'}</h4>
                                <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 700;">£${orderData.totalPrice || orderData.unitPrice || 0}</p>
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                  Quantity: ${orderData.quantity || 1}${orderData.productType === 'cake' ? ` • Design: ${orderData.designType === 'individual' ? 'Individual Design' : 'Standard Design'}` : ''}
                                </p>
                                ${orderData.specialInstructions ? `<p style="margin: 8px 0 0 0; color: #374151; font-size: 14px; font-style: italic;">Special Instructions: ${orderData.specialInstructions}</p>` : ''}
                              </div>
                            </div>
                            ${orderData.deliveryMethod !== 'collection' && orderData.deliveryAddress ? `
                            <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                              <h3 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">Delivery Address</h3>
                              <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">
                                ${orderData.deliveryAddress}${orderData.city ? `, ${orderData.city}` : ''}${orderData.postcode ? `, ${orderData.postcode}` : ''}
                              </p>
                            </div>
                            ` : ''}
                            ${orderData.note || orderData.giftNote ? `
                            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                              <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">Additional Notes</h3>
                              ${orderData.note ? `<p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;"><strong>Notes:</strong> ${orderData.note}</p>` : ''}
                              ${orderData.giftNote ? `<p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Gift Note:</strong> ${orderData.giftNote}</p>` : ''}
                            </div>
                            ` : ''}
                            <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                              <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">What happens next?</h3>
                              <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.6;">
                                <li>We'll review your order and confirm all details within 24 hours</li>
                                <li>You'll receive email updates when your order status changes</li>
                                <li>We'll contact you if we need any additional information</li>
                                <li>Your order will be prepared fresh and delivered on time</li>
                              </ul>
                            </div>
                            <div style="text-align: center; padding: 24px 0; border-top: 1px solid #e5e7eb;">
                              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px;">
                                Questions about your order? We're here to help!
                              </p>
                              <p style="margin: 0 0 20px 0; color: #374151; font-size: 14px;">
                                📧 <a href="mailto:hello@olgishcakes.co.uk" style="color: #2E3192; text-decoration: none; font-weight: 500;">hello@olgishcakes.co.uk</a><br>
                                📞 <a href="${PHONE_UTILS.telLink}" style="color: #2E3192; text-decoration: none; font-weight: 500;">${PHONE_UTILS.displayPhone}</a>
                              </p>
                              <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                Reply to this email to track your order status
                              </p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="background: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; font-weight: 500;">
                              With love from Leeds, UK
                            </p>
                            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                              © ${new Date().getFullYear()} Olgish Cakes. All rights reserved.<br>
                              Traditional Ukrainian honey cakes made with love
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
          });

          if (customerEmailResult.error) {
            console.error('❌ Contact API: Customer email error:', JSON.stringify(customerEmailResult.error, null, 2));
            console.error('❌ Contact API: Email error details:', {
              message: customerEmailResult.error.message,
              name: customerEmailResult.error.name,
              orderNumber,
              customerEmail: orderData.email
            });
            throw new Error(`Failed to send customer email: ${customerEmailResult.error.message || 'Unknown error'}`);
          } else {
            // Track successful email in order metadata
            try {
              await serverClient
                .patch(createdOrder._id)
                .set({
                  'metadata.emailSent': true,
                  'metadata.emailAttemptedAt': new Date().toISOString()
                })
                .commit();
            } catch (metadataError) {
              console.error('❌ Contact API: Failed to update order metadata for success:', metadataError);
            }
          }
        } catch (emailError) {
          console.error('❌ Contact API: Failed to send confirmation email:', emailError);
          console.error('❌ Contact API: Email error stack:', emailError instanceof Error ? emailError.stack : 'No stack trace');
          console.error('❌ Contact API: Order was created but email failed - Order ID:', createdOrder._id);
          // Don't fail the order creation if email fails, but log it prominently
          // Store email failure in order metadata for tracking
          try {
            await serverClient
              .patch(createdOrder._id)
              .set({
                'metadata.emailSent': false,
                'metadata.emailError': emailError instanceof Error ? emailError.message : 'Unknown error',
                'metadata.emailAttemptedAt': new Date().toISOString()
              })
              .commit();
          } catch (metadataError) {
            console.error('❌ Contact API: Failed to update order metadata:', metadataError);
          }
        }
      } catch (orderException) {
        console.error('❌ Exception while creating order:', orderException);
        orderError = orderException;
      }

      // FALLBACK: If order creation failed, send email directly from contact API
      if (!orderCreated && orderError) {
        console.warn('⚠️  Order creation failed, sending fallback notification emails...');
        try {
          // Send admin notification email
          const adminEmailResponse = await resend.emails.send({
            from: "Olgish Cakes <hello@olgishcakes.co.uk>",
            to: recipientEmail,
            bcc: process.env.ADMIN_BCC_EMAIL || undefined,
            replyTo: email,
            subject: `🆕 New Order Inquiry from ${name}`,
            html: htmlContent,
            text: emailContent,
            attachments: designImage
              ? [
                  {
                    filename: designImage.name,
                    content: Buffer.from(imageBuffer!),
                  },
                ]
              : [],
          });

          if (adminEmailResponse.error) {
            console.error('❌ Fallback admin email failed:', adminEmailResponse.error);
          } else {
          }

          // Send simple confirmation to customer
          const customerEmailResponse = await resend.emails.send({
            from: "Olgish Cakes <hello@olgishcakes.co.uk>",
            to: email,
            subject: "Order Inquiry Received - Olgish Cakes",
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; padding: 20px; background-color: #f9f9f9; border-bottom: 2px solid #eee;">
                  <h1 style="color: #2c5282; margin: 0;">🎂 Order Inquiry Received</h1>
                </div>
                <div style="padding: 20px;">
                  <p>Dear ${name},</p>
                  <p>Thank you for your order inquiry! We've received your request and will get back to you within 24 hours.</p>
                  <p>We'll review your requirements and send you a detailed confirmation with next steps.</p>
                  <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Your Details:</strong></p>
                    <p style="margin: 5px 0;">Email: ${email}</p>
                    <p style="margin: 5px 0;">Phone: ${phone}</p>
                    ${formattedDate ? `<p style="margin: 5px 0;">Date Needed: ${formattedDate}</p>` : ''}
                  </div>
                  <p>If you have any questions, please don't hesitate to contact us.</p>
                  <p>Best regards,<br>Olgish Cakes<br><a href="https://olgishcakes.co.uk">olgishcakes.co.uk</a></p>
                </div>
              </body>
              </html>
            `,
          });

          if (customerEmailResponse.error) {
            console.error('❌ Fallback customer email failed:', customerEmailResponse.error);
          } else {
          }
        } catch (fallbackError) {
          console.error('❌ Fallback email sending failed completely:', fallbackError);
          // Log but don't throw - we don't want to show error to user
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}

// Apply rate limiting: 10 requests per minute
export const POST = withRateLimit(handlePOST, {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 requests per minute
});
