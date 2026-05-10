import { generateCategoryLandingMetadata, renderCategoryLandingPage } from '../cakes/renderCategoryLandingPage'

export function generateMetadata({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  return generateCategoryLandingMetadata({
    slug: 'birthday-cakes',
    searchParams
  })
}

export default function BirthdayCakesPage() {
  return renderCategoryLandingPage('birthday-cakes')
}
