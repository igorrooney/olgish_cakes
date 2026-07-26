import { cache } from "react";
import { QueryClient } from '@tanstack/react-query'
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BUSINESS_CONSTANTS } from "@/lib/constants";
import { createBlogArchiveBreadcrumbStructuredData } from '@/lib/blog-archive-structured-data'
import {
  getArticleCardImageUrl,
  formatArticleDate,
  getArticleHref,
  getArticleVisibleImageUrl,
  getArticlePaginationTokens,
  getArticleTopicTitle,
  getBlogArchiveHref,
  getPaginatedArchiveArticles,
  getProductHref,
  getSanityCdnImageUrl,
  isArticleProductPostableToUk,
  isBlogArchivePageOutOfRange,
  resolveBlogArchiveSearchParams,
  toJsonLdScript,
  type BlogArchiveSearchParams
} from "@/lib/articles";
import { ResponsiveSanityImage } from "./ResponsiveSanityImage";
import {
  getArchiveCommerceCopy,
  getArchiveHeroContent,
  getArchiveSectionCopy,
} from "./copy";
import { ArticleTopicFilter } from "./ArticleTopicFilter";
import { BlogArticleLink } from './BlogArticleLink'
import {
  blogArchivePageQueryOptions,
  blogArchiveTopicsQueryOptions
} from './query-options'

const archiveTitle = "Cake by post advice, delivery help, and gift ideas";
const archiveDescription =
  "Notes from Olga on sending cake across the UK, choosing cakes that post well, and knowing when a custom order makes more sense.";
const archiveSocialImageFallbackUrl =
  `${BUSINESS_CONSTANTS.BASE_URL}/images/honey-cake-medovik.jpg`;
const archiveCardShadowClassName = 'shadow-lg'
const archiveLeadSurfaceClassName = 'bg-base-100 shadow-xl'
const archiveCommerceSurfaceClassName = 'bg-base-100 shadow-lg'
const archiveCommerceImageSurfaceClassName = 'shadow-lg'
const archivePaginationCurrentClassName = 'shadow-md'

