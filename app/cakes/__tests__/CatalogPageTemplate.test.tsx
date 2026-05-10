import { render } from '@testing-library/react'
import { CatalogPageTemplate } from '../CatalogPageTemplate'
import type { CatalogPageData } from '../catalogPageData'
import type { CakesTabletCatalogProps, TabletCake } from '../components/types'

const mockedCakesTabletCatalog = jest.fn((_props: CakesTabletCatalogProps) => (
  <div data-testid='cakes-tablet-catalog' />
))

jest.mock('../CatalogClientProviders', () => ({
  CatalogClientProviders: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

jest.mock('../components/CakesTabletCatalog', () => ({
  CakesTabletCatalog: (props: CakesTabletCatalogProps) => mockedCakesTabletCatalog(props)
}))

function createCatalogCake(index: number): TabletCake {
  return {
    id: `cake-${index}`,
    slug: `cake-${index}`,
    href: `/cakes/cake-${index}`,
    navigationTarget: 'product',
    name: `Cake ${index}`,
    description: `Cake ${index} description`,
    price: 25 + index,
    imageUrl: '/images/placeholder-cake.jpg',
    imageAlt: `Cake ${index} by Olgish Cakes`,
    isByPost: false,
    isCustom: true,
    isPopular: false,
    collectionIds: [],
    productType: 'cake'
  }
}

function createCatalogData(cakesForUi: TabletCake[]): CatalogPageData {
  return {
    cakesForUi,
    mappedGiftHampers: cakesForUi.filter((cake) => cake.productType === 'giftHamper'),
    collectionOptions: [],
    featuredOffer: null
  }
}

describe('CatalogPageTemplate', () => {
  beforeEach(() => {
    mockedCakesTabletCatalog.mockClear()
  })

  it('keeps the full catalog server-rendered for mobile requests', () => {
    const cakesForUi = Array.from({ length: 8 }, (_, index) => createCatalogCake(index + 1))

    render(
      <CatalogPageTemplate
        variant='cakes'
        heading='Traditional Ukrainian Cakes Leeds'
        intro='Browse handmade Ukrainian cakes.'
        canonicalPath='/cakes'
        localBusinessDescription='Handmade cakes in Leeds.'
        catalogData={createCatalogData(cakesForUi)}
        initialFilterDefaults={{ byPost: false, custom: true }}
        lazyCustomCakesEndpoint='/api/catalog/custom-cakes'
        lazyByPostCakesEndpoint='/api/catalog/by-post-cakes'
        initialViewport='mobile'
      />
    )

    expect(mockedCakesTabletCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        cakes: cakesForUi
      })
    )
    expect(mockedCakesTabletCatalog.mock.calls[0][0].cakes).toHaveLength(8)
    expect(mockedCakesTabletCatalog.mock.calls[0][0].cakes[7]?.href).toBe('/cakes/cake-8')
  })
})
