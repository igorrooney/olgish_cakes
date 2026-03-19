import type { OccasionOption } from '../components/homepage/formOptions'
import { GetCustomQuoteForm } from './GetCustomQuoteForm'

type GetCustomQuoteFormSectionProps = {
  occasionOptions: OccasionOption[]
}

export function GetCustomQuoteFormSection({
  occasionOptions
}: GetCustomQuoteFormSectionProps) {
  return (
    <section id='quote-form' className='relative z-10 scroll-mt-24 bg-base-100 px-4 py-10 tablet:px-10 tablet:py-14'>
      <div className='homepage-container'>
        <div className='grid gap-8 small-laptop:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]'>
          <div className='max-w-[420px]'>
            <p className='font-body text-xs font-semibold uppercase tracking-[0.18em] text-primary-600'>
              Quote form
            </p>
            <h2 className='mt-3 font-moreSugar text-[28px] uppercase leading-[1.2] tracking-[0.1em] text-primary-700 tablet:text-[40px]'>
              Tell me what you are planning
            </h2>
            <p className='mt-4 font-oldenburg text-[15px] leading-7 tracking-[0.03em] text-base-content/80 tablet:text-base tablet:leading-8'>
              Start with the details that help me price the cake properly: date, servings, your main design idea, and whether you need collection, local delivery or UK delivery by agreement.
            </p>
            <p className='mt-4 text-sm leading-6 text-base-content/70'>
              You do not need a finished cake concept before enquiring. A short brief is enough.
            </p>
          </div>

          <div className='mx-auto w-full max-w-[760px] rounded-[32px] border border-base-300 bg-base-100 px-6 py-7 shadow-[0_10px_24px_rgba(15,23,42,0.03)] tablet:px-8 tablet:py-8'>
            <GetCustomQuoteForm occasionOptions={occasionOptions} />
          </div>
        </div>
      </div>
    </section>
  )
}
