import type { ReactElement, ReactNode } from 'react'
import type {
  CatalogCategoryLandingConfig,
  CatalogCategoryLandingSlug
} from '../../categoryLandingConfig'
import { AnniversaryLandingEditorial } from './AnniversaryLandingEditorial'
import { BabyShowerLandingEditorial } from './BabyShowerLandingEditorial'
import { BirthdayLandingEditorial } from './BirthdayLandingEditorial'
import { WeddingLandingEditorial } from './WeddingLandingEditorial'

const categoryLandingEditorialResolvers: Record<
  CatalogCategoryLandingSlug,
  (config: CatalogCategoryLandingConfig, reviewSection?: ReactNode) => ReactElement
> = {
  'wedding-cakes': (config, reviewSection) => (
    <WeddingLandingEditorial config={config} reviewSection={reviewSection} />
  ),
  'birthday-cakes': (config) => <BirthdayLandingEditorial config={config} />,
  'anniversary-cakes-leeds': (config) => <AnniversaryLandingEditorial config={config} />,
  'baby-shower-cakes': (config) => <BabyShowerLandingEditorial config={config} />
}

export function getCategoryLandingPostCatalogContent(
  slug: CatalogCategoryLandingSlug,
  config: CatalogCategoryLandingConfig,
  reviewSection?: ReactNode
) {
  return categoryLandingEditorialResolvers[slug](config, reviewSection)
}
