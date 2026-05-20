import { cachedSanityFetch } from '@/lib/sanity-cache'

interface RichTextChild {
  text?: string
}

interface RichTextBlock {
  _type?: string
  children?: RichTextChild[]
}

interface AllergenAuditProduct {
  name: string
  slug: string
  allergens?: string[]
  ingredientReference?: {
    ingredients?: RichTextBlock[]
  }
}

interface AllergenAuditQueryResult {
  cakes?: AllergenAuditProduct[]
  giftHampers?: AllergenAuditProduct[]
}

export interface AllergenCount {
  label: string
  count: number
}

export interface AllergensPageData {
  totalCakeCount: number
  totalGiftHamperCount: number
  totalProductCount: number
  cakeCommonAllergens: AllergenCount[]
  giftHamperCommonAllergens: AllergenCount[]
  overallCommonAllergens: AllergenCount[]
  nutOrPeanutCakeNames: string[]
  advisoryAllergens: string[]
  referencedCakeCount: number
  referencedGiftHamperCount: number
}

const ALLERGEN_AUDIT_QUERY = `{
  "cakes": *[_type == "cake" && defined(slug.current)] | order(name asc) {
    name,
    "slug": slug.current,
    allergens,
    ingredientReference->{
      ingredients
    }
  },
  "giftHampers": *[_type == "giftHamper" && defined(slug.current)] | order(name asc) {
    name,
    "slug": slug.current,
    allergens,
    ingredientReference->{
      ingredients
    }
  }
}`

const CANONICAL_ALLERGENS = [
  'Milk',
  'Eggs',
  'Gluten (wheat)',
  'Nuts',
  'Peanuts',
  'Soya',
  'Sulphur dioxide',
  'Sesame'
] as const

type CanonicalAllergen = (typeof CANONICAL_ALLERGENS)[number]

