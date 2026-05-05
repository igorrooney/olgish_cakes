import type { InstagramPost } from '@/app/types/instagram'
import {
  getInstagramPostLimit,
  getLatestInstagramPosts,
  isRecoverableInstagramError
} from '@/app/utils/fetchInstagramPosts'
import { DeferredInstagramCarousel } from './DeferredInstagramCarousel'
import { mapInstagramPostToCarouselPost } from './instagramCarouselContent'

const instagramProfileUrl = 'https://www.instagram.com/olgish_cakes/'
const instagramProfileName = 'Olgish Cakes'
const instagramProfileHandle = '@olgish_cakes'

const placeholderPost: InstagramPost = {
  id: 'instagram-placeholder',
  caption: 'Olgish Cakes Instagram preview',
  imageUrl: '/design/mobile-home/bestseller-secondary.png',
  permalink: instagramProfileUrl,
  mediaType: 'IMAGE'
}

interface InstagramProps {
  limit?: number
}

export async function Instagram({ limit }: InstagramProps = {}) {
  const resolvedLimit = getInstagramPostLimit(limit)
  let posts: InstagramPost[] = []

  try {
    posts = await getLatestInstagramPosts({ limit: resolvedLimit })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (isRecoverableInstagramError(error)) {
      console.warn(
        'Instagram posts unavailable. Refresh INSTAGRAM_ACCESS_TOKEN if the token has expired.',
        message
      )
    } else {
      console.error('Error fetching Instagram posts:', message)
    }
  }

  const displayPosts = (posts.length > 0 ? posts : [placeholderPost])
    .map(mapInstagramPostToCarouselPost)

  return (
    <section className="bg-base-100 px-4 py-8">
      <div className="homepage-container flex flex-col gap-6">
        <div className="flex justify-center">
          <h2 className="font-moreSugar text-[24px] font-normal uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center tablet:text-[36px] tablet:leading-[40px]">
            <span className="inline tablet:block">Follow us</span>{' '}
            <span className="inline tablet:block">on Instagram</span>
          </h2>
        </div>
        <DeferredInstagramCarousel
          posts={displayPosts}
          profileUrl={instagramProfileUrl}
          profileName={instagramProfileName}
          profileHandle={instagramProfileHandle}
        />
      </div>
    </section>
  )
}
