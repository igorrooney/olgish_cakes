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

interface CategoryLandingContentLink {
  href: string
  label: string
  description: string
}

export interface CatalogTrustItem {
  title: string
  detail: string
}

export interface CatalogCategoryCtaBandContent {
  title: string
  body: string
  primaryAction: CategoryLandingAction
  secondaryAction: CategoryLandingAction
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
  heroSupportLine?: string
  trustEyebrow?: string
  localBusinessDescription: string
  itemListName: string
  heroPrimaryAction: CategoryLandingAction
  heroSecondaryAction: CategoryLandingAction
  trustItems: CatalogTrustItem[]
  audienceIntroTitle: string
  audienceIntroBody: string
  useCases: CategoryLandingContentBlock[]
  flavourSectionTitle: string
  flavourSectionIntro: string
  proofSectionTitle: string
  proofPoints: string[]
  orderingSectionTitle: string
  orderingSteps: CategoryLandingContentBlock[]
  internalLinks: CategoryLandingContentLink[]
  faqTitle: string
  faqIntro: string
  faqItems: CatalogFaqItem[]
  ctaBand: CatalogCategoryCtaBandContent
  openGraphImage: {
    url: string
    alt: string
  }
}

const defaultTrustItems: CatalogTrustItem[] = [
  {
    title: 'Handmade in Leeds',
    detail: 'Prepared to order with careful finishing and clear communication from first enquiry.'
  },
  {
    title: 'Collection and local delivery',
    detail: 'Flexible Leeds options depending on the cake size, finish and timing of your order.'
  },
  {
    title: 'UK delivery by arrangement',
    detail: 'Selected orders can travel further when the design and delivery plan are agreed in advance.'
  },
  {
    title: 'Designed around your brief',
    detail: 'Flavour, finish and styling can be shaped around the occasion without overcomplicating the process.'
  }
]

const defaultTrustEyebrow = 'Why customers choose Olgish Cakes'
const categoryLandingLastSignificantUpdate = '2026-03-17'
const customQuotePagePath = '/get-custom-quote' as const

