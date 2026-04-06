'use client'

import { Providers } from '@/app/providers'
import { EnquiryForm } from './EnquiryForm'
import type { OccasionOption } from './formOptions'

type HomeEnquiryFormInnerProps = {
  occasionOptions: OccasionOption[]
}

export function HomeEnquiryFormInner({
  occasionOptions
}: HomeEnquiryFormInnerProps) {
  return (
    <Providers>
      <EnquiryForm occasionOptions={occasionOptions} />
    </Providers>
  )
}
