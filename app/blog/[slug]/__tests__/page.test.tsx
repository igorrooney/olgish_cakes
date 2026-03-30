/**
 * @jest-environment jsdom
 */

import type { ImgHTMLAttributes } from "react";
import { render, screen } from "@testing-library/react";
import BlogArticlePage, { generateMetadata, generateStaticParams } from "../page";
import { notFound } from "next/navigation";

const mockUseSearchParams = jest.fn();

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    alt = "",
    fill,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; fetchPriority?: string }) => (
    <img alt={alt} {...props} />
  ),
}));

jest.mock("../../ArticlePortableText", () => ({
  ArticlePortableText: () => <div>Portable text body</div>,
}));

const mockGetArticleBySlug = jest.fn();
const mockGetRelatedArticles = jest.fn();
const mockGetArticleSlugs = jest.fn();

jest.mock("@/lib/articles", () => ({
  extractArticleTableOfContents: (
    body: Array<{ _type?: string; style?: string; children?: Array<{ text?: string }> }>
  ) => {
    return body
      .filter(block => block._type === "block" && block.style === "h2")
      .map((block, index) => ({
        id: `heading-${index + 1}`,
        title: block.children?.map(child => child.text || "").join(" ") || "",
      }));
  },
  formatArticleDate: (value: string) =>
    value.startsWith("2025-04-05") ? "5 April 2025" : "1 April 2025",
  getArticleBySlug: (...args: unknown[]) => mockGetArticleBySlug(...args),
  getArticleHref: (slug: string) => `/blog/${slug}`,
  getArticleMetadataImageUrl: (article: {
    coverImage?: { asset?: { url?: string } };
    cardImage?: { asset?: { url?: string } };
    primaryProduct?: { image?: { asset?: { url?: string } } };
  }) => {
    return (
      article.coverImage?.asset?.url ||
      article.cardImage?.asset?.url ||
      article.primaryProduct?.image?.asset?.url
    );
  },
  getArticleVisibleImageUrl: (article: {
    coverImage?: { asset?: { url?: string } };
    cardImage?: { asset?: { url?: string } };
  }) => {
    return article.coverImage?.asset?.url || article.cardImage?.asset?.url;
  },
  getArticleReadingTime: () => 7,
  getArticleSlugs: (...args: unknown[]) => mockGetArticleSlugs(...args),
  getArticleTopicTitle: (article: { topic?: { title?: string } }) =>
    article.topic?.title || "Articles",
  getProductHref: (product: { _type: string; slug: string }) =>
    product._type === "giftHamper" ? `/cakes-by-post/${product.slug}` : `/cakes/${product.slug}`,
  getRelatedArticles: (...args: unknown[]) => mockGetRelatedArticles(...args),
  toJsonLdScript: (value: unknown) => JSON.stringify(value),
}));

const baseArticle = {
  _id: "article-1",
  title: "How to order cake by post",
  slug: "how-to-order-cake-by-post",
  summary: "Summary copy",
  dek: "Editorial introduction for the article.",
  publishedAt: "2025-04-01T09:00:00.000Z",
  editorialUpdatedAt: "2025-04-05T10:30:00.000Z",
  modifiedAt: "2025-04-05T10:30:00.000Z",
  coverImage: {
    asset: {
      url: "https://cdn.sanity.io/article-cover.jpg",
    },
    alt: "Cover image",
  },
  topic: {
    _id: "topic-1",
    title: "Cake by post",
    slug: "cake-by-post",
  },
  seo: {
    metaTitle: "Cake by post guide | Olgish Cakes",
    metaDescription: "Everything to know about cake by post.",
    keywords: ["cake by post", "letterbox cake"],
  },
  body: [
    {
      _type: "block",
      style: "normal",
      children: [{ _type: "span", text: "Intro text" }],
    },
    {
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: "Choose the right format" }],
    },
    {
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: "Think about the journey" }],
    },
    {
      _type: "block",
      style: "h2",
      children: [{ _type: "span", text: "Order with enough notice" }],
    },
  ],
  faqItems: [
    {
      _key: "faq-1",
      question: "How long does it stay fresh?",
      answer: "Up to seven days when stored correctly.",
    },
  ],
  primaryProduct: {
    _id: "hamper-1",
    _type: "giftHamper",
    name: "Postal Medovik",
    slug: "postal-medovik",
    image: {
      asset: {
        url: "https://cdn.sanity.io/hamper.jpg",
      },
      alt: "Postal Medovik",
    },
  },
  relatedProducts: [],
};

