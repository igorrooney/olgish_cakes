"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "File", href: null, children: [
    { label: "Home", href: "/" },
    { label: "All Cakes", href: "/cakes" },
    { label: "Cakes by Post", href: "/cakes-by-post" },
    { label: "Contact", href: "/contact" },
  ]},
  { label: "Custom Cakes", href: null, children: [
    { label: "Wedding Cakes", href: "/wedding-cakes" },
    { label: "Birthday Cakes", href: "/birthday-cakes" },
    { label: "Anniversary Cakes", href: "/anniversary-cakes-leeds" },
    { label: "Baby Shower Cakes", href: "/baby-shower-cakes" },
    { label: "Get a Quote", href: "/get-custom-quote#quote-form" },
  ]},
  { label: "Learn & Visit", href: null, children: [
    { label: "Articles", href: "/blog" },
    { label: "Guides", href: "/learn/guides" },
    { label: "Workshops", href: "/learn/workshops" },
    { label: "Customer Stories", href: "/learn/customer-stories" },
    { label: "Farmers Markets", href: "/farmers-markets" },
  ]},
  { label: "Help", href: null, children: [
    { label: "FAQs", href: "/faqs" },
    { label: "About Us", href: "/about" },
    { label: "Allergen Info", href: "/allergen-information" },
    { label: "Reviews", href: "/reviews-awards" },
  ]},
]

export function SiteHeaderClient() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenuToggle = (label: string) => {
    setOpenMenu(current => current === label ? null : label);
  };

  return (
    <header
      style={{
        backgroundColor: '#D4D0C8',
        borderBottom: '2px solid #808080',
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        fontFamily: 'Tahoma, Arial, sans-serif',
      }}
    >
      {/* Top bar - logo + window controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 8px',
          borderBottom: '1px solid #808080',
          backgroundColor: '#D4D0C8',
        }}
      >
        <Link
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
        >
          <div style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
            <Image
              src="/design/mobile-home/navbar-logo.png"
              alt="Olgish Cakes logo"
              fill
              sizes="32px"
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#000000' }}>
            Olgish Cakes
          </span>
        </Link>

        {/* Desktop toolbar icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Link
            href="/cakes-by-post"
            className="win2k-btn"
            style={{ fontSize: '11px', textDecoration: 'none', color: '#000000' }}
          >
            &#128722; Shop Now
          </Link>
          <Link
            href="/get-custom-quote"
            className="win2k-btn"
            style={{ fontSize: '11px', textDecoration: 'none', color: '#000000' }}
          >
            &#128203; Get a Quote
          </Link>
          {/* Mobile menu button */}
          <button
            type="button"
            className="win2k-btn"
            style={{ fontSize: '11px', display: 'none' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? '✕ Close' : '☰ Menu'}
          </button>
        </div>
      </div>

      {/* Classic Win2K menu bar */}
      <nav
        aria-label="Main navigation"
        style={{
          display: 'flex',
          alignItems: 'stretch',
          padding: '0 4px',
          backgroundColor: '#D4D0C8',
          position: 'relative',
        }}
        onMouseLeave={() => setOpenMenu(null)}
      >
        {navItems.map((item) => (
          <div key={item.label} style={{ position: 'relative' }}>
            <button
              type="button"
              className="win2k-menubar-item"
              style={{
                background: openMenu === item.label ? '#000080' : 'transparent',
                color: openMenu === item.label ? '#FFFFFF' : '#000000',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: 'Tahoma, Arial, sans-serif',
                padding: '3px 8px',
                minHeight: '20px',
              }}
              onClick={() => handleMenuToggle(item.label)}
              onMouseEnter={() => openMenu ? setOpenMenu(item.label) : undefined}
              aria-expanded={openMenu === item.label}
              aria-haspopup="true"
            >
              {/* Underline first letter */}
              <span style={{ textDecoration: 'underline' }}>{item.label[0]}</span>
              {item.label.slice(1)}
            </button>

            {/* Dropdown */}
            {openMenu === item.label && item.children && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  zIndex: 10000,
                  minWidth: '160px',
                  backgroundColor: '#D4D0C8',
                  borderTop: '2px solid #FFFFFF',
                  borderLeft: '2px solid #FFFFFF',
                  borderBottom: '2px solid #404040',
                  borderRight: '2px solid #404040',
                  boxShadow: 'inset 1px 1px 0 #F0EFE7, inset -1px -1px 0 #808080',
                  padding: '2px',
                }}
                role="menu"
              >
                {item.children.map((child, idx) => (
                  <Link
                    key={child.href || idx}
                    href={child.href || '#'}
                    role="menuitem"
                    onClick={() => setOpenMenu(null)}
                    style={{
                      display: 'block',
                      padding: '3px 20px 3px 8px',
                      fontSize: '11px',
                      color: pathname === child.href ? '#FFFFFF' : '#000000',
                      backgroundColor: pathname === child.href ? '#000080' : 'transparent',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      fontFamily: 'Tahoma, Arial, sans-serif',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#000080';
                      (e.currentTarget as HTMLElement).style.color = '#FFFFFF';
                    }}
                    onMouseLeave={(e) => {
                      if (pathname !== child.href) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = '#000000';
                      }
                    }}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Right side - address bar hint */}
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '2px 0',
        }}>
          <span style={{ fontSize: '10px', color: '#808080' }}>
            {pathname || '/'}
          </span>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div
          style={{
            backgroundColor: '#D4D0C8',
            borderTop: '1px solid #808080',
            padding: '4px',
          }}
        >
          {navItems.map((item) => (
            <div key={item.label}>
              <div style={{
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '4px 8px 2px',
                color: '#000080',
                borderBottom: '1px solid #808080',
                marginBottom: '2px',
              }}>
                {item.label}
              </div>
              {item.children?.map((child) => (
                <Link
                  key={child.href}
                  href={child.href || '#'}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block',
                    padding: '3px 16px',
                    fontSize: '11px',
                    color: '#000000',
                    textDecoration: 'none',
                  }}
                >
                  &#9656; {child.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
