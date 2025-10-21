import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  components,
  layout,
  animation,
  zIndex,
  designTokens
} from '../design-system'

describe('design-system', () => {
  describe('colors', () => {
    describe('ukrainian', () => {
      it('should have brand blue color', () => {
        expect(colors.ukrainian.blue).toBe('#2E3192')
      })

      it('should have brand yellow color', () => {
        expect(colors.ukrainian.yellow).toBe('#FEF102')
      })

      it('should have honey color', () => {
        expect(colors.ukrainian.honey).toBe('#D4A76A')
      })

      it('should have cream color', () => {
        expect(colors.ukrainian.cream).toBe('#FFF5E6')
      })

      it('should have berry color', () => {
        expect(colors.ukrainian.berry).toBe('#8B0000')
      })
    })

    describe('primary', () => {
      it('should match ukrainian blue', () => {
        expect(colors.primary.main).toBe('#2E3192')
      })

      it('should have light variant', () => {
        expect(colors.primary.light).toBe('#4A4DB0')
      })

      it('should have dark variant', () => {
        expect(colors.primary.dark).toBe('#1F2368')
      })

      it('should have white contrast', () => {
        expect(colors.primary.contrast).toBe('#FFFFFF')
      })
    })

    describe('secondary', () => {
      it('should match ukrainian yellow', () => {
        expect(colors.secondary.main).toBe('#FEF102')
      })

      it('should have light variant', () => {
        expect(colors.secondary.light).toBe('#FFF56A')
      })

      it('should have dark variant', () => {
        expect(colors.secondary.dark).toBe('#C9C200')
      })

      it('should have dark contrast', () => {
        expect(colors.secondary.contrast).toBe('#2D2D2D')
      })
    })

    describe('background', () => {
      it('should have light honey default', () => {
        expect(colors.background.default).toBe('#FFF8E7')
      })

      it('should have white paper', () => {
        expect(colors.background.paper).toBe('#FFFFFF')
      })

      it('should have cream subtle', () => {
        expect(colors.background.subtle).toBe('#FFF5E6')
      })

      it('should have warm variant', () => {
        expect(colors.background.warm).toBe('#FEF9F0')
      })
    })

    describe('text', () => {
      it('should have primary text color', () => {
        expect(colors.text.primary).toBe('#2D2D2D')
      })

      it('should have secondary text color', () => {
        expect(colors.text.secondary).toBe('#666666')
      })

      it('should have disabled text color', () => {
        expect(colors.text.disabled).toBe('#999999')
      })

      it('should have inverse text color', () => {
        expect(colors.text.inverse).toBe('#FFFFFF')
      })
    })

    describe('status colors', () => {
      it('should have success colors', () => {
        expect(colors.success.main).toBe('#1D8348')
        expect(colors.success.light).toBe('#6FCF97')
        expect(colors.success.dark).toBe('#1E8449')
      })

      it('should have warning colors', () => {
        expect(colors.warning.main).toBe('#F39C12')
        expect(colors.warning.light).toBe('#F7DC6F')
        expect(colors.warning.dark).toBe('#D68910')
      })

      it('should have error colors', () => {
        expect(colors.error.main).toBe('#D04436')
        expect(colors.error.light).toBe('#F1948A')
        expect(colors.error.dark).toBe('#C0392B')
      })

      it('should have info colors', () => {
        expect(colors.info.main).toBe('#2A7AAF')
        expect(colors.info.light).toBe('#85C1E9')
        expect(colors.info.dark).toBe('#2874A6')
      })
    })

    describe('grey', () => {
      it('should have all grey shades', () => {
        expect(colors.grey[50]).toBe('#FAFAFA')
        expect(colors.grey[100]).toBe('#F5F5F5')
        expect(colors.grey[200]).toBe('#EEEEEE')
        expect(colors.grey[300]).toBe('#E0E0E0')
        expect(colors.grey[400]).toBe('#BDBDBD')
        expect(colors.grey[500]).toBe('#9E9E9E')
        expect(colors.grey[600]).toBe('#757575')
        expect(colors.grey[700]).toBe('#616161')
        expect(colors.grey[800]).toBe('#424242')
        expect(colors.grey[900]).toBe('#212121')
      })
    })

    describe('border', () => {
      it('should have light border', () => {
        expect(colors.border.light).toBe('#E0E0E0')
      })

      it('should have medium border', () => {
        expect(colors.border.medium).toBe('#BDBDBD')
      })

      it('should have dark border', () => {
        expect(colors.border.dark).toBe('#757575')
      })
    })
  })

  describe('typography', () => {
    describe('fontFamily', () => {
      it('should have primary font family', () => {
        expect(typography.fontFamily.primary).toBeDefined()
        expect(typeof typography.fontFamily.primary).toBe('string')
      })

      it('should have display font family', () => {
        expect(typography.fontFamily.display).toBeDefined()
        expect(typeof typography.fontFamily.display).toBe('string')
      })

      it('should have monospace font family', () => {
        expect(typography.fontFamily.mono).toContain('monospace')
      })
    })

    describe('fontSize', () => {
      it('should have xs font size', () => {
        expect(typography.fontSize.xs).toBe('0.75rem')
      })

      it('should have base font size', () => {
        expect(typography.fontSize.base).toBe('1rem')
      })

      it('should have 5xl font size', () => {
        expect(typography.fontSize['5xl']).toBe('3rem')
      })

      it('should have 6xl font size', () => {
        expect(typography.fontSize['6xl']).toBe('3.75rem')
      })
    })

    describe('fontWeight', () => {
      it('should have all font weights', () => {
        expect(typography.fontWeight.light).toBe(300)
        expect(typography.fontWeight.normal).toBe(400)
        expect(typography.fontWeight.medium).toBe(500)
        expect(typography.fontWeight.semibold).toBe(600)
        expect(typography.fontWeight.bold).toBe(700)
        expect(typography.fontWeight.extrabold).toBe(800)
      })
    })

    describe('lineHeight', () => {
      it('should have all line heights', () => {
        expect(typography.lineHeight.tight).toBe(1.2)
        expect(typography.lineHeight.normal).toBe(1.5)
        expect(typography.lineHeight.relaxed).toBe(1.75)
        expect(typography.lineHeight.loose).toBe(2)
      })
    })

    describe('letterSpacing', () => {
      it('should have all letter spacing values', () => {
        expect(typography.letterSpacing.tight).toBe('-0.025em')
        expect(typography.letterSpacing.normal).toBe('0em')
        expect(typography.letterSpacing.wide).toBe('0.025em')
        expect(typography.letterSpacing.wider).toBe('0.05em')
      })
    })
  })

  describe('spacing', () => {
    it('should have xs spacing', () => {
      expect(spacing.xs).toBe('0.25rem')
    })

    it('should have sm spacing', () => {
      expect(spacing.sm).toBe('0.5rem')
    })

    it('should have md spacing', () => {
      expect(spacing.md).toBe('1rem')
    })

    it('should have lg spacing', () => {
      expect(spacing.lg).toBe('1.5rem')
    })

    it('should have xl spacing', () => {
      expect(spacing.xl).toBe('2rem')
    })

    it('should have 5xl spacing', () => {
      expect(spacing['5xl']).toBe('8rem')
    })
  })

  describe('borderRadius', () => {
    it('should have none border radius', () => {
      expect(borderRadius.none).toBe('0')
    })

    it('should have base border radius', () => {
      expect(borderRadius.base).toBe('0.25rem')
    })

    it('should have lg border radius', () => {
      expect(borderRadius.lg).toBe('0.5rem')
    })

    it('should have 3xl border radius', () => {
      expect(borderRadius['3xl']).toBe('1.5rem')
    })

    it('should have full border radius', () => {
      expect(borderRadius.full).toBe('9999px')
    })
  })

  describe('shadows', () => {
    it('should have sm shadow', () => {
      expect(shadows.sm).toContain('rgba(0, 0, 0, 0.05)')
    })

    it('should have base shadow', () => {
      expect(shadows.base).toContain('rgba(0, 0, 0, 0.1)')
    })

    it('should have 2xl shadow', () => {
      expect(shadows['2xl']).toContain('rgba(0, 0, 0, 0.25)')
    })

    it('should have inner shadow', () => {
      expect(shadows.inner).toContain('inset')
    })

    it('should have none option', () => {
      expect(shadows.none).toBe('none')
    })
  })

  describe('breakpoints', () => {
    it('should have all breakpoint values', () => {
      expect(breakpoints.xs).toBe('0px')
      expect(breakpoints.sm).toBe('600px')
      expect(breakpoints.md).toBe('900px')
      expect(breakpoints.lg).toBe('1200px')
      expect(breakpoints.xl).toBe('1536px')
    })
  })

  describe('components', () => {
    describe('button', () => {
      it('should have primary button styles', () => {
        expect(components.button.primary.backgroundColor).toBe('#2E3192')
        expect(components.button.primary.color).toBe('#FFFFFF')
        expect(components.button.primary.borderRadius).toBe('0.5rem')
      })

      it('should have secondary button styles', () => {
        expect(components.button.secondary.backgroundColor).toBe('#FEF102')
        expect(components.button.secondary.color).toBe('#2D2D2D')
      })

      it('should have outline button styles', () => {
        expect(components.button.outline.backgroundColor).toBe('transparent')
        expect(components.button.outline.border).toContain('#2E3192')
      })
    })

    describe('card', () => {
      it('should have card styles', () => {
        expect(components.card.backgroundColor).toBe('#FFFFFF')
        expect(components.card.borderRadius).toBe('0.75rem')
        expect(components.card.padding).toBe('1.5rem')
      })

      it('should have border', () => {
        expect(components.card.border).toContain('#E0E0E0')
      })
    })

    describe('input', () => {
      it('should have input styles', () => {
        expect(components.input.backgroundColor).toBe('#FFFFFF')
        expect(components.input.borderRadius).toBe('0.375rem')
      })

      it('should have focus styles', () => {
        expect(components.input['&:focus']).toBeDefined()
        expect(components.input['&:focus'].outline).toBe('none')
      })
    })

    describe('chip', () => {
      it('should have chip styles', () => {
        expect(components.chip.borderRadius).toBe('9999px')
        expect(components.chip.fontSize).toBe('0.875rem')
      })
    })
  })

  describe('layout', () => {
    it('should have container max width', () => {
      expect(layout.container.maxWidth).toBe('1200px')
    })

    it('should have section padding', () => {
      expect(layout.section.padding).toContain('6rem')
    })

    it('should have grid gap', () => {
      expect(layout.grid.gap).toBe('1.5rem')
    })
  })

  describe('animation', () => {
    describe('duration', () => {
      it('should have all duration values', () => {
        expect(animation.duration.fast).toBe('0.15s')
        expect(animation.duration.normal).toBe('0.3s')
        expect(animation.duration.slow).toBe('0.5s')
      })
    })

    describe('easing', () => {
      it('should have all easing values', () => {
        expect(animation.easing.ease).toBe('ease')
        expect(animation.easing.easeIn).toBe('ease-in')
        expect(animation.easing.easeOut).toBe('ease-out')
        expect(animation.easing.easeInOut).toBe('ease-in-out')
      })
    })

    describe('transitions', () => {
      it('should have prebuilt transitions', () => {
        expect(animation.transitions.fast).toBe('all 0.15s ease-in-out')
        expect(animation.transitions.normal).toBe('all 0.3s ease-in-out')
        expect(animation.transitions.slow).toBe('all 0.5s ease-in-out')
      })
    })
  })

  describe('zIndex', () => {
    it('should have ordered z-index values', () => {
      expect(zIndex.dropdown).toBe(1000)
      expect(zIndex.sticky).toBe(1020)
      expect(zIndex.fixed).toBe(1030)
      expect(zIndex.modalBackdrop).toBe(1040)
      expect(zIndex.modal).toBe(1050)
      expect(zIndex.popover).toBe(1060)
      expect(zIndex.tooltip).toBe(1070)
    })

    it('should have tooltip as highest z-index', () => {
      const values = Object.values(zIndex)
      expect(Math.max(...values)).toBe(zIndex.tooltip)
    })
  })

  describe('designTokens', () => {
    it('should export all token categories', () => {
      expect(designTokens.colors).toBeDefined()
      expect(designTokens.typography).toBeDefined()
      expect(designTokens.spacing).toBeDefined()
      expect(designTokens.borderRadius).toBeDefined()
      expect(designTokens.shadows).toBeDefined()
      expect(designTokens.breakpoints).toBeDefined()
      expect(designTokens.components).toBeDefined()
      expect(designTokens.layout).toBeDefined()
      expect(designTokens.animation).toBeDefined()
      expect(designTokens.zIndex).toBeDefined()
    })

    it('should match individual exports', () => {
      expect(designTokens.colors).toBe(colors)
      expect(designTokens.typography).toBe(typography)
      expect(designTokens.spacing).toBe(spacing)
    })
  })

  describe('Accessibility', () => {
    it('should have WCAG AA compliant success color', () => {
      expect(colors.success.main).toBe('#1D8348')
    })

    it('should have WCAG AA compliant error color', () => {
      expect(colors.error.main).toBe('#D04436')
    })

    it('should have WCAG AA compliant info color', () => {
      expect(colors.info.main).toBe('#2A7AAF')
    })

    it('should have darkened secondary for better contrast', () => {
      expect(colors.secondary.dark).toBe('#C9C200')
    })
  })

  describe('Brand Consistency', () => {
    it('should use brand blue consistently', () => {
      expect(colors.primary.main).toBe(colors.ukrainian.blue)
      expect(components.button.primary.backgroundColor).toBe(colors.primary.main)
    })

    it('should use brand yellow consistently', () => {
      expect(colors.secondary.main).toBe(colors.ukrainian.yellow)
      expect(components.button.secondary.backgroundColor).toBe(colors.secondary.main)
    })
  })
})

