import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { BUSINESS_CONSTANTS } from "@/lib/constants";
import { normalizeCmsTitle } from "@/lib/metadata";
import {
  extractArticleTableOfContents,
  formatArticleDate,
  getArticleBySlug,
  getArticleHref,
  getArticleMetadataImageUrl,
  getArticleReadingTime,
  getArticleSlugs,
  getArticleTopicTitle,
  getArticleVisibleImageUrl,
  getProductHref,
  getRelatedArticles,
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
import { BlogBackLink } from "../BlogBackLink";
import { BlogBackLinkBase } from "../BlogBackLinkBase";

interface BlogArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
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

function ArticleHeroImage({
  imageUrl,
  imageAlt,
  title,
}: {
  imageUrl?: string;
  imageAlt?: string;
  title: string;
}) {
  if (!imageUrl) {
    return null;
  }

  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-[28px] bg-base-200">
      <Image
        src={imageUrl}
        alt={imageAlt || title}
        fill
        loading="eager"
        fetchPriority="high"
        sizes="(min-width: 1280px) 1060px, 100vw"
        className="object-cover"
      />
    </div>
  );
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
      className={`rounded-[24px] border border-base-300 bg-white p-5 shadow-sm ${className}`.trim()}
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
        <Image
          src={imageUrl}
          alt={imageAlt || topicTitle}
          fill
          sizes="(min-width: 1280px) 320px, 50vw"
          className="object-cover"
        />
      </div>
    );
  }

  return null;
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
  const modifiedAt = article.editorialUpdatedAt || article.publishedAt;

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
      modifiedTime: modifiedAt,
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

