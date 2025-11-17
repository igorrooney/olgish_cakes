import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// Google Merchant Center Feed Revalidation Endpoint
export async function POST(request: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.MERCHANT_CENTER_REVALIDATE_TOKEN;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Revalidate cache tags for product feeds
    revalidateTag('cakes', 'max');
    revalidateTag('gift-hampers', 'max');
    revalidateTag('merchant-center-feed', 'max');

    // Log the revalidation
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Merchant Center feed cache revalidated at:', new Date().toISOString());
    }

    return NextResponse.json({
      success: true,
      message: 'Merchant Center feed cache revalidated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error revalidating merchant center feed:', error);
    }
    return NextResponse.json(
      { error: 'Failed to revalidate feed cache' },
      { status: 500 }
    );
  }
}

// GET endpoint for manual revalidation (for testing)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const expectedToken = process.env.MERCHANT_CENTER_REVALIDATE_TOKEN;

    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid or missing token' },
        { status: 401 }
      );
    }

    // Revalidate cache tags
    revalidateTag('cakes', 'max');
    revalidateTag('gift-hampers', 'max');
    revalidateTag('merchant-center-feed', 'max');

    return NextResponse.json({
      success: true,
      message: 'Merchant Center feed cache revalidated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error revalidating merchant center feed:', error);
    }
    return NextResponse.json(
      { error: 'Failed to revalidate feed cache' },
      { status: 500 }
    );
  }
}
