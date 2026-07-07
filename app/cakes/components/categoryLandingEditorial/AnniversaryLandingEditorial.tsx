import type { ReactNode } from 'react'
import type { CatalogCategoryLandingConfig } from '../../categoryLandingConfig'
import {
  EditorialCardGrid,
  EditorialChecklist,
  EditorialSection,
  EditorialSplitSection,
  EditorialStepGrid,
  EditorialTextBlocks
} from './shared'

interface AnniversaryLandingEditorialProps {
  config: CatalogCategoryLandingConfig
  reviewSection?: ReactNode
}

export function AnniversaryLandingEditorial({
  config,
  reviewSection
}: AnniversaryLandingEditorialProps) {
  return (
    <>
      <EditorialSection
        id={`${config.slug}-proof`}
        title={config.proofSectionTitle}
        intro={config.editorial.proofIntro}
      >
        <EditorialChecklist items={config.proofPoints} />
      </EditorialSection>

      {reviewSection}

      <EditorialSection
        id={`${config.slug}-process`}
        title={config.orderingSectionTitle}
        intro={config.editorial.orderingIntro}
      >
        <EditorialStepGrid steps={config.orderingSteps} />
      </EditorialSection>

      <EditorialSection
        id={`${config.slug}-flavour-planning`}
        title={config.flavourSectionTitle}
        intro={config.flavourSectionIntro}
      >
        {config.flavourSectionItems ? (
          <EditorialCardGrid items={config.flavourSectionItems} />
        ) : null}
      </EditorialSection>

      {config.editorial.delivery ? (
        <EditorialSplitSection
          id={`${config.slug}-delivery`}
          title={config.editorial.delivery.title}
        >
          <EditorialTextBlocks blocks={config.editorial.delivery.body} />
        </EditorialSplitSection>
      ) : null}
    </>
  )
}
