import type { ReactNode } from 'react'

declare global {
  type MockProps = {
    children?: ReactNode
    [key: string]: unknown
  }

  type UnknownRecord = Record<string, unknown>
}

export {}
