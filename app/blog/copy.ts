import type { ArticleProduct, ArticleTopic } from '@/lib/articles'

type BlogTopicCopy = Pick<ArticleTopic, 'title' | 'slug' | 'description'>

interface ArchiveFilterCopy {
  label: string
  status?: string
  summary?: string
}

interface ArchiveSectionCopy {
  eyebrow: string
  heading: string
}

function isGenericPostalProduct(product?: ArticleProduct) {
  return product?.name.trim().toLowerCase() === 'cake by post'
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
  const status = activeTopic ? undefined : 'All articles'

  if (totalCount === 0 || totalPages <= 1) {
    return {
      label: 'Browse by topic',
      status
    }
  }

  return {
    label: 'Browse by topic',
    status,
    summary: `Page ${currentPage} of ${totalPages}`
  }
}

export function getArchiveCommerceCopy(product?: ArticleProduct) {
  const heading = product
    ? isGenericPostalProduct(product)
      ? 'Shop the by-post options'
      : `Shop ${product.name}`
    : 'Shop the options that travel best'
  const body = product
    ? isGenericPostalProduct(product)
      ? 'Start here if you need a standard honey cake prepared for post, vacuum-packed slices in a gift hamper, or caramel biscuits that travel neatly across the UK.'
      : `${product.name} is a good fit when the order is one of the by-post options, or when a wider UK cake delivery has been agreed in advance.`
    : 'If you need something to travel, start with standard honey cake by post, cake slices in gift hampers, or caramel biscuits. For a whole celebration cake further afield, ask about UK delivery by agreement.'

  return {
    eyebrow: 'Need something that can travel?',
    heading,
    body,
    bullets: [
      'Standard honey cake by post is prepared for travel and vacuum-packed before dispatch',
      'Gift hampers and compact slice gifts work well when you want a posted cake surprise without sending a full centrepiece',
      'Tall, chilled, or highly decorated cakes are usually better as local delivery, collection, or UK delivery by agreement'
    ]
  }
}

export function getArticleCommerceCopy(product?: ArticleProduct) {
  const heading = product
    ? isGenericPostalProduct(product)
      ? 'Start with the by-post options'
      : `Start with ${product.name}`
    : 'Start with the format that fits the journey'
  const body = product
    ? isGenericPostalProduct(product)
      ? 'This is where Olga points people when they need standard honey cake by post, cake slices inside a gift hamper, or caramel biscuits that are straightforward to send.'
      : `${product.name} is the kind of product Olga suggests when the format suits by-post gifting, or when a wider UK delivery has already been agreed.`
    : 'If the order has to go across the UK, start with the by-post options first. If the cake needs height, fresh fillings, or a polished celebration finish, ask about local delivery, collection, or UK delivery by agreement instead.'

  return {
    eyebrow: 'Useful if the cake has to travel',
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

export function getArticleClosingCtaCopy() {
  return {
    eyebrow: 'Need the practical answer?',
    heading: 'Choose the format that suits the journey',
    intro:
      'If the parcel has to go across the UK, start with standard honey cake by post, cake slices in gift hampers, or caramel biscuits. If the order depends on height, chilled fillings, or a detailed design brief, send an enquiry about local delivery, collection, or UK delivery by agreement.'
  }
}
