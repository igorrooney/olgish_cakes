import Image from 'next/image'
import Link from 'next/link'

export function HomeHero() {
  return (
    <section style={{ padding: '12px 12px 0 12px' }}>
      {/* Main window */}
      <div className="win2k-window" style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Title bar */}
        <div className="win2k-titlebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '14px' }}>🍰</span>
            <span className="win2k-titlebar-text">Olgish Cakes - Handmade Ukrainian Cakes from Leeds</span>
          </div>
          <div className="win2k-titlebar-controls">
            <div className="win2k-titlebar-btn" aria-hidden="true">_</div>
            <div className="win2k-titlebar-btn" aria-hidden="true">□</div>
            <div className="win2k-titlebar-btn" aria-hidden="true" style={{ fontWeight: 'bold' }}>×</div>
          </div>
        </div>

        {/* Content area */}
        <div style={{ padding: '8px', backgroundColor: '#D4D0C8' }}>
          {/* Address bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px' }}>Address:</span>
            <div
              className="win2k-inset"
              style={{ flex: 1, padding: '2px 6px', fontSize: '11px', backgroundColor: '#FFFFFF' }}
            >
              https://olgishcakes.co.uk/
            </div>
            <button type="button" className="win2k-btn" style={{ fontSize: '11px' }}>Go</button>
          </div>

          {/* Main content panel */}
          <div className="win2k-inset" style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
            {/* IE-style content with table layout */}
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ width: '55%', verticalAlign: 'top', paddingRight: '16px' }}>
                    <h1 style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#000080',
                      marginBottom: '8px',
                      fontFamily: 'Tahoma, Arial, sans-serif',
                      textTransform: 'uppercase',
                      letterSpacing: '2px',
                    }}>
                      HANDMADE CAKES<br />
                      <span style={{ fontSize: '18px' }}>DELIVERED TO YOUR DOOR</span><br />
                      <span style={{ fontSize: '16px', color: '#008000' }}>FROM LEEDS</span>
                    </h1>

                    <div style={{
                      border: '1px solid #808080',
                      backgroundColor: '#FFFBEB',
                      padding: '8px',
                      marginBottom: '8px',
                      fontSize: '11px',
                    }}>
                      <p style={{ margin: '0 0 4px 0' }}>
                        &#9658; Small-batch, hand-decorated cakes baked in Leeds.
                      </p>
                      <p style={{ margin: '0' }}>
                        &#9658; Delivered nationwide by post, or brought to your door across Leeds and West Yorkshire.
                      </p>
                    </div>

                    {/* Marquee for classic web feel */}
                    <div style={{
                      backgroundColor: '#000080',
                      color: '#FFFF00',
                      padding: '3px 6px',
                      fontSize: '11px',
                      overflow: 'hidden',
                      marginBottom: '8px',
                    }}>
                      <div className="win2k-marquee">
                        <span className="win2k-marquee-inner">
                          &nbsp;&nbsp;&nbsp;*** NEW: Cakes by post now available UK-wide! *** Order your Medovik honey cake today! *** 5-star rated bakery in Leeds *** Ukrainian handmade cakes ***&nbsp;&nbsp;&nbsp;
                        </span>
                      </div>
                    </div>

                    {/* CTA buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <Link
                        href="/cakes-by-post"
                        className="win2k-btn-primary"
                        style={{
                          fontSize: '12px',
                          padding: '5px 12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          textDecoration: 'none',
                          color: '#000000',
                          fontWeight: 'bold',
                        }}
                      >
                        &#128722; Shop Cakes By Post
                      </Link>
                      <Link
                        href="/cakes"
                        className="win2k-btn"
                        style={{
                          fontSize: '12px',
                          padding: '5px 12px',
                          textDecoration: 'none',
                          color: '#000000',
                        }}
                      >
                        &#128269; Browse All Cakes
                      </Link>
                    </div>

                    {/* Visitor counter - classic 2000s touch */}
                    <div style={{
                      marginTop: '12px',
                      border: '1px inset #808080',
                      padding: '4px 8px',
                      display: 'inline-block',
                      fontSize: '10px',
                      backgroundColor: '#D4D0C8',
                    }}>
                      <span>Visitors: </span>
                      <span style={{ fontFamily: 'Courier New, monospace', fontWeight: 'bold', color: '#FF0000' }}>
                        001,337
                      </span>
                    </div>
                  </td>

                  <td style={{ width: '45%', verticalAlign: 'top' }}>
                    {/* Image gallery - Windows Photo Viewer style */}
                    <div className="win2k-window" style={{ padding: '0' }}>
                      <div className="win2k-titlebar" style={{ padding: '2px 4px' }}>
                        <span style={{ fontSize: '10px' }}>&#128247; Photo Gallery - Olgish Cakes</span>
                        <div className="win2k-titlebar-controls">
                          <div className="win2k-titlebar-btn" style={{ fontSize: '8px' }} aria-hidden="true">×</div>
                        </div>
                      </div>
                      <div style={{ padding: '4px', backgroundColor: '#D4D0C8' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <div className="win2k-inset" style={{ flex: 1, aspectRatio: '1', overflow: 'hidden', position: 'relative', minHeight: '100px' }}>
                            <Image
                              src="/homeHero/home-hero-cake-left.png"
                              alt="White buttercream birthday cake with black ribbon bows"
                              fill
                              sizes="150px"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div className="win2k-inset" style={{ flex: 1, aspectRatio: '1', overflow: 'hidden', position: 'relative', minHeight: '100px', outline: '2px solid #000080' }}>
                            <Image
                              src="/homeHero/home-hero-cake-center.png"
                              alt="Red birthday cake with gold crown topper and script"
                              fill
                              sizes="150px"
                              style={{ objectFit: 'cover' }}
                              priority
                            />
                          </div>
                          <div className="win2k-inset" style={{ flex: 1, aspectRatio: '1', overflow: 'hidden', position: 'relative', minHeight: '100px' }}>
                            <Image
                              src="/homeHero/home-hero-cake-right.png"
                              alt="Teal money pull birthday cake with gold accents"
                              fill
                              sizes="150px"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        </div>
                        <div style={{ fontSize: '10px', marginTop: '4px', color: '#000080', textAlign: 'center' }}>
                          3 object(s) selected &nbsp;|&nbsp; Use arrow keys to navigate
                        </div>
                      </div>
                    </div>

                    {/* Info box */}
                    <div style={{
                      marginTop: '6px',
                      border: '1px solid #808080',
                      backgroundColor: '#FFFBEB',
                      padding: '6px',
                      fontSize: '10px',
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '11px', marginBottom: '4px', color: '#000080' }}>
                        &#9432; About This Site
                      </div>
                      <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr>
                            <td style={{ color: '#808080', paddingRight: '8px' }}>Baker:</td>
                            <td>Olga (Ukraine)</td>
                          </tr>
                          <tr>
                            <td style={{ color: '#808080' }}>Location:</td>
                            <td>Leeds, UK</td>
                          </tr>
                          <tr>
                            <td style={{ color: '#808080' }}>Rating:</td>
                            <td>&#11088;&#11088;&#11088;&#11088;&#11088; (5/5)</td>
                          </tr>
                          <tr>
                            <td style={{ color: '#808080' }}>Delivery:</td>
                            <td>UK-wide by post</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Status bar */}
          <div className="win2k-statusbar" style={{ marginTop: '4px' }}>
            <div className="win2k-statusbar-panel">Done</div>
            <div className="win2k-statusbar-panel" style={{ flex: 1 }}>
              olgishcakes.co.uk - Ukrainian Handmade Cakes, Leeds
            </div>
            <div className="win2k-statusbar-panel">&#127758; Internet Zone</div>
          </div>
        </div>
      </div>
    </section>
  )
}
