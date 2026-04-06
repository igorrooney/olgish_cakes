import { DeferredWorkshopEnquiryForm } from './DeferredWorkshopEnquiryForm'

const deferredSectionStyle = {
  contentVisibility: 'auto',
  containIntrinsicSize: '960px',
} as const

export function WorkshopEnquiryFormSection() {
  return (
    <section
      id='workshop-enquiry-form'
      className='relative z-10 scroll-mt-24 bg-base-100 px-4 py-6 tablet:px-10 tablet:py-12'
      style={deferredSectionStyle}
    >
      <div className='homepage-container'>
        <div className='grid gap-4 rounded-[24px] border border-primary/10 bg-base-100 p-4 shadow-sm small-laptop:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] tablet:gap-8 tablet:rounded-[28px] tablet:p-8'>
          <div className='max-w-[430px] self-start'>
            <h2 className='font-oldenburg text-[1.75rem] leading-[1.04] tracking-[0.02em] text-primary-800 tablet:text-[2.4rem]'>
              Tell me about the event
            </h2>
            <p className='mt-3 text-[14px] leading-6 text-base-content/80 tablet:mt-4 tablet:text-base tablet:leading-8'>
              Send the date, venue and rough numbers first. Then tell me about stairs, loading
              rules, a tight setup window or anything else that changes the job.
            </p>
            <p className='mt-3 text-[13px] leading-5 text-base-content/70 tablet:mt-4 tablet:text-sm tablet:leading-6'>
              If you already know the colours or style, add that as well. The practical details
              matter more than polished wording at this stage.
            </p>
          </div>

          <div className='mx-auto w-full max-w-[760px] rounded-[20px] border border-base-200 bg-base-100 px-4 py-4 shadow-sm tablet:rounded-[24px] tablet:px-8 tablet:py-8'>
            <DeferredWorkshopEnquiryForm />
          </div>
        </div>
      </div>
    </section>
  )
}
