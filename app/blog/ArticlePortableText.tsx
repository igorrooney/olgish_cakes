import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextMarkComponentProps
} from '@portabletext/react'
import { createArticleHeadingIdResolver } from '@/lib/article-heading-ids'
import { urlFor } from '@/sanity/lib/image'
import type { ArticleBodyNode, PortableTextImage } from '@/lib/articles'

interface ArticlePortableTextProps {
  value: ArticleBodyNode[]
}

interface PortableTextLinkValue {
  _type: 'link'
  href?: string
}

function getTextContent(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }

  if (Array.isArray(node)) {
    return node.map(getTextContent).join('')
  }

  if (node && typeof node === 'object' && 'props' in node) {
    const reactNode = node as { props?: { children?: ReactNode } }
    return getTextContent(reactNode.props?.children ?? '')
  }

  return ''
}

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

function PortableTextLink({ children, value }: PortableTextMarkComponentProps<PortableTextLinkValue>) {
  const href = resolvePortableTextHref(value?.href)

  if (!href) {
    return <span>{children}</span>
  }

  const isExternal = href.startsWith('http://') || href.startsWith('https://')

  return (
    <Link
      href={href}
      className='font-semibold text-primary-500 underline decoration-accent underline-offset-4 transition-colors hover:text-primary-800'
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noreferrer noopener' : undefined}
    >
      {children}
    </Link>
  )
}

function PortableTextImageBlock({ value }: { value: PortableTextImage }) {
  const imageUrl = value.asset?._ref
    ? urlFor(value).width(1440).fit('max').auto('format').url()
    : null

  if (!imageUrl) {
    return null
  }

  return (
    <figure className='my-10 overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm'>
      <div className='relative aspect-[5/3] w-full bg-base-200'>
        <Image
          src={imageUrl}
          alt={value.alt || ''}
          fill
          sizes='(min-width: 1280px) 760px, (min-width: 768px) 70vw, 100vw'
          className='object-cover'
        />
      </div>
      {value.caption ? (
        <figcaption className='px-4 py-3 font-body text-sm text-base-content/70 tablet:px-6'>
          {value.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export function ArticlePortableText({ value }: ArticlePortableTextProps) {
  const resolveHeadingId = createArticleHeadingIdResolver()

  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => (
        <p className='font-body text-[16px] leading-8 tracking-[0.01em] text-base-content tablet:text-[17px]'>
          {children}
        </p>
      ),
      h2: ({ children }) => {
        const headingText = getTextContent(children)

        return (
          <h2
            id={resolveHeadingId(headingText)}
            className='scroll-mt-28 pt-4 font-oldenburg text-[28px] leading-tight tracking-[0.03em] text-primary-800 tablet:text-[32px]'
          >
            {children}
          </h2>
        )
      },
      h3: ({ children }) => (
        <h3 className='pt-2 font-oldenburg text-[24px] leading-tight tracking-[0.03em] text-primary-800 tablet:text-[28px]'>
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4 className='font-oldenburg text-[20px] leading-tight tracking-[0.02em] text-primary-800 tablet:text-[22px]'>
          {children}
        </h4>
      ),
      blockquote: ({ children }) => (
        <blockquote className='rounded-box border-l-4 border-accent bg-accent-50/60 px-5 py-4 font-body text-[18px] leading-8 tracking-[0.01em] text-primary-800'>
          {children}
        </blockquote>
      )
    },
    list: {
      bullet: ({ children }) => (
        <ul className='space-y-3 pl-5 font-body text-[16px] leading-8 tracking-[0.01em] text-base-content marker:text-primary-500 tablet:text-[17px]'>
          {children}
        </ul>
      ),
      number: ({ children }) => (
        <ol className='space-y-3 pl-5 font-body text-[16px] leading-8 tracking-[0.01em] text-base-content marker:text-primary-500 tablet:text-[17px]'>
          {children}
        </ol>
      )
    },
    listItem: {
      bullet: ({ children }) => <li className='pl-1'>{children}</li>,
      number: ({ children }) => <li className='pl-1'>{children}</li>
    },
    marks: {
      link: PortableTextLink,
      strong: ({ children }) => <strong className='font-semibold text-primary-800'>{children}</strong>,
      em: ({ children }) => <em className='italic text-base-content'>{children}</em>
    },
    types: {
      image: PortableTextImageBlock
    }
  }

  return (
    <div className='space-y-6'>
      <PortableText value={value} components={components} />
    </div>
  )
}
