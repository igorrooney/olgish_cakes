import { NextRequest, NextResponse } from 'next/server';
import { account, databases, COLLECTIONS, DATABASE_ID } from '@/lib/appwrite';
import { createCheckoutSession } from '@/lib/stripe';
import { z } from 'zod';

const checkoutSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1).default(1),
  customerEmail: z.string().email().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity, customerEmail } = checkoutSchema.parse(body);

    // Get user session from Appwrite
    const session = await account.getSession('current');
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get product details from database
    const productResponse = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PRODUCTS,
      productId
    );

    const product = productResponse as any;

    if (!product.isGiftHamper || !product.stripePriceId) {
      return NextResponse.json(
        { error: 'Product is not available for purchase' },
        { status: 400 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: 'Product is not currently available' },
        { status: 400 }
      );
    }

    // Get user details for email
    const user = await account.get();
    const finalCustomerEmail = customerEmail || user.email;

    // Create checkout session
    const result = await createCheckoutSession({
      priceId: product.stripePriceId,
      quantity,
      customerEmail: finalCustomerEmail,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/products/${product.slug}`,
      metadata: {
        productId: product.$id,
        userId: user.$id,
        productName: product.name,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ sessionId: result.sessionId });
  } catch (error) {
    console.error('Checkout error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