export default async function BlogArticlePage({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const data = await getArticlePageData(slug);

  if (!data) {
    notFound();
  }

  const { article, relatedArticles, tableOfContents } = data;
  const visibleImageUrl = getArticleVisibleImageUrl(article);
  const readingTime = getArticleReadingTime(article.body);
  const showTableOfContents = tableOfContents.length >= 3;
  const faqItems = (article.faqItems ?? []).filter(
    item => item.question.trim().length > 0 && item.answer.trim().length > 0
  );
  const featuredProduct = article.primaryProduct ?? article.relatedProducts?.[0];
  const articleCommerceCopy = getArticleCommerceCopy(featuredProduct);
  const articleFaqCopy = getArticleFaqCopy(article.topic?.slug);
  const relatedArticlesCopy = getRelatedArticlesCopy(article.topic?.slug);
  const closingCtaCopy = getArticleClosingCtaCopy();
  const canonicalUrl =
    article.seo?.canonicalUrl || `${BUSINESS_CONSTANTS.BASE_URL}${getArticleHref(article.slug)}`;
  const modifiedAt = article.editorialUpdatedAt || article.publishedAt;
  const showVisibleUpdatedDate = Boolean(article.editorialUpdatedAt);
  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.dek,
    image: visibleImageUrl ? [visibleImageUrl] : undefined,
    datePublished: article.publishedAt,
    dateModified: modifiedAt,
    articleSection: getArticleTopicTitle(article),
    mainEntityOfPage: canonicalUrl,
    author: {
      "@type": "Person",
      name: "Olga",
      jobTitle: "Founder and baker",
      url: `${BUSINESS_CONSTANTS.BASE_URL}/about`,
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

        <Suspense fallback={<BlogBackLinkBase href="/blog" />}>
          <BlogBackLink />
        </Suspense>

        <header className="space-y-6 rounded-[32px] border border-base-300 bg-accent-50/55 p-6 shadow-sm tablet:p-10">
          <div className="flex flex-wrap items-center gap-3 font-sans text-sm text-base-content/70">
            <span className="rounded-full bg-accent-50 px-3 py-1 font-semibold text-primary-800">
              {getArticleTopicTitle(article)}
            </span>
            <time dateTime={article.publishedAt}>
              Published {formatArticleDate(article.publishedAt)}
            </time>
            {showVisibleUpdatedDate ? (
              <time dateTime={modifiedAt}>Last updated {formatArticleDate(modifiedAt)}</time>
            ) : null}
            <span>{readingTime} min read</span>
          </div>
          <div className="max-w-[48rem] space-y-4">
            <h1 className="font-oldenburg text-[42px] leading-none tracking-[0.02em] text-primary-800 tablet:text-[56px]">
              {article.title}
            </h1>
            <p className="font-body text-[20px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[23px]">
              {article.dek}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 border-t border-base-300 pt-5">
            <div className="rounded-full bg-primary-50 px-4 py-2 font-sans text-sm font-semibold text-primary-800">
              Written by Olga
            </div>
            <p className="max-w-[40rem] font-body text-[16px] leading-7 tracking-[0.01em] text-base-content/72 tablet:text-[17px]">
              These are the sorts of things Olga ends up explaining in messages before she confirms
              an order: what travels well, what complicates delivery, and what is better kept local.
            </p>
          </div>
        </header>

        {visibleImageUrl ? (
          <ArticleHeroImage
            imageUrl={visibleImageUrl}
            imageAlt={article.coverImage?.alt || article.cardImage?.alt || article.title}
            title={article.title}
          />
        ) : null}

        <section className="grid gap-10 small-laptop:grid-cols-[220px_minmax(0,1fr)]">
          {showTableOfContents ? (
            <aside
              data-testid="article-toc-desktop"
              className="hidden small-laptop:sticky small-laptop:top-28 small-laptop:block small-laptop:h-fit"
            >
              <ArticleTableOfContentsCard items={tableOfContents} />
            </aside>
          ) : null}

          <div className="space-y-10">
            {showTableOfContents ? (
              <details
                data-testid="article-toc-mobile"
                className="rounded-[24px] border border-base-300 bg-white p-4 shadow-sm small-laptop:hidden"
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

            <article className="rounded-[32px] border border-base-300 bg-white px-5 py-8 shadow-sm tablet:px-10 tablet:py-10">
              <ArticlePortableText value={article.body} />
            </article>

            {featuredProduct ? (
              <section
                className={`grid gap-5 rounded-[32px] border border-primary-200 bg-primary-50/60 p-6 shadow-sm ${
                  featuredProduct.image?.asset?.url ? "tablet:grid-cols-[240px_minmax(0,1fr)]" : ""
                }`}
              >
                {featuredProduct.image?.asset?.url ? (
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-base-200">
                    <Image
                      src={featuredProduct.image.asset.url}
                      alt={featuredProduct.image.alt || featuredProduct.name}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex flex-col justify-between gap-5">
                  <div className="space-y-3">
                    <p className="font-moreSugar text-sm uppercase tracking-[0.16em] text-primary-500">
                      {articleCommerceCopy.eyebrow}
                    </p>
                    <div className="space-y-3">
                      <h2 className="font-oldenburg text-[30px] leading-tight tracking-[0.03em] text-primary-800">
                        {articleCommerceCopy.heading}
                      </h2>
                      <p className="font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[17px]">
                        {articleCommerceCopy.body}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={getProductHref(featuredProduct)}
                      className="btn btn-primary rounded-full px-5 normal-case shadow-none"
                    >
                      See this postal cake
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
            ) : null}

            {faqItems.length > 0 ? (
              <section className="rounded-[32px] border border-base-300 bg-base-100 p-6 shadow-sm tablet:p-8">
                <div className="max-w-[46rem] space-y-2">
                  <p className="font-sans text-sm uppercase tracking-[0.16em] text-base-content/75">
                    {articleFaqCopy.eyebrow}
                  </p>
                  <h2 className="font-oldenburg text-[30px] leading-tight tracking-[0.03em] text-primary-800">
                    {articleFaqCopy.heading}
                  </h2>
                  <p className="font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/76 tablet:text-[17px]">
                    {articleFaqCopy.intro}
                  </p>
                </div>
                <div className="mt-6 space-y-4">
                  {faqItems.map(item => (
                    <details
                      key={item._key || item.question}
                      className="group rounded-[20px] border border-base-300 bg-base-100 p-5"
                    >
                      <summary className="cursor-pointer list-none font-oldenburg text-[24px] leading-tight tracking-[0.03em] text-primary-800 [&::-webkit-details-marker]:hidden">
                        {item.question}
                      </summary>
                      <p className="mt-4 font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[17px]">
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
          <section className="space-y-5">
            <div>
              <p className="font-sans text-sm uppercase tracking-[0.16em] text-base-content/75">
                {relatedArticlesCopy.eyebrow}
              </p>
              <h2 className="mt-2 font-oldenburg text-[30px] leading-tight tracking-[0.03em] text-primary-800">
                {relatedArticlesCopy.heading}
              </h2>
              <p className="mt-2 max-w-[46rem] font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/76 tablet:text-[17px]">
                {relatedArticlesCopy.intro}
              </p>
            </div>
            <div className="grid gap-5 tablet:grid-cols-2 small-laptop:grid-cols-3">
              {relatedArticles.map(relatedArticle => {
                const relatedArticleImageUrl = getArticleVisibleImageUrl(relatedArticle);

                return (
                  <article
                    key={relatedArticle._id}
                    className="overflow-hidden rounded-[24px] border border-base-300 bg-white shadow-sm"
                  >
                    <Link
                      href={getArticleHref(relatedArticle.slug)}
                      className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
                    >
                      {relatedArticleImageUrl ? (
                        <RelatedArticleMedia
                          imageUrl={relatedArticleImageUrl}
                          imageAlt={
                            relatedArticle.coverImage?.alt ||
                            relatedArticle.cardImage?.alt ||
                            relatedArticle.title
                          }
                          topicTitle={getArticleTopicTitle(relatedArticle)}
                        />
                      ) : null}
                      <div className="space-y-3 p-5">
                        <div className="flex flex-wrap items-center gap-3 font-sans text-sm text-base-content/65">
                          <span>{getArticleTopicTitle(relatedArticle)}</span>
                          <span>{formatArticleDate(relatedArticle.publishedAt)}</span>
                        </div>
                        <h3 className="font-oldenburg text-[1.7rem] leading-tight tracking-[0.02em] text-primary-800 transition-colors group-hover:text-primary-500">
                          {relatedArticle.title}
                        </h3>
                        <p className="font-body text-[16px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[17px]">
                          {relatedArticle.summary}
                        </p>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="rounded-[32px] border border-primary-500 bg-primary-50 p-6 shadow-sm tablet:p-8">
          <div className="grid gap-6 small-laptop:grid-cols-[minmax(0,1fr)_auto] small-laptop:items-end">
            <div className="max-w-[46rem] space-y-3">
              <p className="font-moreSugar text-sm uppercase tracking-[0.16em] text-primary-500">
                {closingCtaCopy.eyebrow}
              </p>
              <h2 className="font-oldenburg text-[2.3rem] leading-tight tracking-[0.03em] text-primary-800">
                {closingCtaCopy.heading}
              </h2>
              <p className="font-body text-[18px] leading-8 tracking-[0.01em] text-base-content/80 tablet:text-[21px]">
                {closingCtaCopy.intro}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
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
          </div>
        </section>
      </section>
    </main>
  );
}
