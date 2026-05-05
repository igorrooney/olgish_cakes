import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  categoryLandingHeroShellClassName,
  categoryLandingStandardShellClassName,
} from '@/app/cakes/components/categoryLandingLayout'
import { BUSINESS_CONSTANTS } from '@/lib/constants'
import workshopDecoratingImage from '@/public/images/workshops/workshop-decorating.png'
import workshopFinishedCakesImage from '@/public/images/workshops/workshop-finished-cakes.png'
import workshopSetupImage from '@/public/images/workshops/workshop-setup.png'
import { DeferredViewportImage } from './DeferredViewportImage'
import { WorkshopEnquiryFormSection } from './WorkshopEnquiryFormSection'

const title = 'Mobile Cake Decorating Workshops in London and Across the UK'
const description =
  'Mobile cake decorating workshops for office teams, birthdays and hen parties in London and across the UK. Each session includes cakes ready to decorate, tools, boxes and live teaching, with prices from \u00A325 per person and most workshops running for around 1.5 hours.'

type StructuredData = Record<string, unknown>

type WorkshopFact = {
  label: string
  value: string
  detail: string
}

type WorkshopStage = {
  step: string
  title: string
  body: string
}

type WorkshopPhoto = {
  src: typeof workshopDecoratingImage
  alt: string
}

const workshopFacts: WorkshopFact[] = [
  {
    label: 'From',
    value: '\u00A325 per person',
    detail: 'Price depends on guest numbers, design detail and travel.',
  },
  {
    label: 'Typical session',
    value: 'Around 1.5 hours',
    detail: 'That usually covers the demo, table help and boxing at the end.',
  },
  {
    label: 'Coverage',
    value: 'London and the UK',
    detail: 'London is the starting point, then nearby counties and wider UK travel are quoted case by case.',
  },
]

const workshopStages: WorkshopStage[] = [
  {
    step: '01',
    title: 'I quote from the real venue details',
    body: 'I need the venue, headcount, start time and access details first. If there are stairs, loading rules or a short setup window, that affects the quote and sometimes whether I take the booking at all.',
  },
  {
    step: '02',
    title: 'I bring the cakes ready to decorate',
    body: 'The cakes are finished before I arrive and packed with the boards, boxes, tools and decorating materials. That means the session starts with decorating, not with me trying to prep cakes in the room.',
  },
  {
    step: '03',
    title: 'I set up, teach, and box everything before people leave',
    body: 'Once the tables are ready, I get everyone started, teach the design step by step and move around to help. Before people leave, every cake is boxed properly so nobody is carrying fresh buttercream back to the car.',
  },
]

const heroFeaturePoints = [
  'One cake per guest, ready to decorate as soon as everyone is seated.',
  'Boards, boxes, tools and decorating materials brought with me.',
  'Step-by-step teaching, help at the table, and boxing at the end.',
]

const goodOccasionPoints = [
  'Office groups where everyone is expected at the table from the start.',
  'Birthdays where the workshop is the main plan, not something squeezed in on the side.',
  'Hen parties earlier in the day, before the group moves on to the next thing.',
]

const refusalPoints = [
  'Drop-in events where people will keep leaving the table for drinks, speeches or something else.',
  'Venues with awkward access, loading restrictions or a setup window that is too tight.',
  'Rooms where I cannot get around the table once everyone is seated.',
]

const roomNeedsPoints = [
  'Tables and chairs set before I arrive, with enough room for each guest to work.',
  'A clear route in from the entrance or loading point, especially if the venue runs on timed access.',
  'Enough room for me to move around the guests without stopping the whole table every few minutes.',
]

const heroPhotos: WorkshopPhoto[] = [
  {
    src: workshopDecoratingImage,
    alt: 'Red birthday cake with a gold crown topper',
  },
  {
    src: workshopSetupImage,
    alt: 'White buttercream cake with piped swirls and black ribbon bows',
  },
]

const logisticsPhoto: WorkshopPhoto = {
  src: workshopFinishedCakesImage,
  alt: 'Blue birthday cake with gold accents and printed photo toppers',
}

const deferredSectionStyle: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '900px',
}

