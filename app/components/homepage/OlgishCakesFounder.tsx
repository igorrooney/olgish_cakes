import Image from 'next/image'
import Link from 'next/link'

export function OlgishCakesFounder() {
  const links = [
    { label: 'See all cakes', href: '/cakes' },
    { label: 'View bestsellers', href: '/#bestsellers' },
    { label: 'Visit our market stall', href: '/market-schedule' },
    { label: 'Check our reviews', href: '/reviews-awards' },
    { label: 'Browse occasion cakes', href: '/celebration-cakes' },
    { label: 'Custom cake enquiry', href: '/get-custom-quote' },
    { label: 'Follow our Instagram', href: 'https://www.instagram.com/olgish_cakes/' },
  ]

  return (
    <section style={{ padding: '12px' }}>
      <div className="win2k-window" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Title bar */}
        <div className="win2k-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '14px' }}>👩‍🍳</span>
            <span className="win2k-titlebar-text">About - Olga, Founder of Olgish Cakes</span>
          </div>
          <div className="win2k-titlebar-controls">
            <div className="win2k-titlebar-btn" aria-hidden="true">_</div>
            <div className="win2k-titlebar-btn" aria-hidden="true">□</div>
            <div className="win2k-titlebar-btn" aria-hidden="true">×</div>
          </div>
        </div>

        <div style={{ padding: '8px', backgroundColor: '#D4D0C8' }}>
          {/* Tab bar */}
          <div style={{ display: 'flex', marginBottom: '-1px' }}>
            <div className="win2k-tab-active">General</div>
            <div className="win2k-tab">Summary</div>
            <div className="win2k-tab">Contact</div>
          </div>

          {/* Content */}
          <div
            className="win2k-window-inner"
            style={{ padding: '12px', backgroundColor: '#D4D0C8' }}
          >
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {/* Photo */}
              <div style={{ flexShrink: 0 }}>
                <div
                  className="win2k-inset"
                  style={{ width: '200px', height: '280px', position: 'relative', overflow: 'hidden' }}
                >
                  <Image
                    src="/design/mobile-home/about-olga.png"
                    alt="Olga, founder of Olgish Cakes"
                    fill
                    sizes="200px"
                    style={{ objectFit: 'cover', objectPosition: '50% 50%' }}
                  />
                </div>
                <div style={{ fontSize: '10px', textAlign: 'center', marginTop: '2px', color: '#808080' }}>
                  1 item selected
                </div>
              </div>

              {/* Info panel */}
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div
                  className="win2k-inset"
                  style={{ backgroundColor: '#FFFFFF', padding: '8px', marginBottom: '8px' }}
                >
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#000080',
                    borderBottom: '1px solid #D4D0C8',
                    marginBottom: '6px',
                    paddingBottom: '4px',
                  }}>
                    Properties
                  </div>
                  <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                    <tbody>
                      <tr>
                        <td style={{ color: '#808080', width: '100px', paddingBottom: '3px' }}>Name:</td>
                        <td style={{ paddingBottom: '3px', fontWeight: 'bold' }}>Olga</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#808080', paddingBottom: '3px' }}>Origin:</td>
                        <td style={{ paddingBottom: '3px' }}>Ukraine</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#808080', paddingBottom: '3px' }}>Location:</td>
                        <td style={{ paddingBottom: '3px' }}>Leeds, West Yorkshire</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#808080', paddingBottom: '3px' }}>Specialty:</td>
                        <td style={{ paddingBottom: '3px' }}>Medovik, Napoleon cake</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#808080', paddingBottom: '3px' }}>Batch size:</td>
                        <td style={{ paddingBottom: '3px' }}>Small batch</td>
                      </tr>
                      <tr>
                        <td style={{ color: '#808080', paddingBottom: '3px' }}>Rating:</td>
                        <td style={{ paddingBottom: '3px' }}>★★★★★</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div
                  className="win2k-inset"
                  style={{ backgroundColor: '#FFFBEB', padding: '8px', marginBottom: '8px', fontSize: '11px' }}
                >
                  <p style={{ margin: '0 0 6px 0' }}>
                    Olga, a passionate baker from Ukraine, brings the taste of home and heart to every handcrafted cake she creates.
                  </p>
                  <p style={{ margin: '0' }}>
                    Now based in Leeds, she bakes in small batches so every order feels personal, warm, and made just for you.
                  </p>
                </div>

                {/* Quick links */}
                <div className="win2k-window" style={{ padding: '0' }}>
                  <div className="win2k-titlebar" style={{ padding: '2px 4px' }}>
                    <span style={{ fontSize: '10px' }}>&#128279; Quick Links</span>
                  </div>
                  <div style={{ padding: '4px', backgroundColor: '#D4D0C8' }}>
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        style={{
                          display: 'block',
                          padding: '2px 6px',
                          fontSize: '11px',
                          color: '#0000EE',
                          textDecoration: 'underline',
                          fontFamily: 'Tahoma, Arial, sans-serif',
                        }}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        &#9654; {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Buttons row */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '8px' }}>
            <Link href="/about" className="win2k-btn" style={{ textDecoration: 'none', color: '#000000', fontSize: '11px' }}>
              Read More
            </Link>
            <Link href="/cakes" className="win2k-btn-primary" style={{ textDecoration: 'none', color: '#000000', fontSize: '11px' }}>
              OK
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
