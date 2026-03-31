#!/usr/bin/env node

import { createClient, type ClientConfig } from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({ path: './.env.local' })

type PortableTextStyle = 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote'
type PortableTextListItem = 'bullet' | 'number'

export interface PortableTextMarkDef {
  _key: string
  _type: string
  href?: string
}

export interface PortableTextSpan {
  _key: string
  _type: 'span'
  marks: string[]
  text: string
}

export interface PortableTextBlock {
  _key: string
  _type: 'block'
  style?: PortableTextStyle
  listItem?: PortableTextListItem
  level?: number
  markDefs: PortableTextMarkDef[]
  children: PortableTextSpan[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface SanityImageField {
  _type?: string
  asset?: {
    _ref?: string
    _type?: string
  }
  alt?: string
  caption?: string
  isMain?: boolean
}

export interface ReferenceValue {
  _type: 'reference'
  _ref: string
}

export interface ArticleTopicSeed {
  title: string
  slug: string
  description: string
  order: number
}

interface ArticleSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
  numbers?: string[]
}

interface SeedArticleDraft {
  title: string
  slug: string
  summary: string
  dek: string
  topicSlug: string
  primaryProductSlug?: string
  imageProductSlug?: string
  relatedProductSlugs: string[]
  intro: string[]
  sections: ArticleSection[]
  faqItems?: FaqItem[]
  seo: {
    metaTitle: string
    metaDescription: string
    keywords: string[]
  }
  coverImageAlt: string
  cardImageAlt: string
  requiredAnchors: string[]
}

export interface SeedArticle extends Omit<SeedArticleDraft, 'intro' | 'sections'> {
  publishedAt: string
  body: PortableTextBlock[]
}

interface ExistingSlugRecord {
  _id: string
  slug: string
}

interface ExistingArticleDocument {
  editorialUpdatedAt?: string
  refreshEditorialUpdatedAt?: boolean
  seo?: {
    canonicalUrl?: string
    priority?: number
    changefreq?: string
  }
}

export interface ProductRecord {
  _id: string
  _type: 'cake' | 'giftHamper'
  name: string
  slug: string
  mainImage?: SanityImageField | null
  image?: SanityImageField | null
  featuredImage?: SanityImageField | null
  cardImage?: SanityImageField | null
  images?: SanityImageField[] | null
}

interface ArticleVerificationRecord {
  slug: string
  hasBody: boolean
  hasTopic: boolean
  hasCoverImage: boolean
  hasPrimaryProduct: boolean
  hasSeo: boolean
}

interface TopicVerificationRecord {
  slug: string
}

interface SanityEnvironment {
  projectId: string
  dataset: string
  token: string
  apiVersion: string
}

let keyCounter = 0

export const manualArticleScheduleBaseline = '2026-03-31T00:01:00.000Z'
export const retiredArticleSlugs = ['less-sweet-celebration-cakes']

export const antiAiBannedPhrases = [
  'not just any',
  'not just a dessert',
  'rich tapestry',
  'treasure trove',
  'in today\'s world',
  'delve into',
  'elevate your',
  'something for everyone',
  'mouthwatering',
  'without compromising on taste',
  'the beauty of',
  'game changer'
]

export function resetKeyCounter() {
  keyCounter = 0
}

export function createKey(prefix: string) {
  keyCounter += 1
  return `${prefix}-${keyCounter}`
}

export function normalizeForComparison(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function textSpan(text: string): PortableTextSpan {
  return {
    _key: createKey('span'),
    _type: 'span',
    marks: [],
    text
  }
}

export function paragraph(text: string): PortableTextBlock {
  return {
    _key: createKey('block'),
    _type: 'block',
    style: 'normal',
    markDefs: [],
    children: [textSpan(text)]
  }
}

export function heading(
  text: string,
  style: Exclude<PortableTextStyle, 'normal'> = 'h2'
): PortableTextBlock {
  return {
    _key: createKey('block'),
    _type: 'block',
    style,
    markDefs: [],
    children: [textSpan(text)]
  }
}

export function bullet(text: string): PortableTextBlock {
  return {
    _key: createKey('block'),
    _type: 'block',
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [textSpan(text)]
  }
}

export function numbered(text: string): PortableTextBlock {
  return {
    _key: createKey('block'),
    _type: 'block',
    style: 'normal',
    listItem: 'number',
    level: 1,
    markDefs: [],
    children: [textSpan(text)]
  }
}

export function faq(question: string, answer: string): FaqItem {
  return { question, answer }
}

export function toArticleTopicDocumentId(slug: string) {
  return `articleTopic-${slug}`
}

export function toArticleDocumentId(slug: string) {
  return `article-${slug}`
}

export function normalizeImageField(image: SanityImageField | null | undefined) {
  if (!image?.asset?._ref) {
    return undefined
  }

  return {
    _type: 'image',
    asset: {
      _type: 'reference',
      _ref: image.asset._ref
    },
    alt: image.alt,
    caption: image.caption
  }
}

export function applyImageAlt(
  image: SanityImageField | null | undefined,
  altOverride: string
): SanityImageField {
  const normalizedImage = normalizeImageField(image)

  if (!normalizedImage) {
    throw new Error(`Cannot apply alt text because the image asset is missing: ${altOverride}`)
  }

  return {
    ...normalizedImage,
    alt: altOverride
  }
}

export function pickProductImage(product: ProductRecord) {
  const images = [
    product.mainImage,
    product.images?.find((image) => image?.isMain && image.asset?._ref),
    product.image,
    product.featuredImage,
    product.cardImage,
    product.images?.find((image) => image?.asset?._ref)
  ]

  for (const image of images) {
    const normalizedImage = normalizeImageField(image)

    if (normalizedImage) {
      return normalizedImage
    }
  }

  return undefined
}

function buildBody(intro: string[], sections: ArticleSection[]) {
  const blocks: PortableTextBlock[] = []

  for (const paragraphText of intro) {
    blocks.push(paragraph(paragraphText))
  }

  for (const section of sections) {
    blocks.push(heading(section.heading))

    for (const paragraphText of section.paragraphs ?? []) {
      blocks.push(paragraph(paragraphText))
    }

    for (const bulletText of section.bullets ?? []) {
      blocks.push(bullet(bulletText))
    }

    for (const numberText of section.numbers ?? []) {
      blocks.push(numbered(numberText))
    }
  }

  return blocks
}

function publishedAtForIndex(index: number) {
  const publishedAt = new Date(manualArticleScheduleBaseline)
  publishedAt.setUTCDate(publishedAt.getUTCDate() - index)
  return publishedAt.toISOString()
}

export function extractBlockText(block: PortableTextBlock) {
  return block.children.map((child) => child.text).join(' ').replace(/\s+/g, ' ').trim()
}

export function extractBodyPlainText(body: PortableTextBlock[]) {
  return body.map(extractBlockText).join('\n').trim()
}

function extractParagraphTexts(body: PortableTextBlock[]) {
  return body
    .filter((block) => block.style === 'normal' && !block.listItem)
    .map(extractBlockText)
    .filter(Boolean)
}

function firstWords(value: string, count: number) {
  return normalizeForComparison(value).split(' ').filter(Boolean).slice(0, count).join(' ')
}

function buildSeedArticle(draft: SeedArticleDraft, index: number): SeedArticle {
  resetKeyCounter()

  return {
    ...draft,
    publishedAt: publishedAtForIndex(index),
    body: buildBody(draft.intro, draft.sections)
  }
}

export const topicSeeds: ArticleTopicSeed[] = [
  {
    title: 'Cake by post',
    slug: 'cake-by-post',
    description: 'Practical guides for postal cake orders, letterbox gifts, and UK-wide delivery.',
    order: 0
  },
  {
    title: 'Celebration planning',
    slug: 'celebration-planning',
    description: 'Articles that help customers plan birthdays and allergen-sensitive celebrations carefully.',
    order: 1
  },
  {
    title: 'Custom cakes',
    slug: 'custom-cakes',
    description: 'Editorial support for bespoke cake briefs, wedding flavour choices, and celebration planning.',
    order: 2
  },
  {
    title: 'Ukrainian cake guides',
    slug: 'ukrainian-cake-guides',
    description: 'Plain-English guides to Medovik, Napoleon, Kyiv cake, and other Ukrainian cake traditions.',
    order: 3
  },
  {
    title: 'Gift ideas',
    slug: 'gift-ideas',
    description: 'Small but thoughtful cake gifts, cake cards, and postal presents that feel personal.',
    order: 4
  },
  {
    title: 'Local cake delivery',
    slug: 'local-cake-delivery',
    description: 'City-specific guidance for ordering, collecting, or arranging cake delivery from Leeds.',
    order: 5
  },
  {
    title: 'Seasonal cake guides',
    slug: 'seasonal-cake-guides',
    description: 'Seasonal ordering guides for Easter, Halloween, Valentine\'s, and Christmas cake moments.',
    order: 6
  },
  {
    title: 'Cake care and sizing',
    slug: 'cake-care-and-sizing',
    description: 'Storage, freshness, and portion guides for customers planning how to serve cake well.',
    order: 7
  }
]

interface LocalDeliveryDraftConfig {
  slug: string
  title: string
  summary: string
  dek: string
  imageProductSlug: string
  relatedProductSlugs: string[]
  intro: string[]
  sections: ArticleSection[]
  faqItems: FaqItem[]
  seo: SeedArticleDraft['seo']
  requiredAnchors: string[]
  coverImageAlt: string
  cardImageAlt: string
}

interface SeasonalDraftConfig {
  title: string
  slug: string
  summary: string
  dek: string
  primaryProductSlug?: string
  imageProductSlug: string
  relatedProductSlugs: string[]
  intro: string[]
  sections: ArticleSection[]
  closingRule: string
  faqItems: FaqItem[]
  seo: SeedArticleDraft['seo']
  requiredAnchors: string[]
  coverImageAlt: string
  cardImageAlt: string
}

function createFaqItems(items: Array<[string, string]>) {
  return items.map(([question, answer]) => faq(question, answer))
}

function createLocalDeliveryDraft(config: LocalDeliveryDraftConfig): SeedArticleDraft {
  return {
    title: config.title,
    slug: config.slug,
    summary: config.summary,
    dek: config.dek,
    topicSlug: 'local-cake-delivery',
    imageProductSlug: config.imageProductSlug,
    relatedProductSlugs: config.relatedProductSlugs,
    intro: config.intro,
    sections: config.sections,
    faqItems: config.faqItems,
    seo: config.seo,
    coverImageAlt: config.coverImageAlt,
    cardImageAlt: config.cardImageAlt,
    requiredAnchors: config.requiredAnchors
  }
}

function createSeasonalDraft(config: SeasonalDraftConfig): SeedArticleDraft {
  return {
    title: config.title,
    slug: config.slug,
    summary: config.summary,
    dek: config.dek,
    topicSlug: 'seasonal-cake-guides',
    primaryProductSlug: config.primaryProductSlug,
    imageProductSlug: config.imageProductSlug,
    relatedProductSlugs: config.relatedProductSlugs,
    intro: config.intro,
    sections: [
      ...config.sections,
      {
        heading: 'My rule for seasonal orders',
        paragraphs: [
          config.closingRule
        ]
      }
    ],
    faqItems: config.faqItems,
    seo: config.seo,
    coverImageAlt: config.coverImageAlt,
    cardImageAlt: config.cardImageAlt,
    requiredAnchors: config.requiredAnchors
  }
}

const seedArticleDrafts: SeedArticleDraft[] = [
  {
    title: 'Ukrainian cakes: what makes them different and which one to order first',
    slug: 'ukrainian-cakes-guide',
    summary: 'A plain-English guide to the Ukrainian cakes customers ask for most often, from Medovik to Kyiv cake, with honest advice on where to start.',
    dek: 'If you are curious about Ukrainian cakes but do not want a history lecture, start here. I explain how Medovik, Napoleon, Kyiv cake, and Korovai differ in flavour, texture, and occasion so you can order the right one first time.',
    topicSlug: 'ukrainian-cake-guides',
    imageProductSlug: 'honey-cake-medovik',
    relatedProductSlugs: ['honey-cake-medovik', 'napoleon-cake', 'kyiv-cake', 'ukrainian-wedding-bread-korovai'],
    intro: [
      'When people search for Ukrainian cakes, they are usually not asking for a museum answer. They want to know what these cakes actually taste like, which one feels right for a birthday or gift, and whether they will suit British tastes as well as Ukrainian ones.',
      'I keep the answer simple. Ukrainian cakes tend to lean on texture, layered fillings, and a more deliberate flavour balance. They are memorable because they feel distinct, not because they are overloaded with sugar.'
    ],
    sections: [
      {
        heading: 'What makes Ukrainian cakes feel different',
        paragraphs: [
          'The biggest difference is structure. Medovik gives you many soft honey layers, Napoleon gives you thin flaky pastry with cream between each sheet, and Kyiv cake is built around airy nut meringue with cream. They do not eat like one standard sponge in three colours.',
          'I also find that people notice the sweetness differently. A good Ukrainian cake still feels indulgent, but the best versions rely on contrast, not just sugar.'
        ]
      },
      {
        heading: 'For a calm first choice, start with Medovik',
        paragraphs: [
          'Honey Cake Medovik is the one I recommend when someone says they want to try a Ukrainian cake but would rather not start with anything too heavy. The layers are soft, the honey is present without shouting, and the condensed milk cream rounds everything together.',
          'It is also the easiest bridge for customers who normally order celebration sponge cakes but want something with more character.'
        ]
      },
      {
        heading: 'Napoleon and Kyiv cake suit different moods',
        paragraphs: [
          'Napoleon cake is for people who care about texture. The seven thin puff pastry layers and diplomat-style cream give it that delicate crackle and softness together. I often suggest it when someone wants something elegant rather than dramatic.',
          'Kyiv cake is the one I bring up when a customer wants contrast. It has airy meringue, cashew nuts, custard cream, buttercream, and a thin chocolate cream layer, so the bite is richer and more playful.'
        ]
      },
      {
        heading: 'Where Korovai belongs',
        paragraphs: [
          'Korovai is not an everyday dessert choice in the same way. Ukrainian wedding bread has a ceremonial role, and I treat it with that respect. It belongs around weddings and family symbolism more than casual cake browsing.',
          'For a first cake to eat and compare, choose Medovik, Napoleon, or Kyiv cake. For meaning on a wedding table, Korovai deserves its own place.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['Which Ukrainian cake should I order first?', 'For most first-time customers, Medovik is the easiest place to start because it is gentle, layered, and easy to enjoy even if you have never tried Ukrainian cake before.'],
      ['Is Ukrainian cake always very sweet?', 'No. The better examples feel balanced. Texture and cream matter as much as sweetness.'],
      ['What is the difference between Napoleon cake and Kyiv cake?', 'Napoleon is built around flaky pastry and cream, while Kyiv cake is richer and crunchier because of the meringue and cashew nuts.']
    ]),
    seo: {
      metaTitle: 'Ukrainian cakes guide | Medovik, Napoleon and Kyiv cake',
      metaDescription: 'Learn what makes Ukrainian cakes different and which one to order first, with clear advice on Medovik, Napoleon cake, Kyiv cake, and Korovai.',
      keywords: ['ukrainian cakes', 'ukrainian cake guide', 'medovik', 'napoleon cake', 'kyiv cake']
    },
    coverImageAlt: 'Slice of Medovik honey cake showing many soft layers and cream',
    cardImageAlt: 'Close crop of layered Medovik honey cake for the blog archive',
    requiredAnchors: ['ukrainian cakes', 'Medovik', 'Napoleon cake', 'Kyiv cake', 'Korovai']
  },
  {
    title: 'Napoleon cake: what it tastes like, how it compares, and when to order it',
    slug: 'napoleon-cake-guide',
    summary: 'A practical guide to Napoleon cake for first-time buyers who want to understand the flavour, texture, and when it is the right choice.',
    dek: 'Napoleon cake is often described too vaguely. I explain what the pastry actually feels like, why the cream matters, and when I would recommend Napoleon over Medovik or Kyiv cake.',
    topicSlug: 'ukrainian-cake-guides',
    primaryProductSlug: 'napoleon-cake',
    relatedProductSlugs: ['honey-cake-medovik', 'kyiv-cake', 'fruit-cake-svit-berry-or-light-berry-cake-with-cream'],
    intro: [
      'Napoleon cake wins people over when they care about texture as much as flavour. It is not a fluffy sponge in disguise. It is built from thin pastry layers, and that changes the whole experience.',
      'It suits customers who want something refined, lightly nostalgic, and less obvious than a standard celebration cake.'
    ],
    sections: [
      {
        heading: 'What Napoleon cake actually tastes like',
        paragraphs: [
          'The version I make uses seven thin flaky puff pastry layers with a diplomat-style cream, so the bite moves between slight crackle and soft cream rather than one even texture.',
          'Napoleon feels elegant on the plate because it has detail. You notice layers, not just sweetness.'
        ]
      },
      {
        heading: 'How it compares with Medovik and Kyiv cake',
        paragraphs: [
          'If Medovik is soft and rounded, Napoleon is more delicate and pastry-led. If Kyiv cake is richer because of meringue, cashew nuts, and buttercream, Napoleon feels lighter on the palate even though it is still indulgent.',
          'There is no single winner every time. They suit different people.'
        ]
      },
      {
        heading: 'When I recommend Napoleon',
        paragraphs: [
          'I suggest Napoleon for smaller celebrations, thoughtful dinners, and customers who say they want a cake that looks calm when sliced. The layers do a lot of the work visually without needing heavy decoration.',
          'It is also a strong choice when someone wants a conversation piece for people who have not tried Ukrainian cakes before.'
        ]
      },
      {
        heading: 'What to ask before you order',
        numbers: [
          'Ask how large the cake needs to be for the way you will serve it.',
          'Decide whether you want a classic finish or a more decorative celebration brief.',
          'If delivery matters, tell me the route and timing early so I can advise honestly.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['Is Napoleon cake the same as mille-feuille?', 'They are related in structure, but the celebration version people order as a whole cake feels fuller and softer than a plated pastry.'],
      ['Is Napoleon cake very sweet?', 'Not if the cream is balanced properly. The pastry and cream should work together rather than feel sugary for the sake of it.'],
      ['When is Napoleon better than Medovik?', 'I would choose Napoleon when you want flaky pastry texture and a neater, more elegant slice.']
    ]),
    seo: {
      metaTitle: 'Napoleon cake guide | taste, texture and when to order',
      metaDescription: 'Find out what Napoleon cake tastes like, how it compares with Medovik and Kyiv cake, and when it is the right Ukrainian cake to order.',
      keywords: ['napoleon cake', 'what is napoleon cake', 'napoleon cake uk', 'ukrainian napoleon cake']
    },
    coverImageAlt: 'Napoleon cake slice showing flaky pastry layers and diplomat cream',
    cardImageAlt: 'Close crop of Napoleon cake layers and cream on a serving plate',
    requiredAnchors: ['Napoleon cake', 'seven thin flaky puff pastry layers', 'Medovik', 'Kyiv cake']
  },
  {
    title: 'Medovik and honey cake near me: what to expect before you order',
    slug: 'medovik-honey-cake-near-me-guide',
    summary: 'A buyer\'s guide for anyone searching for Medovik or honey cake near them and trying to work out flavour, delivery, and occasion fit.',
    dek: 'People searching for honey cake near me usually want a straightforward answer: what does Medovik taste like, is it too sweet, and is it sensible for local delivery or by-post gifting? This guide answers that without the filler.',
    topicSlug: 'ukrainian-cake-guides',
    primaryProductSlug: 'honey-cake-medovik',
    relatedProductSlugs: ['honey-cake-by-post', 'cake-by-post', 'napoleon-cake', 'kyiv-cake'],
    intro: [
      'When someone types honey cake near me or Medovik near me, they are usually already half-decided. The real hesitation is about flavour, sweetness, and whether the cake will suit the occasion once it arrives.',
      'My answer is that Medovik is one of the easiest Ukrainian cakes to enjoy first time because it is layered, fragrant, and generous without feeling clumsy.'
    ],
    sections: [
      {
        heading: 'What Medovik tastes like in real life',
        paragraphs: [
          'The flavour is led by honey rather than by a synthetic sweetness. In my Medovik, five light sponge layers are filled with condensed milk cream, so the cake feels soft, settled, and comforting rather than flashy.',
          'That balance matters. If honey cake is made badly, it can taste flat. When it is made properly, it tastes round and warm.'
        ]
      },
      {
        heading: 'Who usually likes it most',
        paragraphs: [
          'I recommend Medovik to customers who want a celebration cake that feels special without becoming too rich too quickly. It works well for birthdays, family lunches, and gifts where you want something recognisable but not ordinary.',
          'It also suits people who say they want less sweetness than a typical supermarket-style sponge.'
        ]
      },
      {
        heading: 'Local delivery and by-post are different questions',
        paragraphs: [
          'A full Medovik for local delivery is not the same thing as a postal gift. I keep separate formats in mind for that reason. A local cake can prioritise generous slicing and presentation, while Honey Cake by Post is packed specifically for travel.',
          'Those are two different jobs, and I keep them separate instead of pretending one format covers every situation well.'
        ]
      },
      {
        heading: 'If you are comparing Medovik with other Ukrainian cakes',
        paragraphs: [
          'Choose Napoleon when you want more pastry character. Choose Kyiv cake when you want a richer bite with meringue, cashew nuts, custard cream, and chocolate notes. Choose Medovik when you want the calmest all-rounder.',
          'That is usually the cleanest way to decide.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['Is Medovik very sweet?', 'It should taste gently honeyed and creamy, not harshly sweet. Balance is the whole point.'],
      ['Can I send honey cake by post?', 'Yes, but use a format that has been packed for the post rather than assuming a local celebration cake should travel the same way.'],
      ['What is the difference between honey cake and Medovik?', 'Medovik is the honey cake style most people mean here: layered cake with honey in the sponge and a soft cream filling.']
    ]),
    seo: {
      metaTitle: 'Medovik and honey cake near me | what to expect',
      metaDescription: 'Searching for honey cake near me or Medovik near me? Learn what Medovik tastes like, who it suits, and when to choose local delivery or by-post options.',
      keywords: ['honey cake near me', 'medovik near me', 'medovik cake near me', 'ukrainian honey cake near me']
    },
    coverImageAlt: 'Medovik slice showing soft honey sponge layers and cream filling',
    cardImageAlt: 'Close crop of Medovik honey cake layers on a plate',
    requiredAnchors: ['honey cake near me', 'Medovik', 'five light sponge layers', 'Honey Cake by Post']
  },
  {
    title: 'Kyiv cake: what makes it different and when it is the right choice',
    slug: 'kyiv-cake-guide',
    summary: 'A clear guide to Kyiv cake for customers who want to know what makes it different, how rich it feels, and when it is worth ordering.',
    dek: 'Kyiv cake stands out for texture more than size. I explain the meringue, cashew nuts, creams, and chocolate notes so you can tell whether it suits your table better than Napoleon cake or Medovik.',
    topicSlug: 'ukrainian-cake-guides',
    primaryProductSlug: 'kyiv-cake',
    relatedProductSlugs: ['napoleon-cake', 'honey-cake-medovik', 'ukrainian-wedding-bread-korovai'],
    intro: [
      'Kyiv cake is the one customers ask about when they want something unmistakable. It is not shy, but it should still feel controlled.',
      'It suits celebrations that need contrast and texture, not tables looking for the gentlest option on the menu.'
    ],
    sections: [
      {
        heading: 'Why Kyiv cake tastes so distinct',
        paragraphs: [
          'The personality comes from airy meringue layers with cashew nuts, plus custard cream, buttercream, and a thin chocolate cream layer. That mix gives you crunch, softness, and richness in one slice.',
          'If the cake only tasted sweet, it would be tiring. The meringue and nuts are what keep it interesting.'
        ]
      },
      {
        heading: 'When I suggest Kyiv cake over other options',
        paragraphs: [
          'I bring it up when customers want a stronger flavour contrast than Medovik and something more playful than Napoleon. It works especially well when the table has people who enjoy nutty, creamy desserts rather than plain sponge.',
          'I would not push it on someone asking for the least rich option. That would be the wrong fit.'
        ]
      },
      {
        heading: 'What to know before buying Kyiv cake',
        paragraphs: [
          'Because Kyiv cake includes cashew nuts, I say that clearly at the start rather than letting anyone assume it can be adapted into a nut-free option.',
          'It also helps to think about the audience. A family that loves layered desserts and texture will remember it. A crowd expecting standard sponge may need more explanation.'
        ]
      },
      {
        heading: 'How it sits beside Medovik and Napoleon',
        paragraphs: [
          'Medovik is softer and more rounded. Napoleon is pastry-led and elegant. Kyiv cake is the boldest of the three because every bite carries meringue, nuts, and cream at once.',
          'That contrast is exactly what some customers love about it.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['What is Kyiv cake made of?', 'The core elements are airy meringue, cashew nuts, custard cream, buttercream, and a thin chocolate cream layer.'],
      ['Is Kyiv cake suitable for nut allergies?', 'No. It includes cashew nuts, so I would not describe it as suitable for anyone avoiding nuts.'],
      ['When is Kyiv cake the right choice?', 'Choose it when you want a richer, more textured Ukrainian cake with a clear identity.']
    ]),
    seo: {
      metaTitle: 'Kyiv cake guide | what makes it different',
      metaDescription: 'Learn what makes Kyiv cake different, how rich it feels, and when to choose it over Medovik or Napoleon cake.',
      keywords: ['kyiv cake', 'kiev cake', 'kyiv cake where to buy', 'kyiv cake uk']
    },
    coverImageAlt: 'Kyiv cake slice with meringue layers, cream, and chocolate detail',
    cardImageAlt: 'Close crop of Kyiv cake showing nut meringue and cream texture',
    requiredAnchors: ['Kyiv cake', 'airy meringue', 'cashew nuts', 'Medovik', 'Napoleon']
  },
  createLocalDeliveryDraft({
    slug: 'cake-delivery-leeds-guide',
    title: 'Cake delivery in Leeds: what to order, what to book early, and what travels best',
    summary: 'A Leeds-focused guide to ordering cake with sensible advice on timing, travel, and which styles hold up best on the move.',
    dek: 'If you need cake delivery in Leeds, the right question is not just who can drive it across town. It is which cake will still feel right once it arrives, how early to book, and when collection is actually the simpler choice.',
    imageProductSlug: 'vanilla-delicia-birthday-cake',
    relatedProductSlugs: ['vanilla-delicia-birthday-cake', 'honey-cake-medovik', 'napoleon-cake', 'fruit-cake-svit-berry-or-light-berry-cake-with-cream'],
    intro: [
      'Cake delivery in Leeds is the easiest work for me to judge honestly because I know how these orders behave once they leave the bakery.',
      'Some Leeds deliveries are wonderfully straightforward. Others only look easy until the customer asks for a tall finish, a narrow time slot, and a long venue setup all in the same sentence.'
    ],
    sections: [
      {
        heading: 'What changes when the address is in Leeds',
        paragraphs: [
          'A Leeds run gives me more freedom than a longer journey, so I can support slightly more decorative briefs here than I would for York or Huddersfield. Even so, I still want the cake to open well, slice cleanly, and look settled rather than tense.',
          'That is most obvious on birthdays where the box is opened in front of people. Nobody enjoys a design that looked ambitious in theory and tired in practice.'
        ]
      },
      {
        heading: 'The Leeds orders I ask people to book early',
        paragraphs: [
          'Friday and Saturday celebration cakes move first, especially when there is a venue involved or the finish is more custom than standard.',
          'Very exact arrival times need sorting early instead of being improvised the day before.'
        ]
      },
      {
        heading: 'What I tend to suggest most often',
        paragraphs: [
          'Vanilla Delicia is useful when the customer wants design flexibility. Medovik is the quiet recommendation when someone wants flavour and elegance without a heavy finish. Napoleon is my pick when the person ordering cares about how the slice will look on a plate.',
          'Those three solve very different Leeds orders, which is why "birthday cake" is too broad a label on its own.'
        ]
      },
      {
        heading: 'The details that save the order',
        bullets: [
          'Tell me whether the cake will be cut as dessert or as smaller party slices.',
          'Say whether delivery is to a home, workplace, or venue.',
          'Mention allergen requirements before we talk about decoration.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['Can I order a cake in Leeds at short notice?', 'Sometimes, but it depends on the week and on how simple the brief is. If I cannot do it properly, I say so early.'],
      ['Which cakes travel best across Leeds?', 'Cakes with stable structure and balanced decoration usually travel best. Medovik, Napoleon, and neatly finished celebration cakes are strong options.'],
      ['Is collection ever better than delivery?', 'Yes. If timing is tight or you want more flexibility, collection can be the cleaner option.']
    ]),
    seo: {
      metaTitle: 'Cake delivery Leeds guide | what travels best',
      metaDescription: 'Practical advice on cake delivery in Leeds, including what to order, what to book early, and which cakes travel best across the city.',
      keywords: ['cake delivery leeds', 'birthday cakes leeds', 'cakes in leeds', 'leeds cake delivery']
    },
    requiredAnchors: ['cake delivery in Leeds', 'Medovik', 'Napoleon', 'Vanilla Delicia'],
    coverImageAlt: 'Vanilla celebration cake prepared for local delivery in Leeds',
    cardImageAlt: 'Close crop of a vanilla celebration cake suitable for Leeds delivery'
  }),
  {
    title: 'Nut free cakes in Leeds: what to ask a bakery before you order',
    slug: 'nut-free-cakes-leeds-guide',
    summary: 'A careful guide for Leeds customers who need nut-free birthday or celebration cake information without vague promises.',
    dek: 'If you need nut free cakes in Leeds, the most important thing is not a comforting slogan. It is a precise conversation about recipe, decoration, cross-contact, and what the bakery can honestly support.',
    topicSlug: 'celebration-planning',
    imageProductSlug: 'vanilla-delicia-birthday-cake',
    relatedProductSlugs: [],
    intro: [
      'Nut free cakes in Leeds deserve straight answers. Customers managing allergies need precision, not warm wording that blurs the risk.',
      'So I separate three things every time: whether nuts are in the recipe, whether nuts are used elsewhere in the kitchen, and whether the final decoration changes the risk.'
    ],
    sections: [
      {
        heading: 'Start with the recipe, then ask about the kitchen',
        paragraphs: [
          'A cake can be nut-free in recipe terms and still sit in a bakery where other nut-containing products exist. Those are not the same statement.',
          'So I tell customers to ask both questions clearly before they decide.'
        ]
      },
      {
        heading: 'Use real products as a reality check',
        paragraphs: [
          'Kyiv cake contains cashew nuts, and Snickers Cake is obviously not a nut-free route. Those are easy decisions. The more useful conversation is around cakes such as Vanilla Delicia or other simpler sponge-based briefs, where the design and handling plan still need to be confirmed honestly.',
          'A safer-looking cake design is not a guarantee by itself.'
        ]
      },
      {
        heading: 'Decoration can change the answer',
        paragraphs: [
          'A plain celebration cake and a heavily customised cake are not identical from an allergen-management point of view. Decorations, toppers, fillings, and shared tools all matter.',
          'I ask for the allergen requirement before we spend time on colours and styling.'
        ]
      },
      {
        heading: 'What I want customers to say up front',
        bullets: [
          'Is this a preference, an intolerance, or a diagnosed nut allergy?',
          'Do you need the full order, including decoration, handled to the same standard?',
          'Are there any other allergens that matter besides nuts?'
        ],
        paragraphs: [
          'That kind of clarity leads to better decisions. Vague wording does not.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['Is a cake with no nuts in the ingredients automatically safe?', 'No. Recipe and kitchen handling are separate questions, and both matter.'],
      ['Which cakes clearly contain nuts?', 'Kyiv cake includes cashew nuts, and Snickers Cake is a nut-based flavour profile, so neither belongs in a nut-free conversation.'],
      ['What should I tell the bakery first?', 'Say exactly whether it is a nut allergy, which other allergens matter, and whether decoration choices must follow the same rules.']
    ]),
    seo: {
      metaTitle: 'Nut free cakes Leeds | what to ask before ordering',
      metaDescription: 'Careful advice for customers looking for nut free cakes in Leeds, including what to ask about recipes, decoration, and kitchen handling.',
      keywords: ['nut free cakes leeds', 'nut free cake leeds', 'nut free birthday cake leeds']
    },
    coverImageAlt: 'Vanilla celebration cake used as a reference image for nut-free cake consultations',
    cardImageAlt: 'Close crop of a simple celebration cake used for nut-free planning guidance',
    requiredAnchors: ['nut free cakes in Leeds', 'Kyiv cake', 'Snickers Cake', 'Vanilla Delicia']
  },
  {
    title: 'Best cakes you can send by post in the UK',
    slug: 'best-cakes-you-can-send-by-post-uk',
    summary: 'A practical look at which cakes make sense by post, which ones do not, and why format matters more than marketing language.',
    dek: 'The best cakes you can send by post are not always the most decorated ones. I explain which formats travel well, where honey cake slices and cake cards make sense, and when a local full cake is the better idea.',
    topicSlug: 'cake-by-post',
    primaryProductSlug: 'cake-by-post',
    relatedProductSlugs: ['honey-cake-by-post', 'birthday-gift-by-post', 'happy-birthday-cake-card', 'xmas-gift-boxes-cake-with-card'],
    intro: [
      'Cake by post only works well when the cake has been designed for the post. That sounds obvious, but a lot of customers still assume any pretty cake can simply be boxed and sent.',
      'I separate postal formats from local celebration cakes because they solve different problems. Selling a risky idea helps nobody.'
    ],
    sections: [
      {
        heading: 'What travels best',
        paragraphs: [
          'Smaller portions, flatter formats, and cakes packed specifically for delivery usually travel best. Honey Cake by Post, gift slices, and cake-card formats all make sense because they are built around transport rather than around a tall display moment.',
          'That is different from a larger local celebration cake, which can prioritise presence and generous slicing.'
        ]
      },
      {
        heading: 'Why honey cake works so well by post',
        paragraphs: [
          'Honey cake slices hold their character well. They stay recognisable, satisfying, and easy to pack. That is one reason they appear so often in my postal range.',
          'The flavour also helps. A honey-led cake still feels thoughtful when it arrives as a smaller gift.'
        ]
      },
      {
        heading: 'When a full cake is the wrong postal choice',
        paragraphs: [
          'If the point of the cake is a highly detailed finish, a venue reveal, or a precise celebration setup, the conversation usually needs to move back to local delivery or collection instead.',
          'Postal orders do best when reliability is more important than theatre.'
        ]
      },
      {
        heading: 'My rule for choosing the format',
        bullets: [
          'Choose a postal slice or cake card when the gift is personal and easy handover matters.',
          'Choose a postal cake box when you want more substance without a local setup requirement.',
          'Choose local delivery or collection when the cake itself must perform as the centrepiece.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['What is the best cake to send by post?', 'Usually a cake designed specifically for postal delivery, such as a honey cake slice gift or another format packed for travel.'],
      ['Can I send a birthday cake by post?', 'Yes, but the best version is often a smaller postal gift rather than a large local-style celebration cake.'],
      ['Why do honey cake slices work well by post?', 'They hold their flavour and presentation well in compact packaging and still feel like a proper treat.']
    ]),
    seo: {
      metaTitle: 'Best cakes you can send by post in the UK',
      metaDescription: 'Find out which cakes travel best by post in the UK and when to choose postal slices, cake cards, or a larger local cake instead.',
      keywords: ['best cakes by post', 'cakes by post uk', 'postal cake gifts', 'honey cake by post']
    },
    coverImageAlt: 'Postal cake gift box with neatly packed cake ready for UK shipping',
    cardImageAlt: 'Close crop of a postal cake gift box prepared for UK delivery',
    requiredAnchors: ['cake by post', 'Honey Cake by Post', 'cake card', 'local delivery']
  },
  {
    title: 'Cake by post in the UK: a complete guide to choosing the right format',
    slug: 'cake-by-post-uk-complete-guide',
    summary: 'A fuller guide to postal cake orders in the UK, from choosing the right format to avoiding the mistakes that make delivery feel risky.',
    dek: 'Customers usually ask one broad question about cake by post in the UK, but there are really three decisions hiding inside it: what format to send, what the recipient will find easiest to receive, and when local delivery is the better route. I break that down here.',
    topicSlug: 'cake-by-post',
    primaryProductSlug: 'cake-by-post',
    relatedProductSlugs: ['honey-cake-by-post', 'birthday-gift-by-post', 'wedding-anniversary-gift-or-personalised-honey-cake'],
    intro: [
      'Cake by post can be brilliant, but only when the format matches the purpose. I see the trouble start when customers think in terms of one keyword and not in terms of the actual handover.',
      'The better question is simple: what does the recipient need this parcel to do when it lands at the door?'
    ],
    sections: [
      {
        heading: 'Start with the recipient, not the cake',
        paragraphs: [
          'If the parcel needs to slide easily into someone\'s week, a compact cake-card or postal slice gift is often stronger than a larger box. If it needs to feel more substantial, then a fuller cake-by-post box makes sense.',
          'That is the lens I use before anything else.'
        ]
      },
      {
        heading: 'What belongs in a postal range',
        paragraphs: [
          'The best postal products are the ones that have been packed, portioned, and described with travel in mind. Cake by Post, Honey Cake by Post, and personalised honey cake gifts all fit that brief.',
          'They are not trying to imitate a venue cake. They are solving a different problem.'
        ]
      },
      {
        heading: 'Where people make the wrong assumption',
        paragraphs: [
          'The mistake is assuming that because a cake looks lovely on a page, it should automatically be posted. I separate display cakes from posted gifts very deliberately, and sometimes I will send a customer back towards local delivery instead.',
          'That saves disappointment, and it protects the product itself.'
        ]
      },
      {
        heading: 'My practical shortlist',
        bullets: [
          'Choose Cake by Post when you want the broadest flexible postal option.',
          'Choose Honey Cake by Post when flavour and layered texture matter more than novelty.',
          'Choose a personalised honey cake gift when the message is part of the gesture.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['What does cake by post mean in practice?', 'It means a cake or cake gift packed specifically for postal delivery, not simply a local cake put in a box.'],
      ['What is the easiest postal cake format to receive?', 'Usually a smaller, well-packed gift such as a cake card, slice gift, or compact postal cake box.'],
      ['When should I avoid cake by post?', 'Avoid it when the cake needs to act as a large visual centrepiece or when a precise on-site setup matters more than convenience.']
    ]),
    seo: {
      metaTitle: 'Cake by post UK guide | how to choose the right format',
      metaDescription: 'A complete guide to cake by post in the UK, including which formats work best, when to choose honey cake gifts, and when local delivery is the better route.',
      keywords: ['cake by post uk', 'cakes by post', 'postal cake guide', 'send cake by post']
    },
    coverImageAlt: 'Postal cake box wrapped for UK delivery with neatly packed slices inside',
    cardImageAlt: 'Top view of a cake by post gift box prepared for shipping',
    requiredAnchors: ['cake by post', 'Cake by Post', 'Honey Cake by Post', 'local delivery']
  },
  {
    title: 'Gift cakes by post: when to send a hamper, a cake card, or a full cake',
    slug: 'gift-cakes-by-post-guide',
    summary: 'A guide to choosing the right postal cake gift, from smaller cake cards to fuller gift boxes, without overbuying or underdelivering.',
    dek: 'Not every occasion needs a full cake, and not every gift works as a tiny token either. This guide helps you choose between cake cards, slice gifts, postal cake boxes, and larger gifting formats so the parcel feels right when it arrives.',
    topicSlug: 'gift-ideas',
    primaryProductSlug: 'birthday-gift-by-post',
    relatedProductSlugs: ['happy-birthday-cake-card', '50th-birthday-cake-slice-card', 'xmas-gift-boxes-cake-with-card', 'cake-by-post'],
    intro: [
      'Gift cakes by post work best when the size of the gesture matches the relationship. That sounds emotional, but it is actually a practical buying decision.',
      'I would not send the same format to a close family birthday, a colleague, and a customer thank-you. The cake should fit the message.'
    ],
    sections: [
      {
        heading: 'When a cake card is enough',
        paragraphs: [
          'Cake cards and slice gifts are excellent when the surprise matters more than scale. They feel personal, easy to receive, and less formal than a full boxed cake.',
          'That is one reason Happy Birthday Cake Card and the 50th Birthday Cake Slice Card work so well.'
        ]
      },
      {
        heading: 'When to move up to a fuller gift box',
        paragraphs: [
          'Birthday Gift by Post makes more sense when you want a proper gift rather than a light touch. It still posts well, but it carries more weight in every sense.',
          'I use that format when the occasion deserves a clearer statement.'
        ]
      },
      {
        heading: 'What a full cake is for',
        paragraphs: [
          'A full Cake by Post order is best when the cake itself is the present, not just the message around it. It suits a recipient who will genuinely sit down and enjoy the cake, not just open the parcel and smile at the idea.',
          'That is the difference I keep in mind.'
        ]
      },
      {
        heading: 'How I decide for customers',
        bullets: [
          'Cake card: small, personal, and easy to send.',
          'Slice gift box: stronger birthday or anniversary gesture without becoming oversized.',
          'Full cake by post: the cake is the main event.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['What is the difference between a cake card and a postal cake gift?', 'A cake card is a smaller gesture, while a fuller postal gift box feels more like a complete present.'],
      ['Is a full cake always better?', 'No. Sometimes a smaller, sharper gift feels more thoughtful because it suits the occasion better.'],
      ['Which postal cake gift works for milestone birthdays?', 'The 50th Birthday Cake Slice Card and Birthday Gift by Post are both strong depending on whether you want lighter or fuller gifting.']
    ]),
    seo: {
      metaTitle: 'Gift cakes by post | hamper, cake card or full cake?',
      metaDescription: 'Choose the right postal cake gift with honest advice on cake cards, slice gifts, postal hampers, and full cake by post orders.',
      keywords: ['gift cakes by post', 'cake gift uk', 'cake cards', 'birthday gift by post']
    },
    coverImageAlt: 'Birthday Gift by Post box with honey cake gift ready to send',
    cardImageAlt: 'Close crop of a postal birthday cake gift box',
    requiredAnchors: ['gift cakes by post', 'Happy Birthday Cake Card', '50th Birthday Cake Slice Card', 'Birthday Gift by Post']
  },
  {
    title: 'Why more people order letterbox cakes online',
    slug: 'top-5-reasons-order-letterbox-cakes-online',
    summary: 'A direct look at why letterbox cake orders keep growing and where the format genuinely helps rather than just sounding convenient.',
    dek: 'Letterbox cakes are popular for good reasons, but the reasons are practical rather than trendy. This article looks at ease of delivery, smaller gifting, and why compact formats often beat oversized theatre when the parcel has to travel.',
    topicSlug: 'cake-by-post',
    primaryProductSlug: 'happy-birthday-cake-card',
    relatedProductSlugs: ['50th-birthday-cake-slice-card', 'birthday-gift-by-post', 'cake-by-post', 'wedding-anniversary-gift-or-personalised-honey-cake'],
    intro: [
      'Letterbox cakes appeal because they remove friction. The recipient does not need a big setup, a special handover, or a full party plan to enjoy them.',
      'The format is strongest when it feels deliberate rather than gimmicky.'
    ],
    sections: [
      {
        heading: 'They are easier to receive',
        paragraphs: [
          'A compact cake-card or postal slice is simpler for both sender and recipient. That practical ease matters more than people admit.',
          'If the gift arrives neatly and without fuss, the whole experience improves.'
        ]
      },
      {
        heading: 'They suit ordinary generosity',
        paragraphs: [
          'Not every occasion is a full-birthday-cake moment. Letterbox-friendly cakes are strong when you want to say thank you, happy birthday, or I am thinking of you without overcomplicating the gesture.',
          'That is exactly where cake cards shine.'
        ]
      },
      {
        heading: 'They keep the product honest',
        paragraphs: [
          'A smaller format forces a bakery to think properly about packing, slicing, and what the customer sees when the parcel opens. I actually like that discipline.',
          'It separates a thought-through product from a decorative promise.'
        ]
      },
      {
        heading: 'My practical view',
        bullets: [
          'Use a cake card for the lightest gesture.',
          'Use a slice gift when you want more substance.',
          'Use a bigger postal box only when the cake itself is the main present.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['Do letterbox cakes feel less special?', 'Not when they are packed properly and matched to the occasion. Often they feel more considered, not less.'],
      ['What kind of cake works as a letterbox gift?', 'Smaller, stable formats such as cake cards and postal slices work best.'],
      ['Are letterbox cakes only for birthdays?', 'No. They work well for thank-you gifts, anniversaries, and simple thoughtful surprises too.']
    ]),
    seo: {
      metaTitle: 'Why order letterbox cakes online | practical reasons',
      metaDescription: 'See why more customers order letterbox cakes online and when cake cards, slice gifts, and other compact postal formats make the most sense.',
      keywords: ['letterbox cakes', 'order letterbox cakes online', 'cake card gift', 'postal cake slice']
    },
    coverImageAlt: 'Cake card style postal gift prepared in compact letterbox-friendly packaging',
    cardImageAlt: 'Close crop of a compact cake gift designed for letterbox delivery',
    requiredAnchors: ['letterbox cakes', 'cake cards', 'slice gift', 'letterbox-friendly']
  },
  {
    title: 'Birthday gifts by post that feel personal without sending a whole cake',
    slug: 'birthday-gifts-by-post',
    summary: 'A practical guide to choosing birthday cake gifts by post when you want them to feel personal, generous, and easy to receive.',
    dek: 'Birthday gifts by post work best when the parcel feels intentional rather than oversized. I explain when I would send a personalised honey cake gift, when a cake card is enough, and when a full cake-by-post order makes sense.',
    topicSlug: 'gift-ideas',
    primaryProductSlug: 'birthday-gift-by-post',
    relatedProductSlugs: ['happy-birthday-cake-card', '50th-birthday-cake-slice-card', 'cake-by-post', 'wedding-anniversary-gift-or-personalised-honey-cake'],
    intro: [
      'Birthday gifting by post is not about sending the biggest parcel possible. It is about sending something that feels warm, deliberate, and easy to enjoy on the other side.',
      'Format decides whether the gift feels natural or overblown. The right product does a lot of the emotional work before the box is even opened.'
    ],
    sections: [
      {
        heading: 'When a personalised honey cake gift is the right size',
        paragraphs: [
          'Birthday Gift by Post works well because it has enough presence to feel generous while still arriving as a tidy, manageable parcel.',
          'It is the format I suggest when the cake should feel like a real present rather than a novelty extra.'
        ]
      },
      {
        heading: 'When a cake card is better',
        paragraphs: [
          'Sometimes the sweeter decision is the smaller one. A Happy Birthday Cake Card or 50th Birthday Cake Slice Card can land perfectly when you want a smile, not a full event.',
          'I use those when simplicity helps more than size.'
        ]
      },
      {
        heading: 'When to move up to a full cake by post',
        paragraphs: [
          'If the recipient genuinely loves cake and will share it or make a moment of it, Cake by Post becomes more attractive. That is when the cake is the gift, not just the message carrier.',
          'There is a difference, and customers feel it immediately.'
        ]
      },
      {
        heading: 'My birthday-gift rule',
        paragraphs: [
          'I ask myself one question: should this parcel feel light and thoughtful, or substantial and celebratory? Once that is clear, the right product is usually obvious.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['What is a good birthday cake gift to post?', 'A personalised honey cake gift or a cake card is usually the safest choice because the parcel still feels easy to receive.'],
      ['Is a cake card too small for a birthday?', 'Not if the relationship and occasion suit it. Smaller can feel more thoughtful when the format is right.'],
      ['When should I send a full cake by post?', 'Send a fuller cake when the cake itself is the main present and the recipient will genuinely make time for it.']
    ]),
    seo: {
      metaTitle: 'Birthday gifts by post | personal cake gifts that work',
      metaDescription: 'Choose better birthday gifts by post with honest advice on personalised honey cake gifts, cake cards, and when a full cake delivery makes sense.',
      keywords: ['birthday gifts by post', 'cake birthday gift by post', 'personalised honey cake gift', 'birthday cake card']
    },
    coverImageAlt: 'Personalised birthday honey cake gift box ready to post',
    cardImageAlt: 'Close crop of a birthday cake gift by post with card and cake inside',
    requiredAnchors: ['Birthday Gift by Post', 'Happy Birthday Cake Card', '50th Birthday Cake Slice Card', 'Cake by Post']
  },
  {
    title: 'Cake cards and cake slice gifts: when a smaller postal gift makes more sense',
    slug: 'cake-cards-and-cake-slice-gifts',
    summary: 'An honest guide to cake cards and cake slice gifts for buyers who want something personal, neat, and well judged.',
    dek: 'Cake cards and slice gifts are often more useful than a larger parcel. I explain when that smaller format feels smarter, who it suits, and why compact gifting should not be treated as a lesser option.',
    topicSlug: 'gift-ideas',
    primaryProductSlug: 'happy-birthday-cake-card',
    relatedProductSlugs: ['50th-birthday-cake-slice-card', 'birthday-gift-by-post', 'wedding-anniversary-gift-or-personalised-honey-cake', 'valentine-s-day-honey-cake-slice'],
    intro: [
      'Small postal cake gifts work because they remove pressure. The recipient can enjoy the gesture without needing a full celebration setup.',
      'That restraint helps. A cake card can feel more precise than a bigger box.'
    ],
    sections: [
      {
        heading: 'Why smaller gifts often feel more personal',
        paragraphs: [
          'A cake card is intimate. It feels like someone thought about you, not like someone clicked the largest option on a page.',
          'That is one reason these formats work so well for birthdays, anniversaries, and lighter celebrations.'
        ]
      },
      {
        heading: 'What makes a strong cake slice gift',
        paragraphs: [
          'The product needs to be tidy, stable, and genuinely good to eat. Two slices of handmade honey cake in a neat presentation can do more than a bigger gift that feels clumsy.',
          'So I keep coming back to slice-based gifting.'
        ]
      },
      {
        heading: 'When not to choose the smaller format',
        paragraphs: [
          'If the parcel needs to carry more weight emotionally, or if you want the cake itself to be the main event, move up to a fuller postal gift.',
          'The smaller format is strongest when it stays honest about what it is.'
        ]
      },
      {
        heading: 'The compact options I trust most',
        bullets: [
          'Happy Birthday Cake Card for a clean, cheerful birthday gesture.',
          '50th Birthday Cake Slice Card for a milestone with a little more presence.',
          'Valentine\'s Day Honey Cake Slice when the occasion suits a smaller romantic parcel.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['What is a cake card?', 'It is a compact posted gift that combines the message and the cake into one neat parcel.'],
      ['Are cake slice gifts good for milestone birthdays?', 'Yes. A well-presented slice gift can feel thoughtful and specific, especially for milestone ages.'],
      ['When should I choose a bigger postal gift instead?', 'Choose the bigger format when you want the cake itself to be the centre of the gift, not just the gesture around it.']
    ]),
    seo: {
      metaTitle: 'Cake cards and cake slice gifts | when smaller works better',
      metaDescription: 'Learn when cake cards and cake slice gifts make more sense than a larger postal cake, with practical advice on birthdays, anniversaries, and smaller celebrations.',
      keywords: ['cake cards', 'cake slice gifts', 'postal cake card', 'honey cake slice gift']
    },
    coverImageAlt: 'Cake card gift box with honey cake slices and personalised message',
    cardImageAlt: 'Close crop of a cake card style gift with honey cake slices',
    requiredAnchors: ['cake card', 'slice gift', 'Happy Birthday Cake Card', '50th Birthday Cake Slice Card']
  },
  {
    title: 'Wedding cake flavours for couples who want something personal, not too sweet, and actually memorable',
    slug: 'wedding-cake-flavours-guide',
    summary: 'A flavour-first wedding cake guide for couples who want the cake to be remembered for taste as well as appearance.',
    dek: 'Wedding cake flavour should not be an afterthought. I explain how I help couples choose between softer, richer, and more textured options so the cake suits the day and not just the photos.',
    topicSlug: 'custom-cakes',
    primaryProductSlug: 'ukrainian-wedding-bread-korovai',
    relatedProductSlugs: ['honey-cake-medovik', 'napoleon-cake', 'kyiv-cake'],
    intro: [
      'Wedding cake flavour decisions go wrong when couples choose only by appearance. The cake still has to be eaten, and people remember that part.',
      'I always bring the conversation back to balance, portion style, and the mood of the wedding rather than just the finish on the outside.'
    ],
    sections: [
      {
        heading: 'Start with the way the cake will be served',
        paragraphs: [
          'A formal plated dessert asks for something different from relaxed party slices in the evening. The same flavour can land very differently depending on how guests meet it.',
          'I never start with colours. I start with service, because that decision changes the flavour choice as well.'
        ]
      },
      {
        heading: 'The flavour routes I return to most often',
        paragraphs: [
          'Medovik is a strong wedding choice when a couple wants something distinctive but gentle. Napoleon works when they want elegance and refined texture. Kyiv cake suits couples who want a richer, more contrasting bite.',
          'There is no single right answer. The flavour has to match the feel of the day.'
        ]
      },
      {
        heading: 'Where Korovai fits in',
        paragraphs: [
          'Korovai is different from a standard wedding cake flavour discussion because Ukrainian wedding bread carries symbolism as well as flavour. When a couple wants that tradition on the table, it changes the brief completely.',
          'I treat it as a meaningful wedding element, not as a decorative extra.'
        ]
      },
      {
        heading: 'My strongest advice to couples',
        paragraphs: [
          'Do not pick a wedding flavour only because it sounds safe. Choose the one that still feels like you when the first slice is cut. That is the moment guests remember.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['What wedding cake flavour is least likely to feel too sweet?', 'Medovik is often the calmest option when couples want flavour and softness without a heavy finish.'],
      ['Is Napoleon cake suitable for weddings?', 'Yes. It is especially good when you want elegant slices and layered pastry texture.'],
      ['What is Korovai used for?', 'Korovai is Ukrainian wedding bread with symbolic meaning, so it belongs in a wedding tradition conversation as well as a food one.']
    ]),
    seo: {
      metaTitle: 'Wedding cake flavours guide | personal, balanced choices',
      metaDescription: 'Choose wedding cake flavours with honest advice on Medovik, Napoleon, Kyiv cake, and Korovai for couples who want a cake guests will remember.',
      keywords: ['wedding cake flavours', 'ukrainian wedding cake', 'korovai', 'medovik wedding cake']
    },
    coverImageAlt: 'Korovai wedding bread styled for a Ukrainian wedding table',
    cardImageAlt: 'Close crop of Korovai decoration and braided wedding detail',
    requiredAnchors: ['wedding cake flavour', 'Medovik', 'Napoleon', 'Kyiv cake', 'Korovai']
  },
  createLocalDeliveryDraft({
    slug: 'cake-delivery-wakefield-guide',
    title: 'Cake delivery in Wakefield: how I help customers choose a cake that still feels right on arrival',
    summary: 'A Wakefield cake delivery guide focused on sensible booking, stable cake choices, and avoiding decorative decisions that do not travel well.',
    dek: 'Customers asking for cake delivery in Wakefield usually want reassurance. I think clarity is more useful: which cakes travel calmly, what to book early, and when a simpler finish gives you a better result.',
    imageProductSlug: 'fruit-cake-svit-berry-or-light-berry-cake-with-cream',
    relatedProductSlugs: ['fruit-cake-svit-berry-or-light-berry-cake-with-cream', 'honey-cake-medovik', 'napoleon-cake', 'vanilla-delicia-birthday-cake'],
    intro: [
      'Wakefield orders often come with a family feel. It might be a birthday at home, a garden gathering, or one of those celebrations where the cake is passed around quickly and judged by how happily people eat it, not by how long they stare at it.',
      'That changes what I suggest. In Wakefield, I care a lot about ease of serving and how relaxed the cake still looks once the box is open.'
    ],
    sections: [
      {
        heading: 'Wakefield is often more about the table than the photograph',
        paragraphs: [
          'A lot of Wakefield orders are meant to be enjoyed straight away by family and friends rather than unveiled at a venue under perfect lighting. Because of that, I often steer people towards cakes that cut generously and still look composed without delicate fuss.',
          'That usually means flavour-led choices and a finish that can cope with real handling instead of one dramatic detail that only works in the studio.'
        ]
      },
      {
        heading: 'Where Fruit, Medovik, and Napoleon each make sense',
        paragraphs: [
          'Fruit-led celebration cakes work well when the brief is cheerful and easy to serve. Medovik is often better when the customer wants something less obvious and less sugary than a standard birthday sponge. Napoleon comes in when the person ordering cares about texture and wants the slices to feel a little more elegant.',
          'Those are three different moods, which is why decoration is not my starting point in Wakefield. I start with how the group is actually going to eat.'
        ]
      },
      {
        heading: 'The Wakefield details I want settled early',
        paragraphs: [
          'If there is a venue handover, a short service window, or a taller custom design, I want that pinned down early.',
          'Wakefield can be flexible, but only until the timing and setup start pushing the cake into something more fragile than it needs to be.'
        ]
      },
      {
        heading: 'What I ask before I price the order',
        numbers: [
          'How many people are likely to eat it?',
          'Will the cake be cut after a meal or as part of an open party table?',
          'Does the customer care more about flavour, finish, or serving ease?'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['Which cake works well for Wakefield delivery?', 'Stable layered cakes and neatly finished celebration cakes usually work best.'],
      ['Should I book a custom Wakefield cake early?', 'Yes, especially for weekends, venues, or more decorative briefs.'],
      ['Is lighter flavour better for delivery?', 'Not always, but balanced flavours and calmer finishes often travel more gracefully.']
    ]),
    seo: {
      metaTitle: 'Cake delivery Wakefield guide | what travels well',
      metaDescription: 'Useful advice on cake delivery in Wakefield, including what to order, when to book early, and which cakes still feel right after the journey.',
      keywords: ['cake delivery wakefield', 'birthday cake wakefield', 'cakes wakefield']
    },
    requiredAnchors: ['Wakefield', 'Medovik', 'Napoleon', 'Fruit'],
    coverImageAlt: 'Berry celebration cake used as a reference for Wakefield cake delivery',
    cardImageAlt: 'Close crop of a berry celebration cake suitable for Wakefield delivery'
  }),
  createLocalDeliveryDraft({
    slug: 'cake-delivery-huddersfield-guide',
    title: 'Cake delivery in Huddersfield: choosing a cake that is worth the journey',
    summary: 'A practical Huddersfield cake delivery guide focused on flavour, travel, and realistic expectations for celebration orders.',
    dek: 'Cake delivery in Huddersfield is easiest when the cake and the route are considered together. I explain which cakes I trust most for the journey and when I tell customers to simplify the brief.',
    imageProductSlug: 'napoleon-cake',
    relatedProductSlugs: ['napoleon-cake', 'honey-cake-medovik', 'vanilla-delicia-birthday-cake', 'fruit-cake-svit-berry-or-light-berry-cake-with-cream'],
    intro: [
      'Huddersfield is where weak briefs start to show themselves. The route is not extreme, but it is long enough to expose a cake that was designed for attention rather than for travel.',
      'So I talk more bluntly about trade-offs on Huddersfield orders. The journey will tell the truth anyway.'
    ],
    sections: [
      {
        heading: 'The first thing I trim back for Huddersfield',
        paragraphs: [
          'I question sharply finished celebration cakes much harder for Huddersfield than I would for a short Leeds handover. If the design depends on precision more than flavour, it usually needs simplifying.',
          'That is not caution for its own sake. It is how I stop the customer paying for a look the journey may undo.'
        ]
      },
      {
        heading: 'Why Napoleon often leads the conversation here',
        paragraphs: [
          'Napoleon is often my first Huddersfield suggestion because it already looks refined without needing a lot of extra decoration. Medovik also travels beautifully when layered flavour is the priority.',
          'Vanilla Delicia still has a place when the customer wants a more classic celebration look, but I keep the finish sensible for the route.'
        ]
      },
      {
        heading: 'When I tell customers collection may be the cleaner answer',
        paragraphs: [
          'If the event timing is narrow, the topper is custom, or the visual brief matters more than the eating side, I sometimes tell customers that collection may be the cleaner answer.',
          'Huddersfield is not the route where I enjoy last-minute complexity.'
        ]
      },
      {
        heading: 'The trade-offs to decide before I confirm it',
        bullets: [
          'Whether delivery is essential or collection would reduce stress.',
          'Whether the cake is expected to look polished or dramatic.',
          'Whether flavour matters more than decorative detail.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['Which cakes do you trust most for Huddersfield delivery?', 'Usually cakes with steady structure and moderate decoration rather than fragile showpiece finishes.'],
      ['Is Napoleon cake good for a longer local route?', 'Yes, especially when the customer wants an elegant cake that slices neatly and does not rely on heavy decoration.'],
      ['What should I confirm before placing a Huddersfield order?', 'Serving size, time window, and whether delivery or collection is the better fit.']
    ]),
    seo: {
      metaTitle: 'Cake delivery Huddersfield guide | worth the journey',
      metaDescription: 'Helpful advice on cake delivery in Huddersfield, including which cakes travel well and when to book early for the best result.',
      keywords: ['cake delivery huddersfield', 'cakes huddersfield', 'birthday cakes huddersfield']
    },
    requiredAnchors: ['Huddersfield', 'Napoleon', 'Medovik', 'Vanilla Delicia'],
    coverImageAlt: 'Napoleon cake prepared as a strong option for Huddersfield delivery',
    cardImageAlt: 'Close crop of Napoleon cake for a Huddersfield delivery guide'
  }),
  createLocalDeliveryDraft({
    slug: 'cake-delivery-bradford-guide',
    title: 'Cake delivery in Bradford: how to order without choosing the wrong style of cake',
    summary: 'A Bradford delivery guide that helps customers choose a cake style that still works once it arrives, not just one that looks good in a photo.',
    dek: 'If you need cake delivery in Bradford, choose the cake for the real handover, not just the Instagram idea. I explain what I recommend most often, what to book early, and where customers make the wrong assumptions.',
    imageProductSlug: 'honey-cake-medovik',
    relatedProductSlugs: ['honey-cake-medovik', 'vanilla-delicia-birthday-cake', 'napoleon-cake', 'kyiv-cake'],
    intro: [
      'Bradford orders often come down to audience. I need to know whether the cake is for a mixed family table, a birthday crowd that wants something easy and cheerful, or a group that will genuinely notice a more unusual flavour.',
      'Once I know that, Bradford becomes simpler. The wrong cake usually starts with the wrong assumption about who is actually going to eat it.'
    ],
    sections: [
      {
        heading: 'The main Bradford decision is flavour before finish',
        paragraphs: [
          'The first Bradford question is usually whether to go for something adaptable or something more distinctive. Those are not the same brief.',
          'If the event is large and the cake will be cut quickly, I lean towards cakes that keep their character even when the serving gets a little less careful.'
        ]
      },
      {
        heading: 'Where Medovik, Vanilla Delicia, and Kyiv cake each belong',
        paragraphs: [
          'Medovik suits Bradford orders where people want something balanced and a little different without frightening the room. Vanilla Delicia gives me room when the brief needs more visual customisation and a more familiar party feel.',
          'Kyiv cake only belongs in the conversation when the group genuinely likes a richer, nut-led dessert. It is not a universal answer, and I treat it that way.'
        ]
      },
      {
        heading: 'What I insist on settling before I say yes',
        paragraphs: [
          'Large numbers, a narrow handover slot, or a heavily customised design all need clear decisions before I confirm anything.',
          'If too much is still moving at the last minute, the cake ends up carrying the uncertainty instead of just doing its job.'
        ]
      },
      {
        heading: 'The three things that make Bradford orders easier',
        bullets: [
          'Decide how the cake will be served before choosing the finish.',
          'Be honest about whether guests like richer flavours or lighter ones.',
          'Bring up nut concerns before Kyiv cake enters the conversation.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['What cake do you most often suggest for Bradford delivery?', 'Medovik and calmer celebration cakes are frequent recommendations because they balance flavour and practicality.'],
      ['Should I choose a heavily decorated cake for Bradford delivery?', 'Only if the timing and route can support it. Otherwise a cleaner finish often gives the better result.'],
      ['Is Kyiv cake suitable for everyone?', 'No. It is richer and contains cashew nuts, so it suits a specific audience rather than every celebration.']
    ]),
    seo: {
      metaTitle: 'Cake delivery Bradford guide | how to choose well',
      metaDescription: 'Practical advice on cake delivery in Bradford, including which cake styles travel best and when to book your order earlier.',
      keywords: ['cake delivery bradford', 'cakes bradford', 'birthday cake bradford']
    },
    requiredAnchors: ['Bradford', 'Medovik', 'Vanilla Delicia', 'Kyiv cake'],
    coverImageAlt: 'Medovik honey cake suggested as a practical option for Bradford delivery',
    cardImageAlt: 'Close crop of Medovik for a Bradford cake delivery article'
  }),
  createLocalDeliveryDraft({
    slug: 'cake-delivery-york-guide',
    title: 'Cake delivery in York: what I recommend when the cake needs to travel further',
    summary: 'A York cake delivery guide that focuses on planning, travel distance, and the cake styles I trust most for a longer local journey.',
    dek: 'York orders need a little more planning than a short Leeds drop. I explain which cakes I trust most for the trip, when I advise earlier booking, and how to decide between delivery and collection.',
    imageProductSlug: 'honey-cake-medovik',
    relatedProductSlugs: ['honey-cake-medovik', 'napoleon-cake', 'vanilla-delicia-birthday-cake', 'fruit-cake-svit-berry-or-light-berry-cake-with-cream'],
    intro: [
      'York orders ask more of the plan because the journey is longer and the margin for a sloppy choice is smaller.',
      'For York, I care less about the idea on paper and more about whether the cake will still look calm, slice well, and feel worth the drive once the box is opened.'
    ],
    sections: [
      {
        heading: 'York is where I strip the brief back first',
        paragraphs: [
          'A longer drive changes the kind of cake I am comfortable sending. Stronger structure, calmer decoration, and a clear serving plan matter more here than on a short local handover.',
          'That does not make York orders dull. It just means I filter the options more carefully before saying yes.'
        ]
      },
      {
        heading: 'The cakes I trust most for York',
        paragraphs: [
          'Medovik is often my first York suggestion because it keeps its character beautifully. Napoleon is excellent when the customer wants elegance without a lot of extra structure riding on the outside. Fruit and vanilla celebration cakes can also work very well, but I keep the finish realistic for the route.',
          'The cake needs to arrive looking intentional, not like a compromise made halfway through the drive.'
        ]
      },
      {
        heading: 'The York orders where I mention collection early',
        paragraphs: [
          'If the design is delicate, the timing is narrow, or the order matters in a very exact visual way, I may say plainly that collection is the better option.',
          'That is not me being awkward. It is me protecting the moment the cake is finally seen.'
        ]
      },
      {
        heading: 'What I need to know before I send a cake that far',
        numbers: [
          'Tell me how formal the occasion is.',
          'Tell me whether the cake is dessert, party food, or a photo moment.',
          'Tell me if you would accept collection if it gives the cleaner result.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['What is the safest cake style for a longer York delivery?', 'Usually a cake with steady layering and moderate decoration rather than a fragile showpiece finish.'],
      ['Should I collect instead of using delivery for York?', 'Sometimes, yes. If the design is delicate or the timing is very tight, collection can be the stronger option.'],
      ['Is Medovik a good York delivery cake?', 'Yes. It is one of the cakes I trust most when flavour and steady structure both matter.']
    ]),
    seo: {
      metaTitle: 'Cake delivery York guide | what I recommend most',
      metaDescription: 'Read practical advice on cake delivery in York, including which cakes travel best, when to book earlier, and when collection is smarter.',
      keywords: ['cake delivery york', 'cakes york', 'birthday cake york']
    },
    requiredAnchors: ['York', 'Medovik', 'Napoleon', 'collection'],
    coverImageAlt: 'Medovik cake selected as a dependable option for York delivery',
    cardImageAlt: 'Close crop of a layered Medovik cake for York delivery guidance'
  }),
  {
    title: 'Nut free birthday cakes: how to plan one without guessing',
    slug: 'nut-free-birthday-cakes-guide',
    summary: 'A focused birthday-cake guide for customers who need nut-free planning handled carefully and honestly.',
    dek: 'Nut free birthday cakes need more than a quick flavour pick. I explain how I think through recipe, decoration, fillings, and cross-contact questions so the order starts with the right conversation.',
    topicSlug: 'celebration-planning',
    imageProductSlug: 'vanilla-delicia-birthday-cake',
    relatedProductSlugs: [],
    intro: [
      'Nut free birthday cakes bring more pressure because the cake is often the centrepiece. If nuts are part of the brief, that pressure should lead to better questions, not vaguer assumptions.',
      'I treat the allergen conversation as the first design step, not as a note to add at the end.'
    ],
    sections: [
      {
        heading: 'Why birthdays change the conversation',
        paragraphs: [
          'Birthday cakes often include more decoration, more filling choices, and more serving pressure than smaller celebration orders. That can affect how a nut-free brief is planned and what is sensible to promise.',
          'I want families to know that before they commit to a style.'
        ]
      },
      {
        heading: 'Which flavour briefs are usually easier to discuss',
        paragraphs: [
          'Simpler sponge-based directions such as Vanilla Delicia or fruit-led celebration cakes give more room for a careful conversation than flavour directions built around nuts.',
          'Kyiv cake and Snickers Cake immediately tell us the answer is no. That clarity is useful.'
        ]
      },
      {
        heading: 'Decoration matters as much as the sponge',
        paragraphs: [
          'A nut-free sponge does not solve the whole brief if the final decoration, topper, or shared handling changes the risk picture. So I always talk through the whole order.',
          'It is not me being difficult. It is me being accurate.'
        ]
      },
      {
        heading: 'What I ask before I quote',
        numbers: [
          'Who is the cake for and how strict does the allergen management need to be?',
          'Do you need a simple finish, or are you asking for a decorated centrepiece?',
          'Are there other allergens in the picture besides nuts?'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['Are all birthday cakes suitable for nut-free requests?', 'No. Some flavour directions are clearly unsuitable, and even simpler cakes still need careful discussion around handling and decoration.'],
      ['Which cakes clearly do not fit a nut-free brief?', 'Kyiv cake and Snickers Cake are obvious examples because nuts are central to them.'],
      ['Why do you ask about decoration so early?', 'Because decoration can change the practical answer just as much as the recipe itself.']
    ]),
    seo: {
      metaTitle: 'Nut free birthday cakes | how to plan carefully',
      metaDescription: 'Plan nut free birthday cakes more carefully with clear advice on flavour choices, decoration, and the questions a bakery should answer honestly.',
      keywords: ['nut free birthday cakes', 'nut free birthday cake guide', 'birthday cakes without nuts']
    },
    coverImageAlt: 'Birthday celebration cake used as a planning reference for nut-free birthday orders',
    cardImageAlt: 'Close crop of a birthday celebration cake for nut-free planning guidance',
    requiredAnchors: ['nut free birthday cakes', 'Vanilla Delicia', 'Kyiv cake', 'Snickers Cake']
  },
  {
    title: 'Cake storage and preservation: what I tell customers once the cake gets home',
    slug: 'cake-storage-and-preservation-guide',
    summary: 'A practical cake storage guide based on the real differences between layered honey cake, pastry cakes, and decorated celebration cakes.',
    dek: 'Cake storage advice only helps when it matches the cake in front of you. I explain how I think about Medovik, Napoleon, and decorated celebration cakes once they leave the bakery, without pretending one rule covers everything.',
    topicSlug: 'cake-care-and-sizing',
    primaryProductSlug: 'honey-cake-medovik',
    relatedProductSlugs: ['napoleon-cake', 'vanilla-delicia-birthday-cake', 'cake-by-post'],
    intro: [
      'Cake storage is where generic advice usually falls apart. Different cakes behave differently, and customers need that said plainly instead of handed one recycled paragraph.',
      'The real question is not just "Should it go in the fridge?" It is "What kind of cake is it, and when are you planning to serve it?"'
    ],
    sections: [
      {
        heading: 'Medovik, Napoleon, and sponge cakes do not behave the same way',
        paragraphs: [
          'Medovik settles beautifully because the layers soften into each other. Napoleon depends more on preserving that pastry-and-cream contrast. A decorated sponge cake has its own needs again, especially if the finish matters visually.',
          'So I never give one blanket answer for every cake.'
        ]
      },
      {
        heading: 'What I tell customers first',
        bullets: [
          'Keep the cake boxed until you need it so it is protected and does not dry unnecessarily.',
          'Follow the storage note that fits the actual cake, not a generic online rule.',
          'Give the cake time to come into its best eating condition before serving if I have advised that.'
        ],
        paragraphs: [
          'Most storage mistakes come from moving too quickly and improvising.'
        ]
      },
      {
        heading: 'Why preservation is not just about freshness',
        paragraphs: [
          'Customers often think storage is only about safety, but texture matters just as much. A cake can be perfectly edible and still be served in a way that hides its best qualities.',
          'I care about the eating moment, not just the survival of the cake.'
        ]
      },
      {
        heading: 'My simple rule',
        paragraphs: [
          'If you are unsure, ask the bakery that made the cake and ask before serving time arrives. Accurate product-specific advice will always beat a generic search result.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['Do all cakes store the same way?', 'No. Medovik, Napoleon, and decorated sponge cakes all behave differently.'],
      ['Why does texture matter in storage advice?', 'Because the best flavour can be lost if the cake is served in the wrong condition for its structure.'],
      ['What should I do if I am unsure?', 'Ask the bakery that made the cake. Product-specific advice is always better than a generic rule.']
    ]),
    seo: {
      metaTitle: 'Cake storage and preservation | practical guide',
      metaDescription: 'Useful cake storage and preservation advice for Medovik, Napoleon, and decorated celebration cakes once they get home.',
      keywords: ['cake storage guide', 'cake preservation', 'how to store cake', 'medovik storage']
    },
    coverImageAlt: 'Medovik honey cake boxed for careful storage after collection',
    cardImageAlt: 'Close crop of a boxed Medovik cake for storage guidance',
    requiredAnchors: ['cake storage', 'Medovik', 'Napoleon', 'decorated sponge cake']
  },
  {
    title: 'Cake size and portions: how I help customers order enough without going too big',
    slug: 'cake-size-and-portions-guide',
    summary: 'A practical portion guide for customers choosing cake size for birthdays, parties, and more formal celebrations.',
    dek: 'Cake size only becomes clear when you know how the cake will be served. I explain how I think about dessert portions, party slices, and why bigger is not always better when you want the cake to be enjoyed properly.',
    topicSlug: 'cake-care-and-sizing',
    imageProductSlug: 'vanilla-delicia-birthday-cake',
    relatedProductSlugs: ['vanilla-delicia-birthday-cake', 'chocolate-delicia-sponge-cake-for-parties', 'honey-cake-medovik', 'napoleon-cake'],
    intro: [
      'Cake size questions sound simple until you ask how the cake will actually be eaten. Ten people taking proper dessert portions is a different order from ten people taking polite party slices.',
      'It is better to have that honest conversation at the start than leave someone with the wrong size on the day.'
    ],
    sections: [
      {
        heading: 'Serving style changes everything',
        paragraphs: [
          'If the cake is one part of a large dessert table, portions will be smaller. If it is the headline dessert after a meal, the slices need more substance.',
          'So I ask about the event, not just the headcount.'
        ]
      },
      {
        heading: 'Why design affects size too',
        paragraphs: [
          'Some cakes are built mainly as celebration sponges, some are layered more richly, and some need enough height to carry the design comfortably. Vanilla Delicia, Chocolate Delicia, Medovik, and Napoleon do not all portion out in the same emotional way.',
          'Good sizing should respect both appetite and presentation.'
        ]
      },
      {
        heading: 'The mistake I see most often',
        paragraphs: [
          'People either overbuy because they are worried about running short, or underbuy because they imagine every guest will take a tiny slice. Both problems come from guessing rather than planning.',
          'I anchor the answer in the event format.'
        ]
      },
      {
        heading: 'What to tell me for a better size recommendation',
        numbers: [
          'How many people are likely to eat the cake, not just attend.',
          'Whether it will be dessert, party slices, or part of a wider table.',
          'Whether the cake needs to carry a detailed celebration design.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['Does the same cake size work for every event?', 'No. Portion style changes depending on whether the cake is dessert, party food, or part of a larger spread.'],
      ['Why do you ask about design when sizing a cake?', 'Because the design can affect how the cake needs to be built and therefore what size is sensible.'],
      ['What is the best way to avoid ordering too much or too little?', 'Tell the bakery how the cake will actually be served, not just the guest count.']
    ]),
    seo: {
      metaTitle: 'Cake size and portions guide | order the right amount',
      metaDescription: 'Use this cake size and portions guide to order the right amount for birthdays, parties, and formal celebrations without guessing.',
      keywords: ['cake size guide', 'cake portions', 'what size cake do I need', 'cake servings']
    },
    coverImageAlt: 'Celebration cake used as a reference for portion and size planning',
    cardImageAlt: 'Close crop of a celebration cake for cake size guidance',
    requiredAnchors: ['cake size', 'party slices', 'Vanilla Delicia', 'Napoleon']
  },
  {
    title: 'How to surprise someone with cake delivery by post without making it feel generic',
    slug: 'how-surprise-someone-cake-delivery-post',
    summary: 'A practical guide to sending cake as a surprise so it feels thoughtful, not random, when it arrives.',
    dek: 'A surprise cake gift works because the parcel feels personal, not because it is huge. I explain how I think about timing, format, and message so the delivery lands as a real gesture rather than just another box.',
    topicSlug: 'gift-ideas',
    primaryProductSlug: 'birthday-gift-by-post',
    relatedProductSlugs: ['happy-birthday-cake-card', 'cake-by-post', 'wedding-anniversary-gift-or-personalised-honey-cake', 'honey-cake-by-post'],
    intro: [
      'Surprise cake delivery is a lovely idea when the format matches the relationship and the timing is thought through.',
      'The best surprises are rarely the biggest ones. They feel like somebody paid attention.'
    ],
    sections: [
      {
        heading: 'The surprise works before the box opens',
        paragraphs: [
          'Choose a parcel that feels believable for the person receiving it. A cake card, a birthday gift by post, or a personalised honey cake gift can all feel exactly right depending on the relationship.',
          'That is the part people often underestimate.'
        ]
      },
      {
        heading: 'Timing matters more than scale',
        paragraphs: [
          'A smaller parcel arriving on the right day usually beats a larger one arriving awkwardly. I would always choose timing over unnecessary size.',
          'That is especially true for posted cake gifts.'
        ]
      },
      {
        heading: 'Make the message do some of the work',
        paragraphs: [
          'A gift note or personalised front message turns a cake parcel into something warmer and more memorable, which is why I lean towards formats that leave room for the message as well as the cake.',
          'It is a small detail that changes the whole tone.'
        ]
      },
      {
        heading: 'My best surprise formats',
        bullets: [
          'Birthday Gift by Post for a stronger birthday statement.',
          'Happy Birthday Cake Card for a lighter, neater surprise.',
          'Personalised honey cake gift for anniversaries or more intimate occasions.'
        ]
      }
    ],
    faqItems: createFaqItems([
      ['What makes a cake surprise feel personal?', 'Usually the right format, good timing, and a message that sounds like it came from you rather than a template.'],
      ['Is a cake card enough for a surprise gift?', 'Yes, if the relationship and occasion suit a lighter gesture.'],
      ['Why do you prefer message-led formats for surprise gifts?', 'Because the note and the cake together feel more considered than the cake alone.']
    ]),
    seo: {
      metaTitle: 'How to surprise someone with cake delivery by post',
      metaDescription: 'Learn how to surprise someone with cake delivery by post using the right format, timing, and message so the gift feels personal.',
      keywords: ['surprise cake delivery', 'cake delivery by post', 'send cake surprise', 'postal cake gift']
    },
    coverImageAlt: 'Posted birthday cake gift with personalised message prepared as a surprise',
    cardImageAlt: 'Close crop of a surprise cake delivery gift with note card',
    requiredAnchors: ['surprise cake delivery', 'Birthday Gift by Post', 'Happy Birthday Cake Card', 'personalised honey cake gift']
  },
  createSeasonalDraft({
    title: 'Valentine\'s cake delivery: what to choose when you want romance without the cliche',
    slug: 'valentines-cake-delivery-guide',
    summary: 'A Valentine\'s cake guide for customers deciding between a full romantic cake, a posted honey cake slice, or a smaller gift box.',
    dek: 'Valentine\'s cake delivery lands best when the gift feels affectionate but not forced. I explain when a full celebration cake is right, when a posted honey cake slice makes more sense, and why the gesture should stay personal.',
    primaryProductSlug: 'a-valentine-s-day-cake',
    imageProductSlug: 'a-valentine-s-day-cake',
    relatedProductSlugs: ['valentine-s-day-honey-cake-slice', 'valentine-s-biscuit-gift-box', 'cake-by-post'],
    intro: [
      'Valentine\'s cake gifts go wrong when they feel copied from a calendar rather than chosen for the person receiving them.',
      'The best romantic orders still feel a bit individual, even if the gesture itself is small.'
    ],
    sections: [
      {
        heading: 'When a full Valentine\'s cake earns its place',
        paragraphs: [
          'A full Valentine\'s Day cake works when you are actually sharing the moment together or marking something bigger than a token gift. The flower-pot style cake is strongest when the recipient will enjoy the visual detail as much as the flavour itself.',
          'It suits dinners, planned evenings, and occasions where the cake is part of the setting rather than a parcel left at the door.'
        ]
      },
      {
        heading: 'When a posted honey cake slice feels more personal',
        paragraphs: [
          'Valentine\'s Day Honey Cake Slice is better when you want a smaller posted surprise that still tastes like a real dessert. It feels intimate rather than performative.',
          'That smaller scale often works better for newer relationships or for couples who would rather laugh and share tea than cut a big themed cake.'
        ]
      },
      {
        heading: 'Where a biscuit box fits',
        paragraphs: [
          'A biscuit gift box is lighter again. I use it when the gesture should feel affectionate but low pressure.',
          'Romance does not improve with overselling. The right format is the one that feels natural for the relationship.'
        ]
      }
    ],
    closingRule: 'For Valentine\'s, I want the gift to feel like you picked it for that person, not for the calendar. If that part is right, the cake does the rest.',
    faqItems: createFaqItems([
      ['What is the best Valentine\'s cake gift to post?', 'A honey cake slice or a smaller gift box is usually the easiest choice when you need a clean postal surprise.'],
      ['When should I order a full Valentine\'s Day cake?', 'Order the full cake when you are sharing the occasion in person or want the cake to be the centre of the moment.'],
      ['Do romantic cake gifts need to be large?', 'No. A well-judged smaller gift often feels more personal than a larger generic one.']
    ]),
    seo: {
      metaTitle: 'Valentine\'s cake delivery | what to choose',
      metaDescription: 'Choose the right Valentine\'s cake delivery with honest advice on full romantic cakes, posted honey cake slices, and smaller gift boxes.',
      keywords: ['valentines cake delivery', 'valentines cake gift', 'valentines honey cake slice']
    },
    requiredAnchors: ['Valentine\'s', 'Valentine\'s Day cake', 'Valentine\'s Day Honey Cake Slice'],
    coverImageAlt: 'Valentine\'s Day cake with flower pot design and floral decoration',
    cardImageAlt: 'Close crop of a Valentine\'s Day cake with floral detail'
  }),
  createSeasonalDraft({
    title: 'Easter cakes to order: what I recommend when you want tradition and something people will actually eat',
    slug: 'easter-cakes-to-order-guide',
    summary: 'A practical Easter cake guide covering Paska, smaller Easter gifts, and how to choose a format that suits the table.',
    dek: 'Easter cake should feel meaningful and good to eat, not just seasonal for the sake of it. I explain where Paska fits, when smaller Easter gifts make sense, and how I think about Easter orders in a real household.',
    primaryProductSlug: 'easter-cake-paska',
    imageProductSlug: 'easter-cake-paska',
    relatedProductSlugs: ['easter-gifts-gorishky-caramel-biscuits', 'honey-cake-medovik', 'cake-by-post'],
    intro: [
      'Easter orders often sit between tradition and gifting. Some customers want a proper table cake, while others want something smaller to send or share.',
      'I try to keep those jobs separate so the order stays useful.'
    ],
    sections: [
      {
        heading: 'Why Paska is still the clearest Easter cake',
        paragraphs: [
          'Paska carries an Easter identity immediately, so it makes sense when the order needs to feel seasonal without explanation.',
          'It belongs best on a family table or as a host gift where the tradition itself matters.'
        ]
      },
      {
        heading: 'When a smaller Easter gift is the better decision',
        paragraphs: [
          'Not every Easter order needs one central cake. Sometimes a smaller gift is more useful, especially if you are sending something or dropping it into another household\'s plans.',
          'That is where smaller Easter gifts can do a better job than one ceremonial centrepiece.'
        ]
      },
      {
        heading: 'What I ask before recommending Easter cake',
        paragraphs: [
          'I still ask how the order will be used. A family table, a host gift, and a postal parcel all ask for different decisions.',
          'Once that part is clear, the format becomes much easier to choose.'
        ]
      }
    ],
    closingRule: 'At Easter, I want the cake to feel rooted rather than trendy. If it can sit naturally on the table and still be happily eaten, it belongs there.',
    faqItems: createFaqItems([
      ['What cake do you recommend for Easter?', 'Paska is the clearest Easter cake choice when you want tradition on the table.'],
      ['Can I send a smaller Easter cake gift?', 'Yes. Smaller Easter gifts can work very well when you want something easy to send or share.'],
      ['Should Easter cake be traditional or decorative?', 'For me, meaning should come first and decoration should support it rather than lead it.']
    ]),
    seo: {
      metaTitle: 'Easter cakes to order | Paska and Easter gift ideas',
      metaDescription: 'A useful guide to Easter cakes to order, including Paska, smaller Easter gifts, and how to choose the right format for the occasion.',
      keywords: ['easter cakes to order', 'paska cake', 'easter cake uk', 'easter gifts cake']
    },
    requiredAnchors: ['Easter', 'Paska', 'Easter gifts'],
    coverImageAlt: 'Traditional Paska Easter cake prepared for a seasonal order',
    cardImageAlt: 'Close crop of a Paska Easter cake with decorative top'
  }),
  createSeasonalDraft({
    title: 'Halloween cakes delivery: what works for a party and what is better kept simple',
    slug: 'halloween-cakes-delivery-guide',
    summary: 'A practical Halloween cake guide that focuses on dramatic flavour and realistic delivery rather than overworked novelty.',
    dek: 'Halloween cake can be fun without turning into a gimmick. I explain which cake directions suit parties, when to keep the design simple, and why richer flavours often work better than overcomplicated decoration.',
    primaryProductSlug: 'chocolate-delicia-sponge-cake-for-parties',
    imageProductSlug: 'chocolate-delicia-sponge-cake-for-parties',
    relatedProductSlugs: ['cake-by-post', 'happy-birthday-cake-card', 'vanilla-delicia-birthday-cake'],
    intro: [
      'Halloween cakes should look playful, but I still want them to taste like proper cake rather than a prop.',
      'That usually means leaning into mood, colour, and flavour contrast instead of making the structure itself unnecessarily difficult.'
    ],
    sections: [
      {
        heading: 'Start with a flavour that can carry the mood',
        paragraphs: [
          'Chocolate Delicia is a strong starting point because the flavour already feels deeper and more suited to a darker seasonal mood.',
          'If the cake tastes convincing before the decoration goes on, the whole Halloween brief becomes easier.'
        ]
      },
      {
        heading: 'The party designs I simplify on purpose',
        paragraphs: [
          'For party cakes, I keep the design sharp and manageable rather than overbuild it with fragile novelty details.',
          'People remember whether the cake sliced well and tasted good. They rarely miss the extra gimmick once the party has started.'
        ]
      },
      {
        heading: 'When smaller Halloween gifts make more sense',
        paragraphs: [
          'When the event needs small take-away treats, posted gifts or compact cake formats can do a better job than one oversized centrepiece.',
          'That is especially true when the seasonal touch is meant to be playful rather than theatrical.'
        ]
      }
    ],
    closingRule: 'For Halloween, I keep the joke short and the cake serious. A cleaner party cake usually outlasts a fussy novelty idea once real people start cutting it.',
    faqItems: createFaqItems([
      ['What cake flavour works well for Halloween?', 'Darker chocolate-led cakes often suit the mood best, especially for parties.'],
      ['Should a Halloween cake be highly detailed?', 'Only if the timing and setup support it. Simpler, sharper design often travels and serves better.'],
      ['Can Halloween cake be sent by post?', 'Smaller posted cake gifts can work well when the occasion suits a compact format.']
    ]),
    seo: {
      metaTitle: 'Halloween cakes delivery | party cakes that still work',
      metaDescription: 'Read practical advice on Halloween cakes delivery, including flavour direction, party planning, and when a simpler design gives the better result.',
      keywords: ['halloween cakes delivery', 'halloween party cake', 'halloween cake uk']
    },
    requiredAnchors: ['Halloween', 'Chocolate Delicia', 'party', 'posted gifts'],
    coverImageAlt: 'Chocolate celebration cake used as a Halloween party cake base',
    cardImageAlt: 'Close crop of a chocolate cake suitable for Halloween styling'
  }),
  createSeasonalDraft({
    title: 'Ukrainian Christmas cakes and desserts: what I actually recommend for gifting and the table',
    slug: 'ukrainian-christmas-cakes-and-desserts-guide',
    summary: 'A Christmas guide to the Ukrainian-inspired cakes and sweet gifts that work best for seasonal tables and posted parcels.',
    dek: 'Christmas orders split into two clear jobs: something generous for the table and something warm to send by post. I explain which Ukrainian-style cakes and festive gifts I recommend for each without turning the season into a generic hamper list.',
    primaryProductSlug: 'christmas-food-hamper-with-authentic-honey-cake',
    imageProductSlug: 'christmas-food-hamper-with-authentic-honey-cake',
    relatedProductSlugs: ['xmas-gift-boxes-cake-with-card', 'xmas-honey-cake-slice-in-festive-bag', 'honey-cake-medovik', 'christmas-cake-design-bespoke-cakes-made-just-for-you'],
    intro: [
      'Christmas cake buying gets messy when every order is treated the same. A family table wants one thing, a postal present wants another, and a corporate or host gift wants something else again.',
      'I separate those jobs clearly and then choose the cake or dessert that suits each one.'
    ],
    sections: [
      {
        heading: 'What I send by post at Christmas',
        paragraphs: [
          'For posted gifts, the Christmas Food Hamper with Honey Cake and the Xmas Gift Boxes with Cake and Card make immediate sense because they have both substance and presentation.',
          'They feel generous without asking the recipient to reorganise their whole day around the parcel.'
        ]
      },
      {
        heading: 'What belongs on the Christmas table',
        paragraphs: [
          'For a Christmas table, I still think first about what people genuinely enjoy eating, which is why honey cake keeps returning to the conversation.',
          'If the cake feels festive but nobody really wants the second slice, it has missed the point.'
        ]
      },
      {
        heading: 'Where smaller festive gifts fit',
        paragraphs: [
          'For smaller gestures, the Xmas Honey Cake Slice in Festive Bag is tidy, easy to hand over, and still rooted in real flavour rather than seasonal packaging alone.',
          'That is the option I use when the gift should feel warm and thoughtful without becoming a large hamper moment.'
        ]
      }
    ],
    closingRule: 'At Christmas, send one cake people genuinely want to eat, not a louder box that only looks festive for five minutes.',
    faqItems: createFaqItems([
      ['What is a good Ukrainian-style Christmas cake gift?', 'A festive honey cake hamper or a cake-with-card box works well because it feels generous and still posts cleanly.'],
      ['What if I only need a small Christmas cake gift?', 'A festive honey cake slice gift is often enough for a smaller seasonal gesture.'],
      ['Do you recommend one cake for every Christmas order?', 'No. I separate table cakes, gift boxes, and smaller posted treats because they do different jobs.']
    ]),
    seo: {
      metaTitle: 'Ukrainian Christmas cakes and desserts | what to order',
      metaDescription: 'See which Ukrainian Christmas cakes and desserts I recommend for the table, for gifting, and for posted festive parcels across the UK.',
      keywords: ['ukrainian christmas cakes', 'christmas cake gifts uk', 'honey cake christmas hamper']
    },
    requiredAnchors: ['Christmas', 'Christmas Food Hamper with Honey Cake', 'Xmas Gift Boxes', 'Xmas Honey Cake Slice'],
    coverImageAlt: 'Christmas gift hamper with honey cake prepared for festive gifting',
    cardImageAlt: 'Close crop of a festive honey cake hamper for the Christmas guide'
  }),
]

export const seedArticles: SeedArticle[] = seedArticleDrafts.map(buildSeedArticle)

export function collectProductSlugsFromSeeds(seedArticlesInput = seedArticles) {
  const productSlugs = new Set<string>()

  for (const article of seedArticlesInput) {
    if (article.primaryProductSlug) {
      productSlugs.add(article.primaryProductSlug)
    }

    if (article.imageProductSlug) {
      productSlugs.add(article.imageProductSlug)
    }

    for (const relatedProductSlug of article.relatedProductSlugs) {
      productSlugs.add(relatedProductSlug)
    }
  }

  return Array.from(productSlugs)
}

function getFirstParagraph(article: SeedArticle) {
  return extractParagraphTexts(article.body)[0] ?? ''
}

function getLastParagraph(article: SeedArticle) {
  const paragraphs = extractParagraphTexts(article.body)
  return paragraphs[paragraphs.length - 1] ?? ''
}

function countH2Sections(body: PortableTextBlock[]) {
  return body.filter((block) => block.style === 'h2').length
}

function hasFirstPersonLanguage(value: string) {
  return /\b(i|i'm|i'd|i'll|my|me)\b/i.test(value)
}

function assertNoBannedPhrases(value: string, slug: string, fieldName: string) {
  const normalizedValue = normalizeForComparison(value)

  for (const phrase of antiAiBannedPhrases) {
    if (normalizedValue.includes(normalizeForComparison(phrase))) {
      throw new Error(`Banned phrase "${phrase}" found in ${fieldName} for ${slug}`)
    }
  }
}

function assertDistinctPair(a: string, b: string, labelA: string, labelB: string, slug: string) {
  if (normalizeForComparison(a) === normalizeForComparison(b)) {
    throw new Error(`${labelA} and ${labelB} are duplicated for ${slug}`)
  }
}

function getSanityEnvironment(): SanityEnvironment {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  const token = process.env.SANITY_API_TOKEN
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-03-31'

  if (!projectId || !dataset || !token) {
    throw new Error(
      'Missing Sanity configuration. Check NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, and SANITY_API_TOKEN.'
    )
  }

  return {
    projectId,
    dataset,
    token,
    apiVersion
  }
}

function createSanityClients(environment: SanityEnvironment) {
  const config: ClientConfig = {
    projectId: environment.projectId,
    dataset: environment.dataset,
    apiVersion: environment.apiVersion,
    useCdn: false
  }

  const client = createClient({
    ...config,
    token: environment.token
  })

  const publicClient = createClient({
    ...config,
    perspective: 'published'
  })

  return { client, publicClient }
}

export function validateSeedConfiguration(seedArticlesInput = seedArticles) {
  const topicSlugSet = new Set(topicSeeds.map((topic) => topic.slug))
  const articleSlugSet = new Set<string>()
  const titleSet = new Set<string>()
  const openingMap = new Map<string, string>()
  const closingMap = new Map<string, string>()

  seedArticlesInput.forEach((article, index) => {
    if (articleSlugSet.has(article.slug)) {
      throw new Error(`Duplicate article slug: ${article.slug}`)
    }

    articleSlugSet.add(article.slug)

    if (titleSet.has(normalizeForComparison(article.title))) {
      throw new Error(`Duplicate article title: ${article.title}`)
    }

    titleSet.add(normalizeForComparison(article.title))

    if (!topicSlugSet.has(article.topicSlug)) {
      throw new Error(`Unknown topic slug for ${article.slug}: ${article.topicSlug}`)
    }

    if (article.title.length > 110) {
      throw new Error(`Title too long for ${article.slug}`)
    }

    if (article.summary.length > 220) {
      throw new Error(`Summary too long for ${article.slug}`)
    }

    if (article.dek.length > 320) {
      throw new Error(`Dek too long for ${article.slug}`)
    }

    if (article.relatedProductSlugs.length > 4) {
      throw new Error(`Too many related products for ${article.slug}`)
    }

    if (article.primaryProductSlug && article.relatedProductSlugs.includes(article.primaryProductSlug)) {
      throw new Error(`Primary product duplicated in related products for ${article.slug}`)
    }

    if (article.publishedAt !== publishedAtForIndex(index)) {
      throw new Error(`Unexpected publishedAt for ${article.slug}: ${article.publishedAt}`)
    }

    if (countH2Sections(article.body) < 4) {
      throw new Error(`Expected at least four H2 sections for ${article.slug}`)
    }

    if (!article.coverImageAlt || !article.cardImageAlt) {
      throw new Error(`Missing image alt text for ${article.slug}`)
    }

    const bodyText = extractBodyPlainText(article.body)

    if (!bodyText) {
      throw new Error(`Missing body content for ${article.slug}`)
    }

    assertNoBannedPhrases(article.title, article.slug, 'title')
    assertNoBannedPhrases(article.summary, article.slug, 'summary')
    assertNoBannedPhrases(article.dek, article.slug, 'dek')
    assertNoBannedPhrases(bodyText, article.slug, 'body')
    assertNoBannedPhrases(article.seo.metaTitle, article.slug, 'seo.metaTitle')
    assertNoBannedPhrases(article.seo.metaDescription, article.slug, 'seo.metaDescription')

    if (!hasFirstPersonLanguage(bodyText)) {
      throw new Error(`Missing first-person language for ${article.slug}`)
    }

    for (const anchor of article.requiredAnchors) {
      if (!normalizeForComparison(bodyText).includes(normalizeForComparison(anchor))) {
        throw new Error(`Missing required anchor "${anchor}" for ${article.slug}`)
      }
    }

    assertDistinctPair(article.summary, article.dek, 'summary', 'dek', article.slug)
    assertDistinctPair(article.summary, article.seo.metaDescription, 'summary', 'metaDescription', article.slug)
    assertDistinctPair(article.dek, article.seo.metaDescription, 'dek', 'metaDescription', article.slug)

    const openingSignature = firstWords(getFirstParagraph(article), 7)
    const closingSignature = firstWords(getLastParagraph(article), 7)

    if (openingSignature && openingMap.has(openingSignature)) {
      throw new Error(`Repeated article opening between ${openingMap.get(openingSignature)} and ${article.slug}`)
    }

    if (closingSignature && closingMap.has(closingSignature)) {
      throw new Error(`Repeated article closing between ${closingMap.get(closingSignature)} and ${article.slug}`)
    }

    if (openingSignature) {
      openingMap.set(openingSignature, article.slug)
    }

    if (closingSignature) {
      closingMap.set(closingSignature, article.slug)
    }

    for (const item of article.faqItems ?? []) {
      if (item.question.length > 180) {
        throw new Error(`FAQ question too long for ${article.slug}`)
      }

      if (item.answer.length > 600) {
        throw new Error(`FAQ answer too long for ${article.slug}`)
      }
    }
  })
}

async function fetchExistingSlugRecords(
  client: ReturnType<typeof createSanityClients>['client'],
  type: 'article' | 'articleTopic',
  slugs: string[]
) {
  return client.fetch<ExistingSlugRecord[]>(
    `*[_type == $type && slug.current in $slugs]{
      _id,
      "slug": slug.current
    }`,
    {
      type,
      slugs
    }
  )
}

async function assertDeterministicSlugOwnership(
  client: ReturnType<typeof createSanityClients>['client']
) {
  const articleRecords = await fetchExistingSlugRecords(
    client,
    'article',
    seedArticles.map((article) => article.slug)
  )
  const topicRecords = await fetchExistingSlugRecords(
    client,
    'articleTopic',
    topicSeeds.map((topic) => topic.slug)
  )

  for (const record of articleRecords) {
    const expectedId = toArticleDocumentId(record.slug)

    if (record._id !== expectedId) {
      throw new Error(`Article slug ${record.slug} is owned by ${record._id}, expected ${expectedId}`)
    }
  }

  for (const record of topicRecords) {
    const expectedId = toArticleTopicDocumentId(record.slug)

    if (record._id !== expectedId) {
      throw new Error(`Topic slug ${record.slug} is owned by ${record._id}, expected ${expectedId}`)
    }
  }
}

async function fetchProductRecords(
  client: ReturnType<typeof createSanityClients>['client']
) {
  const productSlugs = collectProductSlugsFromSeeds()

  const products = await client.fetch<ProductRecord[]>(
    `*[_type in ["cake", "giftHamper"] && slug.current in $slugs]{
      _id,
      _type,
      name,
      "slug": slug.current,
      mainImage,
      image,
      featuredImage,
      cardImage,
      images
    }`,
    {
      slugs: productSlugs
    }
  )

  const productMap = new Map(products.map((product) => [product.slug, product]))
  const missingSlugs = productSlugs.filter((slug) => !productMap.has(slug))

  if (missingSlugs.length > 0) {
    throw new Error(`Missing products in Sanity: ${missingSlugs.join(', ')}`)
  }

  return productMap
}

function toReference(_ref: string): ReferenceValue {
  return {
    _type: 'reference',
    _ref
  }
}

function resolveImageForArticle(article: SeedArticle, productMap: Map<string, ProductRecord>) {
  const imageSourceSlug = article.imageProductSlug || article.primaryProductSlug

  if (!imageSourceSlug) {
    throw new Error(`Missing image source slug for ${article.slug}`)
  }

  const product = productMap.get(imageSourceSlug)

  if (!product) {
    throw new Error(`Missing image source product for ${article.slug}: ${imageSourceSlug}`)
  }

  const productImage = pickProductImage(product)

  if (!productImage) {
    throw new Error(`Missing usable image for ${article.slug}: ${imageSourceSlug}`)
  }

  return {
    coverImage: applyImageAlt(productImage, article.coverImageAlt),
    cardImage: applyImageAlt(productImage, article.cardImageAlt)
  }
}

function resolvePrimaryProductReference(article: SeedArticle, productMap: Map<string, ProductRecord>) {
  if (!article.primaryProductSlug) {
    return undefined
  }

  const product = productMap.get(article.primaryProductSlug)

  if (!product) {
    throw new Error(`Missing primary product for ${article.slug}: ${article.primaryProductSlug}`)
  }

  return toReference(product._id)
}

function resolveRelatedProductReferences(article: SeedArticle, productMap: Map<string, ProductRecord>) {
  return article.relatedProductSlugs.map((slug) => {
    const product = productMap.get(slug)

    if (!product) {
      throw new Error(`Missing related product for ${article.slug}: ${slug}`)
    }

    return toReference(product._id)
  })
}

async function ensureTopics(client: ReturnType<typeof createSanityClients>['client']) {
  for (const topic of topicSeeds) {
    await client.createOrReplace({
      _id: toArticleTopicDocumentId(topic.slug),
      _type: 'articleTopic',
      title: topic.title,
      slug: {
        _type: 'slug',
        current: topic.slug
      },
      description: topic.description,
      order: topic.order
    })
  }
}

async function fetchExistingArticleDocument(
  client: ReturnType<typeof createSanityClients>['client'],
  slug: string
) {
  return client.fetch<ExistingArticleDocument | null>(
    `*[_type == "article" && slug.current == $slug][0]{
      editorialUpdatedAt,
      refreshEditorialUpdatedAt,
      seo {
        canonicalUrl,
        priority,
        changefreq
      }
    }`,
    { slug }
  )
}

async function upsertArticles(
  client: ReturnType<typeof createSanityClients>['client'],
  productMap: Map<string, ProductRecord>
) {
  for (const article of seedArticles) {
    const existingDocument = await fetchExistingArticleDocument(client, article.slug)
    const images = resolveImageForArticle(article, productMap)

    await client.createOrReplace({
      _id: toArticleDocumentId(article.slug),
      _type: 'article',
      title: article.title,
      slug: {
        _type: 'slug',
        current: article.slug
      },
      summary: article.summary,
      dek: article.dek,
      publishedAt: article.publishedAt,
      editorialUpdatedAt: article.publishedAt,
      refreshEditorialUpdatedAt: false,
      topic: toReference(toArticleTopicDocumentId(article.topicSlug)),
      primaryProduct: resolvePrimaryProductReference(article, productMap),
      relatedProducts: resolveRelatedProductReferences(article, productMap),
      coverImage: images.coverImage,
      cardImage: images.cardImage,
      body: article.body,
      faqItems: (article.faqItems ?? []).map((item) => ({
        _key: createKey('faq'),
        question: item.question,
        answer: item.answer
      })),
      seo: {
        metaTitle: article.seo.metaTitle,
        metaDescription: article.seo.metaDescription,
        keywords: article.seo.keywords,
        canonicalUrl: existingDocument?.seo?.canonicalUrl,
        priority: existingDocument?.seo?.priority,
        changefreq: existingDocument?.seo?.changefreq
      }
    })
  }
}

async function deleteRetiredArticles(client: ReturnType<typeof createSanityClients>['client']) {
  const retiredRecords = await fetchExistingSlugRecords(client, 'article', retiredArticleSlugs)

  if (retiredRecords.length === 0) {
    return
  }

  let transaction = client.transaction()

  for (const record of retiredRecords) {
    transaction = transaction.delete(record._id)
  }

  await transaction.commit()
}

async function verifyTopics(client: ReturnType<typeof createSanityClients>['publicClient']) {
  const records = await client.fetch<TopicVerificationRecord[]>(
    `*[_type == "articleTopic" && slug.current in $slugs]{
      "slug": slug.current
    }`,
    {
      slugs: topicSeeds.map((topic) => topic.slug)
    }
  )

  const recordSet = new Set(records.map((record) => record.slug))
  const missing = topicSeeds
    .map((topic) => topic.slug)
    .filter((slug) => !recordSet.has(slug))

  if (missing.length > 0) {
    throw new Error(`Missing public topics: ${missing.join(', ')}`)
  }
}

async function verifyArticles(client: ReturnType<typeof createSanityClients>['publicClient']) {
  const records = await client.fetch<ArticleVerificationRecord[]>(
    `*[_type == "article" && slug.current in $slugs && coalesce(publishedAt, _createdAt) <= now()] |
      order(publishedAt desc, _createdAt desc){
      "slug": slug.current,
      "hasBody": count(body) > 0,
      "hasTopic": defined(topic->slug.current),
      "hasCoverImage": defined(coverImage.asset._ref),
      "hasPrimaryProduct": defined(primaryProduct._ref),
      "hasSeo": defined(seo.metaTitle) && defined(seo.metaDescription)
    }`,
    {
      slugs: seedArticles.map((article) => article.slug)
    }
  )

  const expectedOrder = seedArticles.map((article) => article.slug)
  const actualOrder = records.map((record) => record.slug)

  if (actualOrder.join('|') !== expectedOrder.join('|')) {
    throw new Error(
      `Archive order mismatch. Expected ${expectedOrder.join(', ')}. Got ${actualOrder.join(', ')}.`
    )
  }

  for (const record of records) {
    if (!record.hasBody || !record.hasTopic || !record.hasCoverImage || !record.hasSeo) {
      throw new Error(`Incomplete public article detected: ${record.slug}`)
    }
  }

  const optionalPrimaryProductSlugs = new Set([
    'ukrainian-cakes-guide',
    'cake-delivery-leeds-guide',
    'cake-delivery-wakefield-guide',
    'cake-delivery-huddersfield-guide',
    'cake-delivery-bradford-guide',
    'cake-delivery-york-guide',
    'nut-free-cakes-leeds-guide',
    'nut-free-birthday-cakes-guide',
    'cake-size-and-portions-guide'
  ])

  for (const record of records) {
    if (!optionalPrimaryProductSlugs.has(record.slug) && !record.hasPrimaryProduct) {
      throw new Error(`Expected primary product on ${record.slug}`)
    }
  }
}

async function verifyRetiredArticlesRemoved(client: ReturnType<typeof createSanityClients>['publicClient']) {
  const records = await client.fetch<Array<{ slug: string }>>(
    `*[_type == "article" && slug.current in $slugs]{
      "slug": slug.current
    }`,
    {
      slugs: retiredArticleSlugs
    }
  )

  if (records.length > 0) {
    throw new Error(`Retired articles still visible: ${records.map((record) => record.slug).join(', ')}`)
  }
}

export async function runManualArticleImport() {
  validateSeedConfiguration()

  const environment = getSanityEnvironment()
  const { client, publicClient } = createSanityClients(environment)

  await assertDeterministicSlugOwnership(client)

  const productMap = await fetchProductRecords(client)

  await ensureTopics(client)
  await upsertArticles(client, productMap)
  await deleteRetiredArticles(client)

  await verifyTopics(publicClient)
  await verifyArticles(publicClient)
  await verifyRetiredArticlesRemoved(publicClient)

  return {
    importedCount: seedArticles.length,
    retiredCount: retiredArticleSlugs.length
  }
}

if (process.argv[1]?.endsWith('import-manual-articles.ts')) {
  runManualArticleImport()
    .then((result) => {
      console.log(
        `Imported ${result.importedCount} articles and removed ${result.retiredCount} retired article slugs.`
      )
    })
    .catch((error: unknown) => {
      console.error(error)
      process.exitCode = 1
    })
}
