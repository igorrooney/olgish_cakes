/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DesignSelector } from '../DesignSelector'

// Mock MUI
jest.mock('@/lib/mui-optimization', () => ({
  Box: ({ children, sx, ...props }: any) => <div data-testid="box" {...props}>{children}</div>,
  FormControl: ({ children, fullWidth, ...props }: any) => (
    <div data-testid="form-control" data-full-width={fullWidth} {...props}>{children}</div>
  ),
  MenuItem: ({ children, value, ...props }: any) => (
    <option value={value} {...props}>{children}</option>
  ),
  Select: ({ children, value, onChange, sx, ...props }: any) => (
    <select
      data-testid="select"
      value={value}
      onChange={(e) => onChange({ target: { value: e.target.value } })}
      {...props}
    >
      {children}
    </select>
  ),
  Typography: ({ children, variant, sx, ...props }: any) => (
    <div data-testid="typography" data-variant={variant} {...props}>{children}</div>
  )
}))

describe('DesignSelector', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render Box container', () => {
      render(<DesignSelector hasIndividualDesigns={false} onChange={mockOnChange} value="standard" />)

      expect(screen.getByTestId('box')).toBeInTheDocument()
    })

    it('should render label', () => {
      render(<DesignSelector hasIndividualDesigns={false} onChange={mockOnChange} value="standard" />)

      expect(screen.getByText('Select Design Type:')).toBeInTheDocument()
    })

    it('should render FormControl', () => {
      render(<DesignSelector hasIndividualDesigns={false} onChange={mockOnChange} value="standard" />)

      expect(screen.getByTestId('form-control')).toBeInTheDocument()
    })

    it('should render Select', () => {
      render(<DesignSelector hasIndividualDesigns={false} onChange={mockOnChange} value="standard" />)

      expect(screen.getByTestId('select')).toBeInTheDocument()
    })

    it('should render Standard Design option', () => {
      render(<DesignSelector hasIndividualDesigns={false} onChange={mockOnChange} value="standard" />)

      expect(screen.getByText('Standard Design')).toBeInTheDocument()
    })
  })

  describe('Individual Designs', () => {
    it('should render Individual Design option when hasIndividualDesigns is true', () => {
      render(<DesignSelector hasIndividualDesigns={true} onChange={mockOnChange} value="standard" />)

      expect(screen.getByText('Individual Design')).toBeInTheDocument()
    })

    it('should not render Individual Design option when hasIndividualDesigns is false', () => {
      render(<DesignSelector hasIndividualDesigns={false} onChange={mockOnChange} value="standard" />)

      expect(screen.queryByText('Individual Design')).not.toBeInTheDocument()
    })

    it('should show only Standard Design when hasIndividualDesigns is false', () => {
      const { container } = render(
        <DesignSelector hasIndividualDesigns={false} onChange={mockOnChange} value="standard" />
      )

      const options = container.querySelectorAll('option')
      expect(options.length).toBe(1)
    })

    it('should show both options when hasIndividualDesigns is true', () => {
      const { container } = render(
        <DesignSelector hasIndividualDesigns={true} onChange={mockOnChange} value="standard" />
      )

      const options = container.querySelectorAll('option')
      expect(options.length).toBe(2)
    })
  })

  describe('Value Prop', () => {
    it('should display selected value', () => {
      render(<DesignSelector hasIndividualDesigns={false} onChange={mockOnChange} value="standard" />)

      const select = screen.getByTestId('select')
      expect(select).toHaveValue('standard')
    })

    it('should display individual value', () => {
      render(<DesignSelector hasIndividualDesigns={true} onChange={mockOnChange} value="individual" />)

      const select = screen.getByTestId('select')
      expect(select).toHaveValue('individual')
    })
  })

  describe('onChange Handler', () => {
    it('should call onChange when selection changes', () => {
      render(<DesignSelector hasIndividualDesigns={true} onChange={mockOnChange} value="standard" />)

      const select = screen.getByTestId('select')
      fireEvent.change(select, { target: { value: 'individual' } })

      expect(mockOnChange).toHaveBeenCalledWith('individual')
    })

    it('should call onChange with standard value', () => {
      render(<DesignSelector hasIndividualDesigns={true} onChange={mockOnChange} value="individual" />)

      const select = screen.getByTestId('select')
      fireEvent.change(select, { target: { value: 'standard' } })

      expect(mockOnChange).toHaveBeenCalledWith('standard')
    })

    it('should call onChange exactly once per change', () => {
      render(<DesignSelector hasIndividualDesigns={true} onChange={mockOnChange} value="standard" />)

      const select = screen.getByTestId('select')
      fireEvent.change(select, { target: { value: 'individual' } })

      expect(mockOnChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('FormControl', () => {
    it('should be fullWidth', () => {
      render(<DesignSelector hasIndividualDesigns={false} onChange={mockOnChange} value="standard" />)

      const formControl = screen.getByTestId('form-control')
      expect(formControl.getAttribute('data-full-width')).toBe('true')
    })
  })

  describe('Typography', () => {
    it('should use subtitle1 variant', () => {
      render(<DesignSelector hasIndividualDesigns={false} onChange={mockOnChange} value="standard" />)

      const typography = screen.getByTestId('typography')
      expect(typography.getAttribute('data-variant')).toBe('subtitle1')
    })
  })

  describe('MenuItem Values', () => {
    it('should have correct value for standard', () => {
      const { container } = render(
        <DesignSelector hasIndividualDesigns={false} onChange={mockOnChange} value="standard" />
      )

      const standardOption = container.querySelector('option[value="standard"]')
      expect(standardOption).toBeTruthy()
    })

    it('should have correct value for individual', () => {
      const { container } = render(
        <DesignSelector hasIndividualDesigns={true} onChange={mockOnChange} value="standard" />
      )

      const individualOption = container.querySelector('option[value="individual"]')
      expect(individualOption).toBeTruthy()
    })
  })
})

