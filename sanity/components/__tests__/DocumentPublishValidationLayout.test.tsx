import { render, screen } from '@testing-library/react'
import { DocumentPublishValidationLayout } from '../DocumentPublishValidationLayout'

const mockUseValidationStatus = jest.fn()

jest.mock('@sanity/ui', () => {
  const React = require('react')

  function sanitizeProps<T extends Record<string, unknown>>(props: T) {
    const {
      border,
      margin,
      padding,
      paddingLeft,
      radius,
      space,
      tone,
      weight,
      ...domProps
    } = props

    return domProps
  }

  return {
    Box: ({ as: Component = 'div', children, ...props }: { as?: string, children?: React.ReactNode }) => (
      <Component {...sanitizeProps(props)}>{children}</Component>
    ),
    Card: ({ children, ...props }: { children?: React.ReactNode }) => (
      <div {...sanitizeProps(props)}>{children}</div>
    ),
    Stack: ({ as: Component = 'div', children, ...props }: { as?: string, children?: React.ReactNode }) => (
      <Component {...sanitizeProps(props)}>{children}</Component>
    ),
    Text: ({ children, ...props }: { children?: React.ReactNode }) => (
      <span {...sanitizeProps(props)}>{children}</span>
    ),
  }
})

jest.mock('sanity', () => ({
  useValidationStatus: (...args: unknown[]) => mockUseValidationStatus(...args),
}))

describe('DocumentPublishValidationLayout', () => {
  const renderDefault = jest.fn(() => <div>Default layout</div>)

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing extra when there are no blocking validation errors', () => {
    mockUseValidationStatus.mockReturnValue({
      isValidating: false,
      validation: [],
    })

    render(
      <DocumentPublishValidationLayout
        documentId='gift-hamper-1'
        documentType='giftHamper'
        renderDefault={renderDefault}
      />
    )

    expect(screen.getByText('Default layout')).toBeInTheDocument()
    expect(screen.queryByText(/publish is blocked/i)).not.toBeInTheDocument()
  })

  it('renders a bottom summary for publish-blocking errors', () => {
    mockUseValidationStatus.mockReturnValue({
      isValidating: false,
      validation: [
        {
          level: 'warning',
          message: 'This is only a warning',
          path: ['seo', 'metaTitle'],
        },
        {
          level: 'error',
          message: 'Slug must have a value',
          path: ['slug'],
        },
        {
          level: 'error',
          message: 'Dispatch max days must be greater than or equal to dispatch min days.',
          path: ['deliverySection', 'customPolicy', 'dispatchMaxDays'],
        },
      ],
    })

    render(
      <DocumentPublishValidationLayout
        documentId='gift-hamper-1'
        documentType='giftHamper'
        renderDefault={renderDefault}
      />
    )

    expect(screen.getByText('Publish is blocked by 2 errors')).toBeInTheDocument()
    expect(screen.getByText('Slug must have a value')).toBeInTheDocument()
    expect(screen.getByText('Slug')).toBeInTheDocument()
    expect(screen.getByText('Dispatch max days must be greater than or equal to dispatch min days.')).toBeInTheDocument()
    expect(screen.getByText('Delivery Section > Custom Policy > Dispatch Max Days')).toBeInTheDocument()
    expect(screen.queryByText('This is only a warning')).not.toBeInTheDocument()
  })

  it('shows a validation-in-progress message before errors are available', () => {
    mockUseValidationStatus.mockReturnValue({
      isValidating: true,
      validation: [],
    })

    render(
      <DocumentPublishValidationLayout
        documentId='gift-hamper-1'
        documentType='giftHamper'
        renderDefault={renderDefault}
      />
    )

    expect(screen.getByText('Checking publish blockers')).toBeInTheDocument()
    expect(screen.getByText('Sanity is still validating this document.')).toBeInTheDocument()
  })
})
