import { NextRequest, NextResponse } from "next/server";
import { serverClient } from "@/sanity/lib/client";

// GET - Fetch all cakes for admin selection
export async function GET(_request: NextRequest) {
  try {
    const query = `*[_type == "cake"] | order(name asc) {
      _id,
      name,
      slug,
      size,
      pricing,
      "category": coalesce(category, collections[0]->name, "Traditional"),
      collections[]->{
        _id,
        name
      }
    }`;

    const cakes = await serverClient.fetch(query);

    return NextResponse.json({
      success: true,
      cakes
    });

  } catch (error) {
    console.error('Failed to fetch cakes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cakes' },
      { status: 500 }
    );
  }
}
