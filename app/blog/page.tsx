import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BUSINESS_CONSTANTS } from "@/lib/constants";
import {
  BLOG_ARCHIVE_PAGE_SIZE,
  formatArticleDate,
  getArticleHref,
  getArticleVisibleImageUrl,
  getArticlePaginationTokens,
  getArticleTopicTitle,
  getArticleTopics,
  getBlogArchiveHref,
  getPaginatedArchiveArticles,
  getProductHref,
  isBlogArchivePageOutOfRange,
  resolveBlogArchiveSearchParams,
  toJsonLdScript,
} from "@/lib/articles";
import {
  getArchiveCommerceCopy,
  getArchiveFilterCopy,
  getArchiveHeroContent,
  getArchiveSectionCopy,
} from "./copy";
import { ArticleTopicFilter } from "./ArticleTopicFilter";
import { buildBlogArticleHref } from "./navigation";

const archiveTitle = "Cake by post advice, delivery help, and gift ideas";
const archiveDescription =
  "Notes from Olga on sending cake across the UK, choosing cakes that post well, and knowing when a custom order makes more sense.";
const archiveSocialImageUrl = `${BUSINESS_CONSTANTS.BASE_URL}/images/olgish-cakes-logo-bakery-brand.png`;

type SearchParamValue = string | string[] | undefined;

interface BlogPageProps {
  searchParams: Promise<Record<string, SearchParamValue>>;
}

const getBlogArchivePageData = cache(async (topicSlug: string | null, currentPage: number) => {
  const [topics, archivePage] = await Promise.all([
    getArticleTopics(),
    getPaginatedArchiveArticles(topicSlug, currentPage),
  ]);

  const activeTopic = topicSlug ? topics.find(topic => topic.slug === topicSlug) : undefined;

  if (topicSlug && !activeTopic) {
    return null;
  }

  if (isBlogArchivePageOutOfRange(currentPage, archivePage.totalPages)) {
    return null;
  }

  return {
    activeTopic,
    archivePage,
    topics,
  };
});

async function resolveBlogArchivePageData(searchParamsPromise: BlogPageProps["searchParams"]) {
  const resolvedSearchParams = await searchParamsPromise;
  const queryState = resolveBlogArchiveSearchParams(resolvedSearchParams);

  if (!queryState) {
    notFound();
  }

  const data = await getBlogArchivePageData(queryState.topic ?? null, queryState.page);

  if (!data) {
    notFound();
  }

  return {
    ...data,
    queryState,
  };
}

function getArchiveMetadataTitle(activeTopicTitle?: string, currentPage = 1) {
  const titlePrefix = activeTopicTitle ? `${activeTopicTitle} advice` : archiveTitle;

  return currentPage > 1 ? `${titlePrefix} | Page ${currentPage}` : titlePrefix;
}

function getArchiveMetadataDescription(activeTopicDescription?: string, currentPage = 1) {
  const description = activeTopicDescription
    ? `${activeTopicDescription} Notes from Olga on delivery, gifting, and choosing the right format in the UK.`
    : archiveDescription;

  return currentPage > 1 ? `${description} Page ${currentPage}.` : description;
}

function ArticleImage({
  imageUrl,
  imageAlt,
  loading = "lazy",
  fetchPriority,
  sizes = "(min-width: 1280px) 560px, (min-width: 768px) 55vw, 100vw",
}: {
  imageUrl?: string;
  imageAlt?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "auto" | "high" | "low";
  sizes?: string;
}) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="relative h-full min-h-[280px] overflow-hidden rounded-[24px] bg-base-200">
      <Image
        src={imageUrl}
        alt={imageAlt || "Article image"}
        fill
        loading={loading}
        fetchPriority={fetchPriority}
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}

