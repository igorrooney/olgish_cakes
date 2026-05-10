import { generateCategoryLandingMetadata, renderCategoryLandingPage } from '../cakes/renderCategoryLandingPage'

export function generateMetadata({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  return generateCategoryLandingMetadata({
    slug: 'anniversary-cakes-leeds',
    searchParams
  })
}

export default function AnniversaryCakesPage() {
  return renderCategoryLandingPage('anniversary-cakes-leeds')
}
