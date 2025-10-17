import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/client";
import { Resend } from "resend";
import { PHONE_UTILS } from "@/lib/constants";
import { urlFor } from "@/sanity/lib/image";

// GET - Fetch single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await serverClient.fetch(
      `*[_type == "order" && _id == "${params.id}"][0]{
        _id,
        _createdAt,
        _updatedAt,
        orderNumber,
        status,
        orderType,
        customer,
        items,
        delivery,
        pricing,
        messages,
        notes{
          note,
          author,
          createdAt,
          images[]{
            _type,
            asset->{
              _id,
              url
            },
            alt,
            caption
          }
        },
        metadata
      }`
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Failed to fetch order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH - Update order (status, tracking, notes, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Handle both JSON and FormData requests
    let updates: any = {};
    let images: File[] = [];

    const contentType = request.headers.get('content-type');

    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData (with potential image uploads)
      const formData = await request.formData();

      // Extract text fields
      updates.status = formData.get('status') as string;
      updates.trackingNumber = formData.get('trackingNumber') as string;
      updates.deliveryMethod = formData.get('deliveryMethod') as string;
      updates.paymentStatus = formData.get('paymentStatus') as string;
      updates.paymentMethod = formData.get('paymentMethod') as string;
      updates.note = formData.get('note') as string;
      // Extract customer information
      updates.customerName = formData.get('customerName') as string;
      updates.customerEmail = formData.get('customerEmail') as string;
      updates.customerPhone = formData.get('customerPhone') as string;
      updates.customerAddress = formData.get('customerAddress') as string;
      updates.customerCity = formData.get('customerCity') as string;
      updates.customerPostcode = formData.get('customerPostcode') as string;
      // Extract pricing information
      updates.itemPrice = formData.get('itemPrice') as string;
      updates.totalPrice = formData.get('totalPrice') as string;
      // Extract item selection information
      updates.selectedCakeId = formData.get('selectedCakeId') as string;
      updates.selectedCakeName = formData.get('selectedCakeName') as string;
      updates.selectedCakeSize = formData.get('selectedCakeSize') as string;
      updates.selectedDesignType = formData.get('selectedDesignType') as string;

      // Extract images
      const imageFiles = formData.getAll('images') as File[];
      images = imageFiles.filter(file => file.size > 0);
    } else {
      // Handle JSON requests (backward compatibility)
      updates = await request.json();
    }

    // Get current order to compare changes
    const currentOrder = await serverClient.fetch(
      `*[_type == "order" && _id == "${params.id}"][0]{
        _id,
        orderNumber,
        status,
        customer,
        delivery,
        pricing,
        items
      }`
    );

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare update document
    const updateDoc: any = {};

    // Handle status updates
    if (updates.status && updates.status !== currentOrder.status) {
      updateDoc.status = updates.status;
    }

    // Handle tracking number updates
    if (updates.trackingNumber) {
      updateDoc['delivery.trackingNumber'] = updates.trackingNumber;
    }

    // Handle delivery method updates
    if (updates.deliveryMethod) {
      updateDoc['delivery.deliveryMethod'] = updates.deliveryMethod;
    }

    // Handle payment status updates
    if (updates.paymentStatus) {
      updateDoc['pricing.paymentStatus'] = updates.paymentStatus;
    }

    // Handle payment method updates
    if (updates.paymentMethod) {
      updateDoc['pricing.paymentMethod'] = updates.paymentMethod;
    }

    // Handle customer information updates
    if (updates.customerName) {
      updateDoc['customer.name'] = updates.customerName;
    }
    if (updates.customerEmail) {
      updateDoc['customer.email'] = updates.customerEmail;
    }
    if (updates.customerPhone) {
      updateDoc['customer.phone'] = updates.customerPhone;
    }
    if (updates.customerAddress !== undefined) {
      updateDoc['customer.address'] = updates.customerAddress;
    }
    if (updates.customerCity !== undefined) {
      updateDoc['customer.city'] = updates.customerCity;
    }
    if (updates.customerPostcode !== undefined) {
      updateDoc['customer.postcode'] = updates.customerPostcode;
    }

    // Handle price updates
    if (updates.subtotal !== undefined) {
      updateDoc['pricing.subtotal'] = updates.subtotal;
    }
    if (updates.deliveryFee !== undefined) {
      updateDoc['pricing.deliveryFee'] = updates.deliveryFee;
    }
    if (updates.discount !== undefined) {
      updateDoc['pricing.discount'] = updates.discount;
    }
    if (updates.total !== undefined) {
      updateDoc['pricing.total'] = updates.total;
    }

    // Handle item price updates
    if (updates.itemPrice !== undefined) {
      const newItemPrice = parseFloat(updates.itemPrice);
      if (!isNaN(newItemPrice) && currentOrder.items && currentOrder.items.length > 0) {
        const updatedItems = currentOrder.items.map((item: any, index: number) => 
          index === 0 ? { ...item, totalPrice: newItemPrice, unitPrice: newItemPrice } : item
        );
        updateDoc.items = updatedItems;
      }
    }

    // Handle total price update (manual override)
    if (updates.totalPrice !== undefined) {
      const newTotal = parseFloat(updates.totalPrice);
      if (!isNaN(newTotal)) {
        updateDoc['pricing.total'] = newTotal;
      }
    }

    // Handle item selection updates
    if (updates.selectedCakeId !== undefined || updates.selectedCakeName !== undefined || 
        updates.selectedCakeSize !== undefined || updates.selectedDesignType !== undefined) {
      
      const newItem = {
        productType: 'cake',
        productId: updates.selectedCakeId || currentOrder.items[0]?.productId || '',
        productName: updates.selectedCakeName || currentOrder.items[0]?.productName || 'Custom Order',
        designType: updates.selectedDesignType || currentOrder.items[0]?.designType || 'standard',
        quantity: currentOrder.items[0]?.quantity || 1,
        unitPrice: parseFloat(updates.itemPrice) || currentOrder.items[0]?.unitPrice || 0,
        totalPrice: parseFloat(updates.itemPrice) || currentOrder.items[0]?.totalPrice || 0,
        size: updates.selectedCakeSize || currentOrder.items[0]?.size || '',
        flavor: currentOrder.items[0]?.flavor || '',
        specialInstructions: currentOrder.items[0]?.specialInstructions || '',
      };

      updateDoc.items = [newItem];
    }

    // Handle internal notes
    if (updates.note || images.length > 0) {
      const newNote = {
        _key: Date.now().toString(),
        note: updates.note || '',
        author: updates.author || 'Admin',
        createdAt: new Date().toISOString(),
        images: [] as any[],
      };

      // Process uploaded images
      if (images.length > 0) {
        for (const imageFile of images) {
          try {
            // Convert File to Buffer for Sanity upload
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            // Upload image to Sanity
            const imageAsset = await serverClient.assets.upload('image', buffer, {
              filename: imageFile.name,
              contentType: imageFile.type,
            });

            newNote.images.push({
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: imageAsset._id,
              },
              alt: imageFile.name,
              caption: '',
            });
          } catch (imageError) {
            console.error('Failed to upload image:', imageError);
            // Continue with other images even if one fails
          }
        }
      }

      updateDoc.notes = [...(currentOrder.notes || []), newNote];
    }

    // Update order in Sanity
    const updatedOrder = await serverClient
      .patch(params.id)
      .set(updateDoc)
      .commit();

    // Send status update email after order is updated (if status changed)
    if (updates.status && updates.status !== currentOrder.status) {
      // Create a modified order object with the updated delivery method for email
      const orderForEmail = {
        ...updatedOrder,
        delivery: {
          ...updatedOrder.delivery,
          deliveryMethod: updates.deliveryMethod || updatedOrder.delivery.deliveryMethod
        }
      };
      await sendStatusUpdateEmail(orderForEmail, updates.status);
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully'
    });

  } catch (error) {
    console.error('Failed to update order:', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete order (soft delete by default, permanent delete with password)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password, permanent } = body;

    const currentOrder = await serverClient.fetch(
      `*[_type == "order" && _id == "${params.id}"][0]`
    );

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if this is a permanent delete request
    if (permanent && password) {
      // Verify admin password for permanent deletion
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword) {
        return NextResponse.json(
          { error: 'Admin password not configured' },
          { status: 500 }
        );
      }

      if (password !== adminPassword) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }

      // Permanently delete the order from Sanity
      await serverClient.delete(params.id);

      return NextResponse.json({
        success: true,
        message: 'Order permanently deleted from Sanity'
      });
    }

    // Default behavior: Soft delete by changing status to cancelled
    const cancelledOrder = await serverClient
      .patch(params.id)
      .set({
        status: 'cancelled',
        'pricing.paymentStatus': 'cancelled',
        'pricing.paymentMethod': 'cancelled'
      })
      .commit();

    // Send cancellation email to customer
    await sendStatusUpdateEmail(currentOrder, 'cancelled');

    return NextResponse.json({
      success: true,
      order: cancelledOrder,
      message: 'Order cancelled successfully'
    });

  } catch (error) {
    console.error('Failed to delete order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to send status update emails
async function sendStatusUpdateEmail(order: any, newStatus: string) {
  // Check for Resend API key at runtime
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY not configured - skipping status update email');
    return;
  }

  // Initialize Resend at runtime
  const resend = new Resend(process.env.RESEND_API_KEY);

  const statusMessages = {
    'confirmed': {
      subject: `Order Confirmed #${order.orderNumber} - Olgish Cakes`,
      message: `Great news! Your order has been confirmed and we've started working on it. We'll keep you updated on the progress.`
    },
    'in-progress': {
      subject: `Order In Progress #${order.orderNumber} - Olgish Cakes`,
      message: `Your order is now in progress. Our team is preparing your delicious cake with care and attention to detail.`
    },
    'ready-pickup': {
      subject: `Order Ready for Collection #${order.orderNumber} - Olgish Cakes`,
      message: `Your order is ready for collection! Please contact us to arrange pickup or delivery.`
    },
    'out-delivery': {
      subject: `Order Out for Delivery #${order.orderNumber} - Olgish Cakes`,
      message: (() => {
        const deliveryMethod = order.delivery.deliveryMethod;
        let baseMessage = 'Great news! Your order is on its way to you.';

        if (deliveryMethod === 'postal' || deliveryMethod === 'postal-delivery') {
          baseMessage = 'Great news! Your order has been dispatched via Royal Mail and is on its way to you. You should receive it within the next few days.';
        } else if (deliveryMethod === 'local-delivery') {
          baseMessage = 'Great news! Your order is out for local delivery and will be with you soon.';
        } else if (deliveryMethod === 'collection') {
          baseMessage = 'Great news! Your order is ready for collection. Please contact us to arrange pickup.';
        } else if (deliveryMethod === 'market-pickup') {
          baseMessage = 'Great news! Your order is ready for collection at our market stall. Please contact us to arrange pickup.';
        }

        // Only add tracking info for postal deliveries with tracking number
        if ((deliveryMethod === 'postal' || deliveryMethod === 'postal-delivery') && order.delivery.trackingNumber) {
          const trackingInfo = ` You can track your package using the tracking number provided below.`;
          return baseMessage + trackingInfo;
        }

        return baseMessage;
      })()
    },
    'delivered': {
      subject: `Order Delivered #${order.orderNumber} - Olgish Cakes`,
      message: `Your order has been delivered! We hope you enjoy your delicious cake. Please let us know if you have any feedback.`
    },
    'completed': {
      subject: `Order Completed #${order.orderNumber} - Olgish Cakes`,
      message: `Thank you for choosing Olgish Cakes! Your order has been completed. We hope you enjoyed your cake and look forward to serving you again.`
    },
    'cancelled': {
      subject: `Order Cancelled #${order.orderNumber} - Olgish Cakes`,
      message: `We're sorry to inform you that your order has been cancelled. If you have any questions, please don't hesitate to contact us.`
    }
  };

  const statusInfo = statusMessages[newStatus as keyof typeof statusMessages];
  if (!statusInfo) return;

  try {
    // Send the actual email
    await resend.emails.send({
      from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
      to: order.customer.email,
      bcc: 'igorrooney@gmail.com',
      subject: statusInfo.subject,
      html: `
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
                        Dear <strong>${order.customer.name}</strong>,
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
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">#${order.orderNumber}</td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Status</td>
                            <td style="padding: 8px 0; color: #059669; font-size: 14px; font-weight: 600; text-align: right;">${newStatus.charAt(0).toUpperCase() + newStatus.slice(1).replace('-', ' ')}</td>
                          </tr>
                          ${order.delivery.dateNeeded ? `
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Date Needed</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 14px; font-weight: 600; text-align: right;">${new Date(order.delivery.dateNeeded).toLocaleDateString('en-GB')}</td>
                          </tr>
                          ` : ''}
                          <tr>
                            <td style="padding: 8px 0; color: #6b7280; font-size: 14px; font-weight: 500;">Total Amount</td>
                            <td style="padding: 8px 0; color: #1f2937; font-size: 18px; font-weight: 700; text-align: right;">£${order.pricing.total}</td>
                          </tr>
                        </table>
                      </div>

                      <!-- Product Details -->
                      <div style="margin-bottom: 32px;">
                        <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                          Your Order
                        </h3>

                        ${order.items.map((item: any) => `
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

                      <!-- Design Images Section -->
                      ${(() => {
                        // Check if any items have individual design and if there are message attachments
                        const hasIndividualDesign = order.items?.some((item: any) => item.designType === 'individual');
                        const hasAttachments = order.messages?.some((message: any) => message.attachments && message.attachments.length > 0);

                        if (hasIndividualDesign && hasAttachments) {
                          const allAttachments = order.messages
                            .filter((message: any) => message.attachments && message.attachments.length > 0)
                            .flatMap((message: any) => message.attachments)
                            .filter((attachment: any) => attachment && attachment.asset);

                          if (allAttachments.length > 0) {
                            return `
                              <div style="background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                                <h3 style="margin: 0 0 12px 0; color: #15803d; font-size: 16px; font-weight: 600;">🎨 Your Design Reference</h3>
                                <p style="margin: 0 0 16px 0; color: #15803d; font-size: 14px;">
                                  We're using your design reference to create your perfect cake.
                                </p>
                                <div style="display: flex; flex-wrap: wrap; gap: 12px;">
                                  ${allAttachments.map((attachment: any) => {
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
                        }
                        return '';
                      })()}

                      ${newStatus === 'out-delivery' && order.delivery.trackingNumber ? `
                        <div style="background: #e3f2fd; border: 2px solid #2196f3; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                          <h3 style="margin: 0 0 12px 0; color: #1976d2; font-size: 16px; font-weight: 600;">📦 Tracking Information</h3>
                          ${order.delivery.deliveryMethod === 'postal-delivery' || order.delivery.deliveryMethod === 'postal' ? `
                            <p style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px;"><strong>Courier:</strong> Royal Mail</p>
                            <p style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px;">
                              <strong>Tracking Number:</strong>
                              <a href="https://www.royalmail.com/track-your-item#/tracking-results/${order.delivery.trackingNumber}"
                                 style="color: #1976d2; text-decoration: underline; font-weight: 600;">
                                ${order.delivery.trackingNumber}
                              </a>
                            </p>
                            <p style="margin: 0; color: #1976d2; font-size: 14px;">
                              <a href="https://www.royalmail.com/track-your-item#/tracking-results/${order.delivery.trackingNumber}"
                                 style="color: #1976d2; text-decoration: none; font-weight: 500;">
                                Track your package on Royal Mail website →
                              </a>
                            </p>
                          ` : `
                            <p style="margin: 0 0 8px 0; color: #1976d2; font-size: 14px;">
                              <strong>Tracking Number:</strong> ${order.delivery.trackingNumber}
                            </p>
                            <p style="margin: 0; color: #1976d2; font-size: 14px;">
                              <strong>Delivery Method:</strong> ${order.delivery.deliveryMethod.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
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
      `,
    });
  } catch (emailError) {
    console.error('Failed to send status update email:', emailError);
  }
}
