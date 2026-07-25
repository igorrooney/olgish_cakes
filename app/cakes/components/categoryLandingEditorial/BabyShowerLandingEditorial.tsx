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

interface BabyShowerLandingEditorialProps {
  config: CatalogCategoryLandingConfig
  reviewSection?: ReactNode
}

export function BabyShowerLandingEditorial({
  config,
  reviewSection
}: BabyShowerLandingEditorialProps) {
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

      {config.audienceIntroTitle && config.useCases ? (
        <EditorialSection
          id={`${config.slug}-overview`}
          title={config.audienceIntroTitle}
          intro={config.audienceIntroBody}
        >
          <EditorialCardGrid items={config.useCases} />
        </EditorialSection>
      ) : null}

      <EditorialSection
        id={`${config.slug}-flavour-planning`}
        title={config.flavourSectionTitle}
        intro={config.flavourSectionIntro}
      />

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
