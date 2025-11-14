import { invalidateCache } from "@/app/utils/fetchCakes";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Security: Verify revalidation secret
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.REVALIDATE_SECRET;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { _type, _id, slug } = body;

    // Revalidate specific paths based on content type
    if (_type === "cake") {
      // Revalidate cake-specific pages
      if (slug?.current) {
        revalidatePath(`/cakes/${slug.current}`);
        revalidatePath("/cakes"); // Revalidate cakes list
        revalidatePath("/"); // Revalidate home page (might have featured cakes)

        // Clear specific cache entries
        await invalidateCache(`cake-${slug.current}`);
        await invalidateCache("all-cakes");
        await invalidateCache("featured-cakes");
      }
    } else if (_type === "testimonial") {
      // Revalidate testimonial pages
      revalidatePath("/testimonials");
      revalidatePath("/"); // Home page might show testimonials
      await invalidateCache("testimonials");
    } else if (_type === "faq") {
      // Revalidate FAQ pages
      revalidatePath("/faq");
      await invalidateCache("faqs");
    }

    // Revalidate tags for broader cache invalidation
    revalidateTag("cakes", "max");
    revalidateTag("testimonials", "max");
    revalidateTag("faqs", "max");

    return NextResponse.json({
      success: true,
      message: "Revalidation completed",
      revalidated: { _type, _id, slug },
    });
  } catch (error) {
    console.error("❌ Revalidation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Revalidation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET method - protected for security
export async function GET(request: NextRequest) {
  // Security: Require authentication even for GET endpoint
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.REVALIDATE_SECRET;

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    message: "Revalidation webhook is active",
    usage: "POST with Sanity webhook payload",
  });
}
