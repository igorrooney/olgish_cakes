import { generateCategoryLandingMetadata, renderCategoryLandingPage } from '../cakes/renderCategoryLandingPage'

export function generateMetadata({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  return generateCategoryLandingMetadata({
    slug: 'baby-shower-cakes',
    searchParams
  })
}

export default function BabyShowerCakesPage() {
  return renderCategoryLandingPage('baby-shower-cakes')
}
