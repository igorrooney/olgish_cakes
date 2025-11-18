/**
 * @jest-environment jsdom
 */
import { render } from '@testing-library/react'
import React from 'react'
import TraditionalUkrainianCakesPage from '../page'

// Mock dependencies
jest.mock('../../utils/fetchCakes', () => ({
    getAllCakes: jest.fn(() => Promise.resolve([]))
}))

jest.mock('../../components/CakeCard', () => ({
    __esModule: true,
    default: ({ cake }: { cake: { name: string } }) => <div data-testid="cake-card">{cake.name}</div>
}))

jest.mock('../../components/Breadcrumbs', () => ({
    Breadcrumbs: ({ items }: { items: Array<{ label: string; href: string }> }) => (
        <nav data-testid="breadcrumbs">
            {items.map((item, i) => (
                <a key={i} href={item.href}>
                    {item.label}
                </a>
            ))}
        </nav>
    )
}))

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
        <a href={href} {...props}>{children}</a>
    )
}))

jest.mock('@/lib/mui-optimization', () => ({
    Container: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
        <div {...props}>{children}</div>
    ),
    Typography: ({ children, component, ...props }: { children: React.ReactNode; component?: string; [key: string]: unknown }) => {
        const Component = component || 'div'
        return <Component {...props}>{children}</Component>
    },
    Box: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
        <div {...props}>{children}</div>
    ),
    Grid: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
        <div {...props}>{children}</div>
    ),
    Paper: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
        <div {...props}>{children}</div>
    ),
    Chip: ({ label, ...props }: { label: string; [key: string]: unknown }) => (
        <span {...props}>{label}</span>
    ),
    Button: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => (
        <button {...props}>{children}</button>
    )
}))

describe('TraditionalUkrainianCakesPage', () => {
    describe('Structured Data - Price Validation', () => {
        it('should have numeric prices in structured data offers', async () => {
            const { container } = await render(await TraditionalUkrainianCakesPage())

            const script = container.querySelector('script[type="application/ld+json"]')
            expect(script).toBeTruthy()

            const structuredData = JSON.parse(script?.textContent || '{}')

            // Verify ItemList structure
            expect(structuredData['@type']).toBe('ItemList')
            expect(structuredData.itemListElement).toBeDefined()
            expect(Array.isArray(structuredData.itemListElement)).toBe(true)

            // Verify each product has numeric price
            structuredData.itemListElement.forEach((listItem: {
                '@type': string
                position: number
                item: {
                    '@type': string
                    name: string
                    offers: {
                        '@type': string
                        price: number
                        priceCurrency: string
                    }
                }
            }) => {
                const product = listItem.item
                expect(product['@type']).toBe('Product')
                expect(product.offers).toBeDefined()
                expect(product.offers['@type']).toBe('Offer')

                // CRITICAL: Price must be a number, not a string
                expect(typeof product.offers.price).toBe('number')
                expect(Number.isFinite(product.offers.price)).toBe(true)
                expect(product.offers.price).toBeGreaterThan(0)

                // Verify priceCurrency is present
                expect(product.offers.priceCurrency).toBe('GBP')
            })
        })

        it('should have correct numeric prices for each cake type', async () => {
            const { container } = await render(await TraditionalUkrainianCakesPage())

            const script = container.querySelector('script[type="application/ld+json"]')
            const structuredData = JSON.parse(script?.textContent || '{}')

            const expectedPrices: Record<string, number> = {
                'Medovik (Honey Cake)': 25,
                'Kyiv Cake': 30,
                'Napoleon Cake': 28,
                'Poppy Seed Roll (Makivnyk)': 20
            }

            structuredData.itemListElement.forEach((listItem: {
                item: {
                    name: string
                    offers: {
                        price: number
                    }
                }
            }) => {
                const product = listItem.item
                const expectedPrice = expectedPrices[product.name]

                if (expectedPrice) {
                    expect(product.offers.price).toBe(expectedPrice)
                    expect(typeof product.offers.price).toBe('number')
                }
            })
        })

        it('should not have string prices in structured data', async () => {
            const { container } = await render(await TraditionalUkrainianCakesPage())

            const script = container.querySelector('script[type="application/ld+json"]')
            const structuredData = JSON.parse(script?.textContent || '{}')

            structuredData.itemListElement.forEach((listItem: {
                item: {
                    offers: {
                        price: number
                    }
                }
            }) => {
                const product = listItem.item

                // Price should NOT be a string - must be a number
                expect(typeof product.offers.price).toBe('number')
                // If price is a number, it cannot contain strings, so toContain checks are unnecessary
            })
        })

        it('should have valid floating point numbers for prices', async () => {
            const { container } = await render(await TraditionalUkrainianCakesPage())

            const script = container.querySelector('script[type="application/ld+json"]')
            const structuredData = JSON.parse(script?.textContent || '{}')

            structuredData.itemListElement.forEach((listItem: {
                item: {
                    offers: {
                        price: number
                    }
                }
            }) => {
                const product = listItem.item
                const price = product.offers.price

                // Must be a valid number
                expect(typeof price).toBe('number')
                expect(Number.isFinite(price)).toBe(true)
                expect(Number.isNaN(price)).toBe(false)
                expect(Number.isInteger(price) || Number.isFinite(price)).toBe(true)
            })
        })

        it('should have complete offer structure with all required fields', async () => {
            const { container } = await render(await TraditionalUkrainianCakesPage())

            const script = container.querySelector('script[type="application/ld+json"]')
            const structuredData = JSON.parse(script?.textContent || '{}')

            structuredData.itemListElement.forEach((listItem: any) => {
                const offer = listItem.item.offers

                expect(offer['@type']).toBe('Offer')
                expect(typeof offer.price).toBe('number')
                expect(offer.priceCurrency).toBe('GBP')
                expect(offer.availability).toBe('https://schema.org/InStock')
                expect(offer.priceValidUntil).toBeDefined()
                expect(offer.seller).toBeDefined()
                expect(offer.shippingDetails).toBeDefined()
            })
        })
    })

    describe('Structured Data - Schema Validation', () => {
        it('should have valid ItemList schema', async () => {
            const { container } = await render(await TraditionalUkrainianCakesPage())

            const script = container.querySelector('script[type="application/ld+json"]')
            const structuredData = JSON.parse(script?.textContent || '{}')

            expect(structuredData['@context']).toBe('https://schema.org')
            expect(structuredData['@type']).toBe('ItemList')
            expect(structuredData.name).toBe('Traditional Ukrainian Cakes')
            expect(structuredData.url).toBe('https://olgishcakes.co.uk/traditional-ukrainian-cakes')
        })

        it('should have valid Product schema for each item', async () => {
            const { container } = await render(await TraditionalUkrainianCakesPage())

            const script = container.querySelector('script[type="application/ld+json"]')
            const structuredData = JSON.parse(script?.textContent || '{}')

            structuredData.itemListElement.forEach((listItem: {
                '@type': string
                position: number
                item: {
                    '@type': string
                    name: string
                    description: string
                    brand: {
                        '@type': string
                        name: string
                    }
                }
            }) => {
                expect(listItem['@type']).toBe('ListItem')
                expect(listItem.position).toBeGreaterThan(0)
                expect(listItem.item['@type']).toBe('Product')
                expect(listItem.item.name).toBeDefined()
                expect(listItem.item.description).toBeDefined()
                expect(listItem.item.brand).toBeDefined()
                expect(listItem.item.brand['@type']).toBe('Brand')
                expect(listItem.item.brand.name).toBe('Olgish Cakes')
            })
        })
    })
})

