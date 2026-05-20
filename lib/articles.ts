import { cache } from "react";
import { cachedSanityFetch, getCacheConfig } from "@/lib/sanity-cache";
import {
  ARTICLE_ARCHIVE_COUNT_QUERY,
  ARTICLE_ARCHIVE_PAGE_QUERY,
  ARTICLE_ARCHIVE_QUERY,
  ARTICLE_BY_SLUG_QUERY,
  ARTICLE_SLUGS_QUERY,
  ARTICLE_TOPICS_QUERY,
} from "@/lib/queries/articles";
import { createArticleHeadingIdResolver } from '@/lib/article-heading-ids'

export interface PortableTextMarkDefinition {
  _key: string;
  _type: string;
  href?: string;
}

export interface PortableTextSpan {
  _key?: string;
  _type: "span";
  text?: string;
  marks?: string[];
}

export interface PortableTextBlock {
  _key?: string;
  _type: "block";
  style?: string;
  children?: PortableTextSpan[];
  markDefs?: PortableTextMarkDefinition[];
  listItem?: "bullet" | "number";
  level?: number;
}

export interface PortableTextImage {
  _key?: string;
  _type: "image";
  alt?: string;
  caption?: string;
  asset?: {
    _ref?: string;
    url?: string;
  };
}

export type ArticleBodyNode = PortableTextBlock | PortableTextImage;

export interface ArticleImage {
  alt?: string;
  asset?: {
    _id?: string;
    url?: string;
  };
}

export interface ArticleTopic {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  order?: number;
}

export interface ArticleProduct {
  _id: string;
  _type: "cake" | "giftHamper";
  name: string;
  slug: string;
  price?: number | null;
  image?: ArticleImage;
  isPostableToUk?: boolean;
  shortDescription?: PortableTextBlock[];
  description?: PortableTextBlock[];
}

export interface ArticleSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
}

export interface ArticleFaqItem {
  _key?: string;
  question: string;
  answer: string;
}

export interface ArticleCard {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  dek: string;
  publishedAt: string;
  editorialUpdatedAt?: string;
  coverImage?: ArticleImage;
  cardImage?: ArticleImage;
  topic?: ArticleTopic;
  primaryProduct?: ArticleProduct;
  seo?: ArticleSeo;
}

export interface Article extends ArticleCard {
  body: ArticleBodyNode[];
  faqItems?: ArticleFaqItem[];
  relatedProducts?: ArticleProduct[];
}

export interface ArticleTableOfContentsItem {
  id: string;
  title: string;
}

type SearchParamValue = string | string[] | undefined;

export interface BlogArchiveQueryState {
  topic?: string;
  page: number;
}

