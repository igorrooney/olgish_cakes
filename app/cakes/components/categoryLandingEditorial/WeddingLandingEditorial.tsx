import type { ReactNode } from 'react'
import type { CatalogCategoryLandingConfig } from '../../categoryLandingConfig'
import {
  EditorialCardGrid,
  EditorialChecklist,
  EditorialSection,
  EditorialStepGrid
} from './shared'

interface WeddingLandingEditorialProps {
  config: CatalogCategoryLandingConfig
  reviewSection?: ReactNode
}

export function WeddingLandingEditorial({
  config,
  reviewSection
}: WeddingLandingEditorialProps) {
  return (
    <>
      <EditorialSection
        id={`${config.slug}-proof`}
        title={config.proofSectionTitle}
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
        id={`${config.slug}-overview`}
        title={config.audienceIntroTitle}
        intro={config.audienceIntroBody}
      >
        <EditorialCardGrid items={config.useCases} />
      </EditorialSection>

      <EditorialSection
        id={`${config.slug}-flavour-planning`}
        title={config.flavourSectionTitle}
        intro={config.flavourSectionIntro}
      />

    </>
  )
}
