import Link from 'next/link'

type SensitiveDataConsentNoticeProps = {
  className?: string
  includePrivacyLink?: boolean
}

export function SensitiveDataConsentNotice({
  className = '',
  includePrivacyLink = true
}: SensitiveDataConsentNoticeProps) {
  return (
    <p className={`text-sm leading-6 text-base-content/70 ${className}`.trim()}>
      If you include allergy, intolerance or other health-related dietary information, submitting
      the form confirms your explicit consent for us to use it to assess and fulfil your request.
      You can withdraw consent, but we may then be unable to supply safely.
      {includePrivacyLink ? (
        <>
          {' '}Read our{' '}
          <Link href='/privacy' className='link link-primary font-semibold'>
            privacy policy
          </Link>
          .
        </>
      ) : null}
    </p>
  )
}
