import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().split(' ')[0]

    console.warn(`Checking for scheduled posts on ${today} at ${currentTime}`)

    // Find posts scheduled for today that haven't been published yet
    const scheduledPosts = await client.fetch(`
      *[_type == "blogPost" &&
        status == "scheduled" &&
        publishDate >= "${today}T00:00:00.000Z" &&
        publishDate <= "${today}T23:59:59.999Z"]
    `)

    console.warn(`Found ${scheduledPosts.length} scheduled posts for today`)

    const publishedPosts = []

    for (const post of scheduledPosts) {
      const publishTime = new Date(post.publishDate).toTimeString().split(' ')[0]

      // Check if it's time to publish this post
      if (publishTime <= currentTime) {
        try {
          // Update the post status to published
          await client
            .patch(post._id)
            .set({
              status: 'published',
              publishDate: new Date().toISOString() // Update to actual publish time
            })
            .commit()

          publishedPosts.push({
            id: post._id,
            title: post.title,
            publishedAt: new Date().toISOString()
          })

          console.warn(`Published post: ${post.title}`)
        } catch (error) {
          console.error(`Error publishing post ${post._id}:`, error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      published: publishedPosts.length,
      posts: publishedPosts,
      message: `Published ${publishedPosts.length} posts`
    })

  } catch (error) {
    console.error('Error publishing scheduled posts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to publish scheduled posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Manual trigger for testing
export async function POST(request: NextRequest) {
  return GET(request)
}
