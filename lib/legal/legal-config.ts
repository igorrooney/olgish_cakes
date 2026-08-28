import type { Metadata } from 'next'
import { BUSINESS_CONSTANTS } from '@/lib/constants'

export const LEGAL_BUSINESS_DETAILS = {
  tradingName: BUSINESS_CONSTANTS.NAME,
  proprietor: 'Olga Ieromenko',
  legalForm: 'sole trader',
  email: BUSINESS_CONSTANTS.EMAIL,
  phone: BUSINESS_CONSTANTS.PHONE,
  address: {
    street: '15 Allerton Grange Avenue',
    city: 'Leeds',
    postcode: 'LS17 6PR',
    country: 'United Kingdom'
  }
} as const

export const CURRENT_LEGAL_DATE = '28 July 2026'
export const CURRENT_LEGAL_DATE_ISO = '2026-07-28'
export const CURRENT_TERMS_VERSION = CURRENT_LEGAL_DATE_ISO
export const CURRENT_PRIVACY_DATE = '25 August 2026'
export const CURRENT_PRIVACY_DATE_ISO = '2026-08-25'
export const CURRENT_PRIVACY_VERSION = CURRENT_PRIVACY_DATE_ISO
export const CURRENT_TERMS_PDF_PATH = `/legal/olgish-cakes-terms-${CURRENT_TERMS_VERSION}.pdf`
export const CURRENT_TERMS_PDF_FILENAME = `olgish-cakes-terms-${CURRENT_TERMS_VERSION}.pdf`

export const LEGAL_SOCIAL_IMAGE_PATH = '/images/og-legal.jpg'
export const LEGAL_SOCIAL_IMAGE_ALT = 'Olgish Cakes legal information and customer policies'

type LegalPageMetadataInput = {
  title: string
  description: string
  path: '/terms' | '/privacy' | '/cookies'
}

export function createLegalPageMetadata({
  title,
  description,
  path
}: LegalPageMetadataInput): Metadata {
  const canonicalUrl = `${BUSINESS_CONSTANTS.BASE_URL}${path}`
  const socialImageUrl = `${BUSINESS_CONSTANTS.BASE_URL}${LEGAL_SOCIAL_IMAGE_PATH}`

  return {
    title,
    description,
    metadataBase: new URL(BUSINESS_CONSTANTS.BASE_URL),
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: BUSINESS_CONSTANTS.NAME,
      images: [
        {
          url: socialImageUrl,
          width: 1200,
          height: 630,
          alt: LEGAL_SOCIAL_IMAGE_ALT
        }
      ],
      locale: 'en_GB',
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImageUrl]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  }
}

export function getTermsPdfPath(version: string = CURRENT_TERMS_VERSION): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(version)) {
    return CURRENT_TERMS_PDF_PATH
  }

  return `/legal/olgish-cakes-terms-${version}.pdf`
}
