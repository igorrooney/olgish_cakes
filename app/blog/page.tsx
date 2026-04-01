import { cache } from "react";
import type { Metadata } from "next";
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
  isArticleProductPostableToUk,
  isBlogArchivePageOutOfRange,
  resolveBlogArchiveSearchParams,
  toJsonLdScript,
} from "@/lib/articles";
import { ResponsiveSanityImage } from "./ResponsiveSanityImage";
import {
  getArchiveCommerceCopy,
  getArchiveHeroContent,
  getArchiveSectionCopy,
} from "./copy";
import { BlogArticleLink } from "./BlogArticleLink";
import { ArticleTopicFilter } from "./ArticleTopicFilter";

const archiveTitle = "Cake by post advice, delivery help, and gift ideas";
const archiveDescription =
  "Notes from Olga on sending cake across the UK, choosing cakes that post well, and knowing when a custom order makes more sense.";
const archiveSocialImageUrl = `${BUSINESS_CONSTANTS.BASE_URL}/images/olgish-cakes-logo-bakery-brand.png`;
const archiveCardShadowClassName =
  "shadow-[0_18px_40px_color-mix(in_srgb,var(--color-primary-800)_14%,transparent)]";
const archiveLeadSurfaceClassName =
  "bg-base-100 shadow-[0_24px_64px_color-mix(in_srgb,var(--color-primary-800)_12%,transparent)]";
const archiveCommerceSurfaceClassName =
  "bg-base-100 shadow-[0_20px_48px_color-mix(in_srgb,var(--color-primary-500)_8%,transparent)]";
const archiveCommerceImageSurfaceClassName =
  "shadow-[0_18px_40px_color-mix(in_srgb,var(--color-primary-500)_8%,transparent)]";
const archivePaginationCurrentClassName =
  "shadow-[0_10px_24px_color-mix(in_srgb,var(--color-primary-700)_16%,transparent)]";

type SearchParamValue = string | string[] | undefined;

interface BlogPageProps {
  searchParams: Promise<Record<string, SearchParamValue>>;
}

