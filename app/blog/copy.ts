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
      ? 'Shop the cake-by-post range'
      : `Shop ${product.name}`
    : 'Shop the range that suits the post'
  const body = product
    ? isGenericPostalProduct(product)
      ? 'This is the simplest place to start for UK delivery. The range was built for posting, so ordering is more straightforward and the cake suits the journey.'
      : `${product.name} is a solid option when you need to send cake by post in the UK. It travels well and still feels generous when it arrives.`
    : 'If you need to send cake across the UK, start with the by-post range. It is the easiest option when delivery matters as much as the cake itself.'

  return {
    eyebrow: 'Need something that can travel?',
    heading,
    body,
    bullets: [
      'Made with UK delivery in mind from the start',
      'Easy to send for birthdays, thank-yous, and simple gift orders',
      'Better suited to the post than a tall or highly detailed cake'
    ]
  }
}

export function getArticleCommerceCopy(product?: ArticleProduct) {
  const heading = product
    ? isGenericPostalProduct(product)
      ? 'Start with the cake-by-post range'
      : `Start with ${product.name}`
    : 'Start with the postal range'
  const body = product
    ? isGenericPostalProduct(product)
      ? 'This is the range Olga points people to when they want a cake that travels neatly and is easy to send.'
      : `${product.name} is the kind of product Olga suggests when you want a gift that travels neatly and still feels special when it arrives.`
    : 'If the order has to go across the UK, start with the cakes that were planned for the post. If the brief depends on height, fresh fillings, or a polished display finish, send a custom enquiry instead.'

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
      'If the parcel has to go across the UK, start with cakes by post. If the order depends on height, chilled fillings, or a detailed design brief, send a custom enquiry instead.'
  }
}
