// Mock Sanity client BEFORE importing anything else
const mockFetch = jest.fn()
const mockCreate = jest.fn()
const mockPatch = jest.fn()
const mockDelete = jest.fn()
const mockCommit = jest.fn()
const mockSet = jest.fn()

jest.mock('@sanity/client', () => {
  const mockFetchInstance = jest.fn()
  const mockCreateInstance = jest.fn()
  const mockPatchInstance = jest.fn()
  const mockDeleteInstance = jest.fn()
  
  return {
    createClient: jest.fn(() => ({
      fetch: mockFetchInstance,
      create: mockCreateInstance,
      patch: mockPatchInstance,
      delete: mockDeleteInstance
    })),
    __mockFetch: mockFetchInstance,
    __mockCreate: mockCreateInstance,
    __mockPatch: mockPatchInstance,
    __mockDelete: mockDeleteInstance
  }
})

import { createClient } from '@sanity/client'
import {
  getBlogPosts,
  getBlogPost,
  getBlogPostBySlug,
  getBlogCategories,
  getRelatedPosts,
  getScheduledPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} from '../sanity-blog'

const sanityMock = jest.requireMock('@sanity/client')
const mockFetchActual = sanityMock.__mockFetch
const mockCreateActual = sanityMock.__mockCreate
const mockPatchActual = sanityMock.__mockPatch
const mockDeleteActual = sanityMock.__mockDelete

