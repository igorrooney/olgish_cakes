import type { PortableTextComponents } from '@portabletext/react'

function resolvePortableTextHref(rawHref?: string) {
  if (!rawHref) {
    return null
  }

  if (rawHref.startsWith('/') || rawHref.startsWith('#')) {
    return rawHref
  }

  if (
    rawHref.startsWith('https://')
    || rawHref.startsWith('http://')
    || rawHref.startsWith('mailto:')
    || rawHref.startsWith('tel:')
  ) {
    return rawHref
  }

  return null
}

export const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className='mb-3 last:mb-0'>{children}</p>
    ),
    h1: ({ children }) => (
      <h2 className='mb-4 text-3xl font-semibold leading-tight last:mb-0'>{children}</h2>
    ),
    h2: ({ children }) => (
      <h3 className='mb-4 text-2xl font-semibold leading-tight last:mb-0'>{children}</h3>
    ),
    h3: ({ children }) => (
      <h4 className='mb-3 text-xl font-semibold leading-tight last:mb-0'>{children}</h4>
    ),
    h4: ({ children }) => (
      <h5 className='mb-3 text-lg font-semibold leading-tight last:mb-0'>{children}</h5>
    ),
    h5: ({ children }) => (
      <h6 className='mb-3 text-base font-semibold leading-tight last:mb-0'>{children}</h6>
    ),
    h6: ({ children }) => (
      <p className='mb-3 text-sm font-semibold uppercase tracking-[0.04em] last:mb-0'>{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className='mb-3 border-l-4 border-base-300 pl-4 italic last:mb-0'>
        {children}
      </blockquote>
    )
  },
  list: {
    bullet: ({ children }) => (
      <ul className='mb-3 list-disc space-y-1 pl-5 last:mb-0'>{children}</ul>
    ),
    number: ({ children }) => (
      <ol className='mb-3 list-decimal space-y-1 pl-5 last:mb-0'>{children}</ol>
    )
  },
  listItem: ({ children }) => (
    <li>{children}</li>
  ),
  marks: {
    strong: ({ children }) => <strong>{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => {
      const href = resolvePortableTextHref(typeof value?.href === 'string' ? value.href : undefined)

      if (!href) {
        return <span>{children}</span>
      }

      const isExternal = href.startsWith('http://') || href.startsWith('https://')

      return (
        <a
          href={href}
          className='link link-hover'
          {...(isExternal ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
        >
          {children}
        </a>
      )
    }
  }
}
