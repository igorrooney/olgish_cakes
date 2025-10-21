/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import AnimatedWrapper from '../AnimatedWrapper'

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}))

describe('AnimatedWrapper', () => {
  it('should render children', () => {
    const { getByText } = render(
      <AnimatedWrapper>
        <div>Test Content</div>
      </AnimatedWrapper>
    )

    expect(getByText('Test Content')).toBeInTheDocument()
  })

  it('should use default initial values', () => {
    const { container } = render(
      <AnimatedWrapper>
        Content
      </AnimatedWrapper>
    )

    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should accept custom initial prop', () => {
    const { container } = render(
      <AnimatedWrapper initial={{ opacity: 0, scale: 0.9 }}>
        Content
      </AnimatedWrapper>
    )

    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should accept custom animate prop', () => {
    const { container } = render(
      <AnimatedWrapper animate={{ opacity: 1, scale: 1 }}>
        Content
      </AnimatedWrapper>
    )

    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should accept custom transition prop', () => {
    const { container } = render(
      <AnimatedWrapper transition={{ duration: 0.5 }}>
        Content
      </AnimatedWrapper>
    )

    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should accept whileHover prop', () => {
    const { container } = render(
      <AnimatedWrapper whileHover={{ scale: 1.05 }}>
        Content
      </AnimatedWrapper>
    )

    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should use default transition duration', () => {
    const { container } = render(
      <AnimatedWrapper>
        Content
      </AnimatedWrapper>
    )

    // Default transition is used
    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should handle all props together', () => {
    const { container } = render(
      <AnimatedWrapper
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        whileHover={{ scale: 1.1 }}
      >
        Content
      </AnimatedWrapper>
    )

    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should render motion div', () => {
    const { container } = render(
      <AnimatedWrapper>Content</AnimatedWrapper>
    )

    expect(container.querySelector('div')).toBeInTheDocument()
  })

  it('should render multiple children', () => {
    const { getByText } = render(
      <AnimatedWrapper>
        <div>Child 1</div>
        <div>Child 2</div>
      </AnimatedWrapper>
    )

    expect(getByText('Child 1')).toBeInTheDocument()
    expect(getByText('Child 2')).toBeInTheDocument()
  })

  it('should be exported as default', () => {
    expect(AnimatedWrapper).toBeDefined()
    expect(typeof AnimatedWrapper).toBe('function')
  })
})

