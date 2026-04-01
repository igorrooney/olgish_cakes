import { getAllCakes } from '@/app/utils/fetchCakes'
import { urlFor } from '@/sanity/lib/image'
import { blocksToText, Cake } from '@/types/cake'
import Image from 'next/image'
import Link from 'next/link'
import { BestsellersCarousel } from './BestsellersCarousel'

const formatCategoryLabel = (category?: string) => {
  if (!category) {
    return 'Signature'
  }

  return category
    .split('-')
    .map((word) => (word ? `${word[0].toUpperCase()}${word.slice(1)}` : ''))
    .filter(Boolean)
    .join(' ')
}

export async function Bestsellers() {
  const cakes = await getAllCakes()

  const cakesWithImages = cakes
    .map((cake: Cake) => {
      let mainImage = cake.mainImage

      if (!mainImage?.asset?._ref) {
        mainImage =
          cake.designs?.standard?.find((img) => img.isMain && img.asset?._ref) ||
          cake.designs?.standard?.find((img) => img.asset?._ref) ||
          cake.designs?.standard?.[0]
      }

      const imageUrl = mainImage?.asset?._ref
        ? urlFor(mainImage).width(800).height(800).url()
        : null

      if (!imageUrl) {
        return null
      }

      return {
        ...cake,
        imageUrl,
        mainImage
      }
    })
    .filter((cake): cake is NonNullable<typeof cake> => cake !== null)

  const flaggedBestsellers = cakesWithImages.filter((cake) => cake.isBestseller).slice(0, 3)
  const displayCakes = flaggedBestsellers.length > 0 ? flaggedBestsellers : cakesWithImages.slice(0, 3)

  return (
    <section id="bestsellers" style={{ padding: '12px' }}>
      <div className="win2k-window" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Title bar */}
        <div className="win2k-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '14px' }}>🏆</span>
            <span className="win2k-titlebar-text">Windows Explorer - Our Bestsellers</span>
          </div>
          <div className="win2k-titlebar-controls">
            <div className="win2k-titlebar-btn" aria-hidden="true">_</div>
            <div className="win2k-titlebar-btn" aria-hidden="true">□</div>
            <div className="win2k-titlebar-btn" aria-hidden="true">×</div>
          </div>
        </div>

        <div style={{ padding: '8px', backgroundColor: '#D4D0C8' }}>
          {/* Toolbar */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '6px',
            borderBottom: '1px solid #808080',
            paddingBottom: '4px',
          }}>
            <button type="button" className="win2k-btn" style={{ fontSize: '10px' }}>&#128260; Back</button>
            <button type="button" className="win2k-btn" style={{ fontSize: '10px' }}>&#9650; Up</button>
            <Link href="/cakes" className="win2k-btn" style={{ fontSize: '10px', textDecoration: 'none', color: '#000000' }}>
              &#128269; Search All Cakes
            </Link>
            <div style={{
              marginLeft: 'auto',
              border: '1px inset #808080',
              padding: '1px 8px',
              fontSize: '10px',
              backgroundColor: '#FFFFFF',
            }}>
              Address: /bestsellers
            </div>
          </div>

          {/* Split pane - tree + content */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Left pane - folder tree */}
            <div
              className="win2k-inset"
              style={{ width: '140px', flexShrink: 0, backgroundColor: '#FFFFFF', padding: '4px', fontSize: '10px' }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '10px', color: '#000080', marginBottom: '4px' }}>Folders</div>
              <div style={{ paddingLeft: '8px' }}>
                <div style={{ marginBottom: '2px' }}>&#128194; Olgish Cakes</div>
                <div style={{ paddingLeft: '12px' }}>
                  <div style={{ marginBottom: '2px', color: '#000080', fontWeight: 'bold' }}>&#128194; Bestsellers</div>
                  <div style={{ paddingLeft: '12px', color: '#808080' }}>
                    {displayCakes.map((cake) => (
                      <div key={cake._id} style={{ marginBottom: '1px' }}>&#128198; {cake.name}</div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '2px' }}>&#128194; All Cakes</div>
                <div style={{ marginBottom: '2px' }}>&#128194; By Post</div>
                <div style={{ marginBottom: '2px' }}>&#128194; Custom</div>
              </div>
            </div>

            {/* Right pane - cake items */}
            <div className="win2k-inset" style={{ flex: 1, backgroundColor: '#FFFFFF', padding: '8px' }}>
              {displayCakes.length > 0 ? (
                <>
                  {/* Mobile carousel */}
                  <div className="tablet:hidden">
                    <BestsellersCarousel cakes={displayCakes} />
                  </div>

                  {/* Desktop detail view */}
                  <div className="hidden tablet:flex" style={{ flexDirection: 'column', gap: '12px' }}>
                    {displayCakes.map((cake, index) => {
                      const fallbackSummaryText = blocksToText(cake.shortDescription ?? cake.description)
                      const safeSummary = fallbackSummaryText || `${cake.name} is a customer favourite.`
                      const categoryLabel = formatCategoryLabel(cake.category)
                      const imageAlt = cake.mainImage?.alt?.trim() || `${cake.name} ${categoryLabel} cake`

                      return (
                        <div
                          key={cake._id}
                          style={{
                            display: 'flex',
                            gap: '12px',
                            borderBottom: index < displayCakes.length - 1 ? '1px solid #D4D0C8' : 'none',
                            paddingBottom: '12px',
                          }}
                        >
                          <Link href={`/cakes/${cake.slug.current}`} style={{ display: 'block', flexShrink: 0 }}>
                            <div
                              className="win2k-inset"
                              style={{ width: '140px', height: '140px', position: 'relative', overflow: 'hidden' }}
                            >
                              <Image
                                src={cake.imageUrl}
                                alt={imageAlt}
                                fill
                                sizes="140px"
                                style={{ objectFit: 'cover' }}
                                priority={index === 0}
                              />
                            </div>
                          </Link>
                          <div style={{ flex: 1, fontSize: '11px' }}>
                            <Link
                              href={`/cakes/${cake.slug.current}`}
                              style={{ fontSize: '14px', fontWeight: 'bold', color: '#000080', textDecoration: 'underline', display: 'block', marginBottom: '4px' }}
                            >
                              {cake.name}
                            </Link>
                            <div style={{ marginBottom: '4px', color: '#808080' }}>Type: {categoryLabel}</div>
                            <div
                              className="win2k-inset"
                              style={{ backgroundColor: '#FFFBEB', padding: '4px', fontSize: '10px', marginBottom: '6px' }}
                            >
                              {safeSummary.length > 150 ? `${safeSummary.slice(0, 147)}...` : safeSummary}
                            </div>
                            <Link href={`/cakes/${cake.slug.current}`} className="win2k-btn" style={{ textDecoration: 'none', color: '#000000', fontSize: '11px' }}>
                              &#128269; View Cake
                            </Link>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: '#808080' }}>
                  Loading cakes...
                </div>
              )}
            </div>
          </div>

          {/* Status bar */}
          <div className="win2k-statusbar" style={{ marginTop: '4px' }}>
            <div className="win2k-statusbar-panel">{displayCakes.length} object(s)</div>
            <div className="win2k-statusbar-panel" style={{ flex: 1 }}>Bestseller cakes - Olgish Cakes, Leeds</div>
          </div>
        </div>
      </div>
    </section>
  )
}
