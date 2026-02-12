import { invalidateCache } from "@/app/utils/fetchCakes";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateRequest, formatValidationErrors } from "@/lib/validation";
import { withRateLimit } from "@/lib/rate-limit";

// Webhook payload validation schema
const revalidateSchema = z.object({
  _type: z.string().min(1, 'Content type is required'),
  _id: z.string().optional(),
  slug: z.object({
    current: z.string()
  }).optional()
});

async function handlePOST(request: NextRequest) {
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
    const pathsToRevalidate = new Set<string>()
    const tagsToRevalidate = new Set<string>()

    const addPath = (path: string) => {
      pathsToRevalidate.add(path)
    }

    const addTag = (tag: string) => {
      tagsToRevalidate.add(tag)
    }

    // Revalidate specific paths based on content type
    if (_type === "cake") {
      // Revalidate cake-specific pages
      if (slug?.current) {
        addPath(`/cakes/${slug.current}`)
        addPath("/cakes") // Revalidate cakes list
        addPath("/") // Revalidate home page (might have featured cakes)

        // Clear specific cache entries
        await invalidateCache(`cake-${slug.current}`);
        await invalidateCache("all-cakes");
        await invalidateCache("featured-cakes");
      }
      addTag('cakes')
      addTag('pages')
      addTag('sitemaps')
    } else if (_type === 'cakesFeaturedOffer') {
      addPath('/cakes')
      addTag('cakes')
      addTag('cakes-featured-offer')
    } else if (_type === "testimonial") {
      // Revalidate testimonial pages
      addPath("/testimonials")
      addPath("/") // Home page might show testimonials
      addPath("/about")
      addPath("/order")
      addPath("/gift-hampers")
      await invalidateCache("testimonials");
      addTag('testimonials')
    } else if (_type === "faq") {
      // Revalidate FAQ pages
      addPath("/faq")
      await invalidateCache("faqs");
      addTag('faqs')
    } else if (_type === "giftHamper") {
      // Revalidate gift hamper pages
      if (slug?.current) {
        addPath(`/gift-hampers/${slug.current}`)
        addPath("/gift-hampers") // Revalidate gift hampers list
      }
      await invalidateCache("gift-hampers");
      addTag('gift-hampers')
      addTag('pages')
      addTag('sitemaps')
    } else if (_type === "blogPost") {
      // Revalidate blog pages
      if (slug?.current) {
        addPath(`/blog/${slug.current}`)
        addPath("/blog") // Revalidate blog list
      }
      await invalidateCache("blog-posts");
      addTag('blog-posts')
      addTag('sitemaps')
    } else if (_type === "marketSchedule") {
      // Revalidate market schedule page
      addPath("/market-schedule")
      addPath("/") // Home page might link to market schedule
      await invalidateCache("market-schedule");
      addTag('market-schedule')
    } else if (_type === 'collection') {
      // Revalidate homepage collections
      addPath("/")
      addTag('collections')
    }

    for (const path of pathsToRevalidate) {
      revalidatePath(path)
    }

    // Note: revalidateTag requires 2 parameters in Next.js 16 (tag and cache profile)
    for (const tag of tagsToRevalidate) {
      revalidateTag(tag, 'max')
    }

    return NextResponse.json({
      success: true,
      message: "Revalidation completed",
      revalidated: { _type, _id, slug },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error("❌ Revalidation error:", error);
    }
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

// Apply rate limiting: 10 revalidations per minute
export const POST = withRateLimit(handlePOST, {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10 // 10 revalidations per minute
});

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