function blocksToText(blocks: RichTextBlock[] | undefined): string {
  if (!Array.isArray(blocks)) {
    return ''
  }

  return blocks
    .map((block) => {
      if (!Array.isArray(block.children)) {
        return ''
      }

      return block.children.map((child) => child.text || '').join('')
    })
    .join('\n')
    .trim()
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeForAllergenMatching(value: string): string {
  return normalizeWhitespace(value).toLowerCase()
}

function textMentionsAllergen(value: string, allergen: CanonicalAllergen): boolean {
  const normalizedValue = normalizeForAllergenMatching(value)

  if (allergen === 'Peanuts') {
    return /\bpeanuts?\b/.test(normalizedValue)
  }

  if (allergen === 'Nuts') {
    return /\b(?:nuts?|almonds?|cashews?|hazelnuts?|walnuts?|pistachios?|pecans?|macadamias?)\b/.test(normalizedValue)
  }

  if (allergen === 'Gluten (wheat)') {
    return /\b(?:gluten|wheat)\b/.test(normalizedValue)
  }

  if (allergen === 'Milk') {
    return /\b(?:milk|dairy)\b/.test(normalizedValue)
  }

  if (allergen === 'Eggs') {
    return /\beggs?\b/.test(normalizedValue)
  }

  if (allergen === 'Soya') {
    return /\b(?:soya|soy)\b/.test(normalizedValue)
  }

  if (allergen === 'Sulphur dioxide') {
    return /\bsulphur dioxide\b/.test(normalizedValue)
  }

  return /\bsesame\b/.test(normalizedValue)
}

function canonicalizeAllergen(value: string): CanonicalAllergen | null {
  const normalizedValue = normalizeWhitespace(value).toLowerCase()

  if (textMentionsAllergen(normalizedValue, 'Peanuts')) {
    return 'Peanuts'
  }

  if (textMentionsAllergen(normalizedValue, 'Nuts')) {
    return 'Nuts'
  }

  if (textMentionsAllergen(normalizedValue, 'Gluten (wheat)')) {
    return 'Gluten (wheat)'
  }

  if (textMentionsAllergen(normalizedValue, 'Milk')) {
    return 'Milk'
  }

  if (textMentionsAllergen(normalizedValue, 'Eggs')) {
    return 'Eggs'
  }

  if (textMentionsAllergen(normalizedValue, 'Soya')) {
    return 'Soya'
  }

  if (textMentionsAllergen(normalizedValue, 'Sulphur dioxide')) {
    return 'Sulphur dioxide'
  }

  if (textMentionsAllergen(normalizedValue, 'Sesame')) {
    return 'Sesame'
  }

  return null
}

function removeAdvisoryText(value: string): string {
  return value.replace(/may contain:\s*[^\n.]*/gi, ' ')
}

function getDeclaredAllergens(product: AllergenAuditProduct): Set<CanonicalAllergen> {
  const declaredAllergens = new Set<CanonicalAllergen>()

  ;(product.allergens || []).forEach((allergenValue) => {
    const canonicalAllergen = canonicalizeAllergen(allergenValue)

    if (canonicalAllergen) {
      declaredAllergens.add(canonicalAllergen)
    }
  })

  const ingredientReferenceText = removeAdvisoryText(
    blocksToText(product.ingredientReference?.ingredients)
  )

  CANONICAL_ALLERGENS.forEach((allergenLabel) => {
    if (textMentionsAllergen(ingredientReferenceText, allergenLabel)) {
      declaredAllergens.add(allergenLabel)
    }
  })

  return declaredAllergens
}

function toCountList(counter: Map<CanonicalAllergen, number>): AllergenCount[] {
  return [...counter.entries()]
    .sort((firstEntry, secondEntry) => {
      if (secondEntry[1] !== firstEntry[1]) {
        return secondEntry[1] - firstEntry[1]
      }

      return firstEntry[0].localeCompare(secondEntry[0])
    })
    .map(([label, count]) => ({ label, count }))
}

function countDeclaredAllergens(products: AllergenAuditProduct[]): AllergenCount[] {
  const counter = new Map<CanonicalAllergen, number>()

  products.forEach((product) => {
    const declaredAllergens = getDeclaredAllergens(product)

    declaredAllergens.forEach((allergenLabel) => {
      counter.set(allergenLabel, (counter.get(allergenLabel) || 0) + 1)
    })
  })

  return toCountList(counter)
}

function extractAdvisoryAllergens(products: AllergenAuditProduct[]): string[] {
  const advisoryAllergens = new Set<CanonicalAllergen>()

  products.forEach((product) => {
    const ingredientReferenceText = blocksToText(product.ingredientReference?.ingredients)
    const mayContainMatch = ingredientReferenceText.match(/may contain:\s*([^\n.]+)/i)

    if (!mayContainMatch) {
      return
    }

    mayContainMatch[1]
      .split(',')
      .map((entry) => normalizeWhitespace(entry))
      .forEach((entry) => {
        const canonicalAllergen = canonicalizeAllergen(entry)

        if (canonicalAllergen) {
          advisoryAllergens.add(canonicalAllergen)
        }
      })
  })

  return CANONICAL_ALLERGENS.filter((label) => advisoryAllergens.has(label))
}

export function buildAllergensPageDataFromCatalog(queryResult: AllergenAuditQueryResult): AllergensPageData {
  const cakes = queryResult.cakes || []
  const giftHampers = queryResult.giftHampers || []
  const allProducts = [...cakes, ...giftHampers]
  const nutOrPeanutCakeNames = cakes
    .filter((cake) => {
      const declaredAllergens = getDeclaredAllergens(cake)

      return declaredAllergens.has('Nuts') || declaredAllergens.has('Peanuts')
    })
    .map((cake) => cake.name)

  return {
    totalCakeCount: cakes.length,
    totalGiftHamperCount: giftHampers.length,
    totalProductCount: allProducts.length,
    cakeCommonAllergens: countDeclaredAllergens(cakes),
    giftHamperCommonAllergens: countDeclaredAllergens(giftHampers),
    overallCommonAllergens: countDeclaredAllergens(allProducts),
    nutOrPeanutCakeNames,
    advisoryAllergens: extractAdvisoryAllergens(giftHampers),
    referencedCakeCount: cakes.filter((cake) => blocksToText(cake.ingredientReference?.ingredients).length > 0).length,
    referencedGiftHamperCount: giftHampers.filter((giftHamper) => blocksToText(giftHamper.ingredientReference?.ingredients).length > 0).length
  }
}

export async function getAllergensPageData(): Promise<AllergensPageData> {
  const data = await cachedSanityFetch<AllergenAuditQueryResult>(
    ALLERGEN_AUDIT_QUERY,
    {},
    {
      tags: ['cakes', 'cakes-by-post', 'gift-hampers', 'ingredients', 'pages']
    }
  )

  return buildAllergensPageDataFromCatalog(data)
}
