import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { invalidateCache } from "@/app/utils/fetchCakes";

export async function POST(request: NextRequest) {
  try {
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

// GET method for testing
export async function GET() {
  return NextResponse.json({
    message: "Revalidation webhook is active",
    usage: "POST with Sanity webhook payload",
  });
}
