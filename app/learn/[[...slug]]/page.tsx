import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ComingSoonPage } from "@/app/components/ComingSoonPage";
import { getComingSoonMetadata, getLearnComingSoonPage } from "@/lib/coming-soon-pages";

interface LearnPlaceholderPageProps {
  params: Promise<{
    slug?: string[];
  }>;
}

async function resolveLearnPage(paramsPromise: LearnPlaceholderPageProps["params"]) {
  const { slug } = await paramsPromise;
  const page = getLearnComingSoonPage(slug);

  if (!page) {
    notFound();
  }

  return page;
}

export async function generateMetadata({ params }: LearnPlaceholderPageProps): Promise<Metadata> {
  const page = await resolveLearnPage(params);

  return getComingSoonMetadata(page);
}

export default async function LearnPlaceholderPage({ params }: LearnPlaceholderPageProps) {
  const page = await resolveLearnPage(params);

  return <ComingSoonPage page={page} />;
}
