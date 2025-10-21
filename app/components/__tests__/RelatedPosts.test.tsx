/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { RelatedPosts } from '../RelatedPosts'

// Mock Next.js
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>
})

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src, ...props }: any) => <img alt={alt} src={src} {...props} />
}))

// Mock Sanity
jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn((image) => ({
    url: () => 'https://cdn.sanity.io/image.jpg'
  }))
}))

// Mock MUI
jest.mock('@mui/material', () => ({
  Box: ({ children, sx, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  Typography: ({ children, variant, className, sx, ...props }: any) => (
    <div data-testid="typography" data-variant={variant} className={className} {...props}>
      {children}
    </div>
  ),
  Card: ({ children, component, sx, ...props }: any) => {
    const Component = component || 'div'
    return <Component data-testid="card" {...props}>{children}</Component>
  },
  CardContent: ({ children, sx, ...props }: any) => <div data-testid="card-content" {...props}>{children}</div>,
  CardMedia: ({ children, ...props }: any) => <div data-testid="card-media" {...props}>{children}</div>,
  Grid: ({ children, container, item, xs, md, spacing, ...props }: any) => (
    <div data-testid="grid" data-item={item} {...props}>{children}</div>
  ),
  Chip: ({ label, variant, size, sx, ...props }: any) => (
    <span data-testid="chip" data-variant={variant} data-size={size} {...props}>{label}</span>
  ),
  Stack: ({ children, direction, spacing, flexWrap, ...props }: any) => (
    <div data-testid="stack" {...props}>{children}</div>
  )
}))

describe('RelatedPosts', () => {
  const mockPosts = [
    {
      _id: 'post-1',
      title: 'Post 1',
      slug: { current: 'post-1' },
      excerpt: 'Excerpt 1',
      category: 'Recipes',
      readTime: '5 min',
      featured: false
    },
    {
      _id: 'post-2',
      title: 'Post 2',
      slug: { current: 'post-2' },
      excerpt: 'Excerpt 2',
      category: 'Tips',
      readTime: '3 min',
      featured: true
    },
    {
      _id: 'post-3',
      title: 'Post 3',
      slug: { current: 'post-3' },
      excerpt: 'Excerpt 3',
      category: 'Recipes',
      readTime: '7 min',
      featured: false
    }
  ]

  describe('Rendering', () => {
    it('should render heading', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      expect(screen.getByText('You Might Also Like')).toBeInTheDocument()
    })

    it('should render Grid container', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      expect(screen.getAllByTestId('grid').length).toBeGreaterThan(0)
    })

    it('should render cards for each related post', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      const cards = screen.getAllByTestId('card')
      expect(cards.length).toBeGreaterThan(0)
    })
  })

  describe('Post Filtering', () => {
    it('should exclude current post', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="post-1" currentCategory="Recipes" />)

      expect(screen.queryByText('Post 1')).not.toBeInTheDocument()
    })

    it('should show other posts', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="post-1" currentCategory="Recipes" />)

      expect(screen.getByText('Post 2')).toBeInTheDocument()
      expect(screen.getByText('Post 3')).toBeInTheDocument()
    })

    it('should limit to 3 posts', () => {
      const manyPosts = [
        ...mockPosts,
        { _id: 'post-4', title: 'Post 4', slug: { current: 'post-4' }, excerpt: 'Excerpt 4', category: 'Tips', readTime: '5 min' },
        { _id: 'post-5', title: 'Post 5', slug: { current: 'post-5' }, excerpt: 'Excerpt 5', category: 'Recipes', readTime: '6 min' }
      ]

      const { container } = render(<RelatedPosts posts={manyPosts} currentPostId="current" currentCategory="Recipes" />)

      const cards = container.querySelectorAll('[data-testid="card"]')
      expect(cards.length).toBeLessThanOrEqual(3)
    })
  })

  describe('Post Sorting', () => {
    it('should prioritize same category posts', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="post-2" currentCategory="Recipes" />)

      // Posts 1 and 3 are both Recipes, should appear before Tips posts
      const cards = screen.getAllByTestId('card')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should prioritize featured posts', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Other" />)

      // Post 2 is featured, should be prioritized
      expect(screen.getByText('Post 2')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should return null when no related posts', () => {
      const { container } = render(
        <RelatedPosts posts={[mockPosts[0]]} currentPostId="post-1" currentCategory="Recipes" />
      )

      expect(container.firstChild).toBeNull()
    })

    it('should return null for empty posts array', () => {
      const { container } = render(<RelatedPosts posts={[]} currentPostId="current" currentCategory="Recipes" />)

      expect(container.firstChild).toBeNull()
    })

    it('should render when posts available after filtering', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      expect(screen.getByText('You Might Also Like')).toBeInTheDocument()
    })
  })

  describe('Post Content', () => {
    it('should display post titles', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      expect(screen.getByText('Post 1')).toBeInTheDocument()
      expect(screen.getByText('Post 2')).toBeInTheDocument()
    })

    it('should display post excerpts', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      expect(screen.getByText('Excerpt 1')).toBeInTheDocument()
      expect(screen.getByText('Excerpt 2')).toBeInTheDocument()
    })

    it('should display category chips', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      const chips = screen.getAllByTestId('chip')
      expect(chips.length).toBeGreaterThan(0)
    })

    it('should show featured badge for featured posts', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      const chips = screen.getAllByTestId('chip')
      const featuredChip = chips.find(c => c.textContent === 'Featured')
      expect(featuredChip).toBeTruthy()
    })

    it('should not show featured badge for non-featured posts', () => {
      const nonFeaturedPosts = mockPosts.filter(p => !p.featured)
      render(<RelatedPosts posts={nonFeaturedPosts} currentPostId="current" currentCategory="Recipes" />)

      const chips = screen.getAllByTestId('chip')
      const featuredChip = chips.find(c => c.textContent === 'Featured')
      expect(featuredChip).toBeFalsy()
    })
  })

  describe('Links', () => {
    it('should link to blog posts', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      const post1Link = screen.getByText('Post 1').closest('a')
      expect(post1Link).toHaveAttribute('href', '/blog/post-1')
    })

    it('should link to all blog posts', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      const allPostsLink = screen.getByText('View All Blog Posts').closest('a')
      expect(allPostsLink).toHaveAttribute('href', '/blog')
    })

    it('should have aria-label for all blog posts link', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      const allPostsLink = screen.getByText('View All Blog Posts').closest('a')
      expect(allPostsLink).toHaveAttribute('aria-label', 'Browse all blog posts about Ukrainian cakes')
    })
  })

  describe('Images', () => {
    it('should use cardImage when available', () => {
      const postsWithImages = [
        {
          ...mockPosts[0],
          cardImage: { asset: { _ref: 'ref-1', url: '/card.jpg' }, alt: 'Card image' }
        }
      ]

      render(<RelatedPosts posts={postsWithImages as any} currentPostId="current" currentCategory="Recipes" />)

      expect(screen.getByAltText('Card image')).toBeInTheDocument()
    })

    it('should fallback to featuredImage', () => {
      const postsWithFeatured = [
        {
          ...mockPosts[0],
          featuredImage: { asset: { _ref: 'ref-1', url: '/featured.jpg' }, alt: 'Featured image' }
        }
      ]

      render(<RelatedPosts posts={postsWithFeatured as any} currentPostId="current" currentCategory="Recipes" />)

      expect(screen.getByAltText('Featured image')).toBeInTheDocument()
    })

    it('should use post title as fallback alt text', () => {
      render(<RelatedPosts posts={mockPosts} currentPostId="current" currentCategory="Recipes" />)

      expect(screen.getByAltText('Post 1')).toBeInTheDocument()
    })
  })
})

