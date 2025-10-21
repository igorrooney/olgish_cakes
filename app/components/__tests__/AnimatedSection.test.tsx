/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import { AnimatedSection, AnimatedDiv } from '../AnimatedSection'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    section: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <section ref={ref} {...props}>{children}</section>
    )),
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>{children}</div>
    ))
  }
}))

describe('AnimatedSection', () => {
  it('should render children', () => {
    const { getByText } = render(
      <AnimatedSection>
        <div>Test Content</div>
      </AnimatedSection>
    )

    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('should apply className', () => {
    const { container } = render(
      <AnimatedSection className="custom-class">
        Content
      </AnimatedSection>
    )

    const section = container.querySelector('section')
    expect(section).toHaveClass('custom-class')
  })

  it('should use empty string as default className', () => {
    const { container } = render(
      <AnimatedSection>Content</AnimatedSection>
    )

    const section = container.querySelector('section')
    expect(section).toBeInTheDocument()
  })

  it('should forward ref', () => {
    const ref = React.createRef<HTMLElement>()
    
    render(
      <AnimatedSection ref={ref}>
        Content
      </AnimatedSection>
    )

    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('should pass additional props', () => {
    const { container } = render(
      <AnimatedSection data-testid="animated-section">
        Content
      </AnimatedSection>
    )

    expect(container.querySelector('[data-testid="animated-section"]')).toBeInTheDocument()
  })

  it('should have displayName', () => {
  })

  it('should memoize component', () => {
  })

  it('should render as section element', () => {
    const { container } = render(
      <AnimatedSection>Content</AnimatedSection>
    )

    expect(container.querySelector('section')).toBeInTheDocument()
  })
})

describe('AnimatedDiv', () => {
  it('should render children', () => {
    const { getByText } = render(
      <AnimatedDiv>
        <div>Div Content</div>
      </AnimatedDiv>
    )

    expect(getByText('Div Content')).toBeInTheDocument()
  })

  it('should forward ref', () => {
    const ref = React.createRef<HTMLDivElement>()
    
    render(
      <AnimatedDiv ref={ref}>
        Content
      </AnimatedDiv>
    )

    expect(ref.current).toBeInstanceOf(HTMLElement)
  })

  it('should pass additional props', () => {
    const { container } = render(
      <AnimatedDiv data-testid="animated-div">
        Content
      </AnimatedDiv>
    )

    expect(container.querySelector('[data-testid="animated-div"]')).toBeInTheDocument()
  })

  it('should have displayName', () => {
  })

  it('should memoize component', () => {
  })

  it('should render as div element', () => {
    const { container } = render(
      <AnimatedDiv>Content</AnimatedDiv>
    )

    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should accept className', () => {
    const { container } = render(
      <AnimatedDiv className="test-class">Content</AnimatedDiv>
    )

    const div = container.querySelector('div')
    expect(div).toHaveClass('test-class')
  })
})

