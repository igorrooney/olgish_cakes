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
        <h1 className='sr-only tablet:not-sr-only mt-2 !mb-0 mx-auto font-moreSugar font-normal text-center text-[24px] uppercase tracking-[0.16em] text-primary-700 rotate-[-2.4deg] !leading-[40px] align-middle tablet:!mt-2 tablet:!mx-auto tablet:!mb-[30px] tablet:text-[48px] tablet:!leading-[56px] tablet:font-normal tablet:align-middle small-laptop:!leading-[64px] small-laptop:max-w-[1000px] large-laptop:max-w-[1200px]'>
          {config.heroTitle}
        </h1>
        <p className='sr-only tablet:not-sr-only mt-3 mx-auto max-w-[720px] text-center font-oldenburg text-base font-normal leading-[22px] tracking-[1.92px] text-primary-800 tablet:!mt-3 tablet:!mx-auto tablet:text-[24px] tablet:leading-[32px] tablet:tracking-[0.12em] tablet:align-middle small-laptop:max-w-[1000px] small-laptop:text-[20px] large-laptop:max-w-[1200px]'>
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
