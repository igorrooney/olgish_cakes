import type { OccasionOption } from './formOptions'
import { DeferredHomeEnquiryForm } from './DeferredHomeEnquiryForm'

interface HomeEnquirySectionProps {
  occasionOptions: OccasionOption[]
}

export function HomeEnquirySection({ occasionOptions }: HomeEnquirySectionProps) {
  return <DeferredHomeEnquiryForm occasionOptions={occasionOptions} />
}
