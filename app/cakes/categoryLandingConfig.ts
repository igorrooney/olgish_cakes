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

export interface CatalogCategorySupportContent {
  title: string
  body: string
  highlights: string[]
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
  heroEyebrow: string
  heroTitle: string
  heroLead: string
  heroBody: string
  heroSupportLine?: string
  trustEyebrow?: string
  catalogSectionTitle: string
  catalogSectionIntro: string
  localBusinessDescription: string
  itemListName: string
  heroPrimaryAction: CategoryLandingAction
  heroSecondaryAction: CategoryLandingAction
  trustItems: CatalogTrustItem[]
  supportContent: CatalogCategorySupportContent
  audienceIntroTitle: string
  audienceIntroBody: string
  useCases: CategoryLandingContentBlock[]
  flavourSectionTitle: string
  flavourSectionIntro: string
  flavourHighlights: CategoryLandingContentBlock[]
  serviceAreaTitle?: string
  serviceAreaBody?: string
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
    heroEyebrow: 'Handmade in Leeds',
    heroTitle: 'Wedding Cakes in Leeds',
    heroLead: 'Elegant handmade wedding cakes for modern celebrations, carefully finished around your venue, style and serving plans.',
    heroBody: 'Browse bespoke wedding cake designs, from floral details and clean finishes to centrepieces that still feel personal to your day.',
    heroSupportLine: 'Consultation-friendly ordering, refined finishes and reliable planning support for your date.',
    trustEyebrow: defaultTrustEyebrow,
    catalogSectionTitle: 'Browse wedding cake designs',
    catalogSectionIntro: 'Compare elegant styles, flavour ideas and handcrafted finishes to find a wedding cake that fits the look and scale of your celebration.',
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
    supportContent: {
      title: 'Designed for wedding planning that feels calm and clear',
      body: 'These wedding cakes are ideal when you want a polished design, clear communication and flavour choices that still feel personal to your day.',
      highlights: [
        'Bespoke decoration matched to your wedding style',
        'Flexible flavour and finish options for different themes',
        'Clear planning support for delivery, collection and timings'
      ]
    },
    audienceIntroTitle: 'Wedding cake planning should feel specific to your day, not borrowed from a generic template',
    audienceIntroBody: 'Couples usually need more than a pretty centrepiece. The cake has to suit guest numbers, venue setup, flavour expectations and the overall visual tone of the celebration, while still feeling personal to the couple.',
    useCases: [
      {
        title: 'Designed to fit the venue and the styling',
        body: 'A strong wedding cake brief should connect with the flowers, table styling and room setting so the cake feels like part of the celebration rather than a separate visual idea.'
      },
      {
        title: 'Balanced around guest count and serving plans',
        body: 'Tier count, portioning and display decisions matter just as much as decoration. The right structure keeps the cake elegant in the room and practical once guests are being served.'
      },
      {
        title: 'Flexible enough for modern wedding preferences',
        body: 'Some couples want a clean and understated finish, while others want more floral detail or a stronger statement cake. The brief should follow your day, not force you into one style.'
      }
    ],
    flavourSectionTitle: 'Flavour, tier and finish choices should support the way the cake will actually be served',
    flavourSectionIntro: 'Wedding cakes work best when flavour and structure are chosen with the same care as the decoration. That means thinking about the couple, the guest mix and how the cake will be cut and plated on the day.',
    flavourHighlights: [
      {
        title: 'Choose tiers around real guest numbers',
        body: 'Guest count and serving style should decide the scale of the cake before the final finish is locked in. That keeps the design realistic and avoids under- or over-ordering.'
      },
      {
        title: 'Flavours should feel generous and memorable',
        body: 'Wedding cake flavours usually need to satisfy a wider group of guests while still feeling personal to the couple. A balanced brief often combines a polished finish with flavours that are easy to enjoy at a formal celebration.'
      },
      {
        title: 'Delicate decoration needs practical planning',
        body: 'Fresh florals, textured finishes and taller tiered designs can all affect transport, setup and display timing, so the practical details should be considered early.'
      }
    ],
    serviceAreaTitle: 'Leeds venue delivery and setup are part of the cake brief, not an afterthought',
    serviceAreaBody: 'If the cake is travelling to a hotel, wedding barn, restaurant or private venue, access windows and setup timing matter. Local collection and delivery can be planned around the finish, venue logistics and the point in the day when the cake needs to look its best.',
    proofSectionTitle: 'Why couples usually choose a bespoke wedding cake from a local maker',
    proofPoints: [
      'A design brief shaped around venue style, guest numbers and serving plans',
      'Flexible flavours and finishes matched to the overall wedding mood',
      'Leeds collection or local delivery planning for the practical side of the day',
      'Clear communication so design, timing and expectations stay aligned'
    ],
    orderingSectionTitle: 'A calmer wedding cake process starts with the details that matter most',
    orderingSteps: [
      {
        title: 'Share the date, venue and guest count',
        body: 'Once those basics are clear, it becomes much easier to sense-check tier size, serving plan and whether the cake needs delivery or collection.'
      },
      {
        title: 'Refine the visual direction',
        body: 'At this stage the cake can start borrowing from your flowers, styling, colour palette and the tone of the day rather than from generic wedding imagery.'
      },
      {
        title: 'Confirm flavour, finish and logistics',
        body: 'This is where the practical details matter most, especially for taller cakes, venue setup windows and more delicate decoration.'
      },
      {
        title: 'Finalise a cake that still works once guests are being served',
        body: 'The finished design should feel rewarding in the room and still make sense when it is cut, plated and remembered after the celebration.'
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
        question: 'Do you provide wedding cake delivery in Leeds?',
        answer: 'Yes. Local delivery and collection can be arranged depending on the scale of the cake, the finish, venue access and the timing required on the wedding day. Delivery planning is especially important for tiered cakes and delicate decoration.'
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
    heroEyebrow: 'Handmade in Leeds',
    heroTitle: 'Birthday Cakes in Leeds',
    heroLead: 'Handmade custom cakes for children, adults and milestone birthdays, with designs shaped around the person and the occasion.',
    heroBody: 'Browse birthday cake styles prepared for playful themes, elegant milestones and family celebrations, with flavour and finish choices tailored to your brief.',
    heroSupportLine: 'Flexible customisation, clear ordering and handmade cakes prepared in Leeds for memorable birthdays.',
    trustEyebrow: defaultTrustEyebrow,
    catalogSectionTitle: 'Browse birthday cake designs',
    catalogSectionIntro: 'Explore birthday cake ideas by finish, flavour and mood, then choose a design that suits the theme, age and size of your celebration.',
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
    supportContent: {
      title: 'Built for birthdays that need more than a generic supermarket brief',
      body: 'These cakes are suited to themed children\'s parties, polished adult celebrations and milestone birthdays where flavour, finish and personal touches all need to work together.',
      highlights: [
        'Design choices shaped around the person and the celebration style',
        'Flexible sizing for family parties, milestone dinners and larger gatherings',
        'Clear collection or Leeds delivery planning before the finish becomes delicate'
      ]
    },
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
    flavourHighlights: [
      {
        title: 'Match portions to the real guest list',
        body: 'Smaller dinners, children\'s parties and milestone gatherings all need different portion planning. Deciding the size early makes the visual brief much more realistic.'
      },
      {
        title: 'Let flavour reflect the occasion',
        body: 'A playful children\'s cake and a refined adult birthday cake may need very different flavour expectations. The right choice should feel enjoyable for the crowd, not chosen in isolation.'
      },
      {
        title: 'More delicate finishes need transport planning',
        body: 'Tall toppers, intricate details and cleaner fondant finishes can all affect whether collection or local delivery is the safer option on the day.'
      }
    ],
    serviceAreaTitle: 'Collection or local delivery in Leeds should be decided before the finish gets more delicate',
    serviceAreaBody: 'Some birthday cakes travel easily, while others need a more careful plan because of their size, finish or event timing. Deciding collection versus delivery early helps keep the decoration realistic and reduces stress closer to the celebration.',
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
    heroEyebrow: 'Handmade in Leeds',
    heroTitle: 'Anniversary Cakes in Leeds',
    heroLead: 'Elegant handmade anniversary cakes designed for intimate dinners, milestone gatherings and polished celebrations.',
    heroBody: 'Browse refined anniversary cake styles with personal details, balanced flavours and finishing that suits the scale of the occasion.',
    heroSupportLine: 'Thoughtful personalisation, handmade finishing and calm planning support for anniversary celebrations in Leeds.',
    trustEyebrow: defaultTrustEyebrow,
    catalogSectionTitle: 'Browse anniversary cake designs',
    catalogSectionIntro: 'Explore anniversary cake ideas with softer styling, milestone details and portion options that suit both intimate and larger family celebrations.',
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
    supportContent: {
      title: 'Made for anniversary milestones that need a more refined brief',
      body: 'These cakes work well when you want elegant decoration, controlled personalisation and a finish that suits the scale of the milestone rather than a louder party style.',
      highlights: [
        'Designs shaped for intimate dinners, restaurant bookings and family gatherings',
        'Selective personal details that keep the cake polished instead of crowded',
        'Collection or Leeds delivery planning matched to timing and venue needs'
      ]
    },
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
    flavourHighlights: [
      {
        title: 'Choose scale around the real event format',
        body: 'A restaurant table cake, a family lunch and a larger home celebration all need different size expectations. Working from the guest list first keeps the design realistic.'
      },
      {
        title: 'Keep flavours polished and appropriate for the milestone',
        body: 'Anniversary cakes usually feel strongest when the flavour direction is considered and balanced, especially when the celebration is more intimate or more formal.'
      },
      {
        title: 'Minimal finishes still need careful transport planning',
        body: 'Cleaner styling can look simple, but it still benefits from deciding early whether the cake is being collected or delivered to a restaurant, venue or family home.'
      }
    ],
    serviceAreaTitle: 'Collection and local delivery in Leeds should match the timing and setting of the celebration',
    serviceAreaBody: 'A cake heading to a restaurant, venue or family home on a fixed schedule needs the delivery plan to be part of the brief. Timing, table setup and transport all affect what finish is most sensible.',
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
    heroEyebrow: 'Handmade in Leeds',
    heroTitle: 'Baby Shower Cakes in Leeds',
    heroLead: 'Handmade baby shower cakes with warm styling, flexible sizing and practical planning for gifting and celebration tables.',
    heroBody: 'Browse baby shower cake ideas with gentle colours, personal details and portion choices suited to smaller gatherings and family events.',
    heroSupportLine: 'Soft styling, handmade finishing and straightforward ordering for baby shower celebrations in Leeds.',
    trustEyebrow: defaultTrustEyebrow,
    catalogSectionTitle: 'Browse baby shower cake designs',
    catalogSectionIntro: 'Explore softer celebration cakes with practical sizing, gentle decoration and flavour options suited to baby showers, gifting and family gatherings.',
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
    supportContent: {
      title: 'A softer celebration brief still needs practical planning',
      body: 'These cakes are suited to baby showers, gifting moments and family gatherings where warmth, clear styling and manageable portions matter more than louder decoration.',
      highlights: [
        'Gentle personalisation that still feels polished',
        'Sizes suited to showers, gifting and smaller family tables',
        'Clear collection or Leeds delivery planning when timings are tight'
      ]
    },
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
    flavourHighlights: [
      {
        title: 'Choose size around the real event',
        body: 'A smaller shower, a larger family gathering and a gift-led order all need different scales. Deciding this early keeps the design and budget more realistic.'
      },
      {
        title: 'Keep flavour choices approachable',
        body: 'Baby shower cakes usually feel strongest when the flavour is easy for a mixed group to enjoy and still suits the softer, more personal tone of the event.'
      },
      {
        title: 'Transport can shape the finish',
        body: 'Even gentle-looking cakes benefit from deciding early whether they will be collected or delivered locally, especially when the timing window is short.'
      }
    ],
    serviceAreaTitle: 'Collection and local delivery should be planned early when the order window is short',
    serviceAreaBody: 'Baby shower orders often run on tighter timelines than wedding cakes or larger event cakes. Deciding how the cake will travel helps keep the design practical and avoids last-minute changes to the finish.',
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