export const categoryLandingConfig: Record<CatalogCategoryLandingSlug, CatalogCategoryLandingConfig> = {
  'wedding-cakes': {
    slug: 'wedding-cakes',
    canonicalPath: '/wedding-cakes',
    collectionQueryValue: 'c-wedding-cakes',
    lastSignificantUpdate: categoryLandingLastSignificantUpdate,
    title: 'Wedding Cakes Leeds | Elegant Handmade Wedding Cakes',
    description: 'Browse wedding cakes in Leeds by Olgish Cakes. Discover elegant handmade designs, bespoke finishes and flavours prepared for modern wedding celebrations.',
    keywords: 'wedding cakes leeds, bespoke wedding cakes leeds, handmade wedding cakes, leeds wedding cake maker',
    heroTitle: 'Bespoke Wedding Cakes in Leeds',
    heroBody: 'Elegant wedding cakes for celebrations across Yorkshire and the UK.',
    heroSupportLine: 'Consultation-friendly ordering, refined finishes and reliable planning support for your date.',
    trustEyebrow: defaultTrustEyebrow,
    localBusinessDescription: 'Handmade wedding cakes in Leeds with bespoke decoration, elegant flavours and careful celebration planning from Olgish Cakes.',
    itemListName: 'Wedding Cakes in Leeds',
    heroPrimaryAction: {
      href: customQuotePagePath,
      label: 'Start your enquiry'
    },
    heroSecondaryAction: {
      href: '/cakes',
      label: 'View all cakes'
    },
    trustItems: defaultTrustItems,
    audienceIntroTitle: 'Wedding cake planning should feel personal to your day',
    audienceIntroBody: 'Couples need more than a beautiful centrepiece. A bespoke wedding cake should suit your guest numbers, venue style, flavour preferences and wedding theme, while still feeling personal',
    useCases: [
      {
        title: 'Designed for your venue and wedding style',
        body: 'Your wedding cake should work with the flowers, table styling and room layout, so it feels like part of the celebration.'
      },
      {
        title: 'Balanced around guest numbers and servings',
        body: 'Tier count, portion size and display all matter. The right wedding cake structure keeps the design elegant and practical for serving.'
      }
    ],
    flavourSectionTitle: 'Wedding cake flavours',
    flavourSectionIntro: 'Choose from Honey Cake, Red Velvet, Chocolate Delicia and other bespoke wedding cake flavours. Each cake is made to order and tailored to your celebration.',
    proofSectionTitle: 'Why couples choose Olgish Cakes',
    proofPoints: [
      'Handmade wedding cakes made to order',
      'Signature Honey Cake available for weddings',
      'Bespoke designs tailored to your celebration',
      'Delivery available across Yorkshire and the UK'
    ],
    orderingSectionTitle: 'How to order your wedding cake',
    orderingSteps: [
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
    ],
    internalLinks: [
      {
        href: customQuotePagePath,
        label: 'Get a custom quote',
        description: 'Send your date, venue and serving details when you want pricing shaped around your own brief.'
      }
    ],
    faqTitle: 'Wedding cake FAQs',
    faqIntro: 'Helpful answers about consultations, design changes, flavours and wedding cake planning in Leeds.',
    faqItems: [
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
        answer: 'Please ask before booking so I can confirm what is realistic for your date, design and ingredient needs. Some dietary requests are more straightforward than others once structure, decoration and flavour are all considered together.'
      }
    ],
    ctaBand: {
      title: 'Ready to plan your wedding cake?',
      body: 'Share your date, venue and style ideas and I will help you shape the right cake for your celebration.',
      primaryAction: {
        href: customQuotePagePath,
        label: 'Enquire now'
      },
      secondaryAction: {
        href: '/cakes',
        label: 'Browse all cakes'
      }
    },
    openGraphImage: {
      url: '/images/cakes-collection.jpg',
      alt: 'Elegant handmade wedding cakes by Olgish Cakes in Leeds'
    }
  },
  'birthday-cakes': {
    slug: 'birthday-cakes',
    canonicalPath: '/birthday-cakes',
    collectionQueryValue: 'c-birthday-cakes',
    lastSignificantUpdate: categoryLandingLastSignificantUpdate,
    title: 'Birthday Cakes Leeds | Handmade Custom Birthday Cakes',
    description: 'Explore birthday cakes in Leeds by Olgish Cakes. Find handmade custom cakes for children, adults and milestone celebrations with flavour and design flexibility.',
    keywords: 'birthday cakes leeds, custom birthday cakes leeds, handmade birthday cake, celebration cakes leeds',
    heroTitle: 'Birthday Cakes in Leeds',
    heroBody: 'Browse birthday cake styles prepared for playful themes, elegant milestones and family celebrations, with flavour and finish choices tailored to your brief.',
    heroSupportLine: 'Flexible customisation, clear ordering and handmade cakes prepared in Leeds for memorable birthdays.',
    trustEyebrow: defaultTrustEyebrow,
    localBusinessDescription: 'Custom birthday cakes in Leeds made to order with handmade decoration, personal design details and flexible flavour options from Olgish Cakes.',
    itemListName: 'Birthday Cakes in Leeds',
    heroPrimaryAction: {
      href: customQuotePagePath,
      label: 'Start your enquiry'
    },
    heroSecondaryAction: {
      href: '/cakes',
      label: 'View all cakes'
    },
    trustItems: defaultTrustItems,
    audienceIntroTitle: 'Birthday cakes work best when the brief fits the person, not just the party theme',
    audienceIntroBody: 'A birthday cake should still make sense for the person being celebrated. The right brief depends on the age, the style of the event, the guest count and how much visual detail the cake really needs.',
    useCases: [
      {
        title: 'Children\'s birthdays need a readable theme',
        body: 'For younger birthdays, the best results usually come from choosing one clear character, colour direction or activity rather than trying to fit every idea onto a single cake.'
      },
      {
        title: 'Adult birthdays often need a cleaner finish',
        body: 'Adult celebration cakes usually feel stronger when the decoration stays more edited. Colour, message and styling should support each other instead of competing for space.'
      },
      {
        title: 'Milestone birthdays need clearer occasion cues',
        body: 'An 18th, 30th, 40th or 60th birthday should not all look interchangeable. The cake should reflect the tone of the milestone and the person rather than defaulting to generic celebration details.'
      }
    ],
    flavourSectionTitle: 'Size, flavour and decoration should follow the gathering rather than guesswork',
    flavourSectionIntro: 'Birthday cakes usually work best when the practical choices are settled early. That means matching portions, flavour direction and finish to the people actually attending the celebration.',
    proofSectionTitle: 'Why a bespoke birthday cake often works better than a generic celebration design',
    proofPoints: [
      'A design direction shaped around the age, theme and tone of the event',
      'Portion planning that fits family parties, adult dinners or larger milestones',
      'Flavour choices that feel right for the people actually eating the cake',
      'Collection or Leeds delivery plans matched to the finish and timing'
    ],
    orderingSectionTitle: 'A better birthday cake brief usually comes together in four simple steps',
    orderingSteps: [
      {
        title: 'Start with the date and likely guest count',
        body: 'Those two details set the size and help narrow down whether the cake is for a small gathering, a children\'s party or a bigger milestone event.'
      },
      {
        title: 'Choose one clear design direction',
        body: 'It is usually better to anchor the cake around one theme, hobby, colour palette or message than to overload the design with unrelated ideas.'
      },
      {
        title: 'Confirm flavours and practical handling',
        body: 'This is the point to sense-check flavour expectations, toppers, decoration details and whether the cake should be collected or delivered locally.'
      },
      {
        title: 'Finish with a cake that still works for the event itself',
        body: 'The final brief should make sense once guests arrive, photos are taken and the cake actually needs to be served.'
      }
    ],
    internalLinks: [
      {
        href: customQuotePagePath,
        label: 'Get a custom quote',
        description: 'Send the date, occasion details and design direction for a quote matched to your brief.'
      }
    ],
    faqTitle: 'Birthday cake FAQs',
    faqIntro: 'Helpful answers about themes, timings, flavours and birthday cake delivery in Leeds.',
    faqItems: [
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
        answer: 'Yes. Portion planning is part of the order process, so once you share the likely guest count and how formal the celebration is, I can help suggest a size that suits the event.'
      }
    ],
    ctaBand: {
      title: 'Planning a birthday cake in Leeds?',
      body: 'Send the occasion details, guest count and design direction and I will help shape a cake that fits the celebration properly.',
      primaryAction: {
        href: customQuotePagePath,
        label: 'Enquire now'
      },
      secondaryAction: {
        href: '/cakes',
        label: 'Browse all cakes'
      }
    },
    openGraphImage: {
      url: '/images/cakes-collection.jpg',
      alt: 'Handmade birthday cakes by Olgish Cakes in Leeds'
    }
  },
  'anniversary-cakes-leeds': {
    slug: 'anniversary-cakes-leeds',
    canonicalPath: '/anniversary-cakes-leeds',
    collectionQueryValue: 'c-anniversary-cakes',
    collectionQueryValueAliases: ['c-anniversary-cakes-leeds'],
    lastSignificantUpdate: categoryLandingLastSignificantUpdate,
    title: 'Anniversary Cakes Leeds | Handmade Cakes for Milestones',
    description: 'Discover anniversary cakes in Leeds by Olgish Cakes. Find handmade designs for intimate dinners, family milestones and elegant celebrations with bespoke finishing.',
    keywords: 'anniversary cakes leeds, milestone cakes leeds, handmade anniversary cake, bespoke anniversary cakes',
    heroTitle: 'Anniversary Cakes in Leeds',
    heroBody: 'Browse refined anniversary cake styles with personal details, balanced flavours and finishing that suits the scale of the occasion.',
    heroSupportLine: 'Thoughtful personalisation, handmade finishing and calm planning support for anniversary celebrations in Leeds.',
    trustEyebrow: defaultTrustEyebrow,
    localBusinessDescription: 'Handmade anniversary cakes in Leeds with bespoke styling, flavour flexibility and careful celebration planning from Olgish Cakes.',
    itemListName: 'Anniversary Cakes in Leeds',
    heroPrimaryAction: {
      href: customQuotePagePath,
      label: 'Start your enquiry'
    },
    heroSecondaryAction: {
      href: '/cakes',
      label: 'View all cakes'
    },
    trustItems: defaultTrustItems,
    audienceIntroTitle: 'Anniversary cakes should fit the scale of the milestone and the way you are actually celebrating',
    audienceIntroBody: 'Anniversary orders tend to work best when the cake reflects the real setting. A quiet dinner, a family lunch and a larger milestone event all need a different balance of size, detail and visual presence.',
    useCases: [
      {
        title: 'Intimate anniversary dinners need restraint',
        body: 'For smaller celebrations, cleaner styling and selective personal details often feel more elegant than a louder celebration-cake approach.'
      },
      {
        title: 'Family milestone gatherings need clearer portion logic',
        body: 'Once more guests are involved, the cake needs to stay polished while still being practical to serve and proportioned correctly for the table.'
      },
      {
        title: 'Personal details should support the milestone',
        body: 'Dates, initials, floral cues and softer colour palettes often go further than overloading the brief with too many decorative references.'
      }
    ],
    flavourSectionTitle: 'Flavour and size decisions should support the mood of the anniversary, not compete with it',
    flavourSectionIntro: 'A refined anniversary cake should still be practical. The flavours need to suit the people attending and the scale should make sense for the type of celebration being planned.',
    proofSectionTitle: 'Why anniversary customers usually want a more bespoke brief',
    proofPoints: [
      'Decoration that feels measured and personal rather than generic',
      'Sizing that matches an intimate dinner, family gathering or milestone event',
      'Flavour choices shaped around the people attending and the tone of the celebration',
      'Leeds collection or delivery plans that support timing, setup and finish'
    ],
    orderingSectionTitle: 'A polished anniversary cake brief usually follows a clear sequence',
    orderingSteps: [
      {
        title: 'Start with the milestone, date and setting',
        body: 'Those details help decide whether the cake should feel more intimate, more formal or better suited to a wider family gathering.'
      },
      {
        title: 'Choose the right level of personal detail',
        body: 'Dates, initials, florals and subtle colour direction usually work best when they are selective rather than layered in all at once.'
      },
      {
        title: 'Confirm flavour, size and handling',
        body: 'This is the point to align portion expectations, flavour choices and whether collection or local delivery is the better option.'
      },
      {
        title: 'Finish with a cake that suits the celebration itself',
        body: 'The final design should feel rewarding in the room, practical to serve and properly connected to the milestone being marked.'
      }
    ],
    internalLinks: [
      {
        href: '/contact',
        label: 'Contact',
        description: 'Use the contact page if you already know the celebration details and want to discuss the brief directly.'
      }
    ],
    faqTitle: 'Anniversary cake FAQs',
    faqIntro: 'Helpful answers about sizing, style, delivery and planning an anniversary cake in Leeds.',
    faqItems: [
      {
        question: 'Can you make anniversary cakes for smaller and larger milestones?',
        answer: 'Yes. Anniversary cakes can be designed for quiet dinners, family lunches and larger milestone celebrations. The best approach depends on the guest count, the setting and how much visual presence you want the cake to have.'
      },
      {
        question: 'Can an anniversary cake include dates, initials or floral details?',
        answer: 'Yes. Selective personal details such as dates, initials, sugar flowers or a softer colour palette often work very well for anniversary cakes, especially when the design is meant to feel elegant rather than loud.'
      },
      {
        question: 'How do I choose the right anniversary cake size?',
        answer: 'The right size depends on the number of guests, whether the cake is a table centrepiece or a serving dessert, and how formal the celebration is. Share the expected guest count and I can help sense-check the most suitable scale.'
      },
      {
        question: 'Do you offer anniversary cake delivery in Leeds?',
        answer: 'Yes. Local delivery and collection can be arranged depending on the cake size, finish and event timing. Delivery is especially useful when the cake is heading to a restaurant, venue or family home on a fixed schedule.'
      },
      {
        question: 'Can you make an anniversary cake with specific flavour preferences?',
        answer: 'Yes. Flavour choices can be tailored around your preferences and the type of celebration, whether you want something refined for a smaller dinner or more broadly crowd-pleasing for a larger family event.'
      }
    ],
    ctaBand: {
      title: 'Planning an anniversary cake in Leeds?',
      body: 'Share the milestone, guest count and style direction and I will help shape a cake that suits the celebration properly.',
      primaryAction: {
        href: customQuotePagePath,
        label: 'Enquire now'
      },
      secondaryAction: {
        href: '/cakes',
        label: 'Browse all cakes'
      }
    },
    openGraphImage: {
      url: '/images/cakes-collection.jpg',
      alt: 'Handmade anniversary cakes by Olgish Cakes in Leeds'
    }
  },
  'baby-shower-cakes': {
    slug: 'baby-shower-cakes',
    canonicalPath: '/baby-shower-cakes',
    collectionQueryValue: 'c-baby-shower-cakes',
    lastSignificantUpdate: categoryLandingLastSignificantUpdate,
    title: 'Baby Shower Cakes Leeds | Handmade Baby Shower Cakes',
    description: 'Browse baby shower cakes in Leeds by Olgish Cakes. Discover handmade designs for gatherings, gifting and softer celebration styling with flexible flavours.',
    keywords: 'baby shower cakes leeds, handmade baby shower cake, custom baby shower cakes, celebration cakes leeds',
    heroTitle: 'Baby Shower Cakes in Leeds',
    heroBody: 'Browse baby shower cake ideas with gentle colours, personal details and portion choices suited to smaller gatherings and family events.',
    heroSupportLine: 'Soft styling, handmade finishing and straightforward ordering for baby shower celebrations in Leeds.',
    trustEyebrow: defaultTrustEyebrow,
    localBusinessDescription: 'Handmade baby shower cakes in Leeds with bespoke styling, flexible flavour choices and clear celebration planning from Olgish Cakes.',
    itemListName: 'Baby Shower Cakes in Leeds',
    heroPrimaryAction: {
      href: customQuotePagePath,
      label: 'Start your enquiry'
    },
    heroSecondaryAction: {
      href: '/cakes',
      label: 'View all cakes'
    },
    trustItems: defaultTrustItems,
    audienceIntroTitle: 'Baby shower cakes should feel warm, personal and easy to place into the celebration',
    audienceIntroBody: 'Baby shower cakes often work best when the brief stays calm and practical. The cake may be a centrepiece, a family-table dessert or a thoughtful gift, so the finish should suit the real setting rather than just follow a trend.',
    useCases: [
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
    ],
    flavourSectionTitle: 'Flavour and size decisions should stay practical for the gathering',
    flavourSectionIntro: 'A baby shower cake still needs the practical details to be right. Portion size, flavour direction and transport should all be settled before the finish becomes more specific.',
    proofSectionTitle: 'Why this type of cake works well for baby showers and gifting moments',
    proofPoints: [
      'A softer design brief that still feels personal and polished',
      'Portion planning matched to showers, gifting and family tables',
      'Flavour choices that suit mixed groups and daytime celebrations',
      'Collection or Leeds delivery options planned around a shorter order window'
    ],
    orderingSectionTitle: 'A practical baby shower order usually comes together in four simple steps',
    orderingSteps: [
      {
        title: 'Confirm the real event date',
        body: 'Baby shower cakes sometimes shift between the shower itself, a family meal or a gifting date, so it helps to start with the exact occasion first.'
      },
      {
        title: 'Choose one calm design direction',
        body: 'A softer palette, a short message or a gentle theme usually goes further than layering too many decorative ideas into one cake.'
      },
      {
        title: 'Settle size, flavour and transport',
        body: 'This is the point to decide what portion size makes sense and whether collection or local delivery is the safer plan.'
      },
      {
        title: 'Finish with a brief that stays easy to manage',
        body: 'The final cake should feel warm and personal without becoming overcomplicated for the timeline or the gathering itself.'
      }
    ],
    internalLinks: [
      {
        href: customQuotePagePath,
        label: 'Get a custom quote',
        description: 'Send the date, gathering details and design direction for a tailored starting quote.'
      }
    ],
    faqTitle: 'Baby shower cake FAQs',
    faqIntro: 'Helpful answers about sizing, personalisation and planning a baby shower cake in Leeds.',
    faqItems: [
      {
        question: 'Can you make baby shower cakes with personalised details?',
        answer: 'Yes. Baby shower cakes can include names, short messages, colour palettes and softer decorative details. The cleanest results usually come from choosing one calm design direction rather than trying to fit every idea onto the cake.'
      },
      {
        question: 'What size cake works best for a baby shower?',
        answer: 'The best size depends on whether the cake is for the shower itself, a family gathering afterwards or a gift-led order. Share the likely guest count and I can help suggest a sensible scale for the event.'
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
    ],
    ctaBand: {
      title: 'Need a baby shower cake in Leeds?',
      body: 'Share the date, gathering details and style direction and I will help you shape a cake that fits the occasion properly.',
      primaryAction: {
        href: customQuotePagePath,
        label: 'Enquire now'
      },
      secondaryAction: {
        href: '/cakes',
        label: 'Browse all cakes'
      }
    },
    openGraphImage: {
      url: '/images/cakes-collection.jpg',
      alt: 'Handmade baby shower cakes by Olgish Cakes in Leeds'
    }
  }
}

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


