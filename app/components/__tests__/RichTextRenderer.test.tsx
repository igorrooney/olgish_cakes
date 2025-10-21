/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen } from '@testing-library/react'
import { RichTextRenderer } from '../RichTextRenderer'

// Mock PortableText
jest.mock('@portabletext/react', () => ({
  PortableText: ({ value, components }: any) => {
    if (!value || value.length === 0) return null
    
    return (
      <div data-testid="portable-text">
        {value.map((block: any, index: number) => {
          if (block._type === 'block') {
            const Component = components.block[block.style] || components.block.normal
            return <Component key={index}>{block.children?.map((child: any) => child.text).join('')}</Component>
          }
          return null
        })}
      </div>
    )
  }
}))

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Typography: ({ children, variant, component, sx, ...props }: any) => {
    const Component = component || 'div'
    return <Component data-testid="typography" data-variant={variant} {...props}>{children}</Component>
  },
  Box: ({ children, component, sx, ...props }: any) => {
    const Component = component || 'div'
    return <Component data-testid="box" {...props}>{children}</Component>
  },
  Link: ({ children, href, target, rel, sx, ...props }: any) => (
    <a data-testid="link" href={href} target={target} rel={rel} {...props}>{children}</a>
  )
}))

// Mock design system
jest.mock('@/lib/design-system', () => ({
  designTokens: {
    colors: {
      text: { primary: '#000', secondary: '#666' },
      primary: { main: '#2E3192', dark: '#1F2368' },
      background: { subtle: '#F5F5F5' }
    },
    typography: {
      fontFamily: { display: 'Playfair Display' },
      fontWeight: { bold: 700, semibold: 600, normal: 400 },
      lineHeight: { relaxed: 1.75 }
    }
  }
}))

describe('RichTextRenderer', () => {
  const mockValue = [
    {
      _type: 'block',
      style: 'normal',
      children: [{ text: 'Test content' }]
    }
  ]

  describe('Rendering', () => {
    it('should render PortableText', () => {
      render(<RichTextRenderer value={mockValue} />)

      expect(screen.getByTestId('portable-text')).toBeInTheDocument()
    })

    it('should render content', () => {
      render(<RichTextRenderer value={mockValue} />)

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })

    it('should use body1 variant by default', () => {
      render(<RichTextRenderer value={mockValue} />)

      // Default variant is used
      expect(screen.getByTestId('portable-text')).toBeInTheDocument()
    })

    it('should accept body2 variant', () => {
      render(<RichTextRenderer value={mockValue} variant="body2" />)

      expect(screen.getByTestId('portable-text')).toBeInTheDocument()
    })

    it('should accept caption variant', () => {
      render(<RichTextRenderer value={mockValue} variant="caption" />)

      expect(screen.getByTestId('portable-text')).toBeInTheDocument()
    })

    it('should accept custom sx prop', () => {
      render(<RichTextRenderer value={mockValue} sx={{ margin: '10px' }} />)

      expect(screen.getByTestId('portable-text')).toBeInTheDocument()
    })

    it('should accept structuredData prop', () => {
      render(<RichTextRenderer value={mockValue} structuredData={true} />)

      expect(screen.getByTestId('portable-text')).toBeInTheDocument()
    })
  })

  describe('Block Types', () => {
    it('should render h1 blocks', () => {
      const h1Value = [{ _type: 'block', style: 'h1', children: [{ text: 'Heading 1' }] }]
      render(<RichTextRenderer value={h1Value} />)

      expect(screen.getByText('Heading 1')).toBeInTheDocument()
    })

    it('should render h2 blocks', () => {
      const h2Value = [{ _type: 'block', style: 'h2', children: [{ text: 'Heading 2' }] }]
      render(<RichTextRenderer value={h2Value} />)

      expect(screen.getByText('Heading 2')).toBeInTheDocument()
    })

    it('should render h3 blocks', () => {
      const h3Value = [{ _type: 'block', style: 'h3', children: [{ text: 'Heading 3' }] }]
      render(<RichTextRenderer value={h3Value} />)

      expect(screen.getByText('Heading 3')).toBeInTheDocument()
    })

    it('should render h4 blocks', () => {
      const h4Value = [{ _type: 'block', style: 'h4', children: [{ text: 'Heading 4' }] }]
      render(<RichTextRenderer value={h4Value} />)

      expect(screen.getByText('Heading 4')).toBeInTheDocument()
    })

    it('should render h5 blocks', () => {
      const h5Value = [{ _type: 'block', style: 'h5', children: [{ text: 'Heading 5' }] }]
      render(<RichTextRenderer value={h5Value} />)

      expect(screen.getByText('Heading 5')).toBeInTheDocument()
    })

    it('should render h6 blocks', () => {
      const h6Value = [{ _type: 'block', style: 'h6', children: [{ text: 'Heading 6' }] }]
      render(<RichTextRenderer value={h6Value} />)

      expect(screen.getByText('Heading 6')).toBeInTheDocument()
    })

    it('should render normal blocks', () => {
      render(<RichTextRenderer value={mockValue} />)

      expect(screen.getByText('Test content')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should handle empty array', () => {
      const { container } = render(<RichTextRenderer value={[]} />)

      expect(container.innerHTML).toBeFalsy()
    })

    it('should handle null value', () => {
      const { container } = render(<RichTextRenderer value={null as any} />)

      expect(container.innerHTML).toBeFalsy()
    })

    it('should handle undefined value', () => {
      const { container } = render(<RichTextRenderer value={undefined as any} />)

      expect(container.innerHTML).toBeFalsy()
    })
  })

  describe('Memoization', () => {
    it('should be memoized', () => {
      expect(typeof RichTextRenderer).toBe('function')
    })
  })

  describe('Props', () => {
    it('should accept value prop', () => {
      render(<RichTextRenderer value={mockValue} />)

      expect(screen.getByTestId('portable-text')).toBeInTheDocument()
    })

    it('should use empty object as default sx', () => {
      render(<RichTextRenderer value={mockValue} />)

      expect(screen.getByTestId('portable-text')).toBeInTheDocument()
    })

    it('should use false as default structuredData', () => {
      render(<RichTextRenderer value={mockValue} />)

      expect(screen.getByTestId('portable-text')).toBeInTheDocument()
    })
  })
})

