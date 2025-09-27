import { NextRequest, NextResponse } from "next/server";
import { PHONE_UTILS } from "@/lib/constants";

// Test email route - for development only
export async function POST(request: NextRequest) {
  try {
    const { deliveryMethod, trackingNumber, status } = await request.json();
    
    // Mock order data for testing
    const mockOrder = {
      orderNumber: "OC123456789",
      customer: {
        name: "Test Customer",
        email: "test@example.com"
      },
      delivery: {
        deliveryMethod: deliveryMethod || "postal",
        trackingNumber: trackingNumber || null,
        dateNeeded: "2025-01-15"
      },
      pricing: {
        total: 25
      },
      items: [{
        productName: "Chocolate Birthday Cake",
        totalPrice: 25,
        quantity: 1,
        productType: "cake",
        designType: "individual",
        specialInstructions: "Happy Birthday John!"
      }]
    };

    // Status messages (same as in the real route)
    const statusMessages = {
      'confirmed': {
        subject: `Order Confirmed #${mockOrder.orderNumber} - Olgish Cakes`,
        message: `Great news! Your order has been confirmed and we've started working on it. We'll keep you updated on the progress.`
      },
      'in-progress': {
        subject: `Order In Progress #${mockOrder.orderNumber} - Olgish Cakes`,
        message: `Your order is now in progress. Our team is preparing your delicious cake with care and attention to detail.`
      },
      'ready-pickup': {
        subject: `Order Ready for Collection #${mockOrder.orderNumber} - Olgish Cakes`,
        message: `Your order is ready for collection! Please contact us to arrange pickup or delivery.`
      },
      'out-delivery': {
        subject: `Order Out for Delivery #${mockOrder.orderNumber} - Olgish Cakes`,
        message: (() => {
          const deliveryMethod = mockOrder.delivery.deliveryMethod;
          let baseMessage = 'Great news! Your order is on its way to you.';
          
          if (deliveryMethod === 'postal' || deliveryMethod === 'postal-delivery') {
            baseMessage = 'Great news! Your order has been dispatched via Royal Mail and is on its way to you. You should receive it within the next few days.';
          } else if (deliveryMethod === 'local-delivery') {
            baseMessage = 'Great news! Your order is out for local delivery and will be with you soon.';
          } else if (deliveryMethod === 'collection' || deliveryMethod === 'market-pickup') {
            baseMessage = 'Great news! Your order is ready to pick up at our market stall. Please contact us to arrange pickup.';
          }
          
          // Only add tracking info for postal deliveries with tracking number
          if ((deliveryMethod === 'postal' || deliveryMethod === 'postal-delivery') && mockOrder.delivery.trackingNumber) {
            const trackingInfo = ` You can track your package using the tracking number provided below.`;
            return baseMessage + trackingInfo;
          }
          
          return baseMessage;
        })()
      },
      'delivered': {
        subject: `Order Delivered #${mockOrder.orderNumber} - Olgish Cakes`,
        message: `Your order has been delivered! We hope you enjoy your delicious cake. Please let us know if you have any feedback.`
      },
      'completed': {
        subject: `Order Completed #${mockOrder.orderNumber} - Olgish Cakes`,
        message: `Thank you for choosing Olgish Cakes! Your order has been completed. We hope you enjoyed your cake and look forward to serving you again.`
      },
      'cancelled': {
        subject: `Order Cancelled #${mockOrder.orderNumber} - Olgish Cakes`,
        message: `We're sorry to inform you that your order has been cancelled. If you have any questions, please don't hesitate to contact us.`
      }
    };

    const newStatus = status || 'out-delivery';
    const statusInfo = statusMessages[newStatus as keyof typeof statusMessages];
    
    if (!statusInfo) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Generate the email HTML (same as real route)
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update - Olgish Cakes</title>
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
                      🎂 Order Status Update
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #e3f2fd; font-size: 16px; font-weight: 400;">
                      Your order progress update
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 1.6;">
                      Dear <strong>${mockOrder.customer.name}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                      ${statusInfo.message}
                    </p>
                    
                    <!-- Order Summary Card -->
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                        Order Summary
                      </h2>
                      
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Order Number</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">#${mockOrder.orderNumber}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Status</td>
                          <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace('-', ' ')}</td>
                        </tr>
                        ${mockOrder.delivery.dateNeeded ? `
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Date Needed</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${new Date(mockOrder.delivery.dateNeeded).toLocaleDateString('en-GB')}</td>
                        </tr>
                        ` : ''}
                        <tr>
                          <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Total Amount</td>
                          <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: 700; text-align: right;">£${mockOrder.pricing.total}</td>
                        </tr>
                      </table>
                    </div>
                    
                    <!-- Product Details -->
                    <div style="margin-bottom: 32px;">
                      <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                        Your Order
                      </h3>
                      
                      ${mockOrder.items.map((item: any) => `
                        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                          <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${item.productName || 'Custom Product'}</h4>
                          <p style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 700;">£${item.totalPrice || item.unitPrice || 0}</p>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">
                            Quantity: ${item.quantity || 1}${item.productType === 'cake' ? ` • Design: ${item.designType === 'individual' ? 'Individual Design' : 'Standard Design'}` : ''}
                          </p>
                          ${item.specialInstructions ? `<p style="margin: 8px 0 0 0; color: #374151; font-size: 14px; font-style: italic;">Special Instructions: ${item.specialInstructions}</p>` : ''}
                        </div>
                      `).join('')}
                    </div>
                    
                    ${newStatus === 'out-delivery' && mockOrder.delivery.trackingNumber ? `
                      <div style="background: #e3f2fd; border: 2px solid #2196f3; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                        <h3 style="margin: 0 0 12px 0; color: #1976d2; font-size: 16px; font-weight: 600;">📦 Tracking Information</h3>
                        ${mockOrder.delivery.deliveryMethod === 'postal-delivery' || mockOrder.delivery.deliveryMethod === 'postal' ? `
                          <p style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px;"><strong>Courier:</strong> Royal Mail</p>
                          <p style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px;">
                            <strong>Tracking Number:</strong> 
                            <a href="https://www.royalmail.com/track-your-item#/tracking-results/${mockOrder.delivery.trackingNumber}" 
                               style="color: #1976d2; text-decoration: underline; font-weight: 600;">
                              ${mockOrder.delivery.trackingNumber}
                            </a>
                          </p>
                          <p style="margin: 0; color: #1976d2; font-size: 14px;">
                            <a href="https://www.royalmail.com/track-your-item#/tracking-results/${mockOrder.delivery.trackingNumber}" 
                               style="color: #1976d2; text-decoration: none; font-weight: 500;">
                              Track your package on Royal Mail website →
                            </a>
                          </p>
                        ` : `
                          <p style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px;">
                            <strong>Tracking Number:</strong> ${mockOrder.delivery.trackingNumber}
                          </p>
                          <p style="margin: 0; color: #1976d2; font-size: 14px;">
                            <strong>Delivery Method:</strong> ${mockOrder.delivery.deliveryMethod.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </p>
                        `}
                      </div>
                    ` : ''}
                    
                    ${newStatus === 'completed' ? `
                      <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                        <h3 style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 16px; font-weight: 600;">⭐ We'd Love Your Feedback!</h3>
                        <p style="margin: 0 0 12px 0; color: #0c4a6e; font-size: 14px; line-height: 1.6;">
                          Thank you for choosing Olgish Cakes! We hope you enjoyed your order. 
                          Your feedback helps us continue to provide the best service and helps other customers discover our delicious Ukrainian cakes.
                        </p>
                        <p style="margin: 0; color: #0c4a6e; font-size: 14px;">
                          <a href="https://uk.trustpilot.com/review/olgishcakes.co.uk" 
                             style="display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                            Leave a Review on Trustpilot →
                          </a>
                        </p>
                      </div>
                    ` : ''}
                    
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
    `;

    return NextResponse.json({
      success: true,
      email: {
        to: mockOrder.customer.email,
        subject: statusInfo.subject,
        deliveryMethod: mockOrder.delivery.deliveryMethod,
        trackingNumber: mockOrder.delivery.trackingNumber,
        status: newStatus,
        message: statusInfo.message,
        html: emailHtml
      }
    });

  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to generate test email' },
      { status: 500 }
    );
  }
}
