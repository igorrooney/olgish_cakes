import {
  getProductHref,
  isArticleProductPostableToUk,
  type ArticleProduct,
  type ArticleTopic
} from '@/lib/articles'

type BlogTopicCopy = Pick<ArticleTopic, 'title' | 'slug' | 'description'>
type BlogTopicSlug = BlogTopicCopy['slug']

interface ArchiveFilterCopy {
  label: string
  status: string
  summary?: string
  pageLabel?: string
}

interface ArchiveSectionCopy {
  eyebrow: string
  heading: string
}

interface CommerceCta {
  href: string
  label: string
}

interface ArchiveCommerceCopy {
  eyebrow: string
  heading: string
  body: string
  bullets: string[]
  primaryCta: CommerceCta
  secondaryCta: CommerceCta
}

interface ArchiveCommerceCopyInput {
  activeTopicSlug?: BlogTopicSlug
  product?: ArticleProduct
}

interface ArticleClosingCtaCopy {
  eyebrow: string
  heading: string
  intro: string
}

function isGenericPostalProduct(product?: ArticleProduct) {
  return product?.name.trim().toLowerCase() === 'cake by post'
}

function isCustomCakeProduct(product?: ArticleProduct) {
  return product?._type === 'cake'
}

function isBlogPostalProduct(product?: ArticleProduct) {
  return isArticleProductPostableToUk(product)
}

function getArchiveDefaultSecondaryCta(activeTopicSlug?: BlogTopicSlug): CommerceCta {
  if (activeTopicSlug === 'custom-cakes') {
    return {
      href: '/cakes-by-post',
      label: 'Shop cakes by post'
    }
  }

  return {
    href: '/cakes',
    label: 'See custom cakes'
  }
}

export function getArchiveSectionCopy(currentPage: number): ArchiveSectionCopy {
  if (currentPage > 1) {
    return {
      eyebrow: 'Archive pages',
      heading: `Page ${currentPage}`
    }
  }

  return {
    eyebrow: 'More from Olga',
    heading: 'Latest articles'
  }
}

export function getArchiveHeroContent(activeTopic?: BlogTopicCopy) {
  if (activeTopic) {
    if (activeTopic.slug === 'cake-by-post') {
      return {
        eyebrow: 'Cake by post notes',
        heading: 'Cake by post advice for real UK deliveries',
        intro:
          activeTopic.description ||
          'Straight answers on what posts well, what stays neat in transit, and when it makes more sense to order something locally.'
      }
    }

    if (activeTopic.slug === 'celebration-planning') {
      return {
        eyebrow: 'Gifting notes',
        heading: 'How to send cake without making the day harder',
        intro:
          activeTopic.description ||
          'Useful if you are sending cake as a gift: timing, parcel size, and choosing something that still feels thoughtful when it arrives.'
      }
    }

    if (activeTopic.slug === 'custom-cakes') {
      return {
        eyebrow: 'Custom order notes',
        heading: 'When a custom cake is the right answer',
        intro:
          activeTopic.description ||
          'A quick guide to when a custom cake is worth it, what to sort out early, and when a postal cake is the easier option.'
      }
    }

    return {
      eyebrow: `${activeTopic.title} advice`,
      heading: `${activeTopic.title} notes from Olga`,
      intro:
        activeTopic.description ||
        `Practical notes on ${activeTopic.title.toLowerCase()}, based on the questions Olga gets most often.`
    }
  }

  return {
    eyebrow: "Olga's notes",
    heading: 'Cake by post advice, delivery help, and gift ideas',
    intro:
      'These articles answer the questions Olga gets most often: what travels well, what is sensible to post, and when a custom order would be the better fit.'
  }
}

export function getArchiveFilterCopy(
  activeTopic: BlogTopicCopy | undefined,
  {
    currentPage,
    totalCount,
    totalPages
  }: {
    currentPage: number
    totalCount: number
    totalPages: number
  }
): ArchiveFilterCopy {
  const status = activeTopic ? activeTopic.title : 'All topics'

  if (totalCount === 0) {
    return {
      label: 'Browse by topic',
      status,
      summary: 'No published articles yet'
    }
  }

  return {
    label: 'Browse by topic',
    status,
    summary: `${totalCount} published ${totalCount === 1 ? 'article' : 'articles'}`,
    pageLabel: totalPages > 1 ? `Page ${currentPage} of ${totalPages}` : undefined
  }
}

