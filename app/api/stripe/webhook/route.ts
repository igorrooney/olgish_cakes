import { NextRequest, NextResponse } from 'next/server';
import { stripe, verifyWebhookSignature } from '@/lib/stripe';
import { databases, COLLECTIONS, DATABASE_ID } from '@/lib/appwrite';
import { CreateOrderData } from '@/types/orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('No stripe signature found');
      return NextResponse.json(
        { error: 'No signature found' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const event = verifyWebhookSignature(body, signature);
    if (!event) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log('Received webhook event:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        await handleCheckoutSessionCompleted(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log('Payment succeeded:', paymentIntent.id);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log('Payment failed:', paymentIntent.id);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    console.log('Processing checkout session:', session.id);

    // Check if order already exists
    const existingOrders = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.ORDERS,
      [`stripeCheckoutSessionId=${session.id}`]
    );

    if (existingOrders.documents.length > 0) {
      console.log('Order already exists for session:', session.id);
      return;
    }

    // Retrieve the session with line items
    const sessionWithItems = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items.data.price.product'],
    });

    const lineItems = sessionWithItems.line_items?.data || [];
    if (lineItems.length === 0) {
      console.error('No line items found in session:', session.id);
      return;
    }

    // Calculate totals
    const subtotal = session.amount_subtotal || 0;
    const total = session.amount_total || 0;

    // Create order
    const orderData: CreateOrderData = {
      userId: session.metadata.userId,
      stripeCheckoutSessionId: session.id,
      email: session.customer_details?.email || session.customer_email || '',
      shippingName: `${session.shipping_details?.name || ''}`,
      shippingAddress: {
        line1: session.shipping_details?.address?.line1 || '',
        line2: session.shipping_details?.address?.line2 || '',
        city: session.shipping_details?.address?.city || '',
        county: session.shipping_details?.address?.state || '',
        postcode: session.shipping_details?.address?.postal_code || '',
        country: session.shipping_details?.address?.country || 'GB',
      },
      items: lineItems.map((item: any) => ({
        productId: session.metadata.productId,
        name: item.description || session.metadata.productName,
        unitPriceGBP: item.price.unit_amount,
        quantity: item.quantity,
        image: '', // We'll get this from the product
      })),
    };

    // Create order document
    const order = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.ORDERS,
      'unique()',
      {
        userId: orderData.userId,
        status: 'PAID',
        subtotalGBP: subtotal,
        totalGBP: total,
        currency: 'GBP',
        paymentIntentId: session.payment_intent,
        stripeCheckoutSessionId: orderData.stripeCheckoutSessionId,
        email: orderData.email,
        shippingName: orderData.shippingName,
        shippingAddress: orderData.shippingAddress,
      }
    );

    // Create order items
    for (const item of orderData.items) {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.ORDER_ITEMS,
        'unique()',
        {
          orderId: order.$id,
          productId: item.productId,
          name: item.name,
          unitPriceGBP: item.unitPriceGBP,
          quantity: item.quantity,
          image: item.image,
        }
      );
    }

    console.log('Order created successfully:', order.$id);

    // TODO: Send order confirmation email
    // await sendOrderConfirmationEmail(orderData.email, order);

  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

// Export config for Next.js
export const runtime = 'nodejs';

