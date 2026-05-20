export const APP_NAME = 'Olgish Cakes Events'

export const DEFAULT_EVENT_NAME = 'Olgish Cakes event'
export const DEFAULT_MAX_IMAGES = 1
export const MIN_IMAGES = 1
export const MAX_IMAGES_LIMIT = 10
export const MAX_FILE_BYTES = 20 * 1024 * 1024
export const TEMP_UPLOAD_EXPIRY_SECONDS = 15 * 60
export const TEMP_UPLOAD_CLEANUP_HOURS = 24

export const DEFAULT_BUCKET = 'event-photo-temp-uploads'
export const WHATSAPP_PHONE = '447867218194'
export const FALLBACK_ERROR_MESSAGE =
  'Something went wrong and your image was not sent. Please try again, or send it directly to Olga on WhatsApp.'

export const SUCCESS_MESSAGE =
  'Thank you, your image has arrived safely. We’ll prepare it for printing on your cake slice.'

export const MAIN_SITE_URL =
  process.env.NEXT_PUBLIC_MAIN_SITE_URL ?? 'https://olgishcakes.co.uk'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://events.olgishcakes.co.uk'

export const FEATURE_LINKS = [
  {
    href: 'https://olgishcakes.co.uk/',
    title: 'Olgish Cakes',
    description: 'Ukrainian cakes and sweet gifts made in Leeds.',
    image: '/images/olga-baker.webp',
    alt: 'Olga from Olgish Cakes preparing cakes'
  },
  {
    href: 'https://olgishcakes.co.uk/gift-hampers',
    title: 'Gift hampers',
    description: 'Thoughtful Ukrainian cake hampers delivered across the UK.',
    image: '/images/placeholder-cake.jpg',
    alt: 'Olgish Cakes handmade cake gift'
  },
  {
    href: 'https://olgishcakes.co.uk/cakes',
    title: 'Custom cakes',
    description: 'Order a special celebration cake made for your occasion.',
    image: '/images/olgish-cakes-logo-bakery-brand.png',
    alt: 'Olgish Cakes bakery logo'
  }
] as const
