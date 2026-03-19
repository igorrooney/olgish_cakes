import type { ReactElement } from 'react'
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
  (config: CatalogCategoryLandingConfig) => ReactElement
> = {
  'wedding-cakes': (config) => <WeddingLandingEditorial config={config} />,
  'birthday-cakes': (config) => <BirthdayLandingEditorial config={config} />,
  'anniversary-cakes-leeds': (config) => <AnniversaryLandingEditorial config={config} />,
  'baby-shower-cakes': (config) => <BabyShowerLandingEditorial config={config} />
}

export function getCategoryLandingPostCatalogContent(
  slug: CatalogCategoryLandingSlug,
  config: CatalogCategoryLandingConfig
) {
  return categoryLandingEditorialResolvers[slug](config)
}
