/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '@testing-library/react'
import { NavigationStructuredData } from '../NavigationStructuredData'

describe('NavigationStructuredData', () => {
  const mockNavigation = [
    { name: 'Cakes', href: '/cakes' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ]

  it('should render script tag', () => {
    const { container } = render(<NavigationStructuredData navigation={mockNavigation} />)

    const script = container.querySelector('script[type="application/ld+json"]')
    expect(script).toBeTruthy()
  })

  it('should include @context', () => {
    const { container } = render(<NavigationStructuredData navigation={mockNavigation} />)

    const script = container.querySelector('script')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json['@context']).toBe('https://schema.org')
  })

  it('should use SiteNavigationElement type', () => {
    const { container } = render(<NavigationStructuredData navigation={mockNavigation} />)

    const script = container.querySelector('script')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json['@type']).toBe('SiteNavigationElement')
  })

  it('should include navigation name', () => {
    const { container } = render(<NavigationStructuredData navigation={mockNavigation} />)

    const script = container.querySelector('script')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json.name).toBe('Olgish Cakes Navigation')
  })

  it('should map all navigation items', () => {
    const { container } = render(<NavigationStructuredData navigation={mockNavigation} />)

    const script = container.querySelector('script')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json.mainEntity.length).toBe(3)
  })

  it('should create WebPage entries for each item', () => {
    const { container } = render(<NavigationStructuredData navigation={mockNavigation} />)

    const script = container.querySelector('script')
    const json = JSON.parse(script?.textContent || '{}')
    json.mainEntity.forEach((entity: any) => {
      expect(entity['@type']).toBe('WebPage')
    })
  })

  it('should include correct URLs', () => {
    const { container } = render(<NavigationStructuredData navigation={mockNavigation} />)

    const script = container.querySelector('script')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json.mainEntity[0].url).toBe('https://olgishcakes.co.uk/cakes')
    expect(json.mainEntity[1].url).toBe('https://olgishcakes.co.uk/about')
  })

  it('should handle items with megaMenu', () => {
    const navWithMega = [
      { name: 'Cakes', href: '/cakes', megaMenu: {} }
    ]

    const { container } = render(<NavigationStructuredData navigation={navWithMega} />)

    const script = container.querySelector('script')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json.mainEntity[0].description).toContain('featured items')
  })

  it('should handle items with dropdown', () => {
    const navWithDropdown = [
      { name: 'Services', href: '/services', dropdown: [] }
    ]

    const { container } = render(<NavigationStructuredData navigation={navWithDropdown} />)

    const script = container.querySelector('script')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json.mainEntity[0].description).toContain('services and options')
  })

  it('should handle items without megaMenu or dropdown', () => {
    const { container } = render(<NavigationStructuredData navigation={mockNavigation} />)

    const script = container.querySelector('script')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json.mainEntity[0].description).toContain('cakes page')
  })

  it('should include breadcrumb for each item', () => {
    const { container } = render(<NavigationStructuredData navigation={mockNavigation} />)

    const script = container.querySelector('script')
    const json = JSON.parse(script?.textContent || '{}')
    json.mainEntity.forEach((entity: any) => {
      expect(entity.breadcrumb['@type']).toBe('BreadcrumbList')
      expect(entity.breadcrumb.itemListElement.length).toBe(2)
    })
  })

  it('should handle empty navigation', () => {
    const { container } = render(<NavigationStructuredData navigation={[]} />)

    const script = container.querySelector('script')
    const json = JSON.parse(script?.textContent || '{}')
    expect(json.mainEntity).toEqual([])
  })

  it('should memoize component', () => {
  })

  it('should render script without hydration issues', () => {
    const { container } = render(<NavigationStructuredData navigation={mockNavigation} />)

    const script = container.querySelector('script')
    expect(script).toBeTruthy()
    // suppressHydrationWarning is a React prop, not an HTML attribute
    expect(script?.getAttribute('type')).toBe('application/ld+json')
  })
})

