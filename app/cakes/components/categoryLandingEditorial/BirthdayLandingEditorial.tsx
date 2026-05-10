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

interface BirthdayLandingEditorialProps {
  config: CatalogCategoryLandingConfig
}

export function BirthdayLandingEditorial({ config }: BirthdayLandingEditorialProps) {
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
        title={config.serviceAreaTitle || 'Birthday cake delivery planning in Leeds'}
        intro={config.serviceAreaBody}
      >
        <p>
          Collection versus delivery is part of the design brief once toppers, cleaner finishes or tight event timing enter the picture.
        </p>
        <p className='mt-4'>
          The{' '}
          <Link href='/contact' className='link link-hover text-primary'>
            contact page
          </Link>{' '}
          helps you decide what is practical before the finish becomes too delicate for an easy journey.
        </p>
      </EditorialSplitSection>

      <EditorialSection
        id={`${config.slug}-proof`}
        title={config.proofSectionTitle}
        intro='Birthday cakes usually work better when the person, the party style and the serving plan are all reflected in the brief instead of being guessed later.'
      >
        <EditorialChecklist items={config.proofPoints} />
      </EditorialSection>

      <EditorialSection
        id={`${config.slug}-process`}
        title={config.orderingSectionTitle}
        intro='A simple sequence usually makes the order more useful because it turns the occasion details into a design that still works on the day.'
      >
        <EditorialStepGrid steps={config.orderingSteps} />
      </EditorialSection>

      <EditorialSection
        id={`${config.slug}-next-steps`}
        title='Useful pages before you order a birthday cake'
      >
        <EditorialLinkGrid links={config.internalLinks} />
      </EditorialSection>
    </>
  )
}
