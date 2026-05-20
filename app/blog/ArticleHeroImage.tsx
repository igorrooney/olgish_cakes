import { preload } from 'react-dom'
import { getSanityCdnImageUrl, isSanityCdnImageUrl } from '@/lib/utils/image-url'

interface ArticleHeroImageProps {
  imageUrl?: string
  imageAlt?: string
  title: string
}

const articleHeroImageSizes = '(max-width: 767px) 340px, (min-width: 1280px) 1060px, calc(100vw - 5rem)'
const articleHeroImageWidths = [384, 480, 640, 720, 828, 1080, 1200, 1440] as const

function getArticleHeroImageVariant(imageUrl: string, width: number) {
  return getSanityCdnImageUrl(imageUrl, {
    width,
    height: Math.round(width * 9 / 16),
    fit: 'crop',
    quality: 56
  }) ?? imageUrl
}

export function ArticleHeroImage({
  imageUrl,
  imageAlt,
  title
}: ArticleHeroImageProps) {
  if (!imageUrl) {
    return null
  }

  const isSanityImage = isSanityCdnImageUrl(imageUrl)
  const fallbackImageUrl = isSanityImage
    ? getArticleHeroImageVariant(imageUrl, 640)
    : imageUrl
  const imageSrcSet = isSanityImage
    ? articleHeroImageWidths
      .map((width) => `${getArticleHeroImageVariant(imageUrl, width)} ${width}w`)
      .join(', ')
    : undefined

  if (imageSrcSet) {
    preload(fallbackImageUrl, {
      as: 'image',
      fetchPriority: 'high',
      imageSizes: articleHeroImageSizes,
      imageSrcSet
    })
  } else {
    preload(fallbackImageUrl, {
      as: 'image',
      fetchPriority: 'high'
    })
  }

  return (
    <>
      <div className='relative overflow-hidden rounded-[30px] border border-primary-100/70 bg-base-100 shadow-[0_16px_36px_rgba(97,39,0,0.08)]'>
        <div className='relative aspect-[16/9]'>
          <img
            src={fallbackImageUrl}
            srcSet={imageSrcSet}
            sizes={articleHeroImageSizes}
            alt={imageAlt || title}
            width={750}
            height={422}
            loading='eager'
            fetchPriority='high'
            decoding='async'
            className='h-full w-full object-cover'
          />
        </div>
      </div>
    </>
  )
}