const deferredHeroDetailStyle: CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: '360px',
}

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(BUSINESS_CONSTANTS.BASE_URL),
  alternates: {
    canonical: `${BUSINESS_CONSTANTS.BASE_URL}/learn/workshops`,
  },
  openGraph: {
    title,
    description,
    url: `${BUSINESS_CONSTANTS.BASE_URL}/learn/workshops`,
    siteName: BUSINESS_CONSTANTS.NAME,
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

const toJsonLdScript = (value: StructuredData) => JSON.stringify(value).replace(/</g, '\\u003c')

function buildBreadcrumbStructuredData(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BUSINESS_CONSTANTS.BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Workshops',
        item: `${BUSINESS_CONSTANTS.BASE_URL}/learn/workshops`,
      },
    ],
  }
}

function WorkshopBulletList({ items, compact = false }: { items: string[]; compact?: boolean }) {
  const listClassName = compact ? 'list-none space-y-2.5 pl-0 tablet:space-y-3' : 'list-none space-y-3 pl-0'
  const itemTextClassName = compact
    ? 'text-[0.92rem] leading-6 text-base-content/78 tablet:text-sm tablet:leading-7'
    : 'text-sm leading-7 text-base-content/78'

  return (
    <ul className={listClassName}>
      {items.map(item => (
        <li
          key={item}
          className={`flex items-start gap-3 ${compact ? '' : 'border-t border-base-300/70 pt-3 first:border-t-0 first:pt-0'}`}
        >
          <span
            aria-hidden='true'
            className='mt-[0.55rem] h-2 w-2 shrink-0 rounded-full bg-primary-500'
          />
          <span className={itemTextClassName}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default function WorkshopsPage() {
  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(buildBreadcrumbStructuredData()) }}
      />

      <section
        className={`${categoryLandingHeroShellClassName} overflow-hidden bg-gradient-to-b from-base-100 via-base-100 to-base-200/60 text-base-content`}
      >
        <div className='grid gap-5 small-laptop:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] small-laptop:items-start small-laptop:gap-8'>
          <div className='space-y-4 pt-2 small-laptop:space-y-6'>
            <p className='text-xs font-semibold uppercase tracking-[0.22em] text-primary-700'>
              Mobile cake decorating workshops
            </p>

            <div className='space-y-3 tablet:space-y-4'>
              <h1 className='max-w-[15ch] font-oldenburg text-[2.4rem] leading-[1.02] tracking-[0.02em] text-primary-800 tablet:text-[3.4rem]'>
                Cake decorating workshops at your venue
              </h1>
              <p className='max-w-[35rem] text-[15px] leading-7 text-base-content/84 tablet:text-[18px] tablet:leading-8'>
                I get asked for these workshops by office teams, birthdays and hen parties. Most
                of them are in London, but I do travel elsewhere in the UK when the numbers, venue
                and timings make sense. Some briefs are an easy yes. Some are not.
              </p>
              <p className='max-w-[35rem] text-[15px] leading-7 text-base-content/76 tablet:text-[17px] tablet:leading-8'>
                I prep the cakes before I arrive, so each guest sits down to one ready to
                decorate. I bring the tools, boards, boxes and materials with me, then teach the
                design in stages so the table can get on with it straight away.
              </p>
            </div>

            <div className='flex flex-wrap gap-2.5 tablet:gap-3'>
              <a
                href='#workshop-enquiry-form'
                className='btn btn-primary rounded-full border-none px-5 normal-case shadow-none'
              >
                Ask about your date
              </a>
              <Link
                href='/contact'
                prefetch={false}
                className='btn btn-outline rounded-full border-primary-500 px-5 normal-case text-primary-700 shadow-none hover:bg-primary-500 hover:text-primary-content'
              >
                Contact Olga
              </Link>
            </div>

          </div>

          <div className='grid gap-3 tablet:gap-4'>
            <figure className='overflow-hidden rounded-[30px] border border-base-200 bg-base-100 shadow-sm'>
              <div className='relative h-[250px] w-full tablet:h-[420px] small-laptop:h-[500px]'>
                <Image
                  src={heroPhotos[0].src}
                  alt={heroPhotos[0].alt}
                  preload
                  decoding='async'
                  fill
                  className='object-cover'
                  sizes='(min-width: 1280px) 560px, (min-width: 1024px) 46vw, calc(100vw - 2rem)'
                />
              </div>
            </figure>

            <div
              className='grid gap-3 tablet:grid-cols-[0.92fr_1.08fr] tablet:items-start tablet:gap-4'
              style={deferredHeroDetailStyle}
            >
              <figure className='overflow-hidden rounded-[24px] border border-base-200 bg-base-100 shadow-sm'>
                <div className='relative h-[220px] w-full tablet:h-[220px]'>
                  <DeferredViewportImage
                    src={heroPhotos[1].src}
                    alt={heroPhotos[1].alt}
                    fill
                    fetchPriority='low'
                    className='object-cover'
                    sizes='(min-width: 1280px) 240px, (min-width: 1024px) 20vw, calc((100vw - 3rem) * 0.4)'
                  />
                </div>
              </figure>

              <div className='rounded-[24px] border border-primary/10 bg-base-100/90 p-3 shadow-sm tablet:p-5'>
                <h2 className='font-oldenburg text-[1.3rem] leading-[1.08] tracking-[0.02em] text-primary-800 tablet:text-[1.7rem]'>
                  Included in every session
                </h2>
                <div className='mt-3 tablet:mt-4'>
                  <WorkshopBulletList items={heroFeaturePoints} compact />
                </div>
              </div>
            </div>
          </div>

          <dl
            className='grid grid-cols-2 gap-3 border-t border-primary/12 pt-4 tablet:grid-cols-3 tablet:gap-4 tablet:pt-6 small-laptop:max-w-[35rem]'
            style={deferredHeroDetailStyle}
          >
            {workshopFacts.map((fact, index) => (
              <div
                key={fact.label}
                className={`rounded-[22px] border border-primary/10 bg-base-100/90 p-3 shadow-sm tablet:p-4 ${index === workshopFacts.length - 1 ? 'col-span-2 tablet:col-span-1' : ''}`}
              >
                <dt className='text-[0.78rem] font-semibold uppercase tracking-[0.18em] text-primary-700'>
                  {fact.label}
                </dt>
                <dd className='mt-2.5 font-oldenburg text-[1.3rem] leading-[1.05] text-primary-800 tablet:mt-3 tablet:text-[1.45rem]'>
                  {fact.value}
                </dd>
                <dd className='mt-2 text-sm leading-5 text-base-content/74 tablet:leading-6'>
                  {fact.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={categoryLandingStandardShellClassName} style={deferredSectionStyle}>
        <div className='grid gap-5 small-laptop:grid-cols-[minmax(0,0.84fr)_minmax(0,1.16fr)] small-laptop:items-start small-laptop:gap-8'>
          <div className='max-w-[35rem]'>
            <h2 className='font-oldenburg text-3xl tracking-[0.08em] text-base-content tablet:text-4xl'>
              How I run the workshop
            </h2>
            <p className='mt-4 text-base leading-7 text-base-content/80 tablet:text-lg'>
              This goes well when I know the real venue details before the date is confirmed. If I
              have the timings, access notes and headcount early, I can prep off-site and turn up
              ready to teach instead of fixing room problems on the day.
            </p>
          </div>

          <ol className='space-y-4' style={{ listStyle: 'none', margin: 0, paddingLeft: 0 }}>
            {workshopStages.map(stage => (
              <li
                key={stage.step}
                className='rounded-[28px] border border-base-300 bg-base-100 p-4 shadow-sm tablet:p-6'
              >
                <div className='flex flex-col gap-2.5 tablet:flex-row tablet:items-start tablet:gap-4'>
                  <span className='inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary-700 tablet:h-11 tablet:w-11 tablet:text-base'>
                    {stage.step}
                  </span>
                  <div>
                    <h3 className='font-oldenburg text-[1.4rem] leading-[1.08] tracking-[0.02em] text-primary-800 tablet:text-[1.5rem]'>
                      {stage.title}
                    </h3>
                    <p className='mt-2.5 text-sm leading-6 text-base-content/78 tablet:mt-3 tablet:text-base tablet:leading-7'>
                      {stage.body}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className={`${categoryLandingStandardShellClassName} pt-0`}
        style={deferredSectionStyle}
      >
        <div className='grid gap-5 small-laptop:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] small-laptop:items-start small-laptop:gap-8'>
          <div className='space-y-5 tablet:space-y-6'>
            <div className='max-w-[38rem]'>
              <h2 className='font-oldenburg text-3xl tracking-[0.08em] text-base-content tablet:text-4xl'>
                Before you book
              </h2>
              <p className='mt-4 text-base leading-6 text-base-content/80 tablet:text-lg tablet:leading-7'>
                These workshops are not right for every room or every schedule. They go best when
                people are there to sit down, decorate and stay with it, and when I can get in and
                set up properly before everyone arrives.
              </p>
            </div>

            <figure className='overflow-hidden rounded-[28px] border border-base-200 bg-base-100 shadow-sm'>
              <div className='relative h-[280px] w-full tablet:h-[360px]'>
                <Image
                  src={logisticsPhoto.src}
                  alt={logisticsPhoto.alt}
                  fill
                  loading='lazy'
                  fetchPriority='low'
                  className='object-cover'
                  sizes='(min-width: 1280px) 560px, (min-width: 1024px) 46vw, calc(100vw - 2rem)'
                />
              </div>
            </figure>
          </div>

          <div className='grid content-start gap-4 small-laptop:gap-8 small-laptop:pl-4'>
            <article className='rounded-[24px] border border-base-300/70 bg-base-100 px-4 py-4 shadow-sm small-laptop:rounded-none small-laptop:border-0 small-laptop:border-t small-laptop:bg-transparent small-laptop:px-0 small-laptop:pt-6 small-laptop:pb-0 small-laptop:shadow-none'>
              <h3 className='font-oldenburg text-[1.55rem] leading-[1.08] tracking-[0.02em] text-primary-800'>
                Best fit
              </h3>
              <p className='mt-2.5 text-sm leading-6 text-base-content/78 tablet:mt-3 tablet:text-base tablet:leading-7'>
                The best bookings are the ones where decorating is the actual plan. If the table
                is meant to be up and down for lunch, speeches and people wandering off, this
                format usually fights the room.
              </p>
              <div className='mt-4'>
                <WorkshopBulletList items={goodOccasionPoints} />
              </div>
            </article>

            <article className='rounded-[24px] border border-base-300/70 bg-base-100 px-4 py-4 shadow-sm small-laptop:rounded-none small-laptop:border-0 small-laptop:border-t small-laptop:bg-transparent small-laptop:px-0 small-laptop:pt-6 small-laptop:pb-0 small-laptop:shadow-none'>
              <h3 className='font-oldenburg text-[1.55rem] leading-[1.08] tracking-[0.02em] text-primary-800'>
                When I say no
              </h3>
              <p className='mt-2.5 text-sm leading-6 text-base-content/78 tablet:mt-3 tablet:text-base tablet:leading-7'>
                If I can see from the brief that people will be up and down all session, or that I
                will be dragging equipment through a venue with no proper setup time, I would
                rather say no early than pretend it will be fine.
              </p>
              <div className='mt-4'>
                <WorkshopBulletList items={refusalPoints} />
              </div>
            </article>

            <article className='rounded-[24px] border border-base-300/70 bg-base-100 px-4 py-4 shadow-sm small-laptop:rounded-none small-laptop:border-0 small-laptop:border-t small-laptop:bg-transparent small-laptop:px-0 small-laptop:pt-6 small-laptop:pb-0 small-laptop:shadow-none'>
              <h3 className='font-oldenburg text-[1.55rem] leading-[1.08] tracking-[0.02em] text-primary-800'>
                What the room needs
              </h3>
              <p className='mt-2.5 text-sm leading-6 text-base-content/78 tablet:mt-3 tablet:text-base tablet:leading-7'>
                I do not need a fancy venue. I need a room I can get into, set up in and move
                around once everybody is seated. That matters far more than how dressed up the room
                looks.
              </p>
              <div className='mt-4'>
                <WorkshopBulletList items={roomNeedsPoints} />
              </div>
            </article>
          </div>
        </div>
      </section>

      <WorkshopEnquiryFormSection />
    </>
  )
}
