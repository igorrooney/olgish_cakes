import type { CatalogFaqItem } from './catalogFaqItems'

export type CatalogCategoryLandingSlug =
  | 'wedding-cakes'
  | 'birthday-cakes'
  | 'anniversary-cakes-leeds'
  | 'baby-shower-cakes'

interface CategoryLandingAction {
  href: string
  label: string
}

interface CategoryLandingContentBlock {
  title: string
  body: string
}

interface CategoryLandingInlineLinkText {
  before: string
  href: string
  label: string
  after: string
}

export type CategoryLandingEditorialTextBlock = string | CategoryLandingInlineLinkText

interface CategoryLandingOpenGraphImage {
  url: string
  alt: string
}

export interface CatalogCategoryCtaBandContent {
  title: string
  body: string
  primaryAction: CategoryLandingAction
  secondaryAction: CategoryLandingAction
}

export interface CatalogCategoryEditorialContent {
  proofIntro?: string
  orderingIntro?: string
  delivery?: {
    title: string
    body: CategoryLandingEditorialTextBlock[]
  }
}

export interface CatalogCategoryLandingConfig {
  slug: CatalogCategoryLandingSlug
  canonicalPath: `/${string}`
  collectionQueryValue: string
  collectionQueryValueAliases?: string[]
  lastSignificantUpdate: string
  title: string
  description: string
  keywords: string
  heroTitle: string
  heroBody: string
  localBusinessDescription: string
  itemListName: string
  heroPrimaryAction: CategoryLandingAction
  heroSecondaryAction: CategoryLandingAction
  audienceIntroTitle?: string
  audienceIntroBody?: string
  useCases?: CategoryLandingContentBlock[]
  flavourSectionTitle: string
  flavourSectionIntro: string
  flavourSectionItems?: CategoryLandingContentBlock[]
  proofSectionTitle: string
  proofPoints: string[]
  orderingSectionTitle: string
  orderingSteps: CategoryLandingContentBlock[]
  editorial: CatalogCategoryEditorialContent
  faqTitle: string
  faqIntro: string
  faqItems: CatalogFaqItem[]
  ctaBand: CatalogCategoryCtaBandContent
  openGraphImage: CategoryLandingOpenGraphImage
}

interface CatalogCategoryLandingSource {
  slug: CatalogCategoryLandingSlug
  canonicalPath: `/${string}`
  collectionQueryValue: string
  collectionQueryValueAliases?: string[]
  lastSignificantUpdate: string
  metadata: {
    title: string
    description: string
    keywords: string
    localBusinessDescription: string
    itemListName: string
    openGraphImage: CategoryLandingOpenGraphImage
  }
  hero: {
    title: string
    body: string
    primaryAction?: CategoryLandingAction
    secondaryAction?: CategoryLandingAction
  }
  sections: {
    proof: {
      title: string
      intro?: string
      points: string[]
    }
    process: {
      title: string
      intro?: string
      steps: CategoryLandingContentBlock[]
    }
    overview?: {
      title: string
      intro: string
      items: CategoryLandingContentBlock[]
    }
    flavourPlanning: {
      title: string
      intro: string
      items?: CategoryLandingContentBlock[]
    }
    delivery?: {
      title: string
      body: CategoryLandingEditorialTextBlock[]
    }
    faq: {
      title: string
      intro: string
      items: CatalogFaqItem[]
    }
    cta: CatalogCategoryCtaBandContent
  }
}

const categoryLandingLastSignificantUpdate = '2026-03-17'
const customQuotePagePath = '/custom-cakes' as const
const cakesPagePath = '/cakes' as const
const defaultHeroPrimaryAction = {
  href: customQuotePagePath,
  label: 'Start your enquiry'
}
const defaultHeroSecondaryAction = {
  href: cakesPagePath,
  label: 'View all cakes'
}
const defaultCtaSecondaryAction = {
  href: cakesPagePath,
  label: 'Browse all cakes'
}