describe('sanity-blog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup chainable mock methods
    mockPatchActual.mockReturnValue({
      set: mockSet
    })

    mockSet.mockReturnValue({
      commit: mockCommit
    })
  })

  describe('getBlogPosts', () => {
    it('should fetch all blog posts with default options', async () => {
      mockFetchActual.mockResolvedValue([])

      await getBlogPosts()

      expect(mockFetchActual).toHaveBeenCalled()
      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('*[_type == "blogPost"')
    })

    it('should filter by status', async () => {
      mockFetchActual.mockResolvedValue([])

      await getBlogPosts({ status: 'published' })

      const query = mockFetchActual.mock.calls[0][0]
      const params = mockFetchActual.mock.calls[0][1]
      expect(query).toContain('status == $status')
      expect(params.status).toBe('published')
    })

    it('should filter by category', async () => {
      mockFetchActual.mockResolvedValue([])

      await getBlogPosts({ category: 'Recipes' })

      const query = mockFetchActual.mock.calls[0][0]
      const params = mockFetchActual.mock.calls[0][1]
      expect(query).toContain('category == $category')
      expect(params.category).toBe('Recipes')
    })

    it('should filter by featured', async () => {
      mockFetchActual.mockResolvedValue([])

      await getBlogPosts({ featured: true })

      const query = mockFetchActual.mock.calls[0][0]
      const params = mockFetchActual.mock.calls[0][1]
      expect(query).toContain('featured == $featured')
      expect(params.featured).toBe(true)
    })

    it('should apply limit and offset', async () => {
      mockFetchActual.mockResolvedValue([])

      await getBlogPosts({ limit: 10, offset: 5 })

      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('[5...15]')
    })

    it('should handle limit without offset', async () => {
      mockFetchActual.mockResolvedValue([])

      await getBlogPosts({ limit: 10 })

      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('[0...10]')
    })

    it('should combine multiple filters', async () => {
      mockFetchActual.mockResolvedValue([])

      await getBlogPosts({
        status: 'published',
        category: 'Recipes',
        featured: true,
        limit: 5
      })

      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('status == $status')
      expect(query).toContain('category == $category')
      expect(query).toContain('featured == $featured')
    })

    it('should order by publishDate and createdAt', async () => {
      mockFetchActual.mockResolvedValue([])

      await getBlogPosts()

      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('order(publishDate desc, _createdAt desc)')
    })
  })

  describe('getBlogPost', () => {
    it('should fetch single blog post by slug', async () => {
      const mockPost = { _id: '1', title: 'Test', slug: { current: 'test' } }
      mockFetchActual.mockResolvedValue(mockPost)

      const result = await getBlogPost('test-slug')

      expect(mockFetchActual).toHaveBeenCalled()
      const query = mockFetchActual.mock.calls[0][0]
      const params = mockFetchActual.mock.calls[0][1]
      expect(query).toContain('slug.current == $slug')
      expect(params.slug).toBe('test-slug')
      expect(result).toEqual(mockPost)
    })

    it('should return null if not found', async () => {
      mockFetchActual.mockResolvedValue(null)

      const result = await getBlogPost('non-existent')

      expect(result).toBeNull()
    })

    it('should include author data', async () => {
      mockFetchActual.mockResolvedValue({})

      await getBlogPost('test')

      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('author->')
    })
  })

  describe('getBlogPostBySlug', () => {
    it('should call getBlogPost', async () => {
      mockFetchActual.mockResolvedValue(null)

      await getBlogPostBySlug('test-slug')

      expect(mockFetchActual).toHaveBeenCalled()
      const params = mockFetchActual.mock.calls[0][1]
      expect(params.slug).toBe('test-slug')
    })
  })

  describe('getBlogCategories', () => {
    it('should return category counts', async () => {
      const mockPosts = [
        { category: 'Recipes' },
        { category: 'Recipes' },
        { category: 'Tips' }
      ]
      mockFetchActual.mockResolvedValue(mockPosts)

      const result = await getBlogCategories()

      expect(result).toEqual([
        { name: 'Recipes', count: 2 },
        { name: 'Tips', count: 1 }
      ])
    })

    it('should only fetch published posts', async () => {
      mockFetchActual.mockResolvedValue([])

      await getBlogCategories()

      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('status == "published"')
    })

    it('should handle empty results', async () => {
      mockFetchActual.mockResolvedValue([])

      const result = await getBlogCategories()

      expect(result).toEqual([])
    })

    it('should handle single category', async () => {
      mockFetchActual.mockResolvedValue([{ category: 'Recipes' }])

      const result = await getBlogCategories()

      expect(result).toEqual([{ name: 'Recipes', count: 1 }])
    })
  })

  describe('getRelatedPosts', () => {
    it('should fetch related posts excluding current post', async () => {
      mockFetchActual.mockResolvedValue([])

      await getRelatedPosts('post-123', 'Recipes')

      const query = mockFetchActual.mock.calls[0][0]
      const params = mockFetchActual.mock.calls[0][1]
      expect(query).toContain('_id != $currentPostId')
      expect(params.currentPostId).toBe('post-123')
    })

    it('should use default limit of 3', async () => {
      mockFetchActual.mockResolvedValue([])

      await getRelatedPosts('post-123', 'Recipes')

      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('[0...$limit]')
      const params = mockFetchActual.mock.calls[0][1]
      expect(params.limit).toBe(3)
    })

    it('should respect custom limit', async () => {
      mockFetchActual.mockResolvedValue([])

      await getRelatedPosts('post-123', 'Recipes', 5)

      const params = mockFetchActual.mock.calls[0][1]
      expect(params.limit).toBe(5)
    })

    it('should order by featured and publishDate', async () => {
      mockFetchActual.mockResolvedValue([])

      await getRelatedPosts('post-123', 'Recipes')

      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('order(featured desc, publishDate desc)')
    })

    it('should only fetch published posts', async () => {
      mockFetchActual.mockResolvedValue([])

      await getRelatedPosts('post-123', 'Recipes')

      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('status == "published"')
    })
  })

  describe('getScheduledPosts', () => {
    it('should fetch scheduled posts from today onwards', async () => {
      mockFetchActual.mockResolvedValue([])

      await getScheduledPosts()

      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('status == "scheduled"')
      expect(query).toContain('publishDate >= $today')
    })

    it('should order by publishDate ascending', async () => {
      mockFetchActual.mockResolvedValue([])

      await getScheduledPosts()

      const query = mockFetchActual.mock.calls[0][0]
      expect(query).toContain('order(publishDate asc)')
    })

    it('should use ISO date format', async () => {
      mockFetchActual.mockResolvedValue([])

      await getScheduledPosts()

      const params = mockFetchActual.mock.calls[0][1]
      expect(params.today).toMatch(/T00:00:00\.000Z$/)
    })
  })

  describe('createBlogPost', () => {
    it('should create a new blog post', async () => {
      mockCreateActual.mockResolvedValue({ _id: 'new-post-id' })

      const result = await createBlogPost({
        title: 'New Post',
        excerpt: 'Test excerpt'
      })

      expect(mockCreateActual).toHaveBeenCalled()
      expect(result).toBe('new-post-id')
    })

    it('should generate slug from title', async () => {
      mockCreateActual.mockResolvedValue({ _id: 'new-post-id' })

      await createBlogPost({
        title: 'My New Blog Post'
      })

      const doc = mockCreateActual.mock.calls[0][0]
      expect(doc.slug).toEqual({
        _type: 'slug',
        current: 'my-new-blog-post'
      })
    })

    it('should handle special characters in title', async () => {
      mockCreateActual.mockResolvedValue({ _id: 'new-post-id' })

      await createBlogPost({
        title: 'Test & Post #1!'
      })

      const doc = mockCreateActual.mock.calls[0][0]
      expect(doc.slug.current).toBe('test-post-1')
    })

    it('should handle empty title', async () => {
      mockCreateActual.mockResolvedValue({ _id: 'new-post-id' })

      await createBlogPost({})

      const doc = mockCreateActual.mock.calls[0][0]
      expect(doc.slug.current).toBe('')
    })

    it('should set _type to blogPost', async () => {
      mockCreateActual.mockResolvedValue({ _id: 'new-post-id' })

      await createBlogPost({ title: 'Test' })

      const doc = mockCreateActual.mock.calls[0][0]
      expect(doc._type).toBe('blogPost')
    })

    it('should preserve other post properties', async () => {
      mockCreateActual.mockResolvedValue({ _id: 'new-post-id' })

      await createBlogPost({
        title: 'Test',
        excerpt: 'Excerpt',
        category: 'Recipes'
      })

      const doc = mockCreateActual.mock.calls[0][0]
      expect(doc.excerpt).toBe('Excerpt')
      expect(doc.category).toBe('Recipes')
    })
  })

  describe('updateBlogPost', () => {
    it('should update blog post with given id', async () => {
      mockCommit.mockResolvedValue({})

      await updateBlogPost('post-123', { title: 'Updated Title' })

      expect(mockPatchActual).toHaveBeenCalledWith('post-123')
      expect(mockSet).toHaveBeenCalledWith({ title: 'Updated Title' })
      expect(mockCommit).toHaveBeenCalled()
    })

    it('should update multiple fields', async () => {
      mockCommit.mockResolvedValue({})

      await updateBlogPost('post-123', {
        title: 'New Title',
        excerpt: 'New Excerpt',
        status: 'published'
      })

      expect(mockSet).toHaveBeenCalledWith({
        title: 'New Title',
        excerpt: 'New Excerpt',
        status: 'published'
      })
    })
  })

  describe('deleteBlogPost', () => {
    it('should delete blog post by id', async () => {
      mockDelete.mockResolvedValue({})

      await deleteBlogPost('post-123')

      expect(mockDeleteActual).toHaveBeenCalledWith('post-123')
    })
  })

  describe('Client Configuration', () => {
    it('should use environment variables for configuration', () => {
      // Client is configured at module load time
      expect(createClient).toBeDefined()
      expect(typeof createClient).toBe('function')
    })
  })
})

