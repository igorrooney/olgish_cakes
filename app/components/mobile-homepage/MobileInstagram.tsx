import type { InstagramPost } from '@/app/types/instagram'
import { getInstagramPostLimit, getLatestInstagramPosts } from '@/app/utils/fetchInstagramPosts'
import { MobileInstagramCarousel } from './MobileInstagramCarousel'

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

interface MobileInstagramProps {
  limit?: number
}

export async function MobileInstagram({ limit }: MobileInstagramProps = {}) {
  const resolvedLimit = getInstagramPostLimit(limit)
  let posts: InstagramPost[] = []

  try {
    posts = await getLatestInstagramPosts({ limit: resolvedLimit })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error fetching Instagram posts:', message)
  }

  const displayPosts = posts.length > 0 ? posts : [placeholderPost]

  return (
    <section className="bg-base-100 px-4 py-8">
      <div className="homepage-container flex flex-col gap-6">
        <div className="flex justify-center">
          <h2 className="font-moreSugar text-[24px] uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center">
            Follow us on Instagram
          </h2>
        </div>
        <MobileInstagramCarousel
          posts={displayPosts}
          profileUrl={instagramProfileUrl}
          profileName={instagramProfileName}
          profileHandle={instagramProfileHandle}
        />
      </div>
    </section>
  )
}
