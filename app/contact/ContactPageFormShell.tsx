'use client'

import { Providers } from '../providers'
import { ContactPageForm } from './ContactPageForm'

export function ContactPageFormShell() {
  return (
    <Providers>
      <ContactPageForm />
    </Providers>
  )
}
