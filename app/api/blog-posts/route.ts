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

// Additional validation logging for debugging
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || !process.env.NEXT_PUBLIC_SANITY_DATASET || !process.env.SANITY_API_TOKEN) {
  console.error('Missing Sanity configuration:', {
    projectId: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: !!process.env.NEXT_PUBLIC_SANITY_DATASET,
    token: !!process.env.SANITY_API_TOKEN
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    let query = `*[_type == "blogPost"] {
      _id,
      title,
      slug,
      excerpt,
      content,
      category,
      readTime,
      status,
      publishDate,
      seoTitle,
      seoDescription,
      keywords,
      featured,
      author,
      description,
      featuredImage {
        asset->{
          _id,
          url
        },
        alt
      },
      cardImage {
        asset->{
          _id,
          url
        },
        alt
      },
      viewCount
    }`
    const params: any = {}

    // Add status filter
    if (status) {
      query += ` && status == $status`
      params.status = status
    }

    // Add category filter
    if (category) {
      query += ` && category == $category`
      params.category = category
    }

    // Add ordering
    query += ` | order(publishDate desc, _createdAt desc)`

    // Add pagination
    if (limit) {
      query += `[${offset || 0}...${(parseInt(offset || '0') + parseInt(limit))}]`
    }

    const posts = await client.fetch(query, params)

    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

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

    // Validate required fields
    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required' },
        { status: 400 }
      )
    }

    console.log('Creating blog post with data:', {
      title,
      category,
      status,
      hasImage: !!featuredImage,
      imageSize: featuredImage?.size
    })

    let featuredImageAsset = null
    if (featuredImage && featuredImage.size > 0) {
      try {
        console.log('Uploading image to Sanity...')
        // Upload image to Sanity
        const imageBuffer = await featuredImage.arrayBuffer()
        const imageAsset = await client.assets.upload('image', Buffer.from(imageBuffer), {
          filename: featuredImage.name,
          contentType: featuredImage.type,
        })
        console.log('Image uploaded successfully:', imageAsset._id)

        featuredImageAsset = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: imageAsset._id,
          },
          alt: title + ' featured image',
        }
      } catch (imageError) {
        console.error('Error uploading image:', imageError)
        return NextResponse.json(
          { error: 'Failed to upload image: ' + (imageError as Error).message },
          { status: 500 }
        )
      }
    }

    let cardImageAsset = null
    if (cardImage && cardImage.size > 0) {
      try {
        console.log('Uploading card image to Sanity...')
        // Upload image to Sanity
        const imageBuffer = await cardImage.arrayBuffer()
        const imageAsset = await client.assets.upload('image', Buffer.from(imageBuffer), {
          filename: cardImage.name,
          contentType: cardImage.type,
        })
        console.log('Card image uploaded successfully:', imageAsset._id)

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

    const doc = {
      _type: 'blogPost',
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
      author: {
        name: 'Olga',
        image: null
      }
    }

    console.log('Creating document in Sanity...')
    const result = await client.create(doc)
    console.log('Blog post created successfully:', result._id)

    return NextResponse.json({ success: true, id: result._id })
  } catch (error) {
    console.error('Error creating blog post:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to create blog post: ' + errorMessage },
      { status: 500 }
    )
  }
}
