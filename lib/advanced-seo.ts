import { getMerchantReturnPolicy } from '@/app/utils/seo'
import { formatStructuredDataPrice } from '@/lib/utils/price-formatting'

type ProductAvailability =
  | 'BackOrder'
  | 'Discontinued'
  | 'InStock'
  | 'InStoreOnly'
  | 'LimitedAvailability'
  | 'OnlineOnly'
  | 'OutOfStock'
  | 'PreOrder'
  | 'SoldOut'

export const ADVANCED_SEO_CONFIG = {
  PRIMARY_KEYWORDS: [
    'ukrainian cakes leeds',
    'honey cake leeds',
    'medovik cake uk',
    'custom cakes leeds',
    'wedding cakes leeds',
    'birthday cakes leeds',
    'bespoke cakes yorkshire',
    'professional cake design leeds',
    'ukrainian bakery uk',
    'traditional honey cake'
  ],
  LONG_TAIL_KEYWORDS: [
    'ukrainian honey cake in leeds',
    'where to buy medovik cake leeds',
    'custom wedding cake designers leeds',
    'traditional ukrainian bakery yorkshire',
    'cake decorating services leeds',
    'authentic honey cake leeds',
    'bespoke birthday cake design uk',
    'cake delivery leeds',
    'handmade ukrainian cakes west yorkshire',
    'artisan cake maker leeds'
  ],
  LOCAL_KEYWORDS: [
    'cakes near me leeds',
    'cake shop leeds',
    'cake delivery leeds',
    'wedding cake maker leeds',
    'birthday cake leeds availability',
    'cake decorator leeds',
    'custom cake leeds',
    'ukrainian food leeds',
    'speciality cakes yorkshire',
    'cake artist leeds'
  ],
  VOICE_SEARCH_KEYWORDS: [
    'where can I get ukrainian cake in leeds',
    'ukrainian cake shop in leeds',
    'how to order custom cake leeds',
    'ukrainian honey cake near me',
    'wedding cake delivery leeds',
    'birthday cake availability leeds',
    'cake making classes leeds',
    'speciality cake decorator leeds',
    'authentic medovik cake uk',
    'professional cake design leeds'
  ],
  SEMANTIC_KEYWORDS: [
    'cake decorating',
    'sugar craft',
    'fondant work',
    'buttercream piping',
    'cake design',
    'edible art',
    'celebration cakes',
    'special occasion',
    'handcrafted',
    'artisanal',
    'made to order',
    'fresh ingredients',
    'creative design'
  ],
  COMPETITIVE_KEYWORDS: [
    'ukrainian cakes leeds',
    'bespoke cakes leeds',
    'handmade cakes leeds',
    'traditional cake shop leeds',
    'custom cake maker leeds',
    'medovik cake leeds'
  ]
}

export function generateAdvancedMetaTitle(
  baseTitle: string,
  location: string = 'Leeds',
  _year: string = new Date().getFullYear().toString()
): string {
  const descriptors = ['Ukrainian', 'Traditional', 'Handmade', 'Bespoke', 'Authentic', 'Custom']
  const descriptor = descriptors[Math.floor(Math.random() * descriptors.length)]
  const templates = [
    `${descriptor} ${baseTitle} in ${location} | Olgish Cakes`,
    `${baseTitle} ${location} | ${descriptor} Cakes`,
    `Explore ${baseTitle} in ${location} | ${descriptor} Designs`
  ]

  return templates[Math.floor(Math.random() * templates.length)]
}

export function generateAdvancedMetaDescription(
  product: string,
  location: string = 'Leeds',
  uniqueValue: string = 'authentic Ukrainian recipes'
): string {
  return `Handmade ${product} in ${location} using ${uniqueValue}. Tell us your date, serving size and design ideas, and we’ll confirm the available options.`
}

