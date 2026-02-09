import type { InstagramPost } from '@/app/types/instagram'
import { getInstagramPostLimit, getLatestInstagramPosts } from '@/app/utils/fetchInstagramPosts'
import { InstagramCarousel } from './InstagramCarousel'

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
    console.error('Error fetching Instagram posts:', message)
  }

  const displayPosts = posts.length > 0 ? posts : [placeholderPost]

  return (
    <section className="bg-base-100 px-4 py-8">
      <div className="homepage-container flex flex-col gap-6">
        <div className="flex justify-center">
          <h2 className="font-moreSugar text-[24px] font-normal uppercase tracking-[0.12em] text-primary-700 rotate-[-2.4deg] leading-[40px] text-center tablet:text-[36px] tablet:leading-[40px]">
            <span className="inline tablet:block">Follow us</span>{' '}
            <span className="inline tablet:block">on Instagram</span>
          </h2>
        </div>
        <InstagramCarousel
          posts={displayPosts}
          profileUrl={instagramProfileUrl}
          profileName={instagramProfileName}
          profileHandle={instagramProfileHandle}
        />
      </div>
    </section>
  )
}
