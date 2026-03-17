import type { Metadata } from 'next'
import { CatalogPageTemplate } from './CatalogPageTemplate'
import { CatalogFaqAccordion } from './components/CatalogFaqAccordion'
import { cakesCatalogFaqItems } from './catalogFaqItems'
import {
  getCatalogByPostCakesPriceCeiling,
  getCatalogPageData
} from './catalogPageData'
import {
  createCatalogItemListStructuredData,
  createCatalogMetadata,
  type ResolvedSearchParams
} from './catalogSeo'

const pageTitle = 'Traditional Ukrainian Cakes Leeds | Birthday & Wedding'
const pageDescription = 'Authentic Ukrainian cakes in Leeds from GBP 25, including Medovik honey cake, Kyiv cake and custom birthday designs, baked fresh for delivery or collection.'

export async function generateMetadata({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const resolvedSearchParams: ResolvedSearchParams = searchParams ? await searchParams : {}

  return createCatalogMetadata({
    title: pageTitle,
    description: pageDescription,
    keywords: 'traditional Ukrainian cakes, ukrainian cakes Leeds, authentic ukrainian cakes, ukraine birthday cake, ukrainian birthday cakes, ukrainian bakery near me, honey cake, Medovik, Kyiv cake, Ukrainian wedding cakes, Ukrainian desserts Leeds, real Ukrainian cakes, Ukrainian baker Leeds, authentic Medovik, traditional medovik',
    canonicalPath: '/cakes',
    openGraphImage: {
      url: '/images/cakes-collection.jpg',
      alt: 'Ukrainian cakes collection by Olgish Cakes'
    },
    searchParams: resolvedSearchParams,
    noindexOnQueryFilters: true
  })
}

export default async function CakesPage() {
  const [catalogData, byPostCakesPriceCeilingHint] = await Promise.all([
    getCatalogPageData('cakes'),
    getCatalogByPostCakesPriceCeiling().catch((error) => {
      console.warn('Failed to fetch by-post cakes price ceiling hint for cakes page:', error)
      return undefined
    })
  ])
  const cakesForStructuredData = catalogData.cakesForUi.filter((cake) => cake.productType === 'cake')

  return (
    <CatalogPageTemplate
      variant='cakes'
      heading='Traditional Ukrainian custom cakes in Leeds for celebrations'
      intro='Browse handmade Ukrainian cakes prepared in Leeds with traditional recipes, quality ingredients and flavours that feel like home.'
      canonicalPath='/cakes'
      localBusinessDescription='Authentic traditional Ukrainian cakes made with love in Leeds. Specialising in Ukrainian birthday cakes, wedding cakes, and traditional honey cake (Medovik).'
      catalogData={catalogData}
      initialFilterDefaults={{ byPost: false, custom: true }}
      lazyByPostCakesEndpoint='/api/catalog/by-post-cakes'
      lazyByPostCakesPriceCeilingHint={byPostCakesPriceCeilingHint}
      postCatalogContent={(
        <CatalogFaqAccordion
          sectionId='cakes-faq-title'
          title='Cake ordering FAQs'
          intro='Answers to common questions about custom cakes, delivery, and ordering in Leeds.'
          items={cakesCatalogFaqItems}
        />
      )}
      additionalStructuredData={[
        createCatalogItemListStructuredData({
          listName: 'Traditional Ukrainian Cakes in Leeds',
          items: cakesForStructuredData
        })
      ]}
      includeBreadcrumbStructuredData
      breadcrumbItems={[
        {
          name: 'Home',
          item: '/'
        },
        {
          name: 'Cakes',
          item: '/cakes'
        }
      ]}
    />
  )
}
