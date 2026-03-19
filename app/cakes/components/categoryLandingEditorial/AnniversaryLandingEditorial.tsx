import Link from 'next/link'
import type { CatalogCategoryLandingConfig } from '../../categoryLandingConfig'
import {
  EditorialCardGrid,
  EditorialChecklist,
  EditorialLinkGrid,
  EditorialSection,
  EditorialSplitSection,
  EditorialStepGrid
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
      >
        <EditorialCardGrid items={config.flavourHighlights} />
      </EditorialSection>

      <EditorialSplitSection
        id={`${config.slug}-delivery`}
        title={config.serviceAreaTitle || 'Anniversary cake delivery planning in Leeds'}
        intro={config.serviceAreaBody}
      >
        <p>
          Timing matters more when the cake is heading to a restaurant, venue or carefully staged home celebration where the finish needs to arrive intact.
        </p>
        <p className='mt-4'>
          The{' '}
          <Link href='/cake-delivery-leeds' className='link link-hover text-primary'>
            Leeds delivery guide
          </Link>{' '}
          helps you judge whether collection or delivery is the better fit for the setting.
        </p>
      </EditorialSplitSection>

      <EditorialSection
        id={`${config.slug}-proof`}
        title={config.proofSectionTitle}
        intro='Anniversary cakes tend to feel strongest when the personal details stay selective and the practical decisions are settled before the decoration is finalised.'
      >
        <EditorialChecklist items={config.proofPoints} />
      </EditorialSection>

      <EditorialSection
        id={`${config.slug}-process`}
        title={config.orderingSectionTitle}
        intro='A more refined anniversary cake usually starts with clarity about the milestone, the setting and how the cake will actually be served.'
      >
        <EditorialStepGrid steps={config.orderingSteps} />
      </EditorialSection>

      <EditorialSection
        id={`${config.slug}-next-steps`}
        title='Useful pages for a more refined anniversary brief'
      >
        <EditorialLinkGrid links={config.internalLinks} />
      </EditorialSection>
    </>
  )
}
