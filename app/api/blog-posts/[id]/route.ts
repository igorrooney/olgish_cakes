import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'

// Validate Sanity configuration before client initialization
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID')
}
if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SANITY_DATASET')
}
if (!process.env.SANITY_API_TOKEN) {
  throw new Error('Missing environment variable: SANITY_API_TOKEN')
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const { id } = params

    const title = formData.get('title') as string
    const content = formData.get('content') as string
    const category = formData.get('category') as string
    const status = formData.get('status') as string
    const publishDate = formData.get('publishDate') as string
    const seoTitle = formData.get('seoTitle') as string
    const seoDescription = formData.get('seoDescription') as string
    const keywords = JSON.parse(formData.get('keywords') as string || '[]')
    const slug = formData.get('slug') as string
    const excerpt = formData.get('excerpt') as string
    const description = formData.get('description') as string
    const readTime = formData.get('readTime') as string
    const featured = formData.get('featured') === 'true'
    const featuredImage = formData.get('featuredImage') as File | null
    const cardImage = formData.get('cardImage') as File | null

    let featuredImageAsset = null
    if (featuredImage && featuredImage.size > 0) {
      // Upload image to Sanity
      const imageBuffer = await featuredImage.arrayBuffer()
      const imageAsset = await client.assets.upload('image', Buffer.from(imageBuffer), {
        filename: featuredImage.name,
        contentType: featuredImage.type,
      })
      featuredImageAsset = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: imageAsset._id,
        },
        alt: title + ' featured image',
      }
    }

    let cardImageAsset = null
    if (cardImage && cardImage.size > 0) {
      try {
        // Upload image to Sanity
        const imageBuffer = await cardImage.arrayBuffer()
        const imageAsset = await client.assets.upload('image', Buffer.from(imageBuffer), {
          filename: cardImage.name,
          contentType: cardImage.type,
        })

        cardImageAsset = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
          alt: title + ' card image',
        }
      } catch (imageError) {
        console.error('Error uploading card image:', imageError)
        return NextResponse.json(
          { error: 'Failed to upload card image: ' + (imageError as Error).message },
          { status: 500 }
        )
      }
    }

    const updateData = {
      title,
      excerpt,
      description,
      content,
      category,
      readTime,
      status: status || 'draft',
      featured,
      publishDate: publishDate ? new Date(publishDate).toISOString() : null,
      seoTitle,
      seoDescription,
      keywords: keywords || [],
      slug: {
        _type: 'slug',
        current: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      },
      ...(featuredImageAsset && { featuredImage: featuredImageAsset }),
      ...(cardImageAsset && { cardImage: cardImageAsset }),
    }

    const result = await client
      .patch(id)
      .set(updateData)
      .commit()

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error updating blog post:', error)
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params

    console.log('Patching blog post:', id, body)

    const result = await client
      .patch(id)
      .set(body)
      .commit()

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Error patching blog post:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to patch blog post: ' + errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await client.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    )
  }
}
