import type { CatalogCategoryLandingConfig } from '../categoryLandingConfig'
import {
  categoryLandingPanelPaddingClassName,
  categoryLandingStandardShellClassName
} from './categoryLandingLayout'

interface CatalogCategorySupportProps {
  config: CatalogCategoryLandingConfig
}

export function CatalogCategorySupport({ config }: CatalogCategorySupportProps) {
  return (
    <section className={categoryLandingStandardShellClassName}>
      <div className={`grid gap-6 ${categoryLandingPanelPaddingClassName} small-laptop:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] small-laptop:items-start`}>
        <div className='mx-auto max-w-[760px] text-center small-laptop:mx-0 small-laptop:max-w-none small-laptop:text-left'>
          <h2 className='text-[22px] font-semibold leading-[1.25] text-base-content tablet:text-[28px]'>
            {config.supportContent.title}
          </h2>
          <p className='mt-4 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/84 tablet:text-base tablet:leading-8'>
            {config.supportContent.body}
          </p>
        </div>
        <ul
          className='space-y-3 border-t border-base-200/80 pt-5 small-laptop:border-t-0 small-laptop:pt-0'
          style={{ listStyle: 'none', margin: 0, paddingLeft: 0 }}
        >
          {config.supportContent.highlights.map((highlight) => (
            <li
              key={highlight}
              className='border-l-2 border-primary-300 pl-4 text-sm leading-6 text-base-content tablet:text-[15px]'
              style={{ display: 'block', listStyle: 'none', marginBottom: 0 }}
            >
              {highlight}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}