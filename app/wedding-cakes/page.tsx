import { generateCategoryLandingMetadata, renderCategoryLandingPage } from '../cakes/renderCategoryLandingPage'

export function generateMetadata({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  return generateCategoryLandingMetadata({
    slug: 'wedding-cakes',
    searchParams
  })
}

export default function WeddingCakesPage() {
  return renderCategoryLandingPage('wedding-cakes')
}
