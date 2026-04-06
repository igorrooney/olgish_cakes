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

interface BabyShowerLandingEditorialProps {
  config: CatalogCategoryLandingConfig
}

export function BabyShowerLandingEditorial({ config }: BabyShowerLandingEditorialProps) {
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
        title={config.serviceAreaTitle || 'Baby shower cake delivery planning in Leeds'}
        intro={config.serviceAreaBody}
      >
        <p>
          Shorter notice periods mean the travel plan matters early, especially if the cake is being gifted or timed closely to the shower itself.
        </p>
        <p className='mt-4'>
          The{' '}
          <Link href='/contact' className='link link-hover text-primary'>
            contact page
          </Link>{' '}
          helps you compare the safer option before the brief gets more specific.
        </p>
      </EditorialSplitSection>

      <EditorialSection
        id={`${config.slug}-proof`}
        title={config.proofSectionTitle}
        intro='Baby shower cakes usually feel best when the styling stays warm and controlled while the practical details remain easy to manage for the event.'
      >
        <EditorialChecklist items={config.proofPoints} />
      </EditorialSection>

      <EditorialSection
        id={`${config.slug}-process`}
        title={config.orderingSectionTitle}
        intro='A calmer process usually leads to a softer, stronger result because the event type, portion plan and finish are settled in the right order.'
      >
        <EditorialStepGrid steps={config.orderingSteps} />
      </EditorialSection>

      <EditorialSection
        id={`${config.slug}-next-steps`}
        title='Useful pages before you order a baby shower cake'
      >
        <EditorialLinkGrid links={config.internalLinks} />
      </EditorialSection>
    </>
  )
}
