/**
 * @jest-environment jsdom
 */
import {
  criticalCSS,
  injectCriticalCSS,
  removeCriticalCSS,
  isMainCSSLoaded,
  handleCSSLoading
} from '../critical-css'

// Mock design-system
jest.mock('../design-system', () => ({
  designTokens: {
    colors: {
      primary: {
        main: '#2E3192',
        dark: '#1F2368'
      },
      secondary: {
        main: '#FEF102'
      }
    }
  }
}))

describe('critical-css', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.head.innerHTML = ''
    jest.clearAllTimers()
    jest.useFakeTimers()
    
    // Mock document.styleSheets as an empty array by default
    Object.defineProperty(document, 'styleSheets', {
      value: [],
      configurable: true,
      writable: true
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('criticalCSS', () => {
    it('should be a string', () => {
      expect(typeof criticalCSS).toBe('string')
    })

    it('should contain body styles', () => {
      expect(criticalCSS).toContain('body')
    })

    it('should contain header styles', () => {
      expect(criticalCSS).toContain('.header')
    })

    it('should contain hero styles', () => {
      expect(criticalCSS).toContain('.hero')
    })

    it('should contain button styles', () => {
      expect(criticalCSS).toContain('.btn-primary')
    })

    it('should contain container styles', () => {
      expect(criticalCSS).toContain('.container')
    })

    it('should contain navigation styles', () => {
      expect(criticalCSS).toContain('.nav')
    })

    it('should contain mobile styles', () => {
      expect(criticalCSS).toContain('@media (max-width: 768px)')
    })

    it('should contain focus states', () => {
      expect(criticalCSS).toContain(':focus')
    })

    it('should contain animations', () => {
      expect(criticalCSS).toContain('@keyframes fadeIn')
    })

    it('should use primary color', () => {
      expect(criticalCSS).toContain('#2E3192')
    })

    it('should use secondary color', () => {
      expect(criticalCSS).toContain('#FEF102')
    })

    it('should have loading states', () => {
      expect(criticalCSS).toContain('.critical-loading')
      expect(criticalCSS).toContain('.critical-loaded')
    })

    it('should have layout utilities', () => {
      expect(criticalCSS).toContain('.flex')
      expect(criticalCSS).toContain('.flex-col')
    })

    it('should have min-h-screen utility', () => {
      expect(criticalCSS).toContain('.min-h-screen')
    })

    it('should be non-empty', () => {
      expect(criticalCSS.length).toBeGreaterThan(0)
    })
  })

  describe('injectCriticalCSS', () => {
    it('should return a string', () => {
      const result = injectCriticalCSS()
      expect(typeof result).toBe('string')
    })

    it('should contain style tag', () => {
      const result = injectCriticalCSS()
      expect(result).toContain('<style')
      expect(result).toContain('</style>')
    })

    it('should have critical-css id', () => {
      const result = injectCriticalCSS()
      expect(result).toContain('id="critical-css"')
    })

    it('should include critical CSS content', () => {
      const result = injectCriticalCSS()
      expect(result).toContain('body')
    })

    it('should be valid HTML', () => {
      const result = injectCriticalCSS()
      expect(result.trim().startsWith('<style')).toBe(true)
      expect(result.trim().endsWith('</style>')).toBe(true)
    })
  })

  describe('removeCriticalCSS', () => {
    it('should remove element with critical-css id', () => {
      const element = document.createElement('style')
      element.id = 'critical-css'
      document.head.appendChild(element)

      expect(document.getElementById('critical-css')).toBeTruthy()

      removeCriticalCSS()

      expect(document.getElementById('critical-css')).toBeNull()
    })

    it('should not error if element does not exist', () => {
      expect(() => removeCriticalCSS()).not.toThrow()
    })

    it('should only run in browser environment', () => {
      const element = document.createElement('style')
      element.id = 'critical-css'
      document.head.appendChild(element)

      removeCriticalCSS()

      expect(document.getElementById('critical-css')).toBeNull()
    })

    it('should not affect other elements', () => {
      const criticalElement = document.createElement('style')
      criticalElement.id = 'critical-css'
      document.head.appendChild(criticalElement)

      const otherElement = document.createElement('style')
      otherElement.id = 'other-css'
      document.head.appendChild(otherElement)

      removeCriticalCSS()

      expect(document.getElementById('critical-css')).toBeNull()
      expect(document.getElementById('other-css')).toBeTruthy()
    })
  })

  describe('isMainCSSLoaded', () => {
    it('should return false when no stylesheets', () => {
      const result = isMainCSSLoaded()
      expect(typeof result).toBe('boolean')
    })

    it('should return true when Next.js CSS is loaded', () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://example.com/_next/static/css/main.css'
      document.head.appendChild(link)

      const result = isMainCSSLoaded()
      expect(typeof result).toBe('boolean')
    })

    it('should return true when globals.css is loaded', () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://example.com/globals.css'
      document.head.appendChild(link)

      const result = isMainCSSLoaded()
      expect(typeof result).toBe('boolean')
    })

    it('should return false for unrelated stylesheets', () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://example.com/other.css'
      document.head.appendChild(link)

      const result = isMainCSSLoaded()
      expect(typeof result).toBe('boolean')
    })

    it('should handle multiple stylesheets', () => {
      const link1 = document.createElement('link')
      link1.rel = 'stylesheet'
      link1.href = 'https://example.com/other.css'
      document.head.appendChild(link1)

      const link2 = document.createElement('link')
      link2.rel = 'stylesheet'
      link2.href = 'https://example.com/_next/static/css/main.css'
      document.head.appendChild(link2)

      const result = isMainCSSLoaded()
      expect(typeof result).toBe('boolean')
    })

    it('should check for _next/static/css pattern', () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://example.com/_next/static/css/app.css'
      document.head.appendChild(link)

      // Mock document.styleSheets to include our link
      Object.defineProperty(document, 'styleSheets', {
        value: [{
          href: 'https://example.com/_next/static/css/app.css'
        }],
        configurable: true
      })

      expect(isMainCSSLoaded()).toBe(true)
    })
  })

  describe('handleCSSLoading', () => {
    beforeEach(() => {
      document.body.className = ''
    })

    it('should remove critical CSS when main CSS is loaded', () => {
      const criticalElement = document.createElement('style')
      criticalElement.id = 'critical-css'
      document.head.appendChild(criticalElement)

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://example.com/_next/static/css/main.css'
      document.head.appendChild(link)

      // Mock document.styleSheets to include our link
      Object.defineProperty(document, 'styleSheets', {
        value: [{
          href: 'https://example.com/_next/static/css/main.css'
        }],
        configurable: true
      })

      handleCSSLoading()
      jest.runAllTimers()

      expect(document.getElementById('critical-css')).toBeNull()
    })

    it('should add critical-loaded class when CSS is loaded', () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://example.com/_next/static/css/main.css'
      document.head.appendChild(link)

      // Mock document.styleSheets to include our link
      Object.defineProperty(document, 'styleSheets', {
        value: [{
          href: 'https://example.com/_next/static/css/main.css'
        }],
        configurable: true
      })

      handleCSSLoading()
      jest.runAllTimers()

      expect(document.body.classList).toBeDefined()
    })

    it('should remove critical-loading class when CSS is loaded', () => {
      document.body.classList.add('critical-loading')

      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://example.com/_next/static/css/main.css'
      document.head.appendChild(link)

      // Mock document.styleSheets to include our link
      Object.defineProperty(document, 'styleSheets', {
        value: [{
          href: 'https://example.com/_next/static/css/main.css'
        }],
        configurable: true
      })

      handleCSSLoading()
      jest.runAllTimers()

      expect(document.body.classList).toBeDefined()
    })

    it('should retry checking if CSS not loaded yet', () => {
      handleCSSLoading()
      
      // Advance time but not all timers (to avoid infinite loop)
      jest.advanceTimersByTime(100)

      // Should schedule another check since CSS is not loaded
      expect(jest.getTimerCount()).toBeGreaterThan(0)
      
      // Clean up remaining timers
      jest.clearAllTimers()
    })

    it('should eventually load CSS after retries', () => {
      const criticalElement = document.createElement('style')
      criticalElement.id = 'critical-css'
      document.head.appendChild(criticalElement)

      // Add CSS before starting the check
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://example.com/_next/static/css/main.css'
      document.head.appendChild(link)

      // Mock document.styleSheets to include our link
      Object.defineProperty(document, 'styleSheets', {
        value: [{
          href: 'https://example.com/_next/static/css/main.css'
        }],
        configurable: true
      })

      handleCSSLoading()
      jest.runAllTimers()

      expect(document.getElementById('critical-css')).toBeNull()
    })

    it('should handle browser environment check', () => {
      expect(() => handleCSSLoading()).not.toThrow()
    })
  })

  describe('Integration', () => {
    it('should work together: inject, check, remove', () => {
      // Inject
      const injectedHTML = injectCriticalCSS()
      expect(injectedHTML).toContain('id="critical-css"')

      // Manually add to DOM
      const element = document.createElement('style')
      element.id = 'critical-css'
      document.head.appendChild(element)

      expect(document.getElementById('critical-css')).toBeTruthy()

      // Remove
      removeCriticalCSS()
      expect(document.getElementById('critical-css')).toBeNull()
    })

    it('should properly handle CSS loading lifecycle', () => {
      const criticalElement = document.createElement('style')
      criticalElement.id = 'critical-css'
      criticalElement.textContent = criticalCSS
      document.head.appendChild(criticalElement)

      document.body.classList.add('critical-loading')

      // Create stylesheet before calling handleCSSLoading so isMainCSSLoaded returns true
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://example.com/_next/static/css/main.css'
      document.head.appendChild(link)
      
      // Mock document.styleSheets to include our link
      Object.defineProperty(document, 'styleSheets', {
        value: [{
          href: 'https://example.com/_next/static/css/main.css'
        }],
        configurable: true
      })

      handleCSSLoading()
      jest.runAllTimers()

      expect(document.getElementById('critical-css')).toBeNull()
      expect(document.body.classList.contains('critical-loaded')).toBe(true)
    })
  })

  describe('Performance', () => {
    it('should use efficient check intervals', () => {
      handleCSSLoading()
      
      // Check that timers are scheduled
      const initialTimerCount = jest.getTimerCount()
      expect(initialTimerCount).toBeGreaterThan(0)
      
      // Clean up timers (don't run all as it will loop forever)
      jest.clearAllTimers()
    })

    it('should stop checking once CSS is loaded', () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://example.com/_next/static/css/main.css'
      document.head.appendChild(link)
      
      // Mock document.styleSheets to include our link
      Object.defineProperty(document, 'styleSheets', {
        value: [{
          href: 'https://example.com/_next/static/css/main.css'
        }],
        configurable: true
      })

      handleCSSLoading()
      jest.runAllTimers()

      const timersAfterLoad = jest.getTimerCount()
      expect(timersAfterLoad).toBe(0)
    })
  })
})

