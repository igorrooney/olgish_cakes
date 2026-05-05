import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, type ComponentProps } from "react";
import { BUSINESS_CONSTANTS } from "@/lib/constants";
import { normalizeCmsTitle } from "@/lib/metadata";
import {
  extractArticleTableOfContents,
  formatArticleDate,
  getArticleBySlug,
  getArticleCardImageUrl,
  getArticleHref,
  getArticleMetadataImageUrl,
  getArticleReadingTime,
  getSanityCdnImageUrl,
  getArticleSlugs,
  getArticleTopicTitle,
  getArticleVisibleImageUrl,
  hasMaterialArticleUpdate,
  getProductHref,
  getRelatedArticles,
  isArticleProductPostableToUk,
  type ArticleProduct,
  type ArticleTableOfContentsItem,
  toJsonLdScript,
} from "@/lib/articles";
import {
  getArticleClosingCtaCopy,
  getArticleCommerceCopy,
  getArticleFaqCopy,
  getRelatedArticlesCopy,
} from "../copy";
import { ArticlePortableText } from "../ArticlePortableText";
import { ArticleHeroImage } from "../ArticleHeroImage";
import { BlogBackLinkBase } from "../BlogBackLinkBase";
import { buildBlogBackHref } from "../navigation";

interface BlogArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function ArticlePageLink(props: ComponentProps<"a">) {
  return <a {...props} />;
}

const getArticlePageData = cache(async (slug: string) => {
  const article = await getArticleBySlug(slug);

  if (!article) {
    return null;
  }

  const [relatedArticles] = await Promise.all([
    getRelatedArticles(article._id, article.topic?.slug, 3),
  ]);

  return {
    article,
    relatedArticles,
    tableOfContents: extractArticleTableOfContents(article.body),
  };
});

function getArticlePrimaryCtaLabel(featuredProduct: ArticleProduct) {
  if (isArticleProductPostableToUk(featuredProduct)) {
    return "See this cake by post";
  }

  return featuredProduct._type === "cake" ? "See this custom cake" : "See this cake";
}