const categoryLandingCopy = {
  'wedding-cakes': {
    slug: 'wedding-cakes',
    canonicalPath: '/wedding-cakes',
    collectionQueryValue: 'c-wedding-cakes',
    lastSignificantUpdate: categoryLandingLastSignificantUpdate,
    metadata: {
      title: 'Wedding Cakes Leeds | Elegant Handmade Wedding Cakes',
      description: 'Browse wedding cakes in Leeds by Olgish Cakes. Discover elegant handmade designs, bespoke finishes and flavours prepared for modern wedding celebrations.',
      keywords: 'wedding cakes leeds, bespoke wedding cakes leeds, handmade wedding cakes, leeds wedding cake maker',
      localBusinessDescription: 'Handmade wedding cakes in Leeds with bespoke decoration, elegant flavours and careful celebration planning from Olgish Cakes.',
      itemListName: 'Wedding Cakes in Leeds',
      openGraphImage: {
        url: '/images/cakes-collection.jpg',
        alt: 'Elegant handmade wedding cakes by Olgish Cakes in Leeds'
      }
    },
    hero: {
      title: 'Bespoke Wedding Cakes in Leeds',
      body: 'Elegant wedding cakes for celebrations across Yorkshire and the UK.'
    },
    sections: {
      proof: {
        title: 'Why couples choose Olgish Cakes',
        points: [
          'Handmade wedding cakes made to order',
          'Signature Honey Cake available for weddings',
          'Bespoke designs tailored to your celebration',
          'Delivery available across Yorkshire and the UK'
        ]
      },
      process: {
        title: 'How to order your wedding cake',
        intro: 'Ordering your wedding cake is simple. Share your plans, choose your design and flavours, and we will guide you through the rest.',
        steps: [
          {
            title: 'Share your wedding date',
            body: 'Tell us your wedding date, venue and approximate guest numbers.'
          },
          {
            title: 'Choose your design and flavours',
            body: 'Share inspiration photos or ideas, then choose your preferred cake flavour and finish.'
          },
          {
            title: 'Confirm the details',
            body: 'Finalise the size, design, guest numbers and any delivery requirements.'
          },
          {
            title: 'Receive your bespoke wedding cake',
            body: 'Your wedding cake will be prepared to order and delivered or collected as agreed.'
          }
        ]
      },
      overview: {
        title: 'Wedding cake planning should feel personal to your day',
        intro: 'Couples need more than a beautiful centrepiece. A bespoke wedding cake should suit your guest numbers, venue style, flavour preferences and wedding theme, while still feeling personal',
        items: [
          {
            title: 'Designed for your venue and wedding style',
            body: 'Your wedding cake should work with the flowers, table styling and room layout, so it feels like part of the celebration.'
          },
          {
            title: 'Balanced around guest numbers and servings',
            body: 'Tier count, portion size and display all matter. The right wedding cake structure keeps the design elegant and practical for serving.'
          }
        ]
      },
      flavourPlanning: {
        title: 'Wedding cake flavours',
        intro: 'Choose from Honey Cake, Red Velvet, Chocolate Delicia and other bespoke wedding cake flavours. Each cake is made to order and tailored to your celebration.'
      },
      faq: {
        title: 'Wedding cake FAQs',
        intro: 'Helpful answers about consultations, design changes, flavours and wedding cake planning in Leeds.',
        items: [
          {
            question: 'How far ahead should I enquire about a wedding cake?',
            answer: 'Earlier is always better for wedding dates, especially if you already have your venue booked. Once you know the date, venue and likely guest count, send an enquiry so we can confirm availability and start shaping the design and delivery plan around your day.'
          },
          {
            question: 'Can you work from inspiration photos or colour palettes?',
            answer: 'Yes. Inspiration photos, florals, stationery, table styling and colour palettes all help build a clearer brief. They are most useful when they show the overall feel you want, rather than trying to copy a cake detail for detail.'
          },
          {
            question: 'Do you offer different flavours for wedding cakes?',
            answer: 'Yes. Flavours, fillings and finishes can be shaped around your preferences, guest mix and serving plans. The best choice usually balances what feels personal to you with what will still work well for guests at the reception.'
          },
          {
            question: 'Do you provide wedding cake delivery?',
            answer: 'Yes. Delivery and collection are available across Leeds, Yorkshire and selected UK locations by arrangement, depending on your wedding cake and date.'
          },
          {
            question: 'Can you make a wedding cake for dietary requirements?',
            answer: 'Please ask before booking so we can confirm what is realistic for your date, design and ingredient needs. Some dietary requests are more straightforward than others once structure, decoration and flavour are all considered together.'
          }
        ]
      },
      cta: {
        title: 'Ready to plan your wedding cake?',
        body: 'Share your date, venue and style ideas and we will help you shape the right cake for your celebration.',
        primaryAction: {
          href: customQuotePagePath,
          label: 'Enquire now'
        },
        secondaryAction: defaultCtaSecondaryAction
      }
    }
  },
  'birthday-cakes': {
    slug: 'birthday-cakes',
    canonicalPath: '/birthday-cakes',
    collectionQueryValue: 'c-birthday-cakes',
    lastSignificantUpdate: categoryLandingLastSignificantUpdate,
    metadata: {
      title: 'Birthday Cakes Leeds | Handmade Custom Birthday Cakes',
      description: 'Explore birthday cakes in Leeds by Olgish Cakes. Find handmade custom cakes for children, adults and milestone celebrations with flavour and design flexibility.',
      keywords: 'birthday cakes leeds, custom birthday cakes leeds, handmade birthday cake, celebration cakes leeds',
      localBusinessDescription: 'Custom birthday cakes in Leeds made to order with handmade decoration, personal design details and flexible flavour options from Olgish Cakes.',
      itemListName: 'Birthday Cakes in Leeds',
      openGraphImage: {
        url: '/images/cakes-collection.jpg',
        alt: 'Handmade birthday cakes by Olgish Cakes in Leeds'
      }
    },
    hero: {
      title: 'Birthday Cakes in Leeds',
      body: 'Discover handmade birthday cakes in Leeds, with bespoke designs, signature flavours and finishes tailored to your celebration'
    },
    sections: {
      proof: {
        title: 'Why customers choose Olgish Cakes',
        intro: 'Birthday cakes usually work better when the person, the party style and the serving plan are all reflected in the brief instead of being guessed later.',
        points: [
          'Handmade birthday cakes made to order',
          'Signature Honey Cake available',
          'Bespoke designs for children and adults',
          'Delivery available across Yorkshire and the UK'
        ]
      },
      process: {
        title: 'How to order your birthday cake',
        intro: 'A simple sequence usually makes the order more useful because it turns the occasion details into a design that still works on the day.',
        steps: [
          {
            title: 'Share your celebration date',
            body: 'Tell us your celebration date, delivery area and approximate guest numbers.'
          },
          {
            title: 'Choose your design and flavours',
            body: 'Send inspiration photos or ideas, then choose your cake flavour, filling and finish.'
          },
          {
            title: 'Confirm size and personalisation',
            body: 'Finalise the cake size, colours, message, topper, personalisation and delivery details.'
          },
          {
            title: 'Receive your bespoke birthday cake',
            body: 'Your birthday cake is prepared to order and delivered or collected as agreed.'
          }
        ]
      },
      overview: {
        title: 'Birthday cakes for children, adults and milestone celebrations',
        intro: 'Browse handmade birthday cakes in Leeds, with bespoke designs, signature flavours and finishes made to order for every age and occasion.',
        items: [
          {
            title: "Children's birthday cakes in Leeds",
            body: 'Choose a birthday cake design that fits the child, the theme and the celebration. From favourite characters to simple colour-led designs, each cake is made to order.'
          },
          {
            title: 'Adult birthday cakes in Leeds',
            body: 'Handmade birthday cakes for adults, with elegant finishes, personal messages and flavour choices tailored to your celebration.'
          },
          {
            title: 'Milestone birthday cakes in Leeds',
            body: 'Celebrate 18th, 30th, 40th, 50th or 60th birthdays with a bespoke cake design made to suit the person and the occasion.'
          }
        ]
      },
      flavourPlanning: {
        title: 'Birthday cakes work best when the brief matches the celebration',
        intro: 'The right size, flavour and finish depend on guest numbers, the age group and how the cake will be served on the day.'
      },
      delivery: {
        title: 'Birthday cake delivery in Leeds',
        body: [
          'Delivery and collection can be arranged across Leeds, Yorkshire and selected nearby areas such as Bradford, York and Skipton, depending on the cake and the date.'
        ]
      },
      faq: {
        title: 'Birthday cake FAQs',
        intro: 'Helpful answers about themes, timings, flavours and birthday cake delivery in Leeds.',
        items: [
          {
            question: 'Can you make birthday cakes for children and adults?',
            answer: 'Yes. Birthday cakes can be shaped around children\'s themes, adult celebrations and milestone occasions. The strongest brief usually comes from sharing the age, style of event, colour direction and any personal references you want included.'
          },
          {
            question: 'How much notice do you need for a birthday cake?',
            answer: 'As much notice as possible is always helpful, especially for weekends and larger custom orders. If you have the date, guest count and rough design idea ready, send an enquiry early so availability and the best approach can be confirmed.'
          },
          {
            question: 'Can I request a personalised birthday cake design?',
            answer: 'Yes. Names, ages, themes, hobbies, colour palettes and cleaner milestone styling can all be built into the design. It usually helps to focus on one or two strong ideas instead of trying to fit everything onto the cake.'
          },
          {
            question: 'Do you offer birthday cake delivery in Leeds?',
            answer: 'Yes. Collection and local delivery can be arranged depending on the cake size, finish and timing of the celebration. Delivery becomes especially useful when the cake has a more delicate finish or needs to arrive close to the party start time.'
          },
          {
            question: 'Can you advise on birthday cake size and servings?',
            answer: 'Yes. Portion planning is part of the order process, so once you share the likely guest count and how formal the celebration is, we can help suggest a size that suits the event.'
          }
        ]
      },
      cta: {
        title: 'Planning a birthday cake in Leeds?',
        body: 'Send the occasion details, guest count and design direction and we will help shape a cake that fits the celebration properly.',
        primaryAction: {
          href: customQuotePagePath,
          label: 'Enquire now'
        },
        secondaryAction: defaultCtaSecondaryAction
      }
    }
  },
  'anniversary-cakes-leeds': {
    slug: 'anniversary-cakes-leeds',
    canonicalPath: '/anniversary-cakes-leeds',
    collectionQueryValue: 'c-anniversary-cakes',
    collectionQueryValueAliases: ['c-anniversary-cakes-leeds'],
    lastSignificantUpdate: categoryLandingLastSignificantUpdate,
    metadata: {
      title: 'Anniversary Cakes Leeds | Handmade Cakes for Milestones',
      description: 'Discover anniversary cakes in Leeds by Olgish Cakes. Find handmade designs for intimate dinners, family milestones and elegant celebrations with bespoke finishing.',
      keywords: 'anniversary cakes leeds, milestone cakes leeds, handmade anniversary cake, bespoke anniversary cakes',
      localBusinessDescription: 'Handmade anniversary cakes in Leeds with bespoke styling, flavour flexibility and careful celebration planning from Olgish Cakes.',
      itemListName: 'Anniversary Cakes in Leeds',
      openGraphImage: {
        url: '/images/cakes-collection.jpg',
        alt: 'Handmade anniversary cakes by Olgish Cakes in Leeds'
      }
    },
    hero: {
      title: 'Bespoke Anniversary Cakes',
      body: 'Celebrate your anniversary with a handmade cake made to order in Leeds. Choose your flavour, filling, size and finish, with delivery across Leeds and West Yorkshire by arrangement.'
    },
    sections: {
      proof: {
        title: 'Why customers choose Olgish Cakes',
        intro: 'An anniversary cake should feel personal, elegant and suited to your celebration. We help you choose the right flavour, size, finish and message before baking starts.',
        points: [
          'Made to order for your anniversary',
          'Personalised with names, dates or a special message',
          'Flavours suited to couples, families and guests',
          'Delivery available across Yorkshire and the UK by arrangement'
        ]
      },
      process: {
        title: 'How to order your anniversary cake',
        intro: 'Ordering your anniversary cake starts with your celebration plans. Share the date, guest numbers and preferred style, then we shape the cake around your occasion.',
        steps: [
          {
            title: 'Share your anniversary plans',
            body: 'Tell us your anniversary date, venue or delivery area, guest numbers and celebration style.'
          },
          {
            title: 'Choose your cake style',
            body: 'Pick your flavour, filling and finish, then send colours, flowers, toppers or inspiration images.'
          },
          {
            title: 'Add personal details',
            body: 'Confirm the size, message, names, date, decoration style and delivery or collection details.'
          },
          {
            title: 'Enjoy your anniversary cake',
            body: 'Your cake is made to order, packed with care and delivered or collected as agreed.'
          }
        ]
      },
      flavourPlanning: {
        title: 'Anniversary cake flavours and sizes',
        intro: 'Choose from our signature honey cake, sponge cake, red velvet cake and other flavours. Every personalised anniversary cake is made to order in Leeds. We help you choose the right size, flavour and finish for your celebration.',
        items: [
          {
            title: 'For quiet anniversary dinners',
            body: 'A smaller personalised anniversary cake suits intimate anniversary celebrations with close family or friends. Add names, dates or a short anniversary message.'
          },
          {
            title: 'For family anniversary gatherings',
            body: 'Choose a larger personalised anniversary cake with enough portions for family and friends. Multiple flavours and bespoke finishes are available.'
          },
          {
            title: 'For milestone anniversaries',
            body: 'Celebrate a 10th, 25th, 40th or 50th anniversary with edible flowers, gold details, custom cake toppers and personalised decoration.'
          }
        ]
      },
      delivery: {
        title: 'Flavours and sizes chosen for your anniversary',
        body: [
          'Choose from honey cake, sponge cake, red velvet and other flavours. We help match the cake size to your guest numbers and serving plan.'
        ]
      },
      faq: {
        title: 'Anniversary cake FAQs',
        intro: 'Helpful answers about sizing, style, delivery and planning an anniversary cake in Leeds.',
        items: [
          {
            question: 'Do you make anniversary cakes for smaller and larger milestones?',
            answer: 'Yes. We make anniversary cakes for quiet dinners, family lunches and larger milestone celebrations. We help you choose the right size, flavour, finish and decoration style based on guest numbers, venue and serving plans.'
          },
          {
            question: 'Do you offer anniversary cakes with dates, initials or floral details?',
            answer: 'Yes. We offer anniversary cakes with dates, initials, names, sugar flowers, fresh flowers, toppers or soft colour palettes. These details help the cake feel personal while keeping the design elegant.'
          },
          {
            question: 'How do I choose the right anniversary cake size?',
            answer: 'The best size depends on guest numbers, serving style and whether the cake is a centrepiece or dessert. Share your guest count, venue and portion plan, and we will recommend a suitable size for your anniversary.'
          },
          {
            question: 'Do you offer anniversary cake delivery in Leeds?',
            answer: 'Yes. We offer anniversary cake delivery across Leeds and West Yorkshire by arrangement. Collection is also available. Delivery depends on cake size, finish, location and event timing, especially for restaurants, venues and family celebrations.'
          },
          {
            question: 'Do you make anniversary cakes with specific flavour preferences?',
            answer: 'Yes. We make anniversary cakes with your chosen flavour, filling and finish. Share your preferences, guest numbers and celebration style, and we will suggest suitable options.'
          }
        ]
      },
      cta: {
        title: 'Planning an anniversary cake in Leeds?',
        body: 'Share the milestone, guest count and style direction and we will help shape a cake that suits the celebration properly.',
        primaryAction: {
          href: customQuotePagePath,
          label: 'Enquire now'
        },
        secondaryAction: defaultCtaSecondaryAction
      }
    }
  },
  'baby-shower-cakes': {
    slug: 'baby-shower-cakes',
    canonicalPath: '/baby-shower-cakes',
    collectionQueryValue: 'c-baby-shower-cakes',
    lastSignificantUpdate: categoryLandingLastSignificantUpdate,
    metadata: {
      title: 'Baby Shower Cakes Leeds | Handmade Baby Shower Cakes',
      description: 'Browse baby shower cakes in Leeds by Olgish Cakes. Discover handmade designs for gatherings, gifting and softer celebration styling with flexible flavours.',
      keywords: 'baby shower cakes leeds, handmade baby shower cake, custom baby shower cakes, celebration cakes leeds',
      localBusinessDescription: 'Handmade baby shower cakes in Leeds with bespoke styling, flexible flavour choices and clear celebration planning from Olgish Cakes.',
      itemListName: 'Baby Shower Cakes in Leeds',
      openGraphImage: {
        url: '/images/cakes-collection.jpg',
        alt: 'Handmade baby shower cakes by Olgish Cakes in Leeds'
      }
    },
    hero: {
      title: 'Baby Shower Cakes Made to Order',
      body: 'Handmade baby shower cakes with soft colours, floral details, toppers, names or messages. Made in Leeds for small gatherings and family events.'
    },
    sections: {
      proof: {
        title: 'Why choose Olgish Cakes',
        intro: 'A baby shower cake should feel soft, personal and easy to serve. We help you choose the right size, flavour, colours and finish before baking starts.',
        points: [
          'Made to order for your baby shower',
          'Soft colours, gentle details and personal messages',
          'Portion planning for family tables, gifting and daytime celebrations',
          'Collection or delivery across Leeds and West Yorkshire by arrangement'
        ]
      },
      process: {
        title: 'How to order your baby shower cake',
        intro: 'Ordering your baby shower cake starts with the date, guest numbers and celebration style. Then we guide the size, flavour and design.',
        steps: [
          {
            title: 'Share your shower date',
            body: 'Tell us the date, venue or delivery area, guest numbers and collection or delivery preference.'
          },
          {
            title: 'Choose your cake style',
            body: 'Pick soft colours, a short message, toppers, flowers or a gentle theme for the celebration.'
          },
          {
            title: 'Confirm size and flavour',
            body: 'Choose your flavour, filling and portion size, then confirm any name, date or personal details.'
          },
          {
            title: 'Receive your baby shower cake',
            body: 'Your baby shower cake is made to order, packed with care and delivered or collected as agreed.'
          }
        ]
      },
      overview: {
        title: 'Baby shower cake ideas for your celebration',
        intro: 'Baby shower cakes work well with soft buttercream, floral details, pastel colours, teddy bear toppers, baby blocks, bows or clean lettering.',
        items: [
          {
            title: 'Baby shower tables need a softer design language',
            body: 'Gentle colours, controlled decoration and clear wording usually feel more timeless than trying to force every theme detail into one cake.'
          },
          {
            title: 'Gift-led orders need sensible sizing',
            body: 'When the cake is being collected as a surprise or taken to another home, practical portion planning matters as much as the visual styling.'
          },
          {
            title: 'Family gatherings need an easy serving plan',
            body: 'If more guests are involved, it helps to size the cake around the table and the way it will actually be served once the celebration starts.'
          }
        ]
      },
      flavourPlanning: {
        title: 'Flavour and size decisions should stay practical for the gathering',
        intro: 'A baby shower cake still needs the practical details to be right. Portion size, flavour direction and transport should all be settled before the finish becomes more specific.'
      },
      delivery: {
        title: 'Baby shower cake delivery planning in Leeds',
        body: [
          'Shorter notice periods mean the travel plan matters early, especially if the cake is being gifted or timed closely to the shower itself.',
          {
            before: 'The ',
            href: '/contact',
            label: 'contact page',
            after: ' helps you compare the safer option before the brief gets more specific.'
          }
        ]
      },
      faq: {
        title: 'Baby shower cake FAQs',
        intro: 'Helpful answers about sizing, personalisation and planning a baby shower cake in Leeds.',
        items: [
          {
            question: 'Can you make baby shower cakes with personalised details?',
            answer: 'Yes. Baby shower cakes can include names, short messages, colour palettes and softer decorative details. The cleanest results usually come from choosing one calm design direction rather than trying to fit every idea onto the cake.'
          },
          {
            question: 'What size cake works best for a baby shower?',
            answer: 'The best size depends on whether the cake is for the shower itself, a family gathering afterwards or a gift-led order. Share the likely guest count and we can help suggest a sensible scale for the event.'
          },
          {
            question: 'Do you offer baby shower cake delivery in Leeds?',
            answer: 'Yes. Collection and local delivery can be arranged depending on the cake size, finish and timing. Deciding the travel plan early is especially useful when the order window is short.'
          },
          {
            question: 'Can I choose the flavour and colour palette?',
            answer: 'Yes. Flavour, colour direction and finishing details can all be adapted around your brief. It helps to decide first whether you want the cake to feel softer and understated or more obviously themed.'
          },
          {
            question: 'How much notice should I give for a baby shower cake?',
            answer: 'As much notice as you can. Once you know the date, rough guest count and design direction, send an enquiry so availability and the best practical approach can be confirmed.'
          }
        ]
      },
      cta: {
        title: 'Need a baby shower cake in Leeds?',
        body: 'Share the date, gathering details and style direction and we will help you shape a cake that fits the occasion properly.',
        primaryAction: {
          href: customQuotePagePath,
          label: 'Enquire now'
        },
        secondaryAction: defaultCtaSecondaryAction
      }
    }
  }
} satisfies Record<CatalogCategoryLandingSlug, CatalogCategoryLandingSource>

