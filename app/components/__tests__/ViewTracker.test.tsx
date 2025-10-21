/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import { ViewTracker } from '../ViewTracker'

// Mock useViewTracking hook
const mockUseViewTracking = jest.fn()
jest.mock('@/app/hooks/useViewTracking', () => ({
  useViewTracking: (props: any) => {
    mockUseViewTracking(props)
    return null
  }
}))

describe('ViewTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render without visible output', () => {
      const { container } = render(<ViewTracker postId="post-123" />)

      expect(container.firstChild).toBeNull()
    })

    it('should not render any DOM elements', () => {
      const { container } = render(<ViewTracker postId="post-123" />)

      expect(container.innerHTML).toBe('')
    })
  })

  describe('Hook Integration', () => {
    it('should call useViewTracking with postId', () => {
      render(<ViewTracker postId="post-123" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith({
        postId: 'post-123',
        enabled: true
      })
    })

    it('should use enabled=true by default', () => {
      render(<ViewTracker postId="post-456" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith({
        postId: 'post-456',
        enabled: true
      })
    })

    it('should pass enabled prop to hook', () => {
      render(<ViewTracker postId="post-789" enabled={false} />)

      expect(mockUseViewTracking).toHaveBeenCalledWith({
        postId: 'post-789',
        enabled: false
      })
    })

    it('should call hook when enabled is true', () => {
      render(<ViewTracker postId="post-123" enabled={true} />)

      expect(mockUseViewTracking).toHaveBeenCalled()
    })

    it('should call hook even when enabled is false', () => {
      render(<ViewTracker postId="post-123" enabled={false} />)

      // Hook is called but with enabled: false
      expect(mockUseViewTracking).toHaveBeenCalledWith({
        postId: 'post-123',
        enabled: false
      })
    })
  })

  describe('Different PostIds', () => {
    it('should track different postIds', () => {
      const { rerender } = render(<ViewTracker postId="post-1" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith({
        postId: 'post-1',
        enabled: true
      })

      rerender(<ViewTracker postId="post-2" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith({
        postId: 'post-2',
        enabled: true
      })
    })

    it('should handle numeric-like postIds', () => {
      render(<ViewTracker postId="12345" />)

      expect(mockUseViewTracking).toHaveBeenCalledWith({
        postId: '12345',
        enabled: true
      })
    })

    it('should handle UUID postIds', () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000'
      render(<ViewTracker postId={uuid} />)

      expect(mockUseViewTracking).toHaveBeenCalledWith({
        postId: uuid,
        enabled: true
      })
    })
  })

  describe('Return Value', () => {
    it('should return null', () => {
      const { container } = render(<ViewTracker postId="test" />)

      expect(container.firstChild).toBeNull()
    })
  })
})

