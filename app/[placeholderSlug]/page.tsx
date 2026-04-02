import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/app/components/ComingSoonPage";
import { getComingSoonMetadata, getTopLevelComingSoonPage } from "@/lib/coming-soon-pages";

interface PlaceholderRoutePageProps {
  params: Promise<{
    placeholderSlug: string;
  }>;
}

async function resolveTopLevelPage(paramsPromise: PlaceholderRoutePageProps["params"]) {
  const { placeholderSlug } = await paramsPromise;
  const page = getTopLevelComingSoonPage(placeholderSlug);

  if (!page) {
    notFound();
  }

  return page;
}

export async function generateMetadata({ params }: PlaceholderRoutePageProps): Promise<Metadata> {
  const page = await resolveTopLevelPage(params);

  return getComingSoonMetadata(page);
}

export default async function PlaceholderRoutePage({ params }: PlaceholderRoutePageProps) {
  const page = await resolveTopLevelPage(params);

  return <ComingSoonPage page={page} />;
}