function ArchiveArticleCard({
  article,
  archiveHref,
}: {
  article: Awaited<ReturnType<typeof getPaginatedArchiveArticles>>["articles"][number];
  archiveHref: string;
}) {
  const imageUrl = getArticleVisibleImageUrl(article);
  const imageAlt = article.coverImage?.alt || article.cardImage?.alt || article.title;
  const hasImage = Boolean(imageUrl);

  return (
    <article className="h-full">
      <Link
        href={buildBlogArticleHref({
          href: getArticleHref(article.slug),
          fromHref: archiveHref,
        })}
        className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-base-300 bg-white transition-colors duration-200 hover:border-primary-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
      >
        {hasImage ? (
          <div className="relative aspect-[4/3] overflow-hidden bg-base-200">
            <ArticleImage
              imageUrl={imageUrl}
              imageAlt={imageAlt}
              sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw"
            />
          </div>
        ) : null}
        <div className={`flex flex-1 flex-col gap-4 p-5 ${hasImage ? "" : "pt-6"}`}>
          <div className="flex flex-wrap items-center gap-3 font-sans text-sm text-base-content/70">
            <span className="rounded-full bg-accent-50 px-3 py-1 font-semibold text-primary-800">
              {getArticleTopicTitle(article)}
            </span>
            <span>{formatArticleDate(article.publishedAt)}</span>
          </div>
          <div className="space-y-3">
            <h2 className="font-oldenburg text-[1.65rem] leading-tight tracking-[0.02em] text-primary-800 transition-colors group-hover:text-primary-500">
              {article.title}
            </h2>
            <p className="font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[17px]">
              {article.summary}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}

function BlogArchivePagination({
  currentPage,
  totalPages,
  topic,
}: {
  currentPage: number;
  totalPages: number;
  topic?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const tokens = getArticlePaginationTokens(currentPage, totalPages);
  const baseClassName =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border px-4 py-2 font-sans text-sm font-semibold transition-colors";

  return (
    <nav
      aria-label="Blog archive pagination"
      className="flex flex-wrap items-center justify-center gap-2 pt-2"
    >
      {currentPage > 1 ? (
        <Link
          href={getBlogArchiveHref({ topic, page: currentPage - 1 })}
          className={`${baseClassName} border-base-300 bg-base-100 text-base-content hover:border-primary-400 hover:text-primary-500`}
        >
          Previous
        </Link>
      ) : (
        <span
          className={`${baseClassName} cursor-not-allowed border-base-300 bg-base-100 text-base-content/40`}
        >
          Previous
        </span>
      )}

      {tokens.map(token => {
        if (typeof token !== "number") {
          return (
            <span
              key={token}
              className="inline-flex min-w-10 items-center justify-center px-2 py-2 text-sm text-base-content/55"
            >
              &hellip;
            </span>
          );
        }

        if (token === currentPage) {
          return (
            <span
              key={token}
              aria-current="page"
              className={`${baseClassName} border-primary-500 bg-primary-500 text-primary-content`}
            >
              {token}
            </span>
          );
        }

        return (
          <Link
            key={token}
            href={getBlogArchiveHref({ topic, page: token })}
            className={`${baseClassName} border-base-300 bg-base-100 text-base-content hover:border-primary-400 hover:text-primary-500`}
          >
            {token}
          </Link>
        );
      })}

      {currentPage < totalPages ? (
        <Link
          href={getBlogArchiveHref({ topic, page: currentPage + 1 })}
          className={`${baseClassName} border-base-300 bg-base-100 text-base-content hover:border-primary-400 hover:text-primary-500`}
        >
          Next
        </Link>
      ) : (
        <span
          className={`${baseClassName} cursor-not-allowed border-base-300 bg-base-100 text-base-content/40`}
        >
          Next
        </span>
      )}
    </nav>
  );
}

export async function generateMetadata({ searchParams }: BlogPageProps): Promise<Metadata> {
  const { activeTopic, queryState } = await resolveBlogArchivePageData(searchParams);
  const title = getArchiveMetadataTitle(activeTopic?.title, queryState.page);
  const description = getArchiveMetadataDescription(activeTopic?.description, queryState.page);
  const canonicalPath = getBlogArchiveHref({
    topic: activeTopic?.slug,
    page: queryState.page,
  });
  const canonicalUrl = `${BUSINESS_CONSTANTS.BASE_URL}${canonicalPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      siteName: BUSINESS_CONSTANTS.NAME,
      images: [
        {
          url: archiveSocialImageUrl,
          alt: "Olgish Cakes bakery notes and articles",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [archiveSocialImageUrl],
    },
  };
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { activeTopic, archivePage, topics, queryState } =
    await resolveBlogArchivePageData(searchParams);
  const currentPage = queryState.page;
  const archiveArticles = archivePage.articles;
  const leadArticle = currentPage === 1 ? archiveArticles[0] : undefined;
  const supportingArticles = currentPage === 1 ? archiveArticles.slice(1) : archiveArticles;
  const commerceArticle = archiveArticles.find(article => article.primaryProduct);
  const commerceProduct = commerceArticle?.primaryProduct;
  const visibleArticles = leadArticle ? [leadArticle, ...supportingArticles] : supportingArticles;
  const archiveHeroContent = getArchiveHeroContent(activeTopic);
  const archiveSectionCopy = getArchiveSectionCopy(currentPage);
  const archiveCommerceCopy = getArchiveCommerceCopy(commerceProduct);
  const currentArchiveHref = getBlogArchiveHref({
    topic: activeTopic?.slug,
    page: currentPage,
  });
  const itemListStructuredData =
    visibleArticles.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: visibleArticles.map((article, index) => ({
            "@type": "ListItem",
            position: (currentPage - 1) * BLOG_ARCHIVE_PAGE_SIZE + index + 1,
            url: `${BUSINESS_CONSTANTS.BASE_URL}${getArticleHref(article.slug)}`,
            name: article.title,
          })),
        }
      : null;
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BUSINESS_CONSTANTS.BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Articles",
        item: `${BUSINESS_CONSTANTS.BASE_URL}/blog`,
      },
    ],
  };
  const archiveFilterCopy = getArchiveFilterCopy(activeTopic, {
    currentPage,
    totalCount: archivePage.totalCount,
    totalPages: archivePage.totalPages,
  });

  return (
    <main className="min-h-screen bg-base-100 text-base-content [font-family:var(--font-inter)]">
      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-10 px-4 pb-20 pt-8 tablet:px-10 tablet:pt-12">
        {itemListStructuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: toJsonLdScript(itemListStructuredData) }}
          />
        ) : null}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(breadcrumbStructuredData) }}
        />

        <section className="max-w-[72rem] space-y-5">
          <p className="font-moreSugar text-sm uppercase tracking-[0.18em] text-primary-500">
            {archiveHeroContent.eyebrow}
          </p>
          <div className="space-y-4">
            <h1 className="font-oldenburg text-[38px] leading-none tracking-[0.02em] text-primary-800 tablet:text-[48px]">
              {archiveHeroContent.heading}
            </h1>
            <p className="font-body text-[18px] leading-8 tracking-[0.01em] text-base-content/84 tablet:text-[21px]">
              {archiveHeroContent.intro}
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 small-laptop:flex-row small-laptop:items-end small-laptop:justify-between">
            <div className="space-y-2">
              <p className="font-sans text-sm uppercase tracking-[0.16em] text-base-content/75">
                {archiveFilterCopy.label}
              </p>
              <ArticleTopicFilter topics={topics} activeTopic={activeTopic?.slug} />
            </div>
            {archiveFilterCopy.status || archiveFilterCopy.summary ? (
              <p className="font-body text-sm leading-6 text-base-content/75">
                {archiveFilterCopy.status ? (
                  <span className="font-medium text-primary-800">{archiveFilterCopy.status}</span>
                ) : null}
                {archiveFilterCopy.status && archiveFilterCopy.summary ? (
                  <span aria-hidden="true" className="px-2 text-base-content/45">
                    &middot;
                  </span>
                ) : null}
                {archiveFilterCopy.summary ? (
                  <span className="font-medium text-base-content/70">
                    {archiveFilterCopy.summary}
                  </span>
                ) : null}
              </p>
            ) : null}
          </div>
        </section>

        {leadArticle ? (
          <article className="rounded-[32px] bg-white">
            <Link
              href={buildBlogArticleHref({
                href: getArticleHref(leadArticle.slug),
                fromHref: currentArchiveHref,
              })}
              className={`group grid gap-6 p-5 tablet:p-6 ${
                getArticleVisibleImageUrl(leadArticle)
                  ? "small-laptop:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]"
                  : ""
              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500`}
            >
              {getArticleVisibleImageUrl(leadArticle) ? (
                <div>
                  <ArticleImage
                    imageUrl={getArticleVisibleImageUrl(leadArticle)}
                    imageAlt={
                      leadArticle.coverImage?.alt || leadArticle.cardImage?.alt || leadArticle.title
                    }
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
              ) : null}
              <div className="flex flex-col justify-between gap-8 py-2">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3 font-sans text-sm text-base-content/70">
                    <span>{getArticleTopicTitle(leadArticle)}</span>
                    <span aria-hidden="true" className="text-base-content/40">
                      &middot;
                    </span>
                    <span>{formatArticleDate(leadArticle.publishedAt)}</span>
                  </div>
                  <div className="space-y-4">
                    <h2 className="font-oldenburg text-[1.95rem] leading-[1.06] tracking-[0.02em] text-primary-800 transition-colors group-hover:text-primary-500 tablet:text-[2.35rem]">
                      {leadArticle.title}
                    </h2>
                    <p className="font-body text-[18px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[21px]">
                      {leadArticle.dek}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </article>
        ) : (
          <section className="rounded-[28px] border border-base-300 bg-white p-8 text-center">
            <h2 className="font-oldenburg text-[30px] leading-tight tracking-[0.03em] text-primary-800">
              No notes in this topic yet
            </h2>
            <p className="mx-auto mt-4 max-w-[40rem] font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[17px]">
              There are no published notes in this topic yet. If you need a quick answer, start
              with cakes by post or send Olga a short custom brief.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/cakes-by-post"
                className="btn btn-primary rounded-full px-5 normal-case shadow-none"
              >
                Shop cakes by post
              </Link>
              <Link
                href="/get-custom-quote#quote-form"
                className="btn btn-outline rounded-full border-primary-500 px-5 normal-case text-primary-500 shadow-none hover:bg-primary-500 hover:text-primary-content"
              >
                Request a custom cake
              </Link>
            </div>
          </section>
        )}

        {supportingArticles.length > 0 ? (
          <section className="mt-2 space-y-5 border-t border-base-300 pt-8 tablet:pt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="font-sans text-sm uppercase tracking-[0.16em] text-base-content/75">
                  {archiveSectionCopy.eyebrow}
                </p>
                <h2 className="mt-2 font-oldenburg text-[30px] leading-tight tracking-[0.03em] text-primary-800">
                  {archiveSectionCopy.heading}
                </h2>
              </div>
            </div>
            <div className="grid gap-5 tablet:grid-cols-2 small-laptop:grid-cols-3">
              {supportingArticles.map(article => (
                <ArchiveArticleCard
                  key={article._id}
                  article={article}
                  archiveHref={currentArchiveHref}
                />
              ))}
            </div>
            <BlogArchivePagination
              currentPage={currentPage}
              totalPages={archivePage.totalPages}
              topic={activeTopic?.slug}
            />
          </section>
        ) : archivePage.totalPages > 1 ? (
          <BlogArchivePagination
            currentPage={currentPage}
            totalPages={archivePage.totalPages}
            topic={activeTopic?.slug}
          />
        ) : null}

        <section
          className={`grid gap-6 rounded-[32px] border border-primary-200 bg-primary-50/60 p-6 shadow-sm tablet:p-8 ${
            commerceProduct?.image?.asset?.url
              ? "small-laptop:grid-cols-[minmax(260px,360px)_minmax(0,1fr)]"
              : ""
          }`}
        >
          {commerceProduct?.image?.asset?.url ? (
            <div className="overflow-hidden rounded-[24px] bg-base-200">
              <ArticleImage
                imageUrl={commerceProduct.image.asset.url}
                imageAlt={commerceProduct.image.alt || commerceProduct.name}
              />
            </div>
          ) : null}
          <div className="flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="font-moreSugar text-sm uppercase tracking-[0.16em] text-primary-500">
                {archiveCommerceCopy.eyebrow}
              </p>
              <div className="space-y-3">
                <h2 className="font-oldenburg text-[2.1rem] leading-tight tracking-[0.03em] text-primary-800">
                  {archiveCommerceCopy.heading}
                </h2>
                <p className="max-w-[56ch] font-body text-[18px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[21px]">
                  {archiveCommerceCopy.body}
                </p>
              </div>
              <ul className="space-y-3 font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/75 tablet:text-[17px]">
                {archiveCommerceCopy.bullets.map(bullet => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={commerceProduct ? getProductHref(commerceProduct) : "/cakes-by-post"}
                className="btn btn-primary rounded-full px-5 normal-case shadow-none"
              >
                {commerceProduct ? "See this postal cake" : "Shop cakes by post"}
              </Link>
              <Link
                href="/get-custom-quote#quote-form"
                className="btn btn-outline rounded-full border-primary-500 px-5 normal-case text-primary-500 shadow-none hover:bg-primary-500 hover:text-primary-content"
              >
                Request a custom cake
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
