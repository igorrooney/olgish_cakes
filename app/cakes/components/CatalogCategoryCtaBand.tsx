import Link from 'next/link'
import type { CatalogCategoryLandingConfig } from '../categoryLandingConfig'
import {
  categoryLandingCtaShellClassName,
  categoryLandingPanelPaddingClassName
} from './categoryLandingLayout'

interface CatalogCategoryCtaBandProps {
  config: CatalogCategoryLandingConfig
}

export function CatalogCategoryCtaBand({ config }: CatalogCategoryCtaBandProps) {
  return (
    <section className={categoryLandingCtaShellClassName}>
      <div className={`rounded-[32px] bg-primary-700 text-primary-content ${categoryLandingPanelPaddingClassName} tablet:py-10`}>
        <div className='mx-auto max-w-[840px] text-center'>
          <h2 className='font-moreSugar text-[24px] uppercase leading-[1.4] tracking-[0.1em] text-primary-content tablet:text-[34px]'>
            {config.ctaBand.title}
          </h2>
          <p className='mx-auto mt-4 max-w-[680px] font-oldenburg text-[15px] leading-8 tracking-[1.2px] text-primary-content/90 tablet:text-base tablet:tracking-normal'>
            {config.ctaBand.body}
          </p>
          <div className='mt-6 flex flex-col gap-3 tablet:flex-row tablet:justify-center'>
            <Link href={config.ctaBand.primaryAction.href} className='btn min-h-12 rounded-field border-primary-content bg-primary-content px-6 text-sm font-semibold normal-case text-primary-700 hover:border-primary-content hover:bg-primary-content/90'>
              {config.ctaBand.primaryAction.label}
            </Link>
            <Link href={config.ctaBand.secondaryAction.href} className='btn btn-outline min-h-12 rounded-field border-primary-content px-6 text-sm font-semibold normal-case text-primary-content hover:bg-primary-content hover:text-primary-700'>
              {config.ctaBand.secondaryAction.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}