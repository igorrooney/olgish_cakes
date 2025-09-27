import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/client";
import { Resend } from "resend";
import { BUSINESS_CONSTANTS, PHONE_UTILS } from "@/lib/constants";

const resend = new Resend(process.env.RESEND_API_KEY);

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `OC${timestamp}${random}`;
}

// POST - Create new order
export async function POST(request: NextRequest) {
  // Temporarily bypass authentication for testing
  // TODO: Re-enable authentication once login flow is working
  try {
    const orderData = await request.json();
    console.log("Orders API received data:", orderData);
    
    // Debug logging
    console.log("Orders API received data:", {
      name: orderData.name,
      message: orderData.message,
      note: orderData.note,
      deliveryNotes: orderData.deliveryNotes,
      giftNote: orderData.giftNote
    });
    
    // Generate unique order number
    const orderNumber = generateOrderNumber();
    
    // Prepare order document for Sanity
    const orderDoc = {
      _type: 'order',
      orderNumber,
      status: 'new',
      orderType: orderData.orderType || 'custom-quote',
      customer: {
        name: orderData.name,
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.address || '',
        city: orderData.city || '',
        postcode: orderData.postcode || '',
      },
      items: orderData.items || [{
        productType: orderData.productType || 'custom',
        productId: orderData.productId || '',
        productName: orderData.productName || 'Custom Order',
        designType: orderData.designType || 'individual',
        quantity: orderData.quantity || 1,
        unitPrice: orderData.unitPrice || 0,
        totalPrice: orderData.totalPrice || 0,
        size: orderData.size || '',
        flavor: orderData.flavor || '',
        specialInstructions: orderData.specialInstructions || '',
      }],
      delivery: {
        dateNeeded: orderData.dateNeeded,
        deliveryMethod: orderData.deliveryMethod || 'collection',
        deliveryAddress: orderData.deliveryAddress || '',
        deliveryNotes: orderData.deliveryNotes || '',
        giftNote: orderData.giftNote || '',
      },
      pricing: {
        subtotal: orderData.subtotal || orderData.totalPrice || 0,
        deliveryFee: orderData.deliveryFee || 0,
        discount: orderData.discount || 0,
        total: orderData.total || orderData.totalPrice || 0,
        paymentStatus: 'pending',
        paymentMethod: orderData.paymentMethod || 'cash-collection',
      },
      messages: (() => {
        const messages = [];
        if (orderData.message) {
          messages.push({
            message: orderData.message,
            attachments: orderData.attachments || [],
          });
        }
        if (orderData.deliveryNotes || orderData.note) {
          const additionalNote = orderData.deliveryNotes || orderData.note;
          messages.push({
            message: `Additional Notes: ${additionalNote}`,
            attachments: [],
          });
        }
        if (orderData.giftNote) {
          messages.push({
            message: `Gift Note: ${orderData.giftNote}`,
            attachments: [],
          });
        }
        return messages;
      })(),
      metadata: {
        source: 'website',
        referrer: orderData.referrer || '',
        userAgent: request.headers.get('user-agent') || '',
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
      },
    };

    // Create order in Sanity using server client with write permissions
    const createdOrder = await serverClient.create(orderDoc);

    // Send confirmation email to customer
    try {
      // Debug logging
      console.log("Order data for email:", {
        name: orderData.name,
        message: orderData.message,
        note: orderData.note,
        deliveryNotes: orderData.deliveryNotes,
        giftNote: orderData.giftNote
      });
      
      await resend.emails.send({
        from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: orderData.email,
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
                          Dear <strong>${orderData.name}</strong>,
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
                            ${orderData.dateNeeded ? `
                            <tr>
                              <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Date Needed</td>
                              <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${new Date(orderData.dateNeeded).toLocaleDateString('en-GB')}</td>
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
                        
                        <!-- Delivery Information -->
                        ${orderData.deliveryMethod !== 'collection' && orderData.deliveryAddress ? `
                          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                            <h3 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">Delivery Address</h3>
                            <p style="margin: 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">
                              ${orderData.deliveryAddress}${orderData.city ? `, ${orderData.city}` : ''}${orderData.postcode ? `, ${orderData.postcode}` : ''}
                            </p>
                          </div>
                        ` : ''}
                        
                        <!-- Additional Notes -->
                        ${orderData.note || orderData.giftNote ? `
                          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                            <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; font-weight: 600;">Additional Notes</h3>
                            ${orderData.note ? `<p style="margin: 0 0 8px 0; color: #92400e; font-size: 14px;"><strong>Notes:</strong> ${orderData.note}</p>` : ''}
                            ${orderData.giftNote ? `<p style="margin: 0; color: #92400e; font-size: 14px;"><strong>Gift Note:</strong> ${orderData.giftNote}</p>` : ''}
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
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    // Send notification to admin
    try {
      await resend.emails.send({
        from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: 'hello@olgishcakes.co.uk',
        subject: `🆕 New Order #${orderNumber} - ${orderData.name}`,
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
                          Order #${orderNumber} from ${orderData.name}
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
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${orderData.name}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Email</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;"><a href="mailto:${orderData.email}" style="color: #2E3192; text-decoration: none;">${orderData.email}</a></td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Phone</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;"><a href="${PHONE_UTILS.telLink}" style="color: #2E3192; text-decoration: none;">${orderData.phone}</a></td>
                            </tr>
                            ${orderData.dateNeeded ? `
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Date Needed</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${new Date(orderData.dateNeeded).toLocaleDateString('en-GB')}</td>
                            </tr>
                            ` : ''}
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Address</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${orderData.address || 'Not provided'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">City</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${orderData.city || 'Not provided'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Postcode</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${orderData.postcode || 'Not provided'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Delivery Method</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${orderData.deliveryMethod === 'local-delivery' ? 'Local Delivery' : orderData.deliveryMethod === 'collection' ? 'Collection' : 'Delivery'}</td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Payment Method</td>
                              <td style="padding: 6px 0; color: #1f2937; font-size: 14px; font-weight: 600;">${orderData.paymentMethod === 'cash-collection' ? 'Cash on Collection' : orderData.paymentMethod === 'card-collection' ? 'Card on Collection' : 'Online Payment'}</td>
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
                        
                        <!-- Delivery Information -->
                        ${orderData.deliveryMethod !== 'collection' && orderData.deliveryAddress ? `
                          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 8px 0; color: #0c4a6e; font-size: 14px; font-weight: 600;">Delivery Address</h3>
                            <p style="margin: 0; color: #0c4a6e; font-size: 13px; line-height: 1.5;">
                              ${orderData.deliveryAddress}${orderData.city ? `, ${orderData.city}` : ''}${orderData.postcode ? `, ${orderData.postcode}` : ''}
                            </p>
                          </div>
                        ` : ''}
                        
                        <!-- Additional Notes -->
                        ${orderData.note ? `
                          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 8px 0; color: #0c4a6e; font-size: 14px; font-weight: 600;">Additional Notes</h3>
                            <p style="margin: 0; color: #0c4a6e; font-size: 13px;">${orderData.note}</p>
                          </div>
                        ` : ''}
                        
                        <!-- Gift Note -->
                        ${orderData.giftNote ? `
                          <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                            <h3 style="margin: 0 0 8px 0; color: #0c4a6e; font-size: 14px; font-weight: 600;">Gift Note</h3>
                            <p style="margin: 0; color: #0c4a6e; font-size: 13px;">${orderData.giftNote}</p>
                          </div>
                        ` : ''}
                        
                        <!-- Action Buttons -->
                        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb;">
                          <a href="https://olgishcakes.co.uk/studio" 
                             style="display: inline-block; background: #2E3192; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin-right: 12px;">
                            View in Sanity Studio
                          </a>
                          <a href="mailto:${orderData.email}?subject=Re: Order #${orderNumber}" 
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
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: createdOrder._id,
      orderNumber,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order', details: error instanceof Error ? error.message : 'Unknown error' },
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

    let query = `*[_type == "order"] | order(_createdAt desc)`;
    
    if (status) {
      query = `*[_type == "order" && status == "${status}"] | order(_createdAt desc)`;
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
      messages,
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
    }`);

    const totalCount = await serverClient.fetch(
      status 
        ? `count(*[_type == "order" && status == "${status}"])`
        : `count(*[_type == "order"])`
    );

    return NextResponse.json({
      orders,
      totalCount,
      hasMore: offset + limit < totalCount
    });

  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