function ArticleTableOfContentsCard({
  items,
  className = "",
  heading = "On this page",
}: {
  items: ArticleTableOfContentsItem[];
  className?: string;
  heading?: string | null;
}) {
  return (
    <div
      className={`rounded-[24px] bg-[linear-gradient(135deg,var(--color-base-100),rgba(255,250,244,0.86))] p-5 shadow-[0_10px_24px_rgba(97,39,0,0.05)] ${className}`.trim()}
    >
      {heading ? (
        <p className="font-sans text-sm uppercase tracking-[0.16em] text-base-content/75">
          {heading}
        </p>
      ) : null}
      <ul className="mt-4 space-y-3">
        {items.map(item => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="font-sans text-sm leading-6 text-base-content/80 transition-colors hover:text-primary-500"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RelatedArticleMedia({
  imageUrl,
  imageAlt,
  topicTitle,
}: {
  imageUrl?: string;
  imageAlt?: string;
  topicTitle: string;
}) {
  if (imageUrl) {
    return (
      <div className="relative aspect-[4/3] bg-base-200">
        <img
          src={imageUrl}
          alt={imageAlt || topicTitle}
          width={720}
          height={540}
          loading="lazy"
          decoding="async"
          sizes="(min-width: 1280px) 320px, (min-width: 1024px) calc(50vw - 3rem), calc(100vw - 3rem)"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return null;
}

function RelatedArticleCard({
  article,
}: {
  article: Awaited<ReturnType<typeof getRelatedArticles>>[number];
}) {
  const imageUrl = getSanityCdnImageUrl(getArticleCardImageUrl(article), {
    width: 720,
    height: 540,
    fit: "crop",
    quality: 80,
  });
  const imageAlt = article.cardImage?.alt || article.coverImage?.alt || article.title;

  return (
    <article className="h-full">
      <ArticlePageLink
        href={getArticleHref(article.slug)}
        className="group flex h-full flex-col gap-4 rounded-[24px] bg-transparent p-2 transition-colors duration-200 hover:bg-primary-50/25 hover:[&_h3]:text-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
      >
        {imageUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-base-200 shadow-[0_18px_40px_rgba(97,39,0,0.08)]">
            <RelatedArticleMedia
              imageUrl={imageUrl}
              imageAlt={imageAlt}
              topicTitle={getArticleTopicTitle(article)}
            />
          </div>
        ) : null}
        <div className={`flex flex-1 flex-col gap-4 pb-2 ${imageUrl ? "" : "pt-2"}`}>
          <div className="flex flex-wrap items-center gap-3 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-base-content/75">
            <span className="inline-flex items-center border-b border-primary-300 pb-1 font-semibold text-primary-700">
              {getArticleTopicTitle(article)}
            </span>
            <span>{formatArticleDate(article.publishedAt)}</span>
          </div>
          <div className="space-y-3">
            <h3 className="font-oldenburg text-[1.78rem] leading-[1.06] tracking-[0.018em] text-primary-800 transition-colors group-hover:text-primary-500">
              {article.title}
            </h3>
            <p className="max-w-[36ch] font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[17px]">
              {article.summary}
            </p>
          </div>
        </div>
      </ArticlePageLink>
    </article>
  );
}

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();

  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: BlogArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getArticlePageData(slug);

  if (!data) {
    return {
      title: "Article not found",
      description: "The requested article could not be found.",
    };
  }

  const { article } = data;
  const imageUrl =
    getArticleMetadataImageUrl(article) ||
    `${BUSINESS_CONSTANTS.BASE_URL}/images/olgish-cakes-logo-bakery-brand.png`;
  const canonicalUrl =
    article.seo?.canonicalUrl || `${BUSINESS_CONSTANTS.BASE_URL}${getArticleHref(article.slug)}`;
  const description = article.seo?.metaDescription || article.dek || article.summary;
  const metadataTitle = normalizeCmsTitle(article.seo?.metaTitle || article.title) || article.title;
  const modifiedAt = article.editorialUpdatedAt;
  const hasMaterialUpdate = hasMaterialArticleUpdate(article.publishedAt, modifiedAt);

  return {
    title: metadataTitle,
    description,
    keywords: article.seo?.keywords?.join(", "),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: metadataTitle,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: BUSINESS_CONSTANTS.NAME,
      publishedTime: article.publishedAt,
      ...(hasMaterialUpdate && modifiedAt ? { modifiedTime: modifiedAt } : {}),
      images: [
        {
          url: imageUrl,
          alt:
            article.coverImage?.alt ||
            article.cardImage?.alt ||
            article.primaryProduct?.image?.alt ||
            article.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metadataTitle,
      description,
      images: [imageUrl],
    },
  };
}

export default async function BlogArticlePage({ params, searchParams }: BlogArticlePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const data = await getArticlePageData(slug);

  if (!data) {
    notFound();
  }

  const { article, relatedArticles, tableOfContents } = data;
  const visibleImageUrl = getArticleVisibleImageUrl(article);
  const renderedVisibleImageUrl = getSanityCdnImageUrl(visibleImageUrl, {
    width: 1440,
    height: 810,
    fit: "crop",
    quality: 82,
  });
  const readingTime = getArticleReadingTime(article.body);
  const showTableOfContents = tableOfContents.length >= 3;
  const faqItems = (article.faqItems ?? []).filter(
    item => item.question.trim().length > 0 && item.answer.trim().length > 0
  );
  const featuredProduct = article.primaryProduct ?? article.relatedProducts?.[0];
  const featuredProductImageUrl = getSanityCdnImageUrl(featuredProduct?.image?.asset?.url, {
    width: 480,
    height: 600,
    fit: "crop",
    quality: 82,
  });
  const articleCommerceCopy = getArticleCommerceCopy(featuredProduct);
  const articleFaqCopy = getArticleFaqCopy(article.topic?.slug);
  const relatedArticlesCopy = getRelatedArticlesCopy(article.topic?.slug);
  const closingCtaCopy = getArticleClosingCtaCopy();
  const canonicalUrl =
    article.seo?.canonicalUrl || `${BUSINESS_CONSTANTS.BASE_URL}${getArticleHref(article.slug)}`;
  const modifiedAt = article.editorialUpdatedAt;
  const showVisibleUpdatedDate = hasMaterialArticleUpdate(article.publishedAt, modifiedAt);
  const backHref = buildBlogBackHref({
    fallbackHref: "/blog",
    fromParam: resolvedSearchParams?.from,
  });
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.dek,
    image: visibleImageUrl ? [visibleImageUrl] : undefined,
    datePublished: article.publishedAt,
    ...(showVisibleUpdatedDate && modifiedAt ? { dateModified: modifiedAt } : {}),
    articleSection: getArticleTopicTitle(article),
    mainEntityOfPage: canonicalUrl,
    author: {
      "@type": "Person",
      name: "Olga",
      jobTitle: "Founder and baker",
      url: BUSINESS_CONSTANTS.BASE_URL,
      sameAs: ["https://www.instagram.com/olgish_cakes/"],
    },
    publisher: {
      "@type": "Organization",
      name: BUSINESS_CONSTANTS.NAME,
      logo: {
        "@type": "ImageObject",
        url: `${BUSINESS_CONSTANTS.BASE_URL}/images/olgish-cakes-logo-bakery-brand.png`,
      },
    },
    keywords: article.seo?.keywords?.join(", "),
  };
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
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };
  const faqStructuredData =
    faqItems.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqItems.map(item => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <main className="min-h-screen bg-base-100 text-base-content [font-family:var(--font-inter)]">
      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-8 px-4 pb-20 pt-8 tablet:px-10 tablet:pt-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(articleStructuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(breadcrumbStructuredData) }}
        />
        {faqStructuredData ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: toJsonLdScript(faqStructuredData) }}
          />
        ) : null}

        <BlogBackLinkBase href={backHref} />

        <section className="relative space-y-4 overflow-visible tablet:space-y-5">
          <div className="relative">
            <header className="flex flex-col gap-5 pt-1">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 font-sans text-[0.72rem] uppercase tracking-[0.18em] text-base-content/75">
                  <span className="inline-flex items-center border-b border-primary-300 pb-1 font-semibold text-primary-700">
                    {getArticleTopicTitle(article)}
                  </span>
                  <time dateTime={article.publishedAt}>
                    Published {formatArticleDate(article.publishedAt)}
                  </time>
                  {showVisibleUpdatedDate && modifiedAt ? (
                    <time dateTime={modifiedAt}>
                      Last updated {formatArticleDate(modifiedAt)}
                    </time>
                  ) : null}
                  <span>{readingTime} min read</span>
                </div>
                <div className="space-y-2 tablet:space-y-3">
                  <p className="font-moreSugar text-[0.9rem] uppercase tracking-[0.18em] text-primary-500 tablet:text-sm">
                    From Olga&apos;s archive
                  </p>
                  <h1 className="w-full font-oldenburg text-[2.15rem] leading-[1.01] tracking-[0.015em] text-primary-800 tablet:text-[3.6rem]">
                    {article.title}
                  </h1>
                  <p className="w-full font-body text-[17px] leading-7 tracking-[0.01em] text-base-content/80 tablet:text-[23px] tablet:leading-8">
                    {article.dek}
                  </p>
                </div>
              </div>
            </header>
          </div>
          {renderedVisibleImageUrl ? (
            <div className="relative">
              <ArticleHeroImage
                imageUrl={renderedVisibleImageUrl}
                imageAlt={article.coverImage?.alt || article.cardImage?.alt || article.title}
                title={article.title}
              />
            </div>
          ) : null}
        </section>

        <section className="grid gap-10 small-laptop:grid-cols-[220px_minmax(0,1fr)]">
          {showTableOfContents ? (
            <aside
              data-testid="article-toc-desktop"
              className="hidden small-laptop:sticky small-laptop:top-28 small-laptop:block small-laptop:h-fit"
            >
              <ArticleTableOfContentsCard items={tableOfContents} />
            </aside>
          ) : null}

          <div className="space-y-8 tablet:space-y-10">
            {showTableOfContents ? (
              <details
                data-testid="article-toc-mobile"
                className="rounded-[20px] bg-[linear-gradient(180deg,var(--color-base-100),rgba(255,250,244,0.72))] p-4 shadow-[0_6px_16px_rgba(97,39,0,0.04)] small-laptop:hidden"
              >
                <summary className="cursor-pointer list-none font-sans text-sm font-semibold uppercase tracking-[0.16em] text-primary-800 [&::-webkit-details-marker]:hidden">
                  Jump to section
                </summary>
                <div className="mt-4">
                  <ArticleTableOfContentsCard
                    items={tableOfContents}
                    heading={null}
                    className="border-0 bg-transparent p-0 shadow-none"
                  />
                </div>
              </details>
            ) : null}

            <article className="rounded-[22px] bg-[linear-gradient(180deg,var(--color-base-100),rgba(255,250,244,0.76))] px-5 py-8 shadow-[0_14px_30px_rgba(97,39,0,0.05)] tablet:px-10 tablet:py-10">
              <ArticlePortableText value={article.body} />
            </article>

            <section className="rounded-[18px] bg-[linear-gradient(180deg,rgba(255,250,244,0.5),rgba(255,250,244,0.22))] px-5 py-6 tablet:px-8">
              <div className="flex flex-wrap items-center gap-4">
                <div className="rounded-full bg-primary-50 px-4 py-2 font-sans text-sm font-semibold text-primary-800">
                  Written by Olga
                </div>
                <p className="w-full font-body text-[16px] leading-7 tracking-[0.01em] text-base-content/72 tablet:text-[17px]">
                  These are the sorts of things Olga ends up explaining in messages before she confirms
                  an order: what travels well, what complicates delivery, and what is better kept local.
                </p>
              </div>
            </section>

            {featuredProduct ? (
              <section
                className={`grid gap-4 rounded-[24px] bg-base-100 p-6 text-base-content shadow-[0_12px_28px_rgba(97,39,0,0.05)] tablet:gap-5 ${
                  featuredProductImageUrl ? "tablet:grid-cols-[200px_minmax(0,1.45fr)] tablet:items-start" : ""
                }`}
              >
                {featuredProductImageUrl ? (
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-base-100 shadow-[0_8px_20px_rgba(97,39,0,0.05)] tablet:mt-1">
                    <img
                      src={featuredProductImageUrl}
                      alt={featuredProduct.image?.alt || featuredProduct.name}
                      width={480}
                      height={600}
                      loading="lazy"
                      decoding="async"
                      sizes="240px"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex flex-col justify-between gap-4 tablet:gap-5">
                  <div className="space-y-3 tablet:space-y-4">
                    <p className="font-moreSugar text-sm uppercase tracking-[0.16em] text-primary-500">
                      {articleCommerceCopy.eyebrow}
                    </p>
                    <div className="space-y-3">
                      <h2 className="max-w-[18ch] font-oldenburg text-[2.15rem] leading-[1.02] tracking-[0.03em] text-primary-800 tablet:max-w-[20ch]">
                        {articleCommerceCopy.heading}
                      </h2>
                      <p className="max-w-[58ch] font-body text-[17px] leading-7 tracking-[0.01em] text-base-content/80 tablet:text-[20px] tablet:leading-8">
                        {articleCommerceCopy.body}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 pt-1 tablet:flex-row tablet:flex-wrap">
                    <ArticlePageLink
                      href={getProductHref(featuredProduct)}
                      className="btn btn-primary w-full rounded-full px-5 normal-case shadow-none tablet:w-auto"
                    >
                      {getArticlePrimaryCtaLabel(featuredProduct)}
                    </ArticlePageLink>
                    <ArticlePageLink
                      href="/cakes"
                      className="btn btn-outline w-full rounded-full border-primary-500 px-5 normal-case text-primary-500 shadow-none hover:bg-primary-500 hover:text-primary-content tablet:w-auto"
                    >
                      See custom cakes
                    </ArticlePageLink>
                  </div>
                </div>
              </section>
            ) : null}

            {faqItems.length > 0 ? (
              <section className="rounded-[16px] bg-base-100 p-6 tablet:p-8">
                <div className="max-w-[46rem] space-y-2">
                  <p className="font-sans text-sm uppercase tracking-[0.16em] text-base-content/75">
                    {articleFaqCopy.eyebrow}
                  </p>
                  <h2 className="font-oldenburg text-[30px] leading-tight tracking-[0.03em] text-primary-800">
                    {articleFaqCopy.heading}
                  </h2>
                  <p className="font-body text-[16px] leading-7 tracking-[0.01em] text-base-content/76 tablet:text-[17px] tablet:leading-8">
                    {articleFaqCopy.intro}
                  </p>
                </div>
                <div className="mt-6 space-y-4">
                  {faqItems.map(item => (
                    <details
                      key={item._key || item.question}
                      className="group rounded-[10px] bg-base-100 px-0 py-5 first:pt-0 not-first:border-t not-first:border-base-300"
                    >
                      <summary className="cursor-pointer list-none font-oldenburg text-[24px] leading-tight tracking-[0.03em] text-primary-800 [&::-webkit-details-marker]:hidden">
                        {item.question}
                      </summary>
                      <p className="mt-4 font-body text-[16px] leading-7 tracking-[0.01em] text-base-content/80 tablet:text-[17px] tablet:leading-8">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </section>

        {relatedArticles.length > 0 ? (
          <section className="mt-1 space-y-4 border-t border-base-300 pt-5 tablet:space-y-6 tablet:pt-10">
            <div>
              <p className="font-sans text-sm uppercase tracking-[0.16em] text-base-content/75">
                {relatedArticlesCopy.eyebrow}
              </p>
              <h2 className="mt-2 font-oldenburg text-[30px] leading-tight tracking-[0.03em] text-primary-800">
                {relatedArticlesCopy.heading}
              </h2>
              <p className="mt-2 max-w-[46rem] font-body text-[16px] leading-7 tracking-[0.01em] text-base-content/76 tablet:text-[17px] tablet:leading-8">
                {relatedArticlesCopy.intro}
              </p>
            </div>
            <div className="grid gap-x-8 gap-y-8 tablet:grid-cols-2 tablet:gap-y-10 small-laptop:grid-cols-3">
              {relatedArticles.map(relatedArticle => (
                <RelatedArticleCard key={relatedArticle._id} article={relatedArticle} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="relative overflow-hidden rounded-[28px] border border-primary-200/55 bg-[linear-gradient(135deg,var(--color-base-100),var(--color-primary-50),var(--color-secondary)/0.12)] p-6 text-base-content shadow-[0_14px_30px_rgba(46,49,146,0.06)] tablet:rounded-[36px] tablet:border-primary-200/70 tablet:bg-[linear-gradient(135deg,var(--color-base-100),var(--color-primary-50),var(--color-secondary)/0.18)] tablet:p-8 tablet:shadow-[0_20px_48px_rgba(46,49,146,0.08)]">
          <div className="absolute -right-10 top-0 hidden h-32 w-32 rounded-full bg-secondary/20 blur-2xl tablet:block" />
          <div className="absolute bottom-0 left-0 hidden h-24 w-24 rounded-full bg-primary-100/60 blur-2xl tablet:block" />
          <div className="grid gap-6 small-laptop:grid-cols-[minmax(0,1fr)_auto] small-laptop:items-end">
            <div className="relative max-w-[46rem] space-y-3">
              <p className="font-moreSugar text-sm uppercase tracking-[0.16em] text-primary-500">
                {closingCtaCopy.eyebrow}
              </p>
              <h2 className="font-oldenburg text-[2.3rem] leading-tight tracking-[0.03em] text-primary-800">
                {closingCtaCopy.heading}
              </h2>
              <p className="font-body text-[17px] leading-7 tracking-[0.01em] text-base-content/80 tablet:text-[21px] tablet:leading-8">
                {closingCtaCopy.intro}
              </p>
            </div>
            <div className="flex flex-col gap-3 tablet:flex-row tablet:flex-wrap">
              <ArticlePageLink
                href="/cakes-by-post"
                className="btn btn-primary w-full rounded-full px-5 normal-case shadow-none tablet:w-auto"
              >
                Shop cakes by post
              </ArticlePageLink>
              <ArticlePageLink
                href="/cakes"
                className="btn btn-outline w-full rounded-full border-primary-500 px-5 normal-case text-primary-500 shadow-none hover:bg-primary-500 hover:text-primary-content tablet:w-auto"
              >
                See custom cakes
              </ArticlePageLink>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
