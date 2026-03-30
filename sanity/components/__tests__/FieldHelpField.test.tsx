import { fireEvent, render, screen } from '@testing-library/react'
import type { FieldProps } from 'sanity'
import type { ReactNode } from 'react'
import { FieldHelpField, createFieldHelpFieldComponent, type FieldHelpContent } from '../FieldHelpField'

jest.mock('@sanity/ui', () => {
  const React = require('react')
  const renderElement = (tagName: string, children?: ReactNode, props?: Record<string, unknown>) => {
    const safeProps = {
      id: typeof props?.id === 'string' ? props.id : undefined,
      onClick: typeof props?.onClick === 'function' ? props.onClick : undefined,
      type: typeof props?.type === 'string' ? props.type : undefined,
    }

    return React.createElement(tagName, safeProps, children)
  }

  return {
    Box: ({ children }: { children?: ReactNode }) => renderElement('div', children),
    Button: ({ text, children, ...props }: { text?: string, children?: ReactNode }) =>
      renderElement('button', children ?? text, props),
    Dialog: ({ header, children, ...props }: { header?: string, children?: ReactNode }) =>
      renderElement(
        'div',
        <>
          {header ? renderElement('div', header) : null}
          {children}
        </>,
        props
      ),
    Flex: ({ children }: { children?: ReactNode }) => renderElement('div', children),
    Stack: ({ children }: { children?: ReactNode }) => renderElement('div', children),
    Text: ({ children }: { children?: ReactNode }) => renderElement('span', children),
  }
})

jest.mock('sanity', () => ({
  FormField: ({ children }: { children: ReactNode }) => children,
}))

const helpContent: FieldHelpContent = {
  title: 'Title',
  whatItIs: 'This is the main headline.',
  whatToEnter: 'Write a clear title.',
  whyItMatters: 'It helps readers understand the page.',
  whereUsed: ['Article heading', 'Archive card'],
  examples: ['Cake by post guide', 'Birthday cake delivery tips'],
}

function createFieldProps(overrides: Partial<FieldProps> = {}): FieldProps {
  return {
    changed: false,
    children: <input aria-label='Article title input' />,
    description: 'Field description',
    index: 0,
    inputId: 'field-title',
    level: 0,
    name: 'title',
    path: ['title'],
    presence: [],
    renderDefault: jest.fn(),
    schemaType: {
      name: 'string',
      title: 'String',
      jsonType: 'string',
      type: { name: 'string', title: 'String', jsonType: 'string' },
    } as FieldProps['schemaType'],
    title: 'Title',
    validation: [],
    value: 'Cake by post guide',
    ...overrides,
  } as FieldProps
}

describe('FieldHelpField', () => {
  it('renders the normal field content and help trigger', () => {
    render(<FieldHelpField helpContent={helpContent} props={createFieldProps()} />)

    expect(screen.getByLabelText('Article title input')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
  })

  it('opens the help dialog with structured sections', () => {
    render(<FieldHelpField helpContent={helpContent} props={createFieldProps()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))

    expect(screen.getByText('What this is')).toBeInTheDocument()
    expect(screen.getByText('What to enter')).toBeInTheDocument()
    expect(screen.getByText('Why it matters')).toBeInTheDocument()
    expect(screen.getByText('Where we use it')).toBeInTheDocument()
    expect(screen.getByText('Examples')).toBeInTheDocument()
    expect(screen.getByText('Cake by post guide')).toBeInTheDocument()
  })

  it('closes the help dialog when requested', () => {
    render(<FieldHelpField helpContent={helpContent} props={createFieldProps()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close help' }))

    expect(screen.queryByText('What this is')).not.toBeInTheDocument()
  })
})

describe('createFieldHelpFieldComponent', () => {
  it('creates a field component that uses the provided help content', () => {
    const FieldComponent = createFieldHelpFieldComponent(helpContent)

    render(<FieldComponent {...createFieldProps({ title: undefined })} />)

    fireEvent.click(screen.getByRole('button', { name: 'Help' }))

    expect(screen.getByText('Title help')).toBeInTheDocument()
  })
})
