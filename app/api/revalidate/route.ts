import { invalidateCache } from "@/app/utils/fetchCakes";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateRequest, formatValidationErrors } from "@/lib/validation";

// Webhook payload validation schema
const revalidateSchema = z.object({
  _type: z.string().min(1, 'Content type is required'),
  _id: z.string().optional(),
  slug: z.object({
    current: z.string()
  }).optional()
});

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
    
    // Validate webhook payload
    const validationResult = await validateRequest(revalidateSchema, body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: formatValidationErrors(validationResult.errors) 
        },
        { status: 400 }
      );
    }

    const { _type, _id, slug } = validationResult.data;

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
    } else if (_type === "giftHamper") {
      // Revalidate gift hamper pages
      if (slug?.current) {
        revalidatePath(`/gift-hampers/${slug.current}`);
        revalidatePath("/gift-hampers"); // Revalidate gift hampers list
        revalidatePath("/"); // Home page might show featured hampers
      }
      await invalidateCache("gift-hampers");
    } else if (_type === "blogPost") {
      // Revalidate blog pages
      if (slug?.current) {
        revalidatePath(`/blog/${slug.current}`);
        revalidatePath("/blog"); // Revalidate blog list
      }
      await invalidateCache("blog-posts");
    } else if (_type === "marketSchedule") {
      // Revalidate market schedule page
      revalidatePath("/market-schedule");
      revalidatePath("/"); // Home page might link to market schedule
      await invalidateCache("market-schedule");
    }

    // Revalidate tags for broader cache invalidation
    // Note: revalidateTag requires 2 parameters in Next.js 16 (tag and cache profile)
    revalidateTag("cakes", "max");
    revalidateTag("testimonials", "max");
    revalidateTag("faqs", "max");
    revalidateTag("gift-hampers", "max");
    revalidateTag("blog-posts", "max");
    revalidateTag("market-schedule", "max");

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
