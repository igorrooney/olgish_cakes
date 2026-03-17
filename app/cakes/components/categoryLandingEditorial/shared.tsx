import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  categoryLandingCardPaddingClassName,
  categoryLandingCenteredIntroBlockClassName,
  categoryLandingQuotePanelPaddingClassName,
  categoryLandingStandardShellClassName
} from '../categoryLandingLayout'

interface EditorialSectionProps {
  id?: string
  title: string
  intro?: string
  children: ReactNode
}

interface EditorialSplitSectionProps {
  id?: string
  title: string
  intro?: string
  children: ReactNode
}

interface EditorialQuotePanelProps {
  eyebrow?: string
  title: string
  body: string
}

interface EditorialCardGridProps {
  items: Array<{
    title: string
    body: ReactNode
  }>
}

interface EditorialStepGridProps {
  steps: Array<{
    title: string
    body: ReactNode
  }>
}

interface EditorialLinkGridProps {
  links: Array<{
    href: string
    label: string
    description: string
  }>
}

interface EditorialChecklistProps {
  items: string[]
}

const sectionShellClassName = categoryLandingStandardShellClassName

export function EditorialSection({
  id,
  title,
  intro,
  children
}: EditorialSectionProps) {
  return (
    <section id={id} className={sectionShellClassName}>
      <div className={categoryLandingCenteredIntroBlockClassName}>
        <h2 className='font-oldenburg text-3xl tracking-[0.08em] text-base-content tablet:text-4xl'>
          {title}
        </h2>
        {intro ? (
          <p className='mt-4 text-base leading-7 text-base-content/80 tablet:text-lg'>
            {intro}
          </p>
        ) : null}
      </div>
      <div className='mt-8'>{children}</div>
    </section>
  )
}

export function EditorialSplitSection({
  id,
  title,
  intro,
  children
}: EditorialSplitSectionProps) {
  return (
    <section id={id} className={sectionShellClassName}>
      <div className='grid gap-8 small-laptop:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] small-laptop:items-start'>
        <div className='mx-auto max-w-[760px] text-center small-laptop:mx-0 small-laptop:max-w-none small-laptop:text-left'>
          <h2 className='font-oldenburg text-3xl tracking-[0.08em] text-base-content tablet:text-4xl'>
            {title}
          </h2>
          {intro ? (
            <p className='mt-4 text-base leading-7 text-base-content/80 tablet:text-lg'>
              {intro}
            </p>
          ) : null}
        </div>
        <div className='text-sm leading-7 text-base-content/80 tablet:text-base'>
          {children}
        </div>
      </div>
    </section>
  )
}

export function EditorialQuotePanel({
  eyebrow,
  title,
  body
}: EditorialQuotePanelProps) {
  return (
    <section className={sectionShellClassName}>
      <div className={`rounded-[32px] border border-primary/15 bg-base-200/50 shadow-sm ${categoryLandingQuotePanelPaddingClassName}`}>
        <div className={categoryLandingCenteredIntroBlockClassName}>
          {eyebrow ? (
            <p className='text-sm font-semibold uppercase tracking-[0.22em] text-primary'>
              {eyebrow}
            </p>
          ) : null}
          <h2 className='mt-3 font-oldenburg text-3xl tracking-[0.08em] text-base-content tablet:text-4xl'>
            {title}
          </h2>
        </div>
        <p className='mx-auto mt-5 max-w-[760px] text-left text-sm leading-7 text-base-content/80 tablet:text-base'>
          {body}
        </p>
      </div>
    </section>
  )
}

export function EditorialCardGrid({ items }: EditorialCardGridProps) {
  return (
    <div className='grid gap-4 tablet:grid-cols-2'>
      {items.map((item) => (
        <article
          key={item.title}
          className={`rounded-box border border-base-300 bg-base-100 shadow-sm ${categoryLandingCardPaddingClassName}`}
        >
          <h3 className='font-oldenburg text-2xl tracking-[0.06em] text-base-content'>
            {item.title}
          </h3>
          <div className='mt-3 text-sm leading-7 text-base-content/80 tablet:text-base'>
            {item.body}
          </div>
        </article>
      ))}
    </div>
  )
}

export function EditorialStepGrid({ steps }: EditorialStepGridProps) {
  return (
    <ol className='grid gap-4 tablet:grid-cols-2' style={{ listStyle: 'none', margin: 0, paddingLeft: 0 }}>
      {steps.map((step, index) => (
        <li
          key={step.title}
          className={`rounded-box border border-base-300 bg-base-200/40 ${categoryLandingCardPaddingClassName}`}
          style={{ display: 'block', listStyle: 'none', marginBottom: 0 }}
        >
          <p className='text-sm font-semibold uppercase tracking-[0.2em] text-primary'>
            Step {index + 1}
          </p>
          <h3 className='mt-3 font-oldenburg text-2xl tracking-[0.06em] text-base-content'>
            {step.title}
          </h3>
          <div className='mt-3 text-sm leading-7 text-base-content/80 tablet:text-base'>
            {step.body}
          </div>
        </li>
      ))}
    </ol>
  )
}

export function EditorialChecklist({ items }: EditorialChecklistProps) {
  return (
    <ul className='grid gap-4 tablet:grid-cols-2' style={{ listStyle: 'none', margin: 0, paddingLeft: 0 }}>
      {items.map((item, index) => (
        <li
          key={item}
          className={`rounded-box border border-base-300 bg-base-100 shadow-sm ${categoryLandingCardPaddingClassName}`}
          style={{ display: 'block', listStyle: 'none', marginBottom: 0 }}
        >
          <div className='flex items-start gap-3'>
            <span aria-hidden='true' className='mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary'>
              {String(index + 1).padStart(2, '0')}
            </span>
            <p className='text-sm leading-7 text-base-content/80 tablet:text-base'>
              {item}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function EditorialLinkGrid({ links }: EditorialLinkGridProps) {
  return (
    <div className='grid gap-4 tablet:grid-cols-3'>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`rounded-box border border-base-300 bg-base-100 transition hover:border-primary hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${categoryLandingCardPaddingClassName}`}
        >
          <h3 className='font-oldenburg text-2xl tracking-[0.06em] text-base-content'>
            {link.label}
          </h3>
          <p className='mt-3 text-sm leading-7 text-base-content/80 tablet:text-base'>
            {link.description}
          </p>
        </Link>
      ))}
    </div>
  )
}
