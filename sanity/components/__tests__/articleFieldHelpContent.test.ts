import type { ReactNode } from 'react'
import { articleFieldHelpContent, articleFieldHelpComponents, articleHelpFieldPaths } from '../articleFieldHelpContent'

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
        React.createElement(
          React.Fragment,
          null,
          header ? renderElement('div', header) : null,
          children
        ),
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

describe('articleFieldHelpContent', () => {
  it('defines help content for every expected article field path', () => {
    expect(Object.keys(articleFieldHelpContent).sort()).toEqual([...articleHelpFieldPaths].sort())
  })

  it('keeps every help entry complete', () => {
    articleHelpFieldPaths.forEach((fieldPath) => {
      const helpEntry = articleFieldHelpContent[fieldPath]

      expect(helpEntry.title.length).toBeGreaterThan(0)
      expect(helpEntry.whatItIs.length).toBeGreaterThan(0)
      expect(helpEntry.whatToEnter.length).toBeGreaterThan(0)
      expect(helpEntry.whyItMatters.length).toBeGreaterThan(0)
      expect(helpEntry.whereUsed.length).toBeGreaterThan(0)
      expect(helpEntry.examples.length).toBeGreaterThan(0)
    })
  })

  it('returns a field component for every configured path', () => {
    articleHelpFieldPaths.forEach((fieldPath) => {
      const components = articleFieldHelpComponents(fieldPath)

      expect(typeof components.components.field).toBe('function')
    })
  })
})