export interface PaginatedArticleArchive {
  articles: ArticleCard[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export type ArticlePaginationToken = number | "ellipsis-leading" | "ellipsis-trailing";

const DEFAULT_ARTICLE_PUBLISH_REVALIDATE_SECONDS = 300;
const MIN_ARTICLE_PUBLISH_REVALIDATE_SECONDS = 60;
export const BLOG_ARCHIVE_PAGE_SIZE = 12;
const TRUNCATED_PAGINATION_THRESHOLD = 7;
const positiveIntegerPattern = /^[1-9]\d*$/;
const productFeatureBreakPattern =
  /\s+(?=(?:Pack of\b|Letterbox-friendly\b|Free\b|Serves\b|Dispatch\b|Nationwide\b|Collection\b|Storage\b|Vacuum-packed\b|Fits\b))/g;

function isPortableTextBlock(node: ArticleBodyNode): node is PortableTextBlock {
  return node._type === "block";
}

function getArticlePublishRevalidateSeconds() {
  const configuredValue = Number.parseInt(process.env.ARTICLE_PUBLISH_REVALIDATE_SECONDS ?? "", 10);

  if (
    Number.isFinite(configuredValue) &&
    configuredValue >= MIN_ARTICLE_PUBLISH_REVALIDATE_SECONDS
  ) {
    return configuredValue;
  }

  return DEFAULT_ARTICLE_PUBLISH_REVALIDATE_SECONDS;
}

function getScheduledArticleCacheConfig(type: "articles" | "article") {
  const baseConfig = getCacheConfig(type);
  const articleRevalidateSeconds = getArticlePublishRevalidateSeconds();

  if (typeof baseConfig.revalidate === "number") {
    return {
      ...baseConfig,
      revalidate: Math.min(baseConfig.revalidate, articleRevalidateSeconds),
    };
  }

  return {
    ...baseConfig,
    revalidate: articleRevalidateSeconds,
  };
}

function truncateText(value: string, limit: number) {
  const normalized = value.trim();

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit).trimEnd()}...`;
}

export function getArticleHref(slug: string) {
  return `/blog/${slug}`;
}

export function getBlogArchiveHref({ topic, page = 1 }: Partial<BlogArchiveQueryState>) {
  const searchParams = new URLSearchParams();

  if (topic) {
    searchParams.set("topic", topic);
  }

  if (page > 1) {
    searchParams.set("page", String(page));
  }

  const queryString = searchParams.toString();

  return queryString.length > 0 ? `/blog?${queryString}` : "/blog";
}

export function getProductHref(product: ArticleProduct) {
  return product._type === "giftHamper"
    ? `/cakes-by-post/${product.slug}`
    : `/cakes/${product.slug}`;
}

export function isArticleProductPostableToUk(product?: ArticleProduct) {
  return product?.isPostableToUk === true;
}

export function toJsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function portableTextToLines(blocks: ArticleBodyNode[] | PortableTextBlock[] | undefined) {
  if (!blocks || blocks.length === 0) {
    return [];
  }

  return blocks
    .map(block => {
      if (!isPortableTextBlock(block)) {
        return "";
      }

      return (block.children ?? [])
        .map(child => child.text?.trim() ?? "")
        .filter(text => text.length > 0)
        .join(" ");
    })
    .filter(text => text.length > 0);
}

function toSentence(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");

  if (normalized.length === 0) {
    return "";
  }

  if (/[.!?]$/.test(normalized)) {
    return normalized;
  }

  return `${normalized}.`;
}

function getPortableTextEditorialSummary(
  blocks: ArticleBodyNode[] | PortableTextBlock[] | undefined
) {
  const lines = portableTextToLines(blocks).flatMap(line => {
    if (/[.!?]/.test(line) || !productFeatureBreakPattern.test(line)) {
      productFeatureBreakPattern.lastIndex = 0;
      return [line];
    }

    productFeatureBreakPattern.lastIndex = 0;
    return line.split(productFeatureBreakPattern).filter(segment => segment.trim().length > 0);
  });

  if (lines.length === 0) {
    return "";
  }

  return truncateText(lines.map(toSentence).join(" "), 180);
}

export function portableTextToPlainText(
  blocks: ArticleBodyNode[] | PortableTextBlock[] | undefined
) {
  return portableTextToLines(blocks).join("\n").trim();
}

export function getArticleReadingTime(body: ArticleBodyNode[]) {
  const wordCount = portableTextToPlainText(body)
    .split(/\s+/)
    .filter(token => token.length > 0).length;

  return Math.max(2, Math.ceil(wordCount / 220));
}

type ArticleImageSelectionInput = Pick<ArticleCard, "coverImage" | "cardImage" | "primaryProduct">;

export function getArticleVisibleImage(article: ArticleImageSelectionInput) {
  return article.coverImage ?? article.cardImage;
}

export function getArticleVisibleImageUrl(article: ArticleImageSelectionInput) {
  return getArticleVisibleImage(article)?.asset?.url;
}

export function getArticleCardImage(article: ArticleImageSelectionInput) {
  return article.cardImage ?? article.coverImage;
}

export function getArticleCardImageUrl(article: ArticleImageSelectionInput) {
  return getArticleCardImage(article)?.asset?.url;
}

export function getArticleMetadataImage(article: ArticleImageSelectionInput) {
  return getArticleVisibleImage(article) ?? article.primaryProduct?.image;
}

export function getArticleMetadataImageUrl(article: ArticleImageSelectionInput) {
  return getArticleMetadataImage(article)?.asset?.url;
}

export function getArticleImage(article: ArticleImageSelectionInput) {
  return getArticleMetadataImage(article);
}

export function getArticleImageUrl(article: ArticleImageSelectionInput) {
  return getArticleMetadataImageUrl(article);
}

type SanityCdnImageFit = "clip" | "crop" | "fill" | "fillmax" | "max" | "min" | "scale";

interface SanityCdnImageOptions {
  width?: number;
  height?: number;
  fit?: SanityCdnImageFit;
  quality?: number;
  autoFormat?: boolean;
}

type SanityCdnImageLoaderOptions =
  Omit<SanityCdnImageOptions, 'autoFormat'>

export function isSanityCdnImageUrl(imageUrl?: string) {
  if (!imageUrl) {
    return false;
  }

  return imageUrl.startsWith("https://cdn.sanity.io/images/");
}

export function getSanityCdnImageUrl(
  imageUrl: string | undefined,
  {
    width,
    height,
    fit,
    quality,
    autoFormat = true,
  }: SanityCdnImageOptions = {}
) {
  if (!imageUrl || !isSanityCdnImageUrl(imageUrl)) {
    return imageUrl;
  }

  const transformedUrl = new URL(imageUrl);

  if (width) {
    transformedUrl.searchParams.set("w", String(width));
  }

  if (height) {
    transformedUrl.searchParams.set("h", String(height));
  }

  if (fit) {
    transformedUrl.searchParams.set("fit", fit);
  }

  if (typeof quality === "number") {
    transformedUrl.searchParams.set("q", String(quality));
  }

  if (autoFormat) {
    transformedUrl.searchParams.set("auto", "format");
  }

  return transformedUrl.toString();
}

export function getSanityCdnImageLoader({
  width,
  height,
  fit,
  quality,
}: SanityCdnImageLoaderOptions = {}) {
  return ({ src, width: requestedWidth, quality: requestedQuality }: { src: string; width: number; quality?: number }) => {
    if (!isSanityCdnImageUrl(src)) {
      return src;
    }

    const resolvedHeight =
      typeof width === "number" &&
      Number.isFinite(width) &&
      typeof height === "number" &&
      Number.isFinite(height)
        ? Math.max(1, Math.round((requestedWidth / width) * height))
        : undefined;

    return getSanityCdnImageUrl(src, {
      width: requestedWidth,
      height: resolvedHeight,
      fit,
      quality: requestedQuality ?? quality,
    }) ?? src;
  };
}

export function getArticleTopicTitle(article: Pick<ArticleCard, "topic">) {
  return article.topic?.title ?? "Articles";
}

export function getArticleProductDescription(product: ArticleProduct | undefined) {
  if (!product) {
    return "";
  }

  const summary = getPortableTextEditorialSummary(product.shortDescription);
  if (summary.length > 0) {
    return summary;
  }

  const description = getPortableTextEditorialSummary(product.description);
  if (description.length > 0) {
    return description;
  }

  return product._type === "giftHamper"
    ? "Postal cake gift prepared fresh and packed carefully for UK delivery."
    : "Handmade cake baked to order in Leeds for celebrations across Yorkshire and the UK.";
}

export function formatArticleDate(dateValue: string) {
  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function hasMaterialArticleUpdate(publishedAt: string, modifiedAt?: string | null) {
  if (!modifiedAt) {
    return false;
  }

  const publishedTimestamp = Date.parse(publishedAt);
  const modifiedTimestamp = Date.parse(modifiedAt);

  if (
    Number.isNaN(publishedTimestamp) ||
    Number.isNaN(modifiedTimestamp) ||
    modifiedTimestamp <= publishedTimestamp
  ) {
    return false;
  }

  return (
    new Date(publishedTimestamp).toISOString().slice(0, 10) !==
    new Date(modifiedTimestamp).toISOString().slice(0, 10)
  );
}

export function resolveBlogArchiveSearchParams(
  searchParams: Record<string, SearchParamValue>
): BlogArchiveQueryState | null {
  const rawTopic = searchParams.topic;
  const rawPage = searchParams.page;

  if (Array.isArray(rawTopic) || Array.isArray(rawPage)) {
    return null;
  }

  const topic = typeof rawTopic === "string" ? rawTopic.trim() : undefined;

  if (rawTopic !== undefined && (!topic || topic.length === 0)) {
    return null;
  }

  if (rawPage === undefined) {
    return {
      topic,
      page: 1,
    };
  }

  const normalizedPage = rawPage.trim();

  if (!positiveIntegerPattern.test(normalizedPage)) {
    return null;
  }

  return {
    topic,
    page: Number(normalizedPage),
  };
}

export function getArticlePaginationTokens(
  currentPage: number,
  totalPages: number
): ArticlePaginationToken[] {
  if (totalPages <= TRUNCATED_PAGINATION_THRESHOLD) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const tokens: ArticlePaginationToken[] = [1];

  let middleStart = Math.max(2, currentPage - 1);
  let middleEnd = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 3) {
    middleStart = 2;
    middleEnd = 4;
  }

  if (currentPage >= totalPages - 2) {
    middleStart = totalPages - 3;
    middleEnd = totalPages - 1;
  }

  if (middleStart > 2) {
    tokens.push("ellipsis-leading");
  }

  for (let pageNumber = middleStart; pageNumber <= middleEnd; pageNumber += 1) {
    tokens.push(pageNumber);
  }

  if (middleEnd < totalPages - 1) {
    tokens.push("ellipsis-trailing");
  }

  tokens.push(totalPages);

  return tokens;
}

export function isBlogArchivePageOutOfRange(page: number, totalPages: number) {
  if (totalPages === 0) {
    return page !== 1;
  }

  return page > totalPages;
}

export function extractArticleTableOfContents(body: ArticleBodyNode[]) {
  const resolveHeadingId = createArticleHeadingIdResolver()

  return body
    .filter(isPortableTextBlock)
    .filter(block => block.style === "h2")
    .map(block => {
      const title = portableTextToPlainText([block]);
      if (title.length === 0) {
        return null;
      }

      return {
        id: resolveHeadingId(title),
        title,
      } satisfies ArticleTableOfContentsItem;
    })
    .filter((item): item is ArticleTableOfContentsItem => item !== null);
}

export const getArticleTopics = cache(async () => {
  const config = getCacheConfig("articles");
  return cachedSanityFetch<ArticleTopic[]>(ARTICLE_TOPICS_QUERY, {}, config);
});

export const getArchiveArticles = cache(async () => {
  const config = getScheduledArticleCacheConfig("articles");
  return cachedSanityFetch<ArticleCard[]>(ARTICLE_ARCHIVE_QUERY, {}, config);
});

export const getPaginatedArchiveArticles = cache(
  async (
    topic: string | null,
    page: number,
    pageSize = BLOG_ARCHIVE_PAGE_SIZE
  ): Promise<PaginatedArticleArchive> => {
    const config = getScheduledArticleCacheConfig("articles");
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const [articles, totalCount] = await Promise.all([
      cachedSanityFetch<ArticleCard[]>(ARTICLE_ARCHIVE_PAGE_QUERY, { topic, start, end }, config),
      cachedSanityFetch<number>(ARTICLE_ARCHIVE_COUNT_QUERY, { topic }, config),
    ]);

    return {
      articles,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      pageSize,
    };
  }
);

export const getArticleBySlug = cache(async (slug: string) => {
  const config = getScheduledArticleCacheConfig("article");
  return cachedSanityFetch<Article | null>(ARTICLE_BY_SLUG_QUERY, { slug }, config);
});

export const getArticleSlugs = cache(async () => {
  const config = getScheduledArticleCacheConfig("articles");
  const records = await cachedSanityFetch<Array<{ slug: string }>>(ARTICLE_SLUGS_QUERY, {}, config);
  return records.map(record => record.slug);
});

export const getRelatedArticles = cache(
  async (articleId: string, topicSlug?: string, limit = 3) => {
    const articles = await getArchiveArticles();
    const candidates = articles.filter(article => article._id !== articleId);
    const matchingTopic = candidates.filter(article => article.topic?.slug === topicSlug);
    const otherTopics = candidates.filter(article => article.topic?.slug !== topicSlug);

    return [...matchingTopic, ...otherTopics].slice(0, limit);
  }
);
