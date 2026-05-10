import type { CatalogCategoryLandingConfig } from '../categoryLandingConfig'
import {
  categoryLandingCenteredIntroBlockClassName,
  categoryLandingCompactShellClassName
} from './categoryLandingLayout'

interface CatalogCategoryCatalogIntroProps {
  config: CatalogCategoryLandingConfig
}

export function CatalogCategoryCatalogIntro({ config }: CatalogCategoryCatalogIntroProps) {
  return (
    <section className={categoryLandingCompactShellClassName}>
      <div className={categoryLandingCenteredIntroBlockClassName}>
        <h2 className='text-[24px] font-semibold leading-[1.22] text-base-content tablet:text-[30px]'>
          {config.catalogSectionTitle}
        </h2>
        <p className='mt-3 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/82 tablet:text-base tablet:leading-8'>
          {config.catalogSectionIntro}
        </p>
      </div>
    </section>
  )
}