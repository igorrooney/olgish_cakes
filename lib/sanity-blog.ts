import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: true,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31',
})

export interface BlogPost {
  _id: string
  title: string
  slug: {
    current: string
  }
  excerpt: string
  description?: string
  content: any[]
  featuredImage?: {
    asset: {
      _ref: string
      url: string
    }
    alt?: string
  }
  cardImage?: {
    asset: {
      _ref: string
      url: string
    }
    alt?: string
  }
  category: string
  readTime: string
  viewCount?: number
  status: 'draft' | 'scheduled' | 'published'
  publishDate?: string
  seoTitle?: string
  seoDescription?: string
  keywords?: string[]
  featured?: boolean
  author?: {
    name: string
    image?: {
      asset: {
        _ref: string
        url: string
      }
      alt?: string
    }
  }
  _createdAt: string
  _updatedAt: string
}

export async function getBlogPosts(options: {
  status?: 'draft' | 'scheduled' | 'published'
  category?: string
  limit?: number
  offset?: number
  featured?: boolean
} = {}): Promise<BlogPost[]> {
  const { status, category, limit, offset, featured } = options

  let query = `*[_type == "blogPost"`
  const params: any = {}

  if (status) {
    query += ` && status == $status`
    params.status = status
  }

  if (category) {
    query += ` && category == $category`
    params.category = category
  }

  if (featured !== undefined) {
    query += ` && featured == $featured`
    params.featured = featured
  }

  query += `] {
    _id,
    title,
    slug,
    excerpt,
    description,
    content,
    category,
    readTime,
    status,
    publishDate,
    seoTitle,
    seoDescription,
    keywords,
    featured,
    _createdAt,
    _updatedAt,
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
  } | order(publishDate desc, _createdAt desc)`

  if (limit) {
    const start = offset || 0
    query += `[${start}...${start + limit}]`
  }

  return await client.fetch(query, params)
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const query = `*[_type == "blogPost" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    description,
    content,
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
    category,
    readTime,
    viewCount,
    status,
    publishDate,
    seoTitle,
    seoDescription,
    keywords,
    featured,
    _createdAt,
    _updatedAt,
    author->{
      name,
      image
    }
  }`
  return await client.fetch(query, { slug })
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return getBlogPost(slug)
}

export async function getBlogCategories(): Promise<{ name: string; count: number }[]> {
  const query = `*[_type == "blogPost" && status == "published"] {
    category
  }`
  
  const posts = await client.fetch(query)
  const categoryCounts = posts.reduce((acc: any, post: any) => {
    acc[post.category] = (acc[post.category] || 0) + 1
    return acc
  }, {})

  return Object.entries(categoryCounts).map(([name, count]) => ({
    name,
    count: count as number
  }))
}

export async function getRelatedPosts(
  currentPostId: string,
  category: string,
  limit: number = 3
): Promise<BlogPost[]> {
  const query = `*[_type == "blogPost" && status == "published" && _id != $currentPostId] {
    _id,
    title,
    slug,
    excerpt,
    category,
    readTime,
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
    publishDate,
    featured
  } | order(featured desc, publishDate desc) [0...$limit]`
  
  return await client.fetch(query, { currentPostId, category, limit })
}

export async function getScheduledPosts(): Promise<BlogPost[]> {
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  const query = `*[_type == "blogPost" && 
    status == "scheduled" && 
    publishDate >= $today] | order(publishDate asc)`
  
  return await client.fetch(query, { today: `${today}T00:00:00.000Z` })
}

export async function createBlogPost(post: Partial<BlogPost>): Promise<string> {
  const doc = {
    _type: 'blogPost',
    ...post,
    slug: {
      _type: 'slug',
      current: post.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || ''
    }
  }

  const result = await client.create(doc)
  return result._id
}

export async function updateBlogPost(id: string, updates: Partial<BlogPost>): Promise<void> {
  await client
    .patch(id)
    .set(updates)
    .commit()
}

export async function deleteBlogPost(id: string): Promise<void> {
  await client.delete(id)
}
