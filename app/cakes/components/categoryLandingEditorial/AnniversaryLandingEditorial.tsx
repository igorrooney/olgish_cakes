import type { CatalogCategoryLandingConfig } from '../../categoryLandingConfig'
import {
  EditorialCardGrid,
  EditorialChecklist,
  EditorialLinkGrid,
  EditorialSection,
  EditorialSplitSection,
  EditorialStepGrid,
  EditorialTextBlocks
} from './shared'

interface AnniversaryLandingEditorialProps {
  config: CatalogCategoryLandingConfig
}

export function AnniversaryLandingEditorial({ config }: AnniversaryLandingEditorialProps) {
  return (
    <>
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

      {config.editorial.delivery ? (
        <EditorialSplitSection
          id={`${config.slug}-delivery`}
          title={config.editorial.delivery.title}
        >
          <EditorialTextBlocks blocks={config.editorial.delivery.body} />
        </EditorialSplitSection>
      ) : null}

      <EditorialSection
        id={`${config.slug}-proof`}
        title={config.proofSectionTitle}
        intro={config.editorial.proofIntro}
      >
        <EditorialChecklist items={config.proofPoints} />
      </EditorialSection>

      <EditorialSection
        id={`${config.slug}-process`}
        title={config.orderingSectionTitle}
        intro={config.editorial.orderingIntro}
      >
        <EditorialStepGrid steps={config.orderingSteps} />
      </EditorialSection>

      {config.editorial.nextStepsTitle ? (
        <EditorialSection
          id={`${config.slug}-next-steps`}
          title={config.editorial.nextStepsTitle}
        >
          <EditorialLinkGrid links={config.internalLinks} />
        </EditorialSection>
      ) : null}
    </>
  )
}
