import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CatalogPageTemplate } from './CatalogPageTemplate'
import { CatalogFaqAccordion } from './components/CatalogFaqAccordion'
import { CatalogCategoryHero } from './components/CatalogCategoryHero'
import { CatalogCategoryCtaBand } from './components/CatalogCategoryCtaBand'
import { getCategoryLandingPostCatalogContent } from './components/categoryLandingEditorial'
import { Reviews } from '@/app/components/homepage/Reviews'
import type { CatalogCategoryLandingSlug } from './categoryLandingConfig'
import { getCategoryLandingConfig } from './categoryLandingConfig'
import { getCatalogPageData } from './catalogPageData'
import {
  createCatalogFaqStructuredData,
  createCatalogItemListStructuredData,
  createCatalogMetadata,
  type ResolvedSearchParams
} from './catalogSeo'

export async function generateCategoryLandingMetadata({
  slug,
  searchParams
}: {
  slug: CatalogCategoryLandingSlug
  searchParams?: Promise<ResolvedSearchParams>
}): Promise<Metadata> {
  const config = getCategoryLandingConfig(slug)
  const resolvedSearchParams = searchParams ? await searchParams : {}

  return createCatalogMetadata({
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    canonicalPath: config.canonicalPath,
    openGraphImage: config.openGraphImage,
    searchParams: resolvedSearchParams,
    noindexOnQueryFilters: true
  })
}

export async function renderCategoryLandingPage(slug: CatalogCategoryLandingSlug) {
  const config = getCategoryLandingConfig(slug)
  const catalogData = await getCatalogPageData('cakes')
  const acceptedQueryValues = new Set([
    config.collectionQueryValue,
    ...(config.collectionQueryValueAliases ?? [])
  ])
  const targetCollection = catalogData.collectionOptions.find((option) => {
    if (acceptedQueryValues.has(option.queryValue)) {
      return true
    }

    return option.legacyQueryValues.some((value) => acceptedQueryValues.has(value))
  })

  if (!targetCollection) {
    notFound()
  }

  const filteredCakes = catalogData.cakesForUi.filter((cake) => cake.collectionIds.includes(targetCollection.id))

  if (filteredCakes.length === 0) {
    notFound()
  }

  const categoryCatalogData = {
    ...catalogData,
    cakesForUi: filteredCakes,
    featuredOffer: null,
    collectionOptions: [targetCollection]
  }
  const reviewTitleClassName = 'text-center font-oldenburg text-3xl tracking-[0.08em] text-base-content tablet:text-4xl'
  const reviewSection = slug === 'wedding-cakes' || slug === 'birthday-cakes' || slug === 'anniversary-cakes-leeds' || slug === 'baby-shower-cakes'
    ? await Reviews({ titleClassName: reviewTitleClassName })
    : undefined

  return (
    <CatalogPageTemplate
      variant='cakes'
      heading={config.heroTitle}
      intro={config.heroBody}
      canonicalPath={config.canonicalPath}
      localBusinessDescription={config.localBusinessDescription}
      catalogData={categoryCatalogData}
      initialFilterDefaults={{ byPost: false, custom: true }}
      heroSection={<CatalogCategoryHero config={config} />}
      postCatalogContent={(
        <>
          {getCategoryLandingPostCatalogContent(slug, config, reviewSection)}
          <CatalogFaqAccordion
            sectionId={`${config.slug}-faq-title`}
            title={config.faqTitle}
            intro={config.faqIntro}
            items={config.faqItems}
          />
          <CatalogCategoryCtaBand config={config} />
        </>
      )}
      additionalStructuredData={[
        createCatalogItemListStructuredData({
          listName: config.itemListName,
          items: filteredCakes
        }),
        createCatalogFaqStructuredData(config.faqItems)
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
        },
        {
          name: config.heroTitle,
          item: config.canonicalPath
        }
      ]}
      lockedCollectionQueryValues={[targetCollection.queryValue]}
      catalogMode='category-landing'
      showProductTypeFilters={false}
      showDesktopFilters={false}
      showMobileFilterSheet={false}
      showPriceFilter={false}
      showCollectionFilters={false}
      mobileToolbarVariant='inline-compact'
    />
  )
}