function createCategoryLandingConfig(
  source: CatalogCategoryLandingSource
): CatalogCategoryLandingConfig {
  return {
    slug: source.slug,
    canonicalPath: source.canonicalPath,
    collectionQueryValue: source.collectionQueryValue,
    collectionQueryValueAliases: source.collectionQueryValueAliases,
    lastSignificantUpdate: source.lastSignificantUpdate,
    title: source.metadata.title,
    description: source.metadata.description,
    keywords: source.metadata.keywords,
    heroTitle: source.hero.title,
    heroBody: source.hero.body,
    localBusinessDescription: source.metadata.localBusinessDescription,
    itemListName: source.metadata.itemListName,
    heroPrimaryAction: source.hero.primaryAction ?? defaultHeroPrimaryAction,
    heroSecondaryAction: source.hero.secondaryAction ?? defaultHeroSecondaryAction,
    audienceIntroTitle: source.sections.overview?.title,
    audienceIntroBody: source.sections.overview?.intro,
    useCases: source.sections.overview?.items,
    flavourSectionTitle: source.sections.flavourPlanning.title,
    flavourSectionIntro: source.sections.flavourPlanning.intro,
    flavourSectionItems: source.sections.flavourPlanning.items,
    proofSectionTitle: source.sections.proof.title,
    proofPoints: source.sections.proof.points,
    orderingSectionTitle: source.sections.process.title,
    orderingSteps: source.sections.process.steps,
    editorial: {
      proofIntro: source.sections.proof.intro,
      orderingIntro: source.sections.process.intro,
      delivery: source.sections.delivery
    },
    faqTitle: source.sections.faq.title,
    faqIntro: source.sections.faq.intro,
    faqItems: source.sections.faq.items,
    ctaBand: source.sections.cta,
    openGraphImage: source.metadata.openGraphImage
  }
}

export const categoryLandingConfig = Object.fromEntries(
  Object.entries(categoryLandingCopy).map(([slug, source]) => [
    slug,
    createCategoryLandingConfig(source)
  ])
) as Record<CatalogCategoryLandingSlug, CatalogCategoryLandingConfig>

export const categoryLandingCanonicalPaths = Object.freeze(
  Object.values(categoryLandingConfig).map((config) => config.canonicalPath)
)

const categoryLandingPathByQueryValue = new Map<string, `/${string}`>(
  Object.values(categoryLandingConfig).flatMap((config) => ([
    [config.collectionQueryValue, config.canonicalPath] as const,
    ...(config.collectionQueryValueAliases ?? []).map((queryValue) => [queryValue, config.canonicalPath] as const)
  ]))
)

export function getCategoryLandingConfig(slug: CatalogCategoryLandingSlug) {
  return categoryLandingConfig[slug]
}

export function getCategoryLandingPathByQueryValue(queryValue: string) {
  return categoryLandingPathByQueryValue.get(queryValue) ?? null
}
