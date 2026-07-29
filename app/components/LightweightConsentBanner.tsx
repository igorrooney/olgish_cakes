import {
  createConsentBootstrapScript,
  getValidatedGtmId,
  isConsentRuntimeEnabled
} from '@/app/lib/consent-runtime'
import { consentBannerDescription } from '@/app/lib/consent-config'

export function LightweightConsentBanner() {
  if (!isConsentRuntimeEnabled()) {
    return null
  }

  return (
    <>
      <aside
        id='olgish-consent-banner'
        aria-labelledby='cookie-banner-title'
        aria-describedby='cookie-banner-description'
        suppressHydrationWarning
        className='w-full border-b border-base-300 bg-base-100 font-sans text-base-content shadow-sm'
      >
        <div className='homepage-container grid gap-3 px-4 py-3 tablet:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] tablet:items-center tablet:px-0'>
          <div className='min-w-0'>
            <div className='flex items-center justify-between gap-3'>
              <h2
                id='cookie-banner-title'
                className='font-moreSugar text-base font-normal leading-6 tracking-[0.02em] text-primary-800'
              >
                Cookie preferences
              </h2>
              <a
                href='/cookies'
                className='link inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-field px-2 text-sm text-primary-500 underline-offset-[0.22em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
              >
                Cookie policy
              </a>
            </div>
            <p id='cookie-banner-description' className='mt-1 text-sm leading-5 text-base-content'>
              {consentBannerDescription}
            </p>
          </div>
          <div className='grid grid-cols-2 gap-2 tablet:grid-cols-3'>
            <button
              type='button'
              data-consent-preferences
              className='btn btn-outline col-span-2 min-h-11 rounded-field border-primary-500 text-primary-800 tablet:col-span-1'
            >
              Choose preferences
            </button>
            <button
              type='button'
              data-consent-choice='declined'
              className='btn btn-outline min-h-11 rounded-field border-primary-500 text-primary-800'
            >
              Reject optional cookies
            </button>
            <button
              type='button'
              data-consent-choice='accepted'
              className='btn btn-outline min-h-11 rounded-field border-primary-500 text-primary-800'
            >
              Accept optional cookies
            </button>
          </div>
        </div>
      </aside>
      <script
        dangerouslySetInnerHTML={{
          __html: createConsentBootstrapScript(getValidatedGtmId(process.env.NEXT_PUBLIC_GTM_ID))
        }}
      />
    </>
  )
}
