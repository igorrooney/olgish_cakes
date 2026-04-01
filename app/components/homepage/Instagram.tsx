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
    <section style={{ padding: '12px' }}>
      <div className="win2k-window" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="win2k-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '14px' }}>📸</span>
            <span className="win2k-titlebar-text">Internet Explorer - Instagram: @olgish_cakes</span>
          </div>
          <div className="win2k-titlebar-controls">
            <div className="win2k-titlebar-btn" aria-hidden="true">_</div>
            <div className="win2k-titlebar-btn" aria-hidden="true">□</div>
            <div className="win2k-titlebar-btn" aria-hidden="true">×</div>
          </div>
        </div>

        <div style={{ padding: '8px', backgroundColor: '#D4D0C8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px' }}>Address:</span>
            <div className="win2k-inset" style={{ flex: 1, padding: '2px 6px', fontSize: '11px', backgroundColor: '#FFFFFF' }}>
              https://www.instagram.com/olgish_cakes/
            </div>
            <a href={instagramProfileUrl} target="_blank" rel="noopener noreferrer" className="win2k-btn" style={{ fontSize: '11px', textDecoration: 'none', color: '#000000' }}>Go</a>
          </div>

          <div style={{
            backgroundColor: '#000080',
            color: '#FFFFFF',
            padding: '4px 8px',
            marginBottom: '6px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <span style={{ fontWeight: 'bold' }}>&#128247; Follow {instagramProfileHandle} on Instagram</span>
            <a
              href={instagramProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="win2k-btn"
              style={{ fontSize: '10px', textDecoration: 'none', color: '#000000', marginLeft: 'auto' }}
            >
              &#128279; Follow Now
            </a>
          </div>

          <div className="win2k-inset" style={{ backgroundColor: '#FFFFFF', padding: '8px' }}>
            <InstagramCarousel
              posts={displayPosts}
              profileUrl={instagramProfileUrl}
              profileName={instagramProfileName}
              profileHandle={instagramProfileHandle}
            />
          </div>

          <div className="win2k-statusbar" style={{ marginTop: '4px' }}>
            <div className="win2k-statusbar-panel">{displayPosts.length} post(s)</div>
            <div className="win2k-statusbar-panel" style={{ flex: 1 }}>
              {instagramProfileName} - {instagramProfileHandle}
            </div>
            <div className="win2k-statusbar-panel">&#127758; Internet Zone</div>
          </div>
        </div>
      </div>
    </section>
  )
}
