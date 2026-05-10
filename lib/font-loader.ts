/**
 * Font loading utility to ensure fonts are loaded before rendering
 * This prevents FOUT (Flash of Unstyled Text) and ensures fonts always work
 */

export function ensureFontLoaded(fontFamily: string): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(true)
  }

  if (!('fonts' in document)) {
    return Promise.resolve(true)
  }

  return new Promise((resolve) => {
    try {
      // Check if font is already loaded
      if (document.fonts.check(`1em "${fontFamily}"`)) {
        resolve(true)
        return
      }

      // Wait for fonts to load
      document.fonts.ready.then(() => {
        const isLoaded = document.fonts.check(`1em "${fontFamily}"`)
        resolve(isLoaded)
      })

      // Fallback timeout
      setTimeout(() => {
        resolve(false)
      }, 3000)
    } catch (error) {
      // If font loading fails, resolve anyway to prevent blocking
      console.warn('Font loading check failed:', error)
      resolve(false)
    }
  })
}

export function ensureFontVariable(variableName: string, fallback: string): void {
  if (typeof window === 'undefined') {
    return
  }

  const root = document.documentElement
  if (!root) {
    return
  }

  // Ensure CSS variable exists
  const currentValue = getComputedStyle(root).getPropertyValue(variableName)
  if (!currentValue || currentValue.trim() === '') {
    root.style.setProperty(variableName, fallback)
  }
}

/**
 * Initialize font loading - call this on page load
 */
export function initFontLoading(): void {
  if (typeof window === 'undefined') {
    return
  }

  // Ensure MoreSugar font variable is set
  ensureFontVariable('--font-more-sugar', 'cursive, fantasy')

  // Wait for fonts to be ready
  if ('fonts' in document) {
    document.fonts.ready.then(() => {
      // Verify font variable is still set
      ensureFontVariable('--font-more-sugar', 'cursive, fantasy')
    })
  }
}


