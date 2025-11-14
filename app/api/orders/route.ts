import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/client";
import { Resend } from "resend";
import { BUSINESS_CONSTANTS, PHONE_UTILS } from "@/lib/constants";
import { urlFor } from "@/sanity/lib/image";
import { orderSchema, validateRequest, formatValidationErrors } from "@/lib/validation";
import { generateOrderNumber } from "@/lib/order-utils";

// POST - Create new order
// Note: This endpoint is public - customers need to submit orders without authentication
export async function POST(request: NextRequest) {
  console.log('📦 Orders API: Received order creation request');
  
  try {
    const orderData = await request.json();
    console.log('📦 Orders API: Parsed order data for customer:', orderData.email);

    // Validate order data with Zod schema
    const validationResult = await validateRequest(orderSchema, {
      name: orderData.name,
      email: orderData.email,
      phone: orderData.phone,
      address: orderData.address || undefined,
      city: orderData.city || undefined,
      postcode: orderData.postcode || undefined,
      message: orderData.message || '',
      dateNeeded: orderData.dateNeeded || undefined,
      orderType: orderData.orderType || 'custom-quote',
      productType: orderData.productType || 'custom',
      productId: orderData.productId || undefined,
      productName: orderData.productName || 'Custom Order',
      designType: orderData.designType || 'individual',
      quantity: orderData.quantity || 1,
      unitPrice: orderData.unitPrice || 0,
      totalPrice: orderData.totalPrice || 0,
      size: orderData.size || undefined,
      flavor: orderData.flavor || undefined,
      specialInstructions: orderData.specialInstructions || undefined,
      deliveryMethod: orderData.deliveryMethod || 'collection',
      deliveryAddress: orderData.deliveryAddress || undefined,
      deliveryNotes: orderData.deliveryNotes || undefined,
      giftNote: orderData.giftNote || undefined,
      note: orderData.note || undefined,
      paymentMethod: orderData.paymentMethod || 'cash-collection',
      referrer: orderData.referrer || undefined
    });

    if (!validationResult.success) {
      console.error('❌ Orders API: Validation failed:', formatValidationErrors(validationResult.errors));
      return NextResponse.json(
        { error: "Validation failed", details: formatValidationErrors(validationResult.errors) },
        { status: 400 }
      );
    }

    // Use validated data
    const validatedOrderData = validationResult.data;

    // Generate unique order number
    const orderNumber = generateOrderNumber();
    console.log('📦 Orders API: Generated order number:', orderNumber);

    // Prepare order document for Sanity
    const orderDoc = {
      _type: 'order',
      orderNumber,
      status: 'new',
      orderType: validatedOrderData.orderType,
      customer: {
        name: validatedOrderData.name,
        email: validatedOrderData.email,
        phone: validatedOrderData.phone,
        address: validatedOrderData.address || '',
        city: validatedOrderData.city || '',
        postcode: validatedOrderData.postcode || '',
      },
      items: orderData.items || [{
        productType: validatedOrderData.productType,
        productId: validatedOrderData.productId || '',
        productName: validatedOrderData.productName,
        designType: validatedOrderData.designType,
        quantity: validatedOrderData.quantity,
        unitPrice: validatedOrderData.unitPrice,
        totalPrice: validatedOrderData.totalPrice,
        size: validatedOrderData.size || '',
        flavor: validatedOrderData.flavor || '',
        specialInstructions: validatedOrderData.specialInstructions || '',
      }],
      delivery: {
        dateNeeded: validatedOrderData.dateNeeded || null,
        deliveryMethod: validatedOrderData.deliveryMethod,
        deliveryAddress: validatedOrderData.deliveryAddress || '',
        deliveryNotes: validatedOrderData.deliveryNotes || '',
        giftNote: validatedOrderData.giftNote || '',
      },
      pricing: {
        subtotal: orderData.subtotal || validatedOrderData.totalPrice || 0,
        deliveryFee: orderData.deliveryFee || 0,
        discount: orderData.discount || 0,
        total: orderData.total || validatedOrderData.totalPrice || 0,
        paymentStatus: 'pending',
        paymentMethod: validatedOrderData.paymentMethod,
      },
      messages: (() => {
        const messages = [];
        if (validatedOrderData.message) {
          const messageWithAttachments = {
            message: validatedOrderData.message,
            attachments: orderData.attachments || [],
          };

          messages.push(messageWithAttachments);
        }
        if (validatedOrderData.deliveryNotes || validatedOrderData.note) {
          const additionalNote = validatedOrderData.deliveryNotes || validatedOrderData.note;
          messages.push({
            message: `Additional Notes: ${additionalNote}`,
            attachments: [],
          });
        }
        if (validatedOrderData.giftNote) {
          messages.push({
            message: `Gift Note: ${validatedOrderData.giftNote}`,
            attachments: [],
          });
        }

        return messages;
      })(),
      metadata: {
        source: 'website',
        referrer: validatedOrderData.referrer || '',
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown',
      },
    };

    // Create order in Sanity using server client with write permissions
    console.log('📦 Orders API: Creating order in Sanity...');
    const createdOrder = await serverClient.create(orderDoc);
    console.log('✅ Orders API: Order created in Sanity with ID:', createdOrder._id);

    // Send confirmation email to customer
    console.log('📧 Orders API: Sending confirmation email to customer...');
    try {
      // Check for Resend API key at runtime
      if (!process.env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured - skipping confirmation email');
        throw new Error('Email service not configured');
      }

      // Initialize Resend at runtime
      const resend = new Resend(process.env.RESEND_API_KEY);

      const customerEmailResult = await resend.emails.send({
        from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: validatedOrderData.email,
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
                  <!-- Main Container -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

                    <!-- Header -->
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

                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px 30px;">
                        <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                          Dear <strong>${validatedOrderData.name}</strong>,
                        </p>

                        <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                          Thank you for your order! We've received your request and will get back to you within 24 hours with confirmation and next steps. Our team is already preparing your delicious treats with love and care.
                        </p>

                        <!-- Order Summary Card -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                          <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                            Order Summary
                          </h2>

                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Order Number</td>
                              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">#${orderNumber}</td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Status</td>
                              <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">New Order</td>
                            </tr>
                            ${validatedOrderData.dateNeeded ? `
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Date Needed</td>
                              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${new Date(validatedOrderData.dateNeeded).toLocaleDateString('en-GB')}</td>
                            </tr>
                            ` : ''}
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Total Amount</td>
                              <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: 700; text-align: right;">£${orderData.total || orderData.totalPrice || 0}</td>
                            </tr>
                          </table>
                        </div>

                        <!-- Product Details -->
                        <div style="margin-bottom: 32px;">
                          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                            Your Order
                          </h3>

                          ${(() => {
                            if (orderData.items && orderData.items.length > 0) {
                              return orderData.items.map((item: any) => `
                                <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                                  <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${item.productName || 'Custom Product'}</h4>
                                  <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 700;">£${item.totalPrice || item.unitPrice || 0}</p>
                                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                    Quantity: ${item.quantity || 1}${item.productType === 'cake' ? ` • Design: ${item.designType === 'individual' ? 'Individual Design' : 'Standard Design'}` : ''}
                                  </p>
                                  ${item.specialInstructions ? `<p style="margin: 8px 0 0 0; color: #374151; font-size: 14px; font-style: italic;">Special Instructions: ${item.specialInstructions}</p>` : ''}
                                </div>
                              `).join('');
                            } else {
                              return `
                                <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                                  <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${orderData.productName || 'Custom Order'}</h4>
                                  <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 700;">£${orderData.totalPrice || orderData.unitPrice || 0}</p>
                                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                    Quantity: ${orderData.quantity || 1}${orderData.productType === 'cake' ? ` • Design: ${orderData.designType === 'individual' ? 'Individual Design' : 'Standard Design'}` : ''}
                                  </p>
                                  ${orderData.specialInstructions ? `<p style="margin: 8px 0 0 0; color: #374151; font-size: 14px; font-style: italic;">Special Instructions: ${orderData.specialInstructions}</p>` : ''}
                                </div>
                              `;
                            }
                          })()}
                        </div>

                        <!-- Design Images Section -->
                        ${(() => {
                          // Check if any items have individual design and if there are attachments
                          const hasIndividualDesign = orderData.items?.some((item: any) => item.designType === 'individual') || orderData.designType === 'individual';
                          const hasAttachments = orderData.attachments && orderData.attachments.length > 0;

                          if (hasIndividualDesign && hasAttachments) {
                            return `
                              <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                                <h3 style="margin: 0 0 12px 0; color: #15803d; font-size: 16px; font-weight: 600;">🎨 Your Design Reference</h3>
                                <p style="margin: 0 0 16px 0; color: #15803d; font-size: 14px;">
                                  Thank you for providing your design reference! We'll use this to create your perfect cake.
                                </p>
                                <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                                  ${orderData.attachments.map((attachment: any) => {
                                    if (attachment.asset) {
                                      const imageUrl = urlFor(attachment.asset).width(400).height(300).url();
                                      return `
                                        <div style="border: 2px solid #22c55e; border-radius: 8px; overflow: hidden; max-width: 200px;">
                                          <img src="${imageUrl}" alt="Design Reference" style="width: 100%; height: auto; display: block;" />
                                        </div>
                                      `;
                                    }
                                    return '';
                                  }).join('')}
                                </div>
                              </div>
                            `;
                          }
                          return '';
                        })()}

                        <!-- Delivery Information -->
                        ${validatedOrderData.deliveryMethod !== 'collection' && validatedOrderData.deliveryAddress ? `
                          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                            <h3 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">Delivery Address</h3>
                            <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">
                              ${validatedOrderData.deliveryAddress}${validatedOrderData.city ? `, ${validatedOrderData.city}` : ''}${validatedOrderData.postcode ? `, ${validatedOrderData.postcode}` : ''}
                            </p>
                          </div>
                        ` : ''}

                        <!-- Additional Notes -->
                        ${validatedOrderData.note || validatedOrderData.giftNote ? `
                          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                            <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">Additional Notes</h3>
                            ${validatedOrderData.note ? `<p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;"><strong>Notes:</strong> ${validatedOrderData.note}</p>` : ''}
                            ${validatedOrderData.giftNote ? `<p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Gift Note:</strong> ${validatedOrderData.giftNote}</p>` : ''}
                          </div>
                        ` : ''}

                        <!-- Next Steps -->
                        <div style="background: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                          <h3 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">What happens next?</h3>
                          <ul style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.6;">
                            <li>We'll review your order and confirm all details within 24 hours</li>
                            <li>You'll receive email updates when your order status changes</li>
                            <li>We'll contact you if we need any additional information</li>
                            <li>Your order will be prepared fresh and delivered on time</li>
                          </ul>
                        </div>

                        <!-- Contact Information -->
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

                    <!-- Footer -->
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
        console.error('❌ Orders API: Customer email error:', customerEmailResult.error);
      } else {
        console.log('✅ Orders API: Customer confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Orders API: Failed to send confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    // Send notification to admin
    console.log('📧 Orders API: Sending notification email to admin...');
    try {
      // Check for Resend API key at runtime
      if (!process.env.RESEND_API_KEY) {
        console.error('❌ Orders API: RESEND_API_KEY not configured - skipping admin notification');
        throw new Error('Email service not configured');
      }

      // Initialize Resend at runtime (reuse from above if available, or create new instance)
      const resend = new Resend(process.env.RESEND_API_KEY);

      const adminEmailResult = await resend.emails.send({
        from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: 'hello@olgishcakes.co.uk',
        subject: `🆕 New Order #${orderNumber} - ${validatedOrderData.name}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Order Alert - Olgish Cakes Admin</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8f9fa;">
              <tr>
                <td align="center" style="padding: 20px;">
                  <!-- Main Container -->
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">

                    <!-- Header -->
                    <tr>
                      <td style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                          🆕 New Order Alert
                        </h1>
                        <p style="margin: 8px 0 0 0; color: #fecaca; font-size: 14px; font-weight: 400;">
                          Order #${orderNumber} from ${validatedOrderData.name}
                        </p>
                      </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                      <td style="padding: 30px;">
                        <!-- Customer Info -->
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                          <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                            Customer Information
                          </h2>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500; width: 120px;">Name</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${validatedOrderData.name}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Email</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;"><a href="mailto:${validatedOrderData.email}" style="color: #2E3192; text-decoration: none;">${validatedOrderData.email}</a></td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Phone</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;"><a href="${PHONE_UTILS.telLink}" style="color: #2E3192; text-decoration: none;">${validatedOrderData.phone}</a></td>
                            </tr>
                            ${validatedOrderData.dateNeeded ? `
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Date Needed</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${new Date(validatedOrderData.dateNeeded).toLocaleDateString('en-GB')}</td>
                            </tr>
                            ` : ''}
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Address</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${validatedOrderData.address || 'Not provided'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">City</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${validatedOrderData.city || 'Not provided'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Postcode</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${validatedOrderData.postcode || 'Not provided'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Delivery Method</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${validatedOrderData.deliveryMethod === 'local-delivery' ? 'Local Delivery' : validatedOrderData.deliveryMethod === 'collection' ? 'Collection' : 'Delivery'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Payment Method</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${validatedOrderData.paymentMethod === 'cash-collection' ? 'Cash on Collection' : validatedOrderData.paymentMethod === 'card-collection' ? 'Card on Collection' : 'Online Payment'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Total</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 16px; font-weight: 700;">£${orderData.total || orderData.totalPrice || 0}</td>
                            </tr>
                          </table>
                        </div>

                        <!-- Product Details -->
                        <div style="margin-bottom: 24px;">
                          <h3 style="margin: 0 0 16px 0; color: #1f2937; font-size: 16px; font-weight: 600;">
                            Order Details
                          </h3>

                          ${(() => {
                            if (orderData.items && orderData.items.length > 0) {
                              return orderData.items.map((item: any) => `
                                <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                                  <h4 style="margin: 0 0 6px 0; color: #1f2937; font-size: 15px; font-weight: 600;">${item.productName || 'Custom Product'}</h4>
                                  <p style="margin: 0 0 6px 0; color: #1f2937; font-size: 15px; font-weight: 700;">£${item.totalPrice || item.unitPrice || 0}</p>
                                  <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">
                                    Quantity: ${item.quantity || 1}${item.productType === 'cake' ? ` • Design: ${item.designType === 'individual' ? 'Individual Design' : 'Standard Design'}` : ''}
                                  </p>
                                  ${item.size ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;"><strong>Size:</strong> ${item.size}</p>` : ''}
                                  ${item.flavor ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;"><strong>Flavor:</strong> ${item.flavor}</p>` : ''}
                                  ${item.specialInstructions ? `<p style="margin: 6px 0 0 0; color: #374151; font-size: 13px; font-style: italic;"><strong>Special Instructions:</strong> ${item.specialInstructions}</p>` : ''}
                                </div>
                              `).join('');
                            } else {
                              return `
                                <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
                                  <h4 style="margin: 0 0 6px 0; color: #1f2937; font-size: 15px; font-weight: 600;">${orderData.productName || 'Custom Order'}</h4>
                                  <p style="margin: 0 0 6px 0; color: #1f2937; font-size: 15px; font-weight: 700;">£${orderData.totalPrice || orderData.unitPrice || 0}</p>
                                  <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">
                                    Quantity: ${orderData.quantity || 1}${orderData.productType === 'cake' ? ` • Design: ${orderData.designType === 'individual' ? 'Individual Design' : 'Standard Design'}` : ''}
                                  </p>
                                  ${orderData.size ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;"><strong>Size:</strong> ${orderData.size}</p>` : ''}
                                  ${orderData.flavor ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;"><strong>Flavor:</strong> ${orderData.flavor}</p>` : ''}
                                  ${orderData.specialInstructions ? `<p style="margin: 6px 0 0 0; color: #374151; font-size: 13px; font-style: italic;"><strong>Special Instructions:</strong> ${orderData.specialInstructions}</p>` : ''}
                                </div>
                              `;
                            }
                          })()}
                        </div>

                        <!-- Design Images Section -->
                        ${(() => {
                          // Check if any items have individual design and if there are attachments
                          const hasIndividualDesign = orderData.items?.some((item: any) => item.designType === 'individual') || orderData.designType === 'individual';
                          const hasAttachments = orderData.attachments && orderData.attachments.length > 0;

                          if (hasIndividualDesign && hasAttachments) {
                            return `
                              <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                                <h3 style="margin: 0 0 12px 0; color: #15803d; font-size: 16px; font-weight: 600;">🎨 Your Design Reference</h3>
                                <p style="margin: 0 0 16px 0; color: #15803d; font-size: 14px;">
                                  Thank you for providing your design reference! We'll use this to create your perfect cake.
                                </p>
                                <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                                  ${orderData.attachments.map((attachment: any) => {
                                    if (attachment.asset) {
                                      const imageUrl = urlFor(attachment.asset).width(400).height(300).url();
                                      return `
                                        <div style="border: 2px solid #22c55e; border-radius: 8px; overflow: hidden; max-width: 200px;">
                                          <img src="${imageUrl}" alt="Design Reference" style="width: 100%; height: auto; display: block;" />
                                        </div>
                                      `;
                                    }
                                    return '';
                                  }).join('')}
                                </div>
                              </div>
                            `;
                          }
                          return '';
                        })()}

                        <!-- Delivery Information -->
                        ${validatedOrderData.deliveryMethod !== 'collection' && validatedOrderData.deliveryAddress ? `
                          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 8px 0; color: #0c4a6e; font-size: 14px; font-weight: 600;">Delivery Address</h3>
                            <p style="margin: 0; color: #0c4a6e; font-size: 13px; line-height: 1.5;">
                              ${validatedOrderData.deliveryAddress}${validatedOrderData.city ? `, ${validatedOrderData.city}` : ''}${validatedOrderData.postcode ? `, ${validatedOrderData.postcode}` : ''}
                            </p>
                          </div>
                        ` : ''}

                        <!-- Additional Notes -->
                        ${validatedOrderData.note ? `
                          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 8px 0; color: #0c4a6e; font-size: 14px; font-weight: 600;">Additional Notes</h3>
                            <p style="margin: 0; color: #0c4a6e; font-size: 13px;">${validatedOrderData.note}</p>
                          </div>
                        ` : ''}

                        <!-- Gift Note -->
                        ${validatedOrderData.giftNote ? `
                          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 8px 0; color: #0c4a6e; font-size: 14px; font-weight: 600;">Gift Note</h3>
                            <p style="margin: 0; color: #0c4a6e; font-size: 13px;">${validatedOrderData.giftNote}</p>
                          </div>
                        ` : ''}

                        <!-- Action Buttons -->
                        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
                          <a href="https://olgishcakes.co.uk/studio"
                             style="display: inline-block; background: #2E3192; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 12px;">
                            View in Sanity Studio
                          </a>
                          <a href="mailto:${validatedOrderData.email}?subject=Re: Order #${orderNumber}"
                             style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                            Reply to Customer
                          </a>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                          Olgish Cakes Admin Panel • ${new Date().toLocaleString('en-GB')}
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
      
      if (adminEmailResult.error) {
        console.error('❌ Orders API: Admin email error:', adminEmailResult.error);
      } else {
        console.log('✅ Orders API: Admin notification email sent successfully');
      }
    } catch (emailError) {
      console.error('❌ Orders API: Failed to send admin notification:', emailError);
      // Don't fail the order if admin email fails
    }

    console.log('✅ Orders API: Order process completed successfully');
    return NextResponse.json({
      success: true,
      orderId: createdOrder._id,
      orderNumber,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('❌ Orders API: Order creation error:', error);
    console.error('❌ Orders API: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to create order', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// GET - Fetch orders (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Security: Validate status to prevent GROQ injection
    const validStatuses = ['new', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'refunded'];
    
    let query = `*[_type == "order"] | order(_createdAt desc)`;
    let params = {};

    if (status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        );
      }
      query = `*[_type == "order" && status == $status] | order(_createdAt desc)`;
      params = { status };
    }

    const orders = await serverClient.fetch(`${query}[${offset}...${offset + limit}]{
      _id,
      _createdAt,
      orderNumber,
      status,
      orderType,
      customer,
      items,
      delivery,
      pricing,
      messages[]{
        message,
        attachments[]{
          asset->{
            _id,
            _ref,
            url
          },
          alt,
          caption
        }
      },
      notes[]{
        note,
        author,
        createdAt,
        images[]{
          asset->{
            _id,
            _ref,
            url
          },
          alt,
          caption
        }
      }
    }`, params);

    const totalCount = await serverClient.fetch(
      status
        ? `count(*[_type == "order" && status == $status])`
        : `count(*[_type == "order"])`,
      status ? { status } : {}
    );

    return NextResponse.json({
      orders,
      totalCount,
      hasMore: offset + limit < totalCount
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
