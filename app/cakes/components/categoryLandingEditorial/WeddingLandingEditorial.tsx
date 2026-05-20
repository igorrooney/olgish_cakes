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

interface WeddingLandingEditorialProps {
  config: CatalogCategoryLandingConfig
}

export function WeddingLandingEditorial({ config }: WeddingLandingEditorialProps) {
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
        title={config.serviceAreaTitle || 'Wedding cake delivery planning in Leeds'}
        intro={config.serviceAreaBody}
      >
        <p>
          Venue access, setup windows and the point in the schedule when the cake needs to look its best all shape what is sensible to build.
        </p>
        <p className='mt-4'>
          It helps to confirm the venue access window and delivery details on the{' '}
          <Link href='/contact' className='link link-hover text-primary'>
            contact page
          </Link>{' '}
          before you finalise the finish or send a detailed enquiry.
        </p>
      </EditorialSplitSection>

      <EditorialSection
        id={`${config.slug}-proof`}
        title={config.proofSectionTitle}
        intro='The strongest wedding cake orders usually combine visual planning with practical details early, so the brief stays elegant and realistic at the same time.'
      >
        <EditorialChecklist items={config.proofPoints} />
      </EditorialSection>

      <EditorialSection
        id={`${config.slug}-process`}
        title={config.orderingSectionTitle}
        intro='A clearer process usually leads to a better brief because the design, guest count and logistics stay aligned from the beginning.'
      >
        <EditorialStepGrid steps={config.orderingSteps} />
      </EditorialSection>

      <EditorialSection
        id={`${config.slug}-next-steps`}
        title='Useful pages before you finalise a wedding cake brief'
      >
        <EditorialLinkGrid links={config.internalLinks} />
      </EditorialSection>
    </>
  )
}
