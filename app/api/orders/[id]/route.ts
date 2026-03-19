import { isAdminAuthenticated } from "@/lib/admin-auth";
import { logger } from "@/lib/logger";
import { generateUniqueKey } from "@/lib/order-utils";
import { serverClient } from "@/sanity/lib/client";
import { getEmailTransportMode, requiresLiveEmailConfiguration, sendEmail } from "@/lib/email/service";
import type { Order, OrderItem, OrderNoteImage, OrderUpdate } from "@/types/order";
import { NextRequest, NextResponse } from "next/server";

function normalizeEmailOrderItems(items: OrderItem[] | undefined) {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item) => ({
    productName: item.productName || 'Custom Order',
    quantity: typeof item.quantity === 'number' && Number.isFinite(item.quantity) ? item.quantity : 1,
    unitPrice: typeof item.unitPrice === 'number' && Number.isFinite(item.unitPrice) ? item.unitPrice : 0,
    totalPrice: typeof item.totalPrice === 'number' && Number.isFinite(item.totalPrice) ? item.totalPrice : 0,
    designType: item.designType,
    specialInstructions: item.specialInstructions,
    filling: item.flavor,
    servings: item.size,
    productType: item.productType,
    productId: item.productId
  }))
}

// GET - Fetch single order by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const isAuthenticated = await isAdminAuthenticated(request);
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    // Use parameterized query to prevent GROQ injection
    const order = await serverClient.fetch<Order | null>(
      `*[_type == "order" && _id == $id][0]{
        _id,
        _createdAt,
        _updatedAt,
        orderNumber,
        status,
        orderType,
        customer,
        items,
        delivery{
          dateNeeded,
          deliveryMethod,
          deliveryAddress,
          trackingNumber,
          deliveryNotes,
          giftNote
        },
        pricing{
          subtotal,
          deliveryFee,
          discount,
          total,
          paymentStatus,
          paymentMethod
        },
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
        metadata{
          giftNote,
          orderType,
          source,
          referrer
        }
      }`,
      { id }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);

  } catch (error) {
    logger.error('Failed to fetch order', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH - Update order (status, tracking, notes, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const isAuthenticated = await isAdminAuthenticated(request);
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    // Handle both JSON and FormData requests
    let updates: OrderUpdate = {};
    let images: File[] = [];

    const contentType = request.headers.get('content-type');

    if (contentType && contentType.includes('multipart/form-data')) {
      // Handle FormData (with potential image uploads)
      const formData = await request.formData();

      // Extract text fields
      updates.status = formData.get('status') as string;
      updates.trackingNumber = formData.get('trackingNumber') as string;
      updates.deliveryMethod = formData.get('deliveryMethod') as string;
      // Extract dateNeeded (format: YYYY-MM-DD)
      const dateNeeded = formData.get('dateNeeded') as string;
      updates.dateNeeded = dateNeeded && dateNeeded.trim() ? dateNeeded : null;
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

    // Get current order to compare changes (including existing notes)
    // Use parameterized query to prevent GROQ injection
    const currentOrder = await serverClient.fetch<Order | null>(
      `*[_type == "order" && _id == $id][0]{
        _id,
        orderNumber,
        status,
        customer,
        delivery,
        pricing,
        items,
        notes[]{
          _key,
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
        }
      }`,
      { id }
    );

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Prepare update document
    // Sanity uses dot notation for nested fields, so we use Record<string, unknown>
    const updateDoc: Record<string, unknown> = {};

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

    // Handle date needed updates
    if (updates.dateNeeded !== undefined) {
      updateDoc['delivery.dateNeeded'] = updates.dateNeeded;
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
        const updatedItems = currentOrder.items.map((item: OrderItem, index: number) =>
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

      const itemPrice = updates.itemPrice ? parseFloat(updates.itemPrice) : (currentOrder.items[0]?.unitPrice ?? 0);
      const newItem = {
        productType: 'cake',
        productId: updates.selectedCakeId || currentOrder.items[0]?.productId || '',
        productName: updates.selectedCakeName || currentOrder.items[0]?.productName || 'Custom Order',
        designType: updates.selectedDesignType || currentOrder.items[0]?.designType || 'standard',
        quantity: currentOrder.items[0]?.quantity || 1,
        unitPrice: itemPrice,
        totalPrice: itemPrice,
        size: updates.selectedCakeSize || currentOrder.items[0]?.size || '',
        flavor: currentOrder.items[0]?.flavor || '',
        specialInstructions: currentOrder.items[0]?.specialInstructions || '',
      };

      updateDoc.items = [newItem];
    }

    // Handle internal notes - only add if there's actual content (note text or images)
    // Always preserve existing notes by appending new ones
    if ((updates.note && updates.note.trim()) || images.length > 0) {
      const newNote = {
        _key: generateUniqueKey('note'),
        note: (updates.note && updates.note.trim()) || '',
        author: updates.author || 'Admin',
        createdAt: new Date().toISOString(),
        images: [] as OrderNoteImage[],
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
              filename: imageFile.name ?? 'image.jpg',
              contentType: imageFile.type ?? 'image/jpeg',
            });

            newNote.images.push({
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: imageAsset._id,
              },
              alt: imageFile.name ?? 'Uploaded image',
              caption: '',
            });
          } catch (imageError) {
            logger.error('Failed to upload image', imageError);
            // Continue with other images even if one fails
          }
        }
      }

      // Preserve all existing notes and append the new one
      // This ensures no notes are ever removed when adding a new one
      const existingNotes = currentOrder.notes || [];
      updateDoc.notes = [...existingNotes, newNote];
    }
    // Note: If no new note is being added, existing notes are automatically preserved
    // by Sanity's patch operation, so no explicit handling is needed

    // Update order in Sanity
    const updatedOrder = await serverClient
      .patch(id)
      .set(updateDoc)
      .commit();

    // Send status update email after order is updated (if status changed)
    if (updates.status && updates.status !== currentOrder.status) {
      // Fetch the complete order with all fields including pricing for the email
      // Use parameterized query to prevent GROQ injection
      const completeOrder = await serverClient.fetch<Order | null>(
        `*[_type == "order" && _id == $id][0]{
          _id,
          orderNumber,
          status,
          customer,
          items,
          delivery,
          pricing,
          messages[]{
            message,
            attachments[]{
              _type,
              asset->{
                _id,
                url
              },
              alt,
              caption
            }
          }
        }`,
        { id }
      );

      if (completeOrder) {
        // Create a modified order object with the updated delivery method for email
        const orderForEmail = {
          ...completeOrder,
          delivery: {
            ...completeOrder.delivery,
            deliveryMethod: updates.deliveryMethod || completeOrder.delivery.deliveryMethod
          }
        };
        await sendStatusUpdateEmail(orderForEmail, updates.status);
      }
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Order updated successfully'
    });

  } catch (error) {
    logger.error('Failed to update order', error);
    return NextResponse.json(
      { error: 'Failed to update order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete order (soft delete by default, permanent delete with password)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin authentication
  const isAuthenticated = await isAdminAuthenticated(request);
  if (!isAuthenticated) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { password, permanent } = body;

    // Use parameterized query to prevent GROQ injection
    const currentOrder = await serverClient.fetch<Order | null>(
      `*[_type == "order" && _id == $id][0]`,
      { id }
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
      await serverClient.delete(id);

      return NextResponse.json({
        success: true,
        message: 'Order permanently deleted from Sanity'
      });
    }

    // Default behavior: Soft delete by changing status to cancelled
    const cancelledOrder = await serverClient
      .patch(id)
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
    logger.error('Failed to delete order', error);
    return NextResponse.json(
      { error: 'Failed to delete order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to send status update emails
async function sendStatusUpdateEmail(order: Order, newStatus: string) {
  const emailMode = getEmailTransportMode()

  if (requiresLiveEmailConfiguration(emailMode) && !process.env.RESEND_API_KEY) {
    logger.error('RESEND_API_KEY not configured - skipping status update email')
    return
  }

  const statusMessages = {
    confirmed: {
      subject: `Order Confirmed #${order.orderNumber} - Olgish Cakes`,
      message: 'Great news! Your order has been confirmed and we\'ve started working on it. We\'ll keep you updated on progress.'
    },
    'in-progress': {
      subject: `Order In Progress #${order.orderNumber} - Olgish Cakes`,
      message: 'Your order is now in progress. Our team is preparing your cake with care.'
    },
    'ready-pickup': {
      subject: `Order Ready for Collection #${order.orderNumber} - Olgish Cakes`,
      message: 'Your order is ready for collection. Please contact us to arrange pickup.'
    },
    'out-delivery': {
      subject: `Order Out for Delivery #${order.orderNumber} - Olgish Cakes`,
      message: (() => {
        const deliveryMethod = order.delivery.deliveryMethod

        if (deliveryMethod === 'postal' || deliveryMethod === 'postal-delivery') {
          return order.delivery.trackingNumber
            ? 'Great news! Your order has been dispatched via Royal Mail. You can use the tracking number below to follow delivery.'
            : 'Great news! Your order has been dispatched via Royal Mail and is on the way.'
        }

        if (deliveryMethod === 'local-delivery') {
          return 'Great news! Your order is out for local delivery and will be with you soon.'
        }

        if (deliveryMethod === 'market-pickup') {
          return 'Great news! Your order is ready for collection at our market stall. Please contact us to arrange pickup.'
        }

        return 'Great news! Your order is on its way to you.'
      })()
    },
    delivered: {
      subject: `Order Delivered #${order.orderNumber} - Olgish Cakes`,
      message: 'Your order has been delivered. We hope you enjoy your cake.'
    },
    completed: {
      subject: `Order Completed #${order.orderNumber} - Olgish Cakes`,
      message: 'Thank you for choosing Olgish Cakes. Your order is completed and we look forward to serving you again.'
    },
    cancelled: {
      subject: `Order Cancelled #${order.orderNumber} - Olgish Cakes`,
      message: 'We\'re sorry to inform you that your order has been cancelled. If you have questions, please contact us.'
    }
  } as const

  const statusInfo = statusMessages[newStatus as keyof typeof statusMessages]
  if (!statusInfo) {
    return
  }

  const firstItem = order.items?.[0]
  const totalPrice = (() => {
    if (typeof order.pricing?.total === 'number' && order.pricing.total > 0) {
      return order.pricing.total
    }

    if (Array.isArray(order.items) && order.items.length > 0) {
      return order.items.reduce((sum: number, item: OrderItem) => {
        const itemTotal = typeof item.totalPrice === 'number' ? item.totalPrice : item.unitPrice || 0
        return sum + itemTotal
      }, 0)
    }

    return 0
  })()

  const normalizedStatus = newStatus === 'ready-pickup'
    ? 'ready'
    : newStatus === 'out-delivery'
      ? 'out-for-delivery'
      : newStatus

  try {
    const sendResult = await sendEmail({
      templateId: 'orders-status-update',
      input: {
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone,
        address: order.customer.address,
        city: order.customer.city,
        postcode: order.customer.postcode,
        orderNumber: order.orderNumber,
        orderType: order.orderType,
        productName: firstItem?.productName,
        productId: firstItem?.productId,
        productType: firstItem?.productType,
        quantity: firstItem?.quantity,
        unitPrice: firstItem?.unitPrice,
        totalPrice,
        orderItems: normalizeEmailOrderItems(order.items),
        dateNeeded: order.delivery.dateNeeded || undefined,
        status: normalizedStatus,
        designType: firstItem?.designType,
        filling: firstItem?.flavor,
        servings: firstItem?.size,
        customerMessage: firstItem?.specialInstructions,
        deliveryMethod: order.delivery.deliveryMethod,
        deliveryAddress: order.delivery.deliveryAddress,
        paymentMethod: order.pricing?.paymentMethod,
        trackingNumber: order.delivery.trackingNumber || undefined,
        titleOverride: statusInfo.subject,
        statusMessage: statusInfo.message
      },
      modeOverride: emailMode,
      message: {
        from: 'Olgish Cakes <hello@olgishcakes.co.uk>',
        to: order.customer.email,
        bcc: process.env.ADMIN_BCC_EMAIL || undefined
      }
    })

    if (sendResult.error) {
      throw new Error(sendResult.error.message)
    }
  } catch (emailError) {
    logger.error('Failed to send status update email', emailError)
  }
}