function resolveArchiveCommerceProduct(
  activeTopicSlug: string | undefined,
  archiveArticles: Awaited<ReturnType<typeof getPaginatedArchiveArticles>>["articles"]
) {
  const postalProducts = archiveArticles.filter(article =>
    isArticleProductPostableToUk(article.primaryProduct)
  );
  const nonPostalCakeProducts = archiveArticles.filter(
    article =>
      article.primaryProduct?._type === "cake" &&
      !isArticleProductPostableToUk(article.primaryProduct)
  );

  if (activeTopicSlug === "custom-cakes") {
    return nonPostalCakeProducts[0]?.primaryProduct || postalProducts[0]?.primaryProduct;
  }

  if (activeTopicSlug === "cake-by-post") {
    return postalProducts[0]?.primaryProduct;
  }

  if (activeTopicSlug === "celebration-planning") {
    return postalProducts[0]?.primaryProduct || nonPostalCakeProducts[0]?.primaryProduct;
  }

  return postalProducts[0]?.primaryProduct;
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

function ArchiveArticleCard({
  article,
  archiveHref,
  index,
}: {
  article: Awaited<ReturnType<typeof getPaginatedArchiveArticles>>["articles"][number];
  archiveHref: string;
  index: number;
}) {
  const isLeadSupportingCard = index === 0;
  const imageUrl = getArticleVisibleImageUrl(article);
  const imageAlt = article.coverImage?.alt || article.cardImage?.alt || article.title;
  const hasImage = Boolean(imageUrl);
  const articleClassName = isLeadSupportingCard
    ? "h-full tablet:col-span-2"
    : "h-full";
  const linkClassName = isLeadSupportingCard
    ? "group grid h-full gap-4 rounded-[24px] bg-transparent p-2 transition-colors duration-200 hover:bg-primary-50/25 hover:[&_h2]:text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 tablet:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.95fr)] tablet:items-stretch"
    : "group flex h-full flex-col gap-4 rounded-[24px] bg-transparent p-2 transition-colors duration-200 hover:bg-primary-50/25 hover:[&_h2]:text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500";
  const imageClassName = isLeadSupportingCard
    ? `relative aspect-[4/3] overflow-hidden rounded-[26px] bg-base-200 tablet:h-full tablet:aspect-auto ${archiveCardShadowClassName}`
    : `relative aspect-[4/3] overflow-hidden rounded-[22px] bg-base-200 ${archiveCardShadowClassName}`;
  const contentClassName = isLeadSupportingCard
    ? `flex flex-1 flex-col gap-5 py-1 ${hasImage ? "" : "pt-1"}`
    : `flex flex-1 flex-col gap-4 pb-2 ${hasImage ? "" : "pt-2"}`;
  const metaClassName = isLeadSupportingCard
    ? "flex flex-wrap items-center gap-3 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-base-content/72"
    : "flex flex-wrap items-center gap-3 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-base-content/72";
  const topicClassName = isLeadSupportingCard
    ? "inline-flex items-center border-b border-primary-400 pb-1 font-semibold text-primary-700"
    : "inline-flex items-center border-b border-primary-300 pb-1 font-semibold text-primary-700";
  const titleClassName = isLeadSupportingCard
    ? "font-oldenburg text-[2rem] leading-[1.02] tracking-[0.015em] text-primary-800 transition-colors group-hover:text-primary-500 tablet:text-[2.2rem]"
    : index % 2 === 0
      ? "font-oldenburg text-[1.64rem] leading-[1.08] tracking-[0.02em] text-primary-800 transition-colors group-hover:text-primary-500"
      : "font-oldenburg text-[1.78rem] leading-[1.06] tracking-[0.018em] text-primary-800 transition-colors group-hover:text-primary-500";
  const summaryClassName = isLeadSupportingCard
    ? "max-w-[40ch] font-body text-[17px] leading-8 tracking-[0.01em] text-base-content/78 tablet:text-[18px]"
    : index % 2 === 0
      ? "max-w-[32ch] font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/78 tablet:text-[17px]"
      : "max-w-[36ch] font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[17px]";

  return (
    <article className={articleClassName}>
      <BlogArticleLink
        href={getArticleHref(article.slug)}
        archiveHref={archiveHref}
        className={linkClassName}
      >
        {hasImage ? (
          <div className={imageClassName}>
            <ResponsiveSanityImage
              imageUrl={imageUrl}
              imageAlt={imageAlt}
              width={isLeadSupportingCard ? 840 : 720}
              height={540}
              fit="crop"
              quality={80}
              sizes={
                isLeadSupportingCard
                  ? "(min-width: 1280px) 420px, (min-width: 1024px) 42vw, 100vw"
                  : "(min-width: 1280px) 360px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              }
            />
          </div>
        ) : null}
        <div className={contentClassName}>
          <div className={metaClassName}>
            <span className={topicClassName}>
              {getArticleTopicTitle(article)}
            </span>
            <span>{formatArticleDate(article.publishedAt)}</span>
          </div>
          <div className="space-y-3">
            <h2 className={titleClassName}>
              {article.title}
            </h2>
            <p className={summaryClassName}>
              {article.summary}
            </p>
          </div>
        </div>
      </BlogArticleLink>
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
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-[16px] border px-4 py-2 font-sans text-sm font-semibold transition-colors";

  return (
    <nav
      aria-label="Blog archive pagination"
      className="flex flex-wrap items-center justify-center gap-2 pt-2"
    >
      {currentPage > 1 ? (
        <Link
          href={getBlogArchiveHref({ topic, page: currentPage - 1 })}
          className={`${baseClassName} border-primary-200 bg-base-100/90 text-base-content hover:border-primary-500 hover:bg-primary-50/70 hover:text-primary-700`}
        >
          Previous
        </Link>
      ) : (
        <span
          className={`${baseClassName} cursor-not-allowed border-primary-200 bg-base-100/90 text-base-content/70`}
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
              className={`${baseClassName} border-primary-700 bg-primary-700 text-primary-content ${archivePaginationCurrentClassName}`}
            >
              {token}
            </span>
          );
        }

        return (
          <Link
            key={token}
            href={getBlogArchiveHref({ topic, page: token })}
            className={`${baseClassName} border-primary-200 bg-base-100/90 text-base-content hover:border-primary-500 hover:bg-primary-50/70 hover:text-primary-700`}
          >
            {token}
          </Link>
        );
      })}

      {currentPage < totalPages ? (
        <Link
          href={getBlogArchiveHref({ topic, page: currentPage + 1 })}
          className={`${baseClassName} border-primary-200 bg-base-100/90 text-base-content hover:border-primary-500 hover:bg-primary-50/70 hover:text-primary-700`}
        >
          Next
        </Link>
      ) : (
        <span
          className={`${baseClassName} cursor-not-allowed border-primary-200 bg-base-100/90 text-base-content/70`}
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
  const showEmptyState = archiveArticles.length === 0;
  const commerceProduct = resolveArchiveCommerceProduct(activeTopic?.slug, archiveArticles);
  const visibleArticles = leadArticle ? [leadArticle, ...supportingArticles] : supportingArticles;
  const archiveHeroContent = getArchiveHeroContent(activeTopic);
  const archiveSectionCopy = getArchiveSectionCopy(currentPage);
  const archiveCommerceCopy = getArchiveCommerceCopy({
    activeTopicSlug: activeTopic?.slug,
    product: commerceProduct,
  });
  const visibleCommerceProduct =
    commerceProduct && archiveCommerceCopy.primaryCta.href === getProductHref(commerceProduct)
      ? commerceProduct
      : undefined;
  const leadArticleImageUrl = leadArticle ? getArticleVisibleImageUrl(leadArticle) : undefined;
  const commerceImageUrl = visibleCommerceProduct?.image?.asset?.url;
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
  return (
    <main className="min-h-screen bg-base-100 text-base-content [font-family:var(--font-inter)]">
      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-4 pb-20 pt-6 tablet:gap-10 tablet:px-10 tablet:pt-12">
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

        <section className="relative overflow-visible pb-4 tablet:pb-10">
          <div className="absolute right-0 top-0 hidden h-36 w-36 rounded-full bg-primary-100/70 blur-3xl small-laptop:block" />
          <div className="relative flex w-full flex-col items-center space-y-4 text-center">
            <div className="w-full space-y-3 tablet:space-y-4">
              <h1 className="w-full font-moreSugar text-[30px] uppercase !leading-[34px] tracking-[0.02em] text-primary-700 rotate-0 tablet:max-w-none tablet:text-[48px] tablet:!leading-[56px] tablet:rotate-[-2.4deg] small-laptop:!leading-[64px]">
                {archiveHeroContent.heading}
              </h1>
              {archiveHeroContent.intro ? (
                <p className="mx-auto w-full font-body text-[16px] leading-7 tracking-[0.01em] text-base-content/84 tablet:text-[21px] tablet:leading-8">
                  {archiveHeroContent.intro}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <section className="-mt-3 space-y-3 tablet:-mt-2 tablet:space-y-4">
          <ArticleTopicFilter topics={topics} activeTopic={activeTopic?.slug} />
        </section>

        {leadArticle ? (
          <article
            className={`overflow-hidden rounded-[36px] border border-primary-200 ${archiveLeadSurfaceClassName}`}
          >
            <BlogArticleLink
              href={getArticleHref(leadArticle.slug)}
              archiveHref={currentArchiveHref}
              className={`group grid gap-4 p-4 tablet:gap-6 tablet:p-6 small-laptop:gap-8 small-laptop:p-8 ${
                leadArticleImageUrl
                  ? "small-laptop:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]"
                  : ""
              } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500`}
            >
              <div className="flex flex-col justify-between gap-6 py-0.5 tablet:gap-8 tablet:py-1">
                <div className="space-y-4 tablet:space-y-5">
                  <div className="flex flex-wrap items-center gap-3 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-base-content/72">
                    <span className="inline-flex items-center border-b border-primary-300 pb-1 font-semibold text-primary-700">
                      {getArticleTopicTitle(leadArticle)}
                    </span>
                    <span>{formatArticleDate(leadArticle.publishedAt)}</span>
                  </div>
                  <div className="space-y-3 tablet:space-y-4">
                    <p className="font-oldenburg text-[0.82rem] uppercase tracking-[0.22em] text-primary-500 tablet:text-[0.9rem] tablet:tracking-[0.24em]">
                      Lead note
                    </p>
                    <h2 className="max-w-[13ch] font-oldenburg text-[1.9rem] leading-[1] tracking-[0.015em] text-primary-800 transition-colors group-hover:text-primary-500 tablet:max-w-[14ch] tablet:text-[2.8rem]">
                      {leadArticle.title}
                    </h2>
                    <p className="max-w-[30rem] font-body text-[16px] leading-7 tracking-[0.01em] text-base-content/80 tablet:max-w-[32rem] tablet:text-[21px] tablet:leading-8">
                      {leadArticle.dek}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-base-content/70">
                  <span className="inline-flex h-px w-10 bg-primary-300" aria-hidden="true" />
                  <span className="font-sans uppercase tracking-[0.18em]">From Olga&apos;s archive</span>
                </div>
              </div>
              {leadArticleImageUrl ? (
                <div className="relative h-full min-h-[220px] tablet:min-h-[280px]">
                  <ResponsiveSanityImage
                    imageUrl={leadArticleImageUrl}
                    imageAlt={
                      leadArticle.coverImage?.alt || leadArticle.cardImage?.alt || leadArticle.title
                    }
                    loading="eager"
                    fetchPriority="high"
                    width={1200}
                    height={900}
                    fit="crop"
                    quality={82}
                    sizes="(min-width: 1280px) 600px, (min-width: 1024px) 48vw, 100vw"
                    containerClassName="h-full min-h-[220px] tablet:min-h-[280px]"
                  />
                </div>
              ) : null}
            </BlogArticleLink>
          </article>
        ) : showEmptyState ? (
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
                href="/cakes"
                className="btn btn-outline rounded-full border-primary-500 px-5 normal-case text-primary-500 shadow-none hover:bg-primary-500 hover:text-primary-content"
              >
                See custom cakes
              </Link>
            </div>
          </section>
        ) : null}

        {supportingArticles.length > 0 ? (
          <section className="mt-1 space-y-5 border-t border-base-300 pt-6 tablet:mt-2 tablet:space-y-6 tablet:pt-10">
            <div className="flex items-end justify-between gap-4">
              <div className="space-y-2">
                <p className="font-sans text-sm uppercase tracking-[0.16em] text-base-content/75">
                  {archiveSectionCopy.eyebrow}
                </p>
                <h2 className="font-oldenburg text-[30px] leading-tight tracking-[0.03em] text-primary-800">
                  {archiveSectionCopy.heading}
                </h2>
                <p className="max-w-[38rem] font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/74 tablet:text-[17px]">
                  Practical notes on delivery, gifting, and choosing the right format without the fluff.
                </p>
              </div>
            </div>
            <div className="grid gap-x-8 gap-y-8 tablet:grid-cols-2 tablet:gap-y-10 small-laptop:grid-cols-3">
              {supportingArticles.map((article, index) => (
                <ArchiveArticleCard
                  key={article._id}
                  article={article}
                  archiveHref={currentArchiveHref}
                  index={index}
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
          className={`relative overflow-hidden rounded-[36px] border border-primary-200/70 p-6 text-base-content tablet:p-8 ${
            commerceImageUrl
              ? `grid gap-6 small-laptop:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]`
              : ""
          } ${archiveCommerceSurfaceClassName}`}
        >
          {commerceImageUrl ? (
            <div
              className={`overflow-hidden rounded-[28px] border border-primary-100 bg-base-100 ${archiveCommerceImageSurfaceClassName}`}
            >
              <ResponsiveSanityImage
                imageUrl={commerceImageUrl}
                imageAlt={visibleCommerceProduct?.image?.alt || visibleCommerceProduct?.name}
                width={720}
                height={900}
                fit="crop"
                quality={82}
                sizes="(min-width: 1280px) 360px, (min-width: 1024px) 34vw, 100vw"
              />
            </div>
          ) : null}
          <div
            className={`relative flex flex-col justify-between gap-6 ${
              commerceImageUrl ? "" : "max-w-[64rem]"
            }`}
          >
            <div className="space-y-5">
              <p className="font-moreSugar text-sm uppercase tracking-[0.16em] text-primary-500">
                {archiveCommerceCopy.eyebrow}
              </p>
              <div className="space-y-4">
                <h2 className="w-full font-oldenburg text-[2.15rem] leading-[1.02] tracking-[0.03em] text-primary-800">
                  {archiveCommerceCopy.heading}
                </h2>
                <p className="max-w-[56ch] font-body text-[18px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[21px]">
                  {archiveCommerceCopy.body}
                </p>
              </div>
              <ul className="ml-5 grid list-disc gap-3 pl-2 font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/76 marker:text-primary-500 tablet:text-[17px]">
                {archiveCommerceCopy.bullets.map(bullet => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={archiveCommerceCopy.primaryCta.href}
                className="btn btn-primary rounded-full border-none px-5 normal-case shadow-none"
              >
                {archiveCommerceCopy.primaryCta.label}
              </Link>
              <Link
                href={archiveCommerceCopy.secondaryCta.href}
                className="btn btn-outline rounded-full border-primary-500 px-5 normal-case text-primary-500 shadow-none hover:bg-primary-500 hover:text-primary-content"
              >
                {archiveCommerceCopy.secondaryCta.label}
              </Link>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
