import { NextRequest, NextResponse } from "next/server";
import { invalidateCache } from "@/app/utils/fetchCakes";

export async function POST(request: NextRequest) {
  try {
    // Basic security check (you can enhance this)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.ADMIN_SECRET_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pattern } = body;

    console.log("🧹 Admin cache clear requested:", { pattern });

    // Clear cache with optional pattern
    await invalidateCache(pattern);

    return NextResponse.json({
      success: true,
      message: pattern ? `Cache cleared for pattern: ${pattern}` : "All cache cleared",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Admin cache clear error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Cache clear failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET method for status check
export async function GET() {
  return NextResponse.json({
    status: "Admin cache management endpoint is active",
    usage: "POST with optional pattern parameter",
  });
}
