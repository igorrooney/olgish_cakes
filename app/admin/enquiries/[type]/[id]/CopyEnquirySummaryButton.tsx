'use client'

import { useState } from 'react'

interface CopyEnquirySummaryButtonProps {
  summaryText: string
}

export function CopyEnquirySummaryButton({ summaryText }: CopyEnquirySummaryButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      return
    }

    await navigator.clipboard.writeText(summaryText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button type='button' className='btn btn-outline min-h-12' onClick={handleCopy}>
      {copied ? 'Copied' : 'Copy summary'}
    </button>
  )
}