export function generateAdvancedStructuredData(data: {
  name: string
  description: string
  imageUrl?: string
  price?: number
  category: string
  availability?: ProductAvailability
  location?: string
}) {
  const baseUrl = 'https://olgishcakes.co.uk'
  const productSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const imageUrl = data.imageUrl?.startsWith('http')
    ? data.imageUrl
    : data.imageUrl
      ? `${baseUrl}${data.imageUrl}`
      : undefined
  const hasPrice = typeof data.price === 'number' && Number.isFinite(data.price) && data.price > 0

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `${baseUrl}/cakes/${productSlug}#product`,
        name: data.name,
        description: data.description,
        ...(imageUrl ? { image: [imageUrl] } : {}),
        category: data.category,
        brand: {
          '@type': 'Brand',
          name: 'Olgish Cakes',
          url: baseUrl
        },
        ...(hasPrice
          ? {
              offers: {
                '@type': 'Offer',
                price: formatStructuredDataPrice(data.price, 0),
                priceCurrency: 'GBP',
                ...(data.availability
                  ? { availability: `https://schema.org/${data.availability}` }
                  : {}),
                seller: {
                  '@type': 'Organization',
                  name: 'Olgish Cakes',
                  url: baseUrl
                },
                hasMerchantReturnPolicy: getMerchantReturnPolicy()
              }
            }
          : {})
      },
      {
        '@type': 'Bakery',
        '@id': `${baseUrl}/#bakery`,
        name: 'Olgish Cakes',
        description: 'Ukrainian bakery in Leeds specialising in handmade honey cakes, custom celebration cakes and traditional desserts.',
        url: baseUrl,
        telephone: '+44 786 721 8194',
        email: 'hello@olgishcakes.co.uk',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '15 Allerton Grange Avenue',
          addressLocality: 'Leeds',
          addressRegion: 'West Yorkshire',
          postalCode: 'LS17 6PR',
          addressCountry: 'GB'
        },
        areaServed: data.location || 'Leeds'
      },
      {
        '@type': 'HowTo',
        name: 'How to order a custom cake from Olgish Cakes',
        description: 'Steps for sending a custom-cake enquiry.',
        step: [
          {
            '@type': 'HowToStep',
            name: 'Browse cake options',
            text: 'Browse our cake pages for ideas.',
            url: `${baseUrl}/cakes`
          },
          {
            '@type': 'HowToStep',
            name: 'Send an enquiry',
            text: 'Tell us your date, serving size and design requirements.',
            url: `${baseUrl}/custom-cakes`
          },
          {
            '@type': 'HowToStep',
            name: 'Confirm the details',
            text: 'Review the offer, allergen information and collection or delivery arrangements.'
          }
        ]
      }
    ]
  }
}

export function generateAISearchOptimization(content: {
  topic: string
  expertise: string[]
  location: string
}) {
  return {
    aiContext: `Olgish Cakes is a Ukrainian bakery in ${content.location} specialising in ${content.expertise.join(', ')}.`,
    factualClaims: [
      `Olgish Cakes is a Ukrainian bakery in ${content.location}`,
      'Olgish Cakes makes honey cake (medovik) using Ukrainian recipes',
      'The cakes are handmade in Leeds',
      'Delivery options depend on the product, destination and requested date'
    ],
    qaPairs: [
      {
        question: `Where can I buy Ukrainian cake in ${content.location}?`,
        answer: `Olgish Cakes is a Ukrainian bakery in ${content.location} offering honey cakes and custom designs.`
      },
      {
        question: 'What is medovik cake?',
        answer: 'Medovik is a layered honey cake with a soft filling.'
      }
    ]
  }
}

export function generateTopicCluster(mainTopic: string, location: string = 'Leeds') {
  const clusters = {
    'ukrainian-cakes': {
      pillar: `Guide to Ukrainian cakes in ${location}`,
      supporting: [
        'Traditional Ukrainian honey cake',
        `Ukrainian baking in ${location}`,
        'Ukrainian wedding cake traditions',
        'How to store honey cake',
        'Ukrainian cake ingredients'
      ]
    },
    'custom-cakes': {
      pillar: `Custom cake design services in ${location}`,
      supporting: [
        'Wedding cake design ideas',
        'Birthday cake ideas for adults',
        `Corporate cake design ${location}`,
        'Cake decoration techniques',
        'Choosing a cake flavour'
      ]
    },
    'cake-delivery': {
      pillar: `Cake delivery services in ${location}`,
      supporting: [
        `Cake delivery availability ${location}`,
        'Wedding cake delivery tips',
        'Cake transport and storage',
        'Delivery areas we cover',
        'Ordering process explained'
      ]
    }
  }

  return clusters[mainTopic as keyof typeof clusters] || clusters['ukrainian-cakes']
}

export function generateEATOptimization() {
  return {
    expertise: {
      credentials: [
        'Ukrainian culinary heritage',
        'Publish food-safety credentials only while the evidence is current',
        'Publish training and qualifications only after verification'
      ],
      demonstrations: [
        'Detailed recipe explanations and techniques',
        'Behind-the-scenes baking process',
        'Approved testimonials with source attribution',
        'Cake portfolio photographs',
        'Educational content about Ukrainian baking traditions'
      ]
    },
    authoritativeness: {
      citations: [
        'Link to source evidence for media coverage',
        'Retain evidence for venue recommendations and partnerships',
        'Retain evidence for industry recognition'
      ],
      backlinks: [
        'Local business directories',
        'Wedding venue partner pages',
        'Relevant food publications',
        'Local newspaper coverage',
        'Industry association listings'
      ]
    },
    trustworthiness: {
      transparency: [
        'Clear pricing and policies',
        'Detailed ingredient lists and allergen information',
        'Customer review policy',
        'Contact information and business identity'
      ],
      security: [
        'Secure online ordering system',
        'Data protection information',
        'Published food-safety information where verified'
      ]
    }
  }
}
