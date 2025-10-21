/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import BlogPostPage, { generateStaticParams, generateMetadata } from '../page'
import { notFound } from 'next/navigation'

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND')
  })
}))

// Mock sanity-blog functions
jest.mock('@/lib/sanity-blog', () => ({
  getBlogPost: jest.fn(),
  getRelatedPosts: jest.fn(() => Promise.resolve([])),
  getBlogCategories: jest.fn(() => Promise.resolve([]))
}))

const { getBlogPost: mockGetBlogPost } = jest.requireMock('@/lib/sanity-blog')

jest.mock('@/sanity/lib/client', () => {
  const mockFetch = jest.fn()
  return {
    client: { fetch: mockFetch },
    __mockFetch: mockFetch
  }
})

const { __mockFetch: mockFetch } = jest.requireMock('@/sanity/lib/client')

jest.mock('@/types/cake', () => ({ blocksToText: jest.fn(() => 'Text') }))
jest.mock('@/app/components/Breadcrumbs', () => ({ Breadcrumbs: () => <nav>Breadcrumbs</nav> }))
jest.mock('@/app/components/RichTextRenderer', () => ({ RichTextRenderer: () => <div>Content</div> }))
jest.mock('@/app/components/ViewTracker', () => ({ __esModule: true, default: () => null }))
jest.mock('@/app/components/RelatedPosts', () => ({ RelatedPosts: () => <div>Related</div> }))
jest.mock('@mui/material', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children }: any) => <div>{children}</div>,
  Box: ({ children }: any) => <div>{children}</div>,
  Chip: ({ label }: any) => <span>{label}</span>
}))
jest.mock('next/image', () => ({ __esModule: true, default: () => <img alt="blog" /> }))
jest.mock('@/sanity/lib/image', () => ({ urlFor: jest.fn(() => ({ width: () => ({ height: () => ({ url: () => 'url' }) }) })) }))

describe('BlogPostPage', () => {
  const mockPost = {
    _id: '1',
    title: 'Test Post',
    slug: { current: 'test-post' },
    excerpt: 'Excerpt',
    content: [],
    author: { name: 'Author' },
    publishedAt: '2025-01-01',
    mainImage: {},
    categories: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateStaticParams', () => {
    it('should generate params', async () => {
      mockFetch.mockResolvedValue([{ slug: 'test-post' }])

      const params = await generateStaticParams()

      expect(params).toEqual([{ slug: 'test-post' }])
    })
  })

  describe('generateMetadata', () => {
    it('should generate metadata', async () => {
      mockGetBlogPost.mockResolvedValue(mockPost)

      const metadata = await generateMetadata({ params: { slug: 'test-post' } })

      expect(metadata.title).toContain('Test Post')
    }, 10000)

    it('should return 404 for missing post', async () => {
      mockGetBlogPost.mockResolvedValue(null)

      const metadata = await generateMetadata({ params: { slug: 'missing' } })

      expect(metadata.title).toContain('Not Found')
    }, 10000)
  })

  describe('Rendering', () => {
    it('should render post page', async () => {
      mockGetBlogPost.mockResolvedValue(mockPost)

      // Server component - just verify it returns without throwing
      await expect(BlogPostPage({ params: { slug: 'test-post' } })).resolves.toBeDefined()
    }, 10000)

    it('should call notFound for missing post', async () => {
      mockGetBlogPost.mockResolvedValue(null)

      await expect(async () => {
        await BlogPostPage({ params: { slug: 'missing' } })
      }).rejects.toThrow('NEXT_NOT_FOUND')
      
      expect(notFound).toHaveBeenCalled()
    }, 10000)
  })
})

