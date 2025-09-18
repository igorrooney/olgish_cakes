import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Blog post ID is required' }, { status: 400 });
    }

    // Get the current blog post to check if it exists
    const blogPost = await client.getDocument(id);
    
    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Increment view count
    const currentViewCount = blogPost.viewCount || 0;
    const newViewCount = currentViewCount + 1;

    // Update the view count in Sanity
    await client
      .patch(id)
      .set({ viewCount: newViewCount })
      .commit();

    return NextResponse.json({ 
      success: true, 
      viewCount: newViewCount 
    });

  } catch (error) {
    console.error('Error tracking view count:', error);
    return NextResponse.json(
      { error: 'Failed to track view count' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Blog post ID is required' }, { status: 400 });
    }

    // Get the current view count
    const blogPost = await client.fetch(`*[_id == $id][0]{viewCount}`, { id });
    
    if (!blogPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      viewCount: blogPost.viewCount || 0 
    });

  } catch (error) {
    console.error('Error fetching view count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch view count' },
      { status: 500 }
    );
  }
}
