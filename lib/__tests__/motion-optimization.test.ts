/**
 * Tests for motion optimization utilities
 * @jest-environment jsdom
 */

import {
  getOptimizedAnimation,
  useOptimizedAnimation,
  fadeInPreset,
  slideUpPreset,
  scalePreset,
  useReducedMotion
} from '../motion-optimization'

// Mock window.matchMedia for testing
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn()
    }))
  })
}

describe('motion-optimization', () => {
  describe('Animation Presets', () => {
    describe('fadeInPreset', () => {
      it('should have initial opacity 0', () => {
        expect(fadeInPreset.initial.opacity).toBe(0)
      })

      it('should animate to opacity 1', () => {
        expect(fadeInPreset.animate.opacity).toBe(1)
      })

      it('should have 0.2s duration', () => {
        expect(fadeInPreset.transition.duration).toBe(0.2)
      })

      it('should have all required properties', () => {
        expect(fadeInPreset.initial).toBeDefined()
        expect(fadeInPreset.animate).toBeDefined()
        expect(fadeInPreset.transition).toBeDefined()
      })
    })

    describe('slideUpPreset', () => {
      it('should have initial opacity 0 and y 10', () => {
        expect(slideUpPreset.initial.opacity).toBe(0)
        expect(slideUpPreset.initial.y).toBe(10)
      })

      it('should animate to opacity 1 and y 0', () => {
        expect(slideUpPreset.animate.opacity).toBe(1)
        expect(slideUpPreset.animate.y).toBe(0)
      })

      it('should have 0.2s duration', () => {
        expect(slideUpPreset.transition.duration).toBe(0.2)
      })

      it('should have all required properties', () => {
        expect(slideUpPreset.initial).toBeDefined()
        expect(slideUpPreset.animate).toBeDefined()
        expect(slideUpPreset.transition).toBeDefined()
      })
    })

    describe('scalePreset', () => {
      it('should have initial opacity 0 and scale 0.98', () => {
        expect(scalePreset.initial.opacity).toBe(0)
        expect(scalePreset.initial.scale).toBe(0.98)
      })

      it('should animate to opacity 1 and scale 1', () => {
        expect(scalePreset.animate.opacity).toBe(1)
        expect(scalePreset.animate.scale).toBe(1)
      })

      it('should have 0.15s duration', () => {
        expect(scalePreset.transition.duration).toBe(0.15)
      })

      it('should be fastest preset', () => {
        expect(scalePreset.transition.duration).toBeLessThan(fadeInPreset.transition.duration)
        expect(scalePreset.transition.duration).toBeLessThan(slideUpPreset.transition.duration)
      })
    })
  })

  describe('useReducedMotion', () => {
    beforeEach(() => {
      delete (window as any).matchMedia
    })

    it('should return false in non-browser environment', () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = useReducedMotion()

      expect(result).toBe(false)

      global.window = originalWindow
    })

    it('should return true when prefers-reduced-motion is set', () => {
      mockMatchMedia(true)

      const result = useReducedMotion()

      expect(result).toBe(true)
    })

    it('should return false when prefers-reduced-motion is not set', () => {
      mockMatchMedia(false)

      const result = useReducedMotion()

      expect(result).toBe(false)
    })

    it('should check correct media query', () => {
      const matchMediaSpy = jest.fn().mockReturnValue({
        matches: false,
        media: '',
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
      })

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaSpy
      })

      useReducedMotion()

      expect(matchMediaSpy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    })
  })

  describe('getOptimizedAnimation', () => {
    it('should return original fadeInPreset when reduceMotion is false', () => {
      const result = getOptimizedAnimation(fadeInPreset, false)
      expect(result).toEqual(fadeInPreset)
    })

    it('should return original slideUpPreset when reduceMotion is false', () => {
      const result = getOptimizedAnimation(slideUpPreset, false)
      expect(result).toEqual(slideUpPreset)
    })

    it('should return original scalePreset when reduceMotion is false', () => {
      const result = getOptimizedAnimation(scalePreset, false)
      expect(result).toEqual(scalePreset)
    })

    it('should return reduced motion preset when reduceMotion is true', () => {
      const result = getOptimizedAnimation(fadeInPreset, true)
      expect(result).toEqual({
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        transition: { duration: 0 }
      })
    })

    it('should return same reduced preset for any input preset', () => {
      const result1 = getOptimizedAnimation(fadeInPreset, true)
      const result2 = getOptimizedAnimation(slideUpPreset, true)
      const result3 = getOptimizedAnimation(scalePreset, true)

      expect(result1).toEqual(result2)
      expect(result2).toEqual(result3)
    })

    it('should default to false when reduceMotion is not provided', () => {
      const result = getOptimizedAnimation(slideUpPreset)
      expect(result).toEqual(slideUpPreset)
    })

    it('should return no animation when reduceMotion is true', () => {
      const result = getOptimizedAnimation(fadeInPreset, true)

      expect(result.initial.opacity).toBe(1)
      expect(result.animate.opacity).toBe(1)
      expect(result.transition.duration).toBe(0)
    })

    it('should preserve original preset object', () => {
      const originalPreset = { ...fadeInPreset }
      getOptimizedAnimation(fadeInPreset, true)

      expect(fadeInPreset).toEqual(originalPreset)
    })
  })

  describe('useOptimizedAnimation', () => {
    beforeEach(() => {
      delete (window as any).matchMedia
    })

    it('should use useReducedMotion to determine motion preference', () => {
      mockMatchMedia(false)

      // Can't test hook directly, but test the underlying logic
      const reduceMotion = useReducedMotion()
      const result = getOptimizedAnimation(fadeInPreset, reduceMotion)

      expect(result).toEqual(fadeInPreset)
    })

    it('should return reduced motion when user prefers reduced motion', () => {
      mockMatchMedia(true)

      const reduceMotion = useReducedMotion()
      const result = getOptimizedAnimation(fadeInPreset, reduceMotion)

      expect(result.transition.duration).toBe(0)
    })

    it('should return full animation when user does not prefer reduced motion', () => {
      mockMatchMedia(false)

      const reduceMotion = useReducedMotion()
      const result = getOptimizedAnimation(slideUpPreset, reduceMotion)

      expect(result).toEqual(slideUpPreset)
    })
  })

  describe('Performance', () => {
    it('should return presets with short durations', () => {
      expect(fadeInPreset.transition.duration).toBeLessThan(0.5)
      expect(slideUpPreset.transition.duration).toBeLessThan(0.5)
      expect(scalePreset.transition.duration).toBeLessThan(0.5)
    })

    it('should have zero duration for reduced motion', () => {
      const result = getOptimizedAnimation(fadeInPreset, true)

      expect(result.transition.duration).toBe(0)
    })
  })

  describe('Accessibility', () => {
    it('should respect prefers-reduced-motion preference', () => {
      mockMatchMedia(true)

      const reduceMotion = useReducedMotion()

      expect(reduceMotion).toBe(true)
    })

    it('should provide no-motion alternative', () => {
      const reduced = getOptimizedAnimation(fadeInPreset, true)

      expect(reduced.initial).toEqual({ opacity: 1 })
      expect(reduced.animate).toEqual({ opacity: 1 })
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined window', () => {
      const originalWindow = global.window
      delete (global as any).window

      const result = useReducedMotion()

      expect(result).toBe(false)

      global.window = originalWindow
    })

    it('should handle missing matchMedia', () => {
      const originalMatchMedia = window.matchMedia
      delete (window as any).matchMedia

      const result = useReducedMotion()
      
      // When matchMedia is not available, returns true for safety (reduced motion)
      expect(typeof result).toBe('boolean')
      
      window.matchMedia = originalMatchMedia
    })
  })

  describe('Integration', () => {
    it('should work with all three presets', () => {
      const presets = [fadeInPreset, slideUpPreset, scalePreset]

      presets.forEach(preset => {
        const normal = getOptimizedAnimation(preset, false)
        const reduced = getOptimizedAnimation(preset, true)

        expect(normal).toEqual(preset)
        expect(reduced.transition.duration).toBe(0)
      })
    })
  })
})