interface BlogPageProps {
  searchParams: Promise<BlogArchiveSearchParams>;
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
  const queryClient = new QueryClient()
  const [topics, archivePage] = await Promise.all([
    queryClient.fetchQuery(blogArchiveTopicsQueryOptions()),
    queryClient.fetchQuery(blogArchivePageQueryOptions(topicSlug, currentPage))
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

function getArchiveSocialImage(
  articles: Awaited<ReturnType<typeof getPaginatedArchiveArticles>>['articles']
) {
  const representativeArticle = articles.find(article => getArticleVisibleImageUrl(article))
  const representativeImageUrl = representativeArticle
    ? getArticleVisibleImageUrl(representativeArticle)
    : undefined

  return {
    url: representativeImageUrl
      ? getSanityCdnImageUrl(representativeImageUrl, {
          width: 1200,
          height: 630,
          fit: 'crop',
          quality: 80
        }) ?? representativeImageUrl
      : archiveSocialImageFallbackUrl,
    alt: representativeArticle
      ? representativeArticle.coverImage?.alt ||
        representativeArticle.cardImage?.alt ||
        representativeArticle.title
      : 'Traditional Ukrainian honey cake from Olgish Cakes',
    width: 1200,
    height: 630
  }
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
  const imageUrl = getArticleCardImageUrl(article);
  const imageAlt = article.cardImage?.alt || article.coverImage?.alt || article.title;
  const hasImage = Boolean(imageUrl);
  const articleClassName = isLeadSupportingCard
    ? "h-full tablet:col-span-2"
    : "h-full";
  const linkClassName = isLeadSupportingCard
    ? "group grid h-full gap-4 rounded-box bg-transparent p-2 transition-colors duration-200 hover:bg-primary-50/25 hover:[&_h2]:text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 tablet:grid-cols-[minmax(0,1.05fr)_minmax(240px,0.95fr)] tablet:items-stretch"
    : "group flex h-full flex-col gap-4 rounded-box bg-transparent p-2 transition-colors duration-200 hover:bg-primary-50/25 hover:[&_h2]:text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500";
  const imageClassName = isLeadSupportingCard
    ? `relative aspect-[4/3] overflow-hidden rounded-box bg-base-200 tablet:h-full tablet:aspect-auto ${archiveCardShadowClassName}`
    : `relative aspect-[4/3] overflow-hidden rounded-box bg-base-200 ${archiveCardShadowClassName}`;
  const contentClassName = isLeadSupportingCard
    ? `flex flex-1 flex-col gap-5 py-1 ${hasImage ? "" : "pt-1"}`
    : `flex flex-1 flex-col gap-4 pb-2 ${hasImage ? "" : "pt-2"}`;
  const metaClassName =
    'flex flex-wrap items-center gap-3 font-sans text-xs uppercase tracking-widest text-base-content/72'
  const topicClassName = isLeadSupportingCard
    ? "inline-flex items-center border-b border-primary-400 pb-1 font-semibold text-primary-700"
    : "inline-flex items-center border-b border-primary-300 pb-1 font-semibold text-primary-700";
  const titleClassName = isLeadSupportingCard
    ? "font-oldenburg text-3xl leading-tight tracking-tight text-primary-800 transition-colors group-hover:text-primary-500 tablet:text-4xl"
    : index % 2 === 0
      ? "font-oldenburg text-2xl leading-tight tracking-tight text-primary-800 transition-colors group-hover:text-primary-500"
      : "font-oldenburg text-3xl leading-tight tracking-tight text-primary-800 transition-colors group-hover:text-primary-500";
  const summaryClassName = isLeadSupportingCard
    ? "max-w-[40ch] font-body text-base leading-8 tracking-normal text-base-content/78 tablet:text-lg"
    : index % 2 === 0
      ? "max-w-[32ch] font-body text-base leading-8 tracking-normal text-base-content/78 tablet:text-lg"
      : "max-w-[36ch] font-body text-base leading-8 tracking-normal text-base-content/80 tablet:text-lg";
  const articleHref = getArticleHref(article.slug);

  return (
    <article className={`card ${articleClassName}`}>
      <BlogArticleLink
        href={articleHref}
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
              quality={76}
              sizes={
                isLeadSupportingCard
                  ? "(min-width: 1280px) 420px, (min-width: 1024px) 42vw, calc(100vw - 4rem)"
                  : "(min-width: 1280px) 360px, (min-width: 1024px) 33vw, calc(100vw - 3rem)"
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
    "btn btn-sm join-item min-h-11 min-w-11 rounded-selector border px-4 font-sans text-sm font-semibold";

  return (
    <nav
      aria-label="Blog archive pagination"
      className="join flex flex-wrap items-center justify-center gap-2 pt-2"
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
  const { activeTopic, archivePage, queryState } = await resolveBlogArchivePageData(searchParams);
  const title = getArchiveMetadataTitle(activeTopic?.title, queryState.page);
  const description = getArchiveMetadataDescription(activeTopic?.description, queryState.page);
  const canonicalPath = getBlogArchiveHref({
    topic: activeTopic?.slug,
    page: queryState.page,
  });
  const canonicalUrl = `${BUSINESS_CONSTANTS.BASE_URL}${canonicalPath}`;
  const socialImage = getArchiveSocialImage(archivePage.articles)

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
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
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
  const breadcrumbStructuredData = createBlogArchiveBreadcrumbStructuredData()
  return (
    <div className="min-h-screen bg-base-100 text-base-content [font-family:var(--font-inter)]">
      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-4 pb-20 pt-6 tablet:gap-10 tablet:px-10 tablet:pt-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(breadcrumbStructuredData) }}
        />

        <section className="relative overflow-visible pb-4 tablet:pb-10">
          <div className="absolute right-0 top-0 hidden h-36 w-36 rounded-full bg-primary-100/70 blur-3xl small-laptop:block" />
          <div className="relative flex w-full flex-col items-center space-y-4 text-center">
            <div className="w-full space-y-3 tablet:space-y-4">
              <h1 className="w-full rotate-0 font-moreSugar text-3xl uppercase leading-tight tracking-wide text-primary-700 tablet:max-w-none tablet:rotate-[-2.4deg] tablet:text-5xl">
                {archiveHeroContent.heading}
              </h1>
              {archiveHeroContent.intro ? (
                <p className="mx-auto w-full font-body text-base leading-7 tracking-normal text-base-content/84 tablet:text-xl tablet:leading-8">
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
            className={`card overflow-hidden rounded-box border border-primary-200 ${archiveLeadSurfaceClassName}`}
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
                  <div className="flex flex-wrap items-center gap-3 font-sans text-xs uppercase tracking-widest text-base-content/72">
                    <span className="inline-flex items-center border-b border-primary-300 pb-1 font-semibold text-primary-700">
                      {getArticleTopicTitle(leadArticle)}
                    </span>
                    <span>{formatArticleDate(leadArticle.publishedAt)}</span>
                  </div>
                  <div className="space-y-3 tablet:space-y-4">
                    <p className="font-oldenburg text-sm uppercase tracking-widest text-primary-500">
                      Lead note
                    </p>
                    <h2 className="max-w-[13ch] font-oldenburg text-3xl leading-none tracking-tight text-primary-800 transition-colors group-hover:text-primary-500 tablet:max-w-[14ch] tablet:text-5xl">
                      {leadArticle.title}
                    </h2>
                    <p className="max-w-[30rem] font-body text-base leading-7 tracking-normal text-base-content/80 tablet:max-w-[32rem] tablet:text-xl tablet:leading-8">
                      {leadArticle.dek}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-base-content/70">
                  <span className="inline-flex h-px w-10 bg-primary-300" aria-hidden="true" />
                  <span className="font-sans uppercase tracking-widest">From Olga&apos;s archive</span>
                </div>
              </div>
              {leadArticleImageUrl ? (
                <div className="relative h-full min-h-[220px] tablet:min-h-[280px]">
                  <ResponsiveSanityImage
                    imageUrl={leadArticleImageUrl}
                    imageAlt={
                      leadArticle.coverImage?.alt || leadArticle.cardImage?.alt || leadArticle.title
                    }
                    width={1200}
                    height={900}
                    fit="crop"
                    quality={72}
                    sizes="(min-width: 1280px) 600px, (min-width: 1024px) 48vw, calc(100vw - 4rem)"
                    containerClassName="h-full min-h-[220px] tablet:min-h-[280px]"
                    loading="eager"
                    fetchPriority="high"
                    preloadImage
                  />
                </div>
              ) : null}
            </BlogArticleLink>
          </article>
        ) : showEmptyState ? (
          <section className="card rounded-box border border-base-300 bg-base-100 p-8 text-center">
            <h2 className="font-oldenburg text-3xl leading-tight tracking-wide text-primary-800">
              No notes in this topic yet
            </h2>
            <p className="mx-auto mt-4 max-w-[40rem] font-body text-base leading-8 tracking-normal text-base-content/80 tablet:text-lg">
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
                <p className="font-sans text-sm uppercase tracking-widest text-base-content/75">
                  {archiveSectionCopy.eyebrow}
                </p>
                <h2 className="font-oldenburg text-3xl leading-tight tracking-wide text-primary-800">
                  {archiveSectionCopy.heading}
                </h2>
                <p className="max-w-[38rem] font-body text-base leading-8 tracking-normal text-base-content/74 tablet:text-lg">
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
          className={`card relative overflow-hidden rounded-box border border-primary-200/70 p-6 text-base-content tablet:p-8 ${
            commerceImageUrl
              ? `grid gap-6 small-laptop:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]`
              : ""
          } ${archiveCommerceSurfaceClassName}`}
        >
          {commerceImageUrl ? (
            <div
              className={`overflow-hidden rounded-box border border-primary-100 bg-base-100 ${archiveCommerceImageSurfaceClassName}`}
            >
              <ResponsiveSanityImage
                imageUrl={commerceImageUrl}
                imageAlt={visibleCommerceProduct?.image?.alt || visibleCommerceProduct?.name}
                width={720}
                height={900}
                fit="crop"
                quality={76}
                sizes="(min-width: 1280px) 360px, (min-width: 1024px) 34vw, calc(100vw - 3rem)"
              />
            </div>
          ) : null}
          <div
            className={`relative flex flex-col justify-between gap-6 ${
              commerceImageUrl ? "" : "max-w-[64rem]"
            }`}
          >
            <div className="space-y-5">
              <p className="font-moreSugar text-sm uppercase tracking-widest text-primary-500">
                {archiveCommerceCopy.eyebrow}
              </p>
              <div className="space-y-4">
                <h2 className="w-full font-oldenburg text-4xl leading-tight tracking-wide text-primary-800">
                  {archiveCommerceCopy.heading}
                </h2>
                <p className="max-w-[56ch] font-body text-lg leading-8 tracking-normal text-base-content/80 tablet:text-xl">
                  {archiveCommerceCopy.body}
                </p>
              </div>
              <ul className="ml-5 grid list-disc gap-3 pl-2 font-body text-base leading-8 tracking-normal text-base-content/76 marker:text-primary-500 tablet:text-lg">
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
    </div>
  );
}