const relatedArticles = [
  {
    _id: "article-2",
    title: "Birthday cakes by post",
    slug: "birthday-cakes-by-post",
    summary: "Related summary",
    dek: "Related dek",
    publishedAt: "2025-03-21T09:00:00.000Z",
    topic: {
      _id: "topic-1",
      title: "Cake by post",
      slug: "cake-by-post",
    },
    primaryProduct: {
      image: {
        asset: {
          url: "https://cdn.sanity.io/related-product.jpg",
        },
        alt: "Related product image",
      },
    },
  },
];

describe("BlogArticlePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    mockGetArticleSlugs.mockResolvedValue(["how-to-order-cake-by-post"]);
    mockGetRelatedArticles.mockResolvedValue(relatedArticles);
    mockGetArticleBySlug.mockResolvedValue(baseArticle);
  });

  it("generates static params from article slugs", async () => {
    const params = await generateStaticParams();

    expect(params).toEqual([{ slug: "how-to-order-cake-by-post" }]);
  });

  it("generates metadata from the article SEO fields without duplicating the brand suffix", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    expect(metadata.title).toBe("Cake by post guide");
    expect(metadata.description).toBe("Everything to know about cake by post.");
    expect(metadata.alternates?.canonical).toBe(
      "https://olgishcakes.co.uk/blog/how-to-order-cake-by-post"
    );
    expect(metadata.openGraph?.modifiedTime).toBe("2025-04-05T10:30:00.000Z");
  });

  it("falls back to the linked product image in metadata when the article has no dedicated cover image", async () => {
    mockGetArticleBySlug.mockResolvedValue({
      ...baseArticle,
      coverImage: undefined,
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://cdn.sanity.io/hamper.jpg",
        alt: "Postal Medovik",
      },
    ]);
    expect(metadata.twitter?.images).toEqual(["https://cdn.sanity.io/hamper.jpg"]);
  });

  it("does not use the linked product image as the visible hero when the article has no dedicated editorial image", async () => {
    mockGetArticleBySlug.mockResolvedValue({
      ...baseArticle,
      coverImage: undefined,
    });

    const view = await BlogArticlePage({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    const { container } = render(view);

    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(screen.getAllByText("How to order cake by post")).toHaveLength(1);
    expect(screen.queryByText(/reached the box before it reached the camera/i)).not.toBeInTheDocument();
  });

  it("renders the article, TOC, FAQ, related articles, and commerce CTA", async () => {
    const view = await BlogArticlePage({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    const { container } = render(view);

    const articleHeading = screen.getByRole("heading", { name: /how to order cake by post/i });
    const dek = screen.getByText("Editorial introduction for the article.");
    const byline = screen.getByText(/the sorts of things olga ends up explaining in messages/i);
    const mobileToc = screen.getByTestId("article-toc-mobile");
    const desktopToc = screen.getByTestId("article-toc-desktop");
    const backLink = screen.getByTestId("blog-back-link");

    expect(articleHeading).toBeInTheDocument();
    expect(articleHeading.className).toContain("font-oldenburg");
    expect(screen.getByText(/written by olga/i)).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/blog");
    expect(byline.className).toContain("font-body");
    expect(screen.getAllByText(/on this page/i)).toHaveLength(1);
    expect(screen.getByText(/jump to section/i)).toBeInTheDocument();
    expect(screen.getAllByText(/choose the right format/i)).toHaveLength(2);
    expect(screen.getByText(/portable text body/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /start with postal medovik/i })).toBeInTheDocument();
    expect(screen.getByText(/useful if the cake has to travel/i)).toBeInTheDocument();
    expect(screen.getByText(/travels neatly and still feels special when it arrives/i)).toBeInTheDocument();
    expect(screen.getByText(/the practical details that matter first/i)).toBeInTheDocument();
    expect(screen.getByText(/how long does it stay fresh/i)).toBeInTheDocument();
    expect(screen.getByText(/more notes if you are still weighing it up/i)).toBeInTheDocument();
    expect(screen.getByText(/birthday cakes by post/i)).toBeInTheDocument();
    expect(screen.getByText(/last updated 5 april 2025/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shop cakes by post/i })).toHaveAttribute(
      "href",
      "/cakes-by-post"
    );
    expect(screen.getAllByRole("link", { name: /request a custom cake/i })[0]).toHaveAttribute(
      "href",
      "/get-custom-quote#quote-form"
    );
    expect(screen.getByRole("link", { name: /see this postal cake/i })).toHaveAttribute(
      "href",
      "/cakes-by-post/postal-medovik"
    );
    expect(screen.getAllByRole("link", { name: /birthday cakes by post/i })).toHaveLength(1);
    expect(screen.queryByAltText("Related product image")).not.toBeInTheDocument();
    expect(dek.className).toContain("font-body");

    expect(mobileToc.className).toContain("small-laptop:hidden");
    expect(mobileToc).not.toHaveAttribute("open");
    expect(desktopToc.className).toContain("small-laptop:block");

    const article = container.querySelector("article");
    expect(
      mobileToc.compareDocumentPosition(article as HTMLElement) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    const main = container.querySelector("main");
    expect(main?.className).toContain("[font-family:var(--font-inter)]");

    const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
    expect(scripts[0]?.textContent).toContain('"dateModified":"2025-04-05T10:30:00.000Z"');
    expect(scripts[0]?.textContent).toContain('"url":"https://olgishcakes.co.uk/about"');
  });

  it("uses the sanitized archive href for the back link when a safe from param is present", async () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("from=%2Fblog%3Ftopic%3Dcake-by-post%26page%3D2")
    );

    const view = await BlogArticlePage({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    render(view);

    expect(screen.getByTestId("blog-back-link")).toHaveAttribute(
      "href",
      "/blog?topic=cake-by-post&page=2"
    );
  });

  it("falls back to /blog when the from param is unsafe", async () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams("from=https%3A%2F%2Fevil.example%2Fblog")
    );

    const view = await BlogArticlePage({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    render(view);

    expect(screen.getByTestId("blog-back-link")).toHaveAttribute("href", "/blog");
  });

  it("hides the table of contents when the article does not have enough h2 headings", async () => {
    mockGetArticleBySlug.mockResolvedValue({
      ...baseArticle,
      body: baseArticle.body.slice(0, 2),
    });

    const view = await BlogArticlePage({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    render(view);

    expect(screen.queryByText(/on this page/i)).not.toBeInTheDocument();
  });

  it("hides the visible updated label when there is no editorial updated date", async () => {
    mockGetArticleBySlug.mockResolvedValue({
      ...baseArticle,
      editorialUpdatedAt: undefined,
      modifiedAt: "2025-04-05T10:30:00.000Z",
    });

    const view = await BlogArticlePage({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    render(view);

    expect(screen.queryByText(/last updated/i)).not.toBeInTheDocument();
  });

  it("calls notFound when the article does not exist", async () => {
    mockGetArticleBySlug.mockResolvedValue(null);

    await expect(
      BlogArticlePage({
        params: Promise.resolve({ slug: "missing" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });
});
