import Link from 'next/link'
import type { CatalogCategoryLandingConfig } from '../categoryLandingConfig'
import {
  categoryLandingCenteredIntroBlockClassName,
  categoryLandingHeroShellClassName
} from './categoryLandingLayout'

interface CatalogCategoryHeroProps {
  config: CatalogCategoryLandingConfig
}

const secondaryButtonClassName = 'btn btn-outline btn-primary min-h-12 w-full rounded-field px-6 text-sm font-semibold normal-case tablet:min-h-11 tablet:w-auto'

export function CatalogCategoryHero({ config }: CatalogCategoryHeroProps) {
  return (
    <section className={categoryLandingHeroShellClassName}>
      <div className={`${categoryLandingCenteredIntroBlockClassName} flex flex-col items-center`}>
        <p className='font-oldenburg text-[11px] uppercase tracking-[0.3em] text-primary-700 tablet:text-xs'>
          {config.heroEyebrow}
        </p>
        <h1 className='mt-3 max-w-[16ch] font-moreSugar text-[28px] uppercase leading-[1.16] tracking-[0.06em] text-primary-700 tablet:max-w-[18ch] tablet:text-[40px] small-laptop:max-w-[20ch] small-laptop:text-[46px]'>
          {config.heroTitle}
        </h1>
        <p className='mx-auto mt-4 max-w-[620px] text-[16px] font-semibold leading-7 text-base-content tablet:text-[18px] tablet:leading-8'>
          {config.heroLead}
        </p>
        <p className='mx-auto mt-3 hidden max-w-[680px] font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/88 tablet:block tablet:text-base tablet:leading-8'>
          {config.heroBody}
        </p>
        <div className='mt-6 flex w-full flex-col gap-3 tablet:w-auto tablet:flex-row tablet:items-center tablet:justify-center'>
          <Link href={config.heroPrimaryAction.href} className='btn btn-primary min-h-12 w-full rounded-field px-6 text-sm font-semibold normal-case tablet:min-h-11 tablet:w-auto'>
            {config.heroPrimaryAction.label}
          </Link>
          <Link href={config.heroSecondaryAction.href} className={secondaryButtonClassName}>
            {config.heroSecondaryAction.label}
          </Link>
        </div>
      </div>
    </section>
  )
}