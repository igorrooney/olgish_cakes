'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

function Win2KClock() {
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [])

  return <span>{time}</span>
}

const desktopIcons = [
  { label: 'Our Cakes', href: '/cakes', emoji: '🎂' },
  { label: 'By Post', href: '/cakes-by-post', emoji: '📦' },
  { label: 'Contact', href: '/contact', emoji: '📧' },
  { label: 'Reviews', href: '/reviews-awards', emoji: '⭐' },
]

export function Win2KDesktop({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="win2k-mode"
      style={{
        background: '#008080',
        minHeight: '100vh',
        paddingBottom: '34px',
        position: 'relative',
      }}
    >
      {/* Desktop icons (top-left) */}
      <div
        style={{
          position: 'fixed',
          top: '8px',
          left: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          zIndex: 50,
        }}
      >
        {desktopIcons.map((icon) => (
          <Link key={icon.href} href={icon.href} className="win2k-icon">
            <div style={{ fontSize: '32px', lineHeight: '1' }}>{icon.emoji}</div>
            <span className="win2k-icon-label">{icon.label}</span>
          </Link>
        ))}
      </div>

      {/* Main content */}
      <div style={{ paddingLeft: '80px' }}>
        {children}
      </div>

      {/* Taskbar */}
      <div className="win2k-taskbar">
        {/* Start button */}
        <button
          type="button"
          className="win2k-start-btn"
          aria-label="Start"
        >
          <span style={{ fontSize: '13px' }}>⊞</span>
          <span>Start</span>
        </button>

        {/* Taskbar separator */}
        <div
          style={{
            width: '2px',
            height: '20px',
            borderLeft: '1px solid #808080',
            borderRight: '1px solid #FFFFFF',
            margin: '0 4px',
          }}
        />

        {/* Active window button */}
        <button
          type="button"
          className="win2k-btn"
          style={{ fontSize: '11px', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}
          aria-label="Olgish Cakes - Home"
        >
          🍰 Olgish Cakes - Home
        </button>

        {/* System tray */}
        <div className="win2k-taskbar-clock" aria-live="polite" aria-atomic="true">
          <Win2KClock />
        </div>
      </div>
    </div>
  )
}
