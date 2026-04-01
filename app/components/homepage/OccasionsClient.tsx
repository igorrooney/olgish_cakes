'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'
import type { DisplayCollection } from './occasions.types'

type OccasionsClientProps = {
  collections: DisplayCollection[]
}

const MOBILE_INITIAL_COLLECTIONS = 6
const SMALL_LAPTOP_INITIAL_COLLECTIONS = 8

export function OccasionsClient({ collections }: OccasionsClientProps) {
  const [showAll, setShowAll] = useState(false)
  const sectionRef = useRef<HTMLElement | null>(null)
  const canExpand = collections.length > MOBILE_INITIAL_COLLECTIONS
  const visibleCollections = showAll ? collections : collections.slice(0, MOBILE_INITIAL_COLLECTIONS)

  const handleToggle = () => {
    const wasShowingAll = showAll
    setShowAll(!showAll)

    if (!wasShowingAll) return

    const scrollToSection = () => {
      sectionRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
    }

    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      window.requestAnimationFrame(scrollToSection)
      return
    }

    setTimeout(scrollToSection, 0)
  }

  return (
    <section ref={sectionRef} style={{ padding: '12px' }}>
      <div className="win2k-window" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="win2k-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '14px' }}>🎉</span>
            <span className="win2k-titlebar-text">Cakes for Any Occasion - Category Browser</span>
          </div>
          <div className="win2k-titlebar-controls">
            <div className="win2k-titlebar-btn" aria-hidden="true">_</div>
            <div className="win2k-titlebar-btn" aria-hidden="true">□</div>
            <div className="win2k-titlebar-btn" aria-hidden="true">×</div>
          </div>
        </div>

        <div style={{ padding: '8px', backgroundColor: '#D4D0C8' }}>
          <div className="win2k-inset" style={{ backgroundColor: '#FFFFFF', padding: '12px' }}>
            <h2 style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#000080',
              marginBottom: '8px',
              fontFamily: 'Tahoma, Arial, sans-serif',
              textTransform: 'uppercase',
            }}>
              Select a Cake Category:
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '8px',
            }}>
              {visibleCollections.map((collection) => (
                <Link
                  key={collection._id}
                  href={collection.href}
                  style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
                  className="win2k-icon"
                >
                  <div className="win2k-inset" style={{ width: '80px', height: '80px', position: 'relative', overflow: 'hidden' }}>
                    <Image
                      src={collection.imageUrl}
                      alt={collection.imageAlt}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="80px"
                    />
                  </div>
                  <span style={{
                    fontSize: '10px',
                    color: '#000000',
                    textAlign: 'center',
                    fontFamily: 'Tahoma, Arial, sans-serif',
                    lineHeight: '1.2',
                  }}>
                    {collection.name}
                  </span>
                </Link>
              ))}
            </div>

            {canExpand && (
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <button
                  type="button"
                  className="win2k-btn"
                  style={{ fontSize: '11px' }}
                  onClick={handleToggle}
                  aria-expanded={showAll}
                >
                  {showAll ? 'Show fewer occasions' : 'Show all occasions'}
                </button>
              </div>
            )}
          </div>

          <div className="win2k-statusbar" style={{ marginTop: '4px' }}>
            <div className="win2k-statusbar-panel">{collections.length} categories</div>
            <div className="win2k-statusbar-panel" style={{ flex: 1 }}>Select a category to browse cakes</div>
          </div>
        </div>
      </div>
    </section>
  )
}
