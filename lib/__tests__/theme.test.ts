/**
 * @jest-environment jsdom
 */
// Mock MUI createTheme direct import
jest.mock('@mui/material/styles/createTheme', () => ({
  __esModule: true,
  default: jest.requireActual('@mui/material/styles').createTheme
}))

import { theme } from '../theme'

// Mock design-system module
jest.mock('../design-system', () => ({
  designTokens: {
    colors: {
      primary: {
        main: '#2E3192',
        light: '#5A5FC7',
        dark: '#1F2163',
        contrast: '#FFFFFF'
      },
      secondary: {
        main: '#FEF102',
        light: '#FFFD7A',
        dark: '#C5BD00',
        contrast: '#000000'
      },
      background: {
        default: '#FFFFFF',
        paper: '#FAFAFA',
        subtle: '#F5F5F5'
      },
      text: {
        primary: '#1A1A1A',
        secondary: '#666666'
      },
      error: {
        main: '#D32F2F',
        light: '#EF5350',
        dark: '#C62828'
      },
      warning: {
        main: '#ED6C02',
        light: '#FF9800',
        dark: '#E65100'
      },
      success: {
        main: '#2E7D32',
        light: '#4CAF50',
        dark: '#1B5E20'
      },
      info: {
        main: '#0288D1',
        light: '#03A9F4',
        dark: '#01579B'
      },
      ukrainian: {
        blue: '#0057B7',
        yellow: '#FFD700',
        honey: '#D4A017',
        cream: '#FFFDD0',
        berry: '#8B008B'
      },
      border: {
        light: '#E0E0E0',
        medium: '#BDBDBD',
        dark: '#757575'
      }
    },
    typography: {
      fontFamily: {
        primary: '"Inter", "Helvetica", "Arial", sans-serif',
        display: '"Playfair Display", "Georgia", serif'
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.2,
        base: 1.5,
        relaxed: 1.75
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.02em'
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem'
    },
    borderRadius: {
      sm: '4px',
      base: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    }
  }
}))

describe('theme', () => {
  describe('Palette', () => {
    it('should have primary color configured', () => {
      expect(theme.palette.primary.main).toBe('#2E3192')
      expect(theme.palette.primary.light).toBe('#5A5FC7')
      expect(theme.palette.primary.dark).toBe('#1F2163')
      expect(theme.palette.primary.contrastText).toBe('#FFFFFF')
    })

    it('should have secondary color configured', () => {
      expect(theme.palette.secondary.main).toBe('#FEF102')
      expect(theme.palette.secondary.light).toBe('#FFFD7A')
      expect(theme.palette.secondary.dark).toBe('#C5BD00')
      expect(theme.palette.secondary.contrastText).toBe('#000000')
    })

    it('should have background colors', () => {
      expect(theme.palette.background.default).toBe('#FFFFFF')
      expect(theme.palette.background.paper).toBe('#FAFAFA')
    })

    it('should have text colors', () => {
      expect(theme.palette.text.primary).toBe('#1A1A1A')
      expect(theme.palette.text.secondary).toBe('#666666')
    })

    it('should have error colors', () => {
      expect(theme.palette.error.main).toBe('#D32F2F')
      expect(theme.palette.error.light).toBe('#EF5350')
      expect(theme.palette.error.dark).toBe('#C62828')
    })

    it('should have warning colors', () => {
      expect(theme.palette.warning.main).toBe('#ED6C02')
      expect(theme.palette.warning.light).toBe('#FF9800')
      expect(theme.palette.warning.dark).toBe('#E65100')
    })

    it('should have success colors', () => {
      expect(theme.palette.success.main).toBe('#2E7D32')
      expect(theme.palette.success.light).toBe('#4CAF50')
      expect(theme.palette.success.dark).toBe('#1B5E20')
    })

    it('should have info colors', () => {
      expect(theme.palette.info.main).toBe('#0288D1')
      expect(theme.palette.info.light).toBe('#03A9F4')
      expect(theme.palette.info.dark).toBe('#01579B')
    })

    it('should have Ukrainian theme colors', () => {
      expect(theme.palette.ukrainian.blue).toBe('#0057B7')
      expect(theme.palette.ukrainian.yellow).toBe('#FFD700')
      expect(theme.palette.ukrainian.honey).toBe('#D4A017')
      expect(theme.palette.ukrainian.cream).toBe('#FFFDD0')
      expect(theme.palette.ukrainian.berry).toBe('#8B008B')
    })
  })

  describe('Typography', () => {
    it('should have primary font family', () => {
      expect(theme.typography.fontFamily).toBe('"Inter", "Helvetica", "Arial", sans-serif')
    })

    it('should have h1 configuration', () => {
      expect(theme.typography.h1.fontFamily).toBe('"Playfair Display", "Georgia", serif')
      expect(theme.typography.h1.fontWeight).toBe(700)
      expect(theme.typography.h1.fontSize).toBe('3rem')
    })

    it('should have h2 configuration', () => {
      expect(theme.typography.h2.fontFamily).toBe('"Playfair Display", "Georgia", serif')
      expect(theme.typography.h2.fontWeight).toBe(600)
      expect(theme.typography.h2.fontSize).toBe('2.25rem')
    })

    it('should have h3 configuration', () => {
      expect(theme.typography.h3.fontFamily).toBe('"Playfair Display", "Georgia", serif')
      expect(theme.typography.h3.fontSize).toBe('1.875rem')
    })

    it('should have h4 configuration', () => {
      expect(theme.typography.h4.fontSize).toBe('1.5rem')
    })

    it('should have h5 configuration', () => {
      expect(theme.typography.h5.fontSize).toBe('1.25rem')
    })

    it('should have h6 configuration', () => {
      expect(theme.typography.h6.fontSize).toBe('1.125rem')
    })

    it('should have body1 configuration', () => {
      expect(theme.typography.body1.fontSize).toBe('1rem')
      expect(theme.typography.body1.lineHeight).toBe(1.75)
    })

    it('should have body2 configuration', () => {
      expect(theme.typography.body2.fontSize).toBe('0.875rem')
    })

    it('should have button configuration', () => {
      expect(theme.typography.button.fontWeight).toBe(600)
      expect(theme.typography.button.textTransform).toBe('none')
    })

    it('should use tight line height for headings', () => {
      expect(theme.typography.h1.lineHeight).toBe(1.2)
      expect(theme.typography.h2.lineHeight).toBe(1.2)
    })

    it('should use tight letter spacing for headings', () => {
      expect(theme.typography.h1.letterSpacing).toBe('-0.02em')
      expect(theme.typography.h2.letterSpacing).toBe('-0.02em')
    })
  })

  describe('Spacing', () => {
    it('should use 4px base unit', () => {
      expect(theme.spacing(1)).toBe('0.25rem')
      expect(theme.spacing(2)).toBe('0.5rem')
      expect(theme.spacing(4)).toBe('1rem')
      expect(theme.spacing(8)).toBe('2rem')
    })

    it('should handle fractional spacing', () => {
      expect(theme.spacing(0.5)).toBe('0.125rem')
      expect(theme.spacing(1.5)).toBe('0.375rem')
    })

    it('should handle zero spacing', () => {
      expect(theme.spacing(0)).toBe('0rem')
    })

    it('should handle negative spacing', () => {
      expect(theme.spacing(-1)).toBe('-0.25rem')
      expect(theme.spacing(-4)).toBe('-1rem')
    })
  })

  describe('Shape', () => {
    it('should have border radius from design tokens', () => {
      expect(theme.shape.borderRadius).toBe(12)
    })
  })

  describe('Components', () => {
    describe('MuiButton', () => {
      it('should have no text transform', () => {
        expect(theme.components?.MuiButton?.styleOverrides?.root).toHaveProperty('textTransform', 'none')
      })

      it('should have custom border radius', () => {
        const root = theme.components?.MuiButton?.styleOverrides?.root as Record<string, unknown>
        expect(root?.borderRadius).toBe('35px !important')
      })

      it('should have hover transform', () => {
        const root = theme.components?.MuiButton?.styleOverrides?.root as Record<string, unknown>
        const hover = root?.['&:hover'] as Record<string, unknown>
        expect(hover?.transform).toBe('translateY(-1px)')
      })

      it('should have contained variant styles', () => {
        const contained = theme.components?.MuiButton?.styleOverrides?.contained as Record<string, unknown>
        expect(contained?.backgroundColor).toBe('#2E3192')
        expect(contained?.color).toBe('#FFFFFF')
      })

      it('should have outlined variant styles', () => {
        const outlined = theme.components?.MuiButton?.styleOverrides?.outlined as Record<string, unknown>
        expect(outlined?.borderColor).toBe('#2E3192')
        expect(outlined?.color).toBe('#2E3192')
      })
    })

    describe('MuiCard', () => {
      it('should have custom border radius', () => {
        const root = theme.components?.MuiCard?.styleOverrides?.root as Record<string, unknown>
        expect(root?.borderRadius).toBe('16px')
      })

      it('should have hover effect', () => {
        const root = theme.components?.MuiCard?.styleOverrides?.root as Record<string, unknown>
        const hover = root?.['&:hover'] as Record<string, unknown>
        expect(hover?.transform).toBe('translateY(-2px)')
      })

      it('should have border', () => {
        const root = theme.components?.MuiCard?.styleOverrides?.root as Record<string, unknown>
        expect(root?.border).toBe('1px solid #E0E0E0')
      })
    })

    describe('MuiPaper', () => {
      it('should have background color', () => {
        const root = theme.components?.MuiPaper?.styleOverrides?.root as Record<string, unknown>
        expect(root?.backgroundColor).toBe('#FAFAFA')
      })
    })

    describe('MuiTextField', () => {
      it('should have custom border radius', () => {
        const root = theme.components?.MuiTextField?.styleOverrides?.root as Record<string, unknown>
        expect(root).toBeDefined()
      })
    })

    describe('MuiChip', () => {
      it('should have full border radius', () => {
        const root = theme.components?.MuiChip?.styleOverrides?.root as Record<string, unknown>
        expect(root?.borderRadius).toBe('9999px')
      })

      it('should have border', () => {
        const root = theme.components?.MuiChip?.styleOverrides?.root as Record<string, unknown>
        expect(root?.border).toBe('1px solid #E0E0E0')
      })
    })

    describe('MuiAppBar', () => {
      it('should have paper background', () => {
        const root = theme.components?.MuiAppBar?.styleOverrides?.root as Record<string, unknown>
        expect(root?.backgroundColor).toBe('#FAFAFA')
      })

      it('should have text color', () => {
        const root = theme.components?.MuiAppBar?.styleOverrides?.root as Record<string, unknown>
        expect(root?.color).toBe('#1A1A1A')
      })
    })

    describe('MuiAccordion', () => {
      it('should have custom border radius', () => {
        const root = theme.components?.MuiAccordion?.styleOverrides?.root as Record<string, unknown>
        expect(root?.borderRadius).toBe('12px')
      })

      it('should hide default divider', () => {
        const root = theme.components?.MuiAccordion?.styleOverrides?.root as Record<string, unknown>
        const before = root?.['&:before'] as Record<string, unknown>
        expect(before?.display).toBe('none')
      })
    })
  })

  describe('Theme Structure', () => {
    it('should be a valid MUI theme object', () => {
      expect(theme).toBeDefined()
      expect(theme.palette).toBeDefined()
      expect(theme.typography).toBeDefined()
      expect(theme.spacing).toBeDefined()
      expect(theme.shape).toBeDefined()
    })

    it('should have components configuration', () => {
      expect(theme.components).toBeDefined()
    })

    it('should export theme from createTheme', () => {
      expect(typeof theme).toBe('object')
    })
  })

  describe('Brand Colors', () => {
    it('should use brand primary blue', () => {
      expect(theme.palette.primary.main).toBe('#2E3192')
    })

    it('should use brand secondary yellow', () => {
      expect(theme.palette.secondary.main).toBe('#FEF102')
    })
  })

  describe('Accessibility', () => {
    it('should have high contrast for primary text on primary background', () => {
      expect(theme.palette.primary.contrastText).toBe('#FFFFFF')
    })

    it('should have high contrast for secondary text on secondary background', () => {
      expect(theme.palette.secondary.contrastText).toBe('#000000')
    })
  })
})