export function getArchiveCommerceCopy({
  activeTopicSlug,
  product
}: ArchiveCommerceCopyInput = {}): ArchiveCommerceCopy {
  const isPostalProduct = isBlogPostalProduct(product)
  const secondaryCta = getArchiveDefaultSecondaryCta(activeTopicSlug)

  if (activeTopicSlug === 'custom-cakes' && !isPostalProduct) {
    return {
      eyebrow: 'Planning something more detailed?',
      heading: 'Browse the custom cakes first',
      body:
        'If the cake depends on height, fresh fillings, or a proper design brief, start with the custom cakes range. That is the easiest way to compare celebration styles before deciding what should stay local and what might travel by agreement.',
      bullets: [
        'Custom cakes are the right starting point for birthdays, tiered cakes, and designs that need more than standard by-post packing',
        'Collection and local delivery suit celebration cakes better when the finish matters as much as the flavour',
        'If the order has to post across the UK, the cakes by post range is still the safer option for reliable travel'
      ],
      primaryCta: {
        href: '/cakes',
        label: 'Browse custom cakes'
      },
      secondaryCta
    }
  }

  const postalProduct = isPostalProduct ? product : undefined
  const heading = postalProduct
    ? isGenericPostalProduct(postalProduct)
      ? 'Shop the by-post options'
      : `Shop ${postalProduct.name}`
    : 'Shop the options that travel best'
  const body = postalProduct
    ? isGenericPostalProduct(postalProduct)
      ? 'Start here if you need cakes by post with honey cake slices, caramel biscuits, or standard-design honey cake vacuum-packed and sent as a parcel across the UK.'
      : `${postalProduct.name} is prepared as a vacuum-packed parcel for UK post when you need slices, biscuits, or standard-design honey cake that can travel neatly.`
    : activeTopicSlug === 'celebration-planning'
      ? 'If you are sending cake as a gift, start with the by-post options that travel cleanly, then compare custom cakes only if the occasion really needs a larger centrepiece.'
      : 'If you need something to travel, start with the cakes by post range for honey cake slices, caramel biscuits, or standard-design honey cake vacuum-packed for parcel post. For full celebration cakes, ask about local delivery, collection, or UK delivery by agreement.'

  return {
    eyebrow: 'Need something that can travel?',
    heading,
    body,
    bullets: [
      'The cakes by post range is prepared for post, with bakes vacuum-packed and dispatched as parcels',
      'Honey cake slices, caramel biscuits, and standard-design honey cake work well when you want a posted surprise without sending a full celebration cake',
      'Tall, chilled, or highly decorated cakes are better kept to local delivery, collection, or UK delivery by agreement'
    ],
    primaryCta: {
      href: postalProduct ? getProductHref(postalProduct) : '/cakes-by-post',
      label: postalProduct ? 'See this cake by post' : 'Shop cakes by post'
    },
    secondaryCta
  }
}

export function getArticleCommerceCopy(product?: ArticleProduct) {
  const isPostalProduct = isBlogPostalProduct(product)
  const eyebrow = product
    ? isPostalProduct
      ? 'Useful if the cake has to travel'
      : isCustomCakeProduct(product)
        ? 'Better for local delivery or collection'
        : 'Better arranged directly'
    : 'Useful if the cake has to travel'
  const heading = product
    ? isPostalProduct && isGenericPostalProduct(product)
      ? 'Start with the by-post options'
      : `Start with ${product.name}`
    : 'Start with the format that fits the journey'
  const body = product
    ? isPostalProduct && isGenericPostalProduct(product)
      ? 'This is where Olga points people when they need standard-design honey cake, honey cake slices, or caramel biscuits vacuum-packed and sent as a parcel.'
      : isPostalProduct
        ? `${product.name} is prepared as a vacuum-packed parcel for UK post when you want slices, biscuits, or standard-design honey cake that can travel neatly.`
        : isCustomCakeProduct(product)
        ? `${product.name} is the kind of cake Olga suggests when the order needs a proper celebration finish, local delivery, or collection rather than parcel-post packing.`
        : `${product.name} is better treated as a product to arrange directly, rather than a standard UK by-post option. If the parcel has to travel, compare the cakes by post range first.`
    : 'If the order has to go across the UK, start with the cakes by post options first. Those cover standard-design honey cake, honey cake slices, and caramel biscuits vacuum-packed for parcel delivery. If the cake needs height, fresh fillings, or a polished celebration finish, ask about local delivery, collection, or UK delivery by agreement instead.'

  return {
    eyebrow,
    heading,
    body
  }
}

export function getArticleFaqCopy(topicSlug?: string) {
  if (topicSlug === 'celebration-planning') {
    return {
      eyebrow: 'Questions that come up before sending',
      heading: 'The details people usually check first',
      intro:
        'Timing, delivery fit, and whether the surprise will feel easy at the other end are the things people normally want sorted before they place the order.'
    }
  }

  if (topicSlug === 'custom-cakes') {
    return {
      eyebrow: 'Questions before the brief is fixed',
      heading: 'The things worth clearing up early',
      intro:
        'These are the details that save time later: what travels well, what should stay local, and where a custom order starts to make sense.'
    }
  }

  return {
    eyebrow: 'Questions people ask before ordering',
    heading: 'The practical details that matter first',
    intro:
      'These are the bits customers usually want answered before they commit: freshness, delivery timing, and whether a postal cake is the right fit at all.'
  }
}

export function getRelatedArticlesCopy(topicSlug?: string) {
  if (topicSlug === 'celebration-planning') {
    return {
      eyebrow: 'Keep reading',
      heading: 'A few more useful notes before you send anything',
      intro:
        'These are the follow-on reads for people trying to make the gift feel thoughtful without turning the delivery into hard work.'
    }
  }

  if (topicSlug === 'custom-cakes') {
    return {
      eyebrow: 'Keep reading',
      heading: 'More guidance if you are weighing up the brief',
      intro:
        'These pieces help if you are still deciding whether the order should stay postal, go local, or become a proper custom cake.'
    }
  }

  return {
    eyebrow: 'Keep reading',
    heading: 'More notes if you are still weighing it up',
    intro:
      'These are the pieces people usually read next when they are deciding what can go in the post, what should stay local, and how much fuss the delivery should involve.'
  }
}

export function getArticleClosingCtaCopy(): ArticleClosingCtaCopy {
  return {
    eyebrow: 'Need the practical answer?',
    heading: 'Choose the format that suits the journey',
    intro:
      'If the parcel has to go across the UK, start with the cakes by post range for standard-design honey cake, honey cake slices, or caramel biscuits vacuum-packed for post. If the order depends on height, chilled fillings, or a detailed design brief, browse the custom cakes range for the celebration options that are better suited to local delivery, collection, or UK delivery by agreement.'
  }
}
