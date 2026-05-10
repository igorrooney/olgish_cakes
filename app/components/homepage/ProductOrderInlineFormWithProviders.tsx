'use client'

import { Providers } from '@/app/providers'
import {
  ProductOrderInlineForm,
  type ProductOrderInlineFormProps
} from './ProductOrderInlineForm'

export function ProductOrderInlineFormWithProviders(props: ProductOrderInlineFormProps) {
  return (
    <Providers>
      <ProductOrderInlineForm {...props} />
    </Providers>
  )
}
