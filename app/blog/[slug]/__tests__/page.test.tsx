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
    unoptimized,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; fetchPriority?: string; unoptimized?: boolean }) => (
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
  getArticleCardImageUrl: (article: {
    coverImage?: { asset?: { url?: string } };
    cardImage?: { asset?: { url?: string } };
  }) => {
    return article.cardImage?.asset?.url || article.coverImage?.asset?.url;
  },
  getArticleHref: (slug: string) => `/blog/${slug}`,
  getSanityCdnImageUrl: (imageUrl?: string) => imageUrl,
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
  hasMaterialArticleUpdate: (publishedAt: string, modifiedAt?: string | null) => {
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
  },
  isArticleProductPostableToUk: (product?: { isPostableToUk?: boolean }) => product?.isPostableToUk === true,
  isSanityCdnImageUrl: (imageUrl?: string) => Boolean(imageUrl?.startsWith("https://cdn.sanity.io/images/")),
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
  editorialUpdatedAt: "2025-04-05T09:00:00.000Z",
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
    isPostableToUk: true,
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
    cardImage: {
      asset: {
        url: "https://cdn.sanity.io/related-card.jpg",
      },
      alt: "Related card crop",
    },
    coverImage: {
      asset: {
        url: "https://cdn.sanity.io/related-cover.jpg",
      },
      alt: "Related cover crop",
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
    window.sessionStorage.clear();
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
    expect(metadata.openGraph?.modifiedTime).toBe("2025-04-05T09:00:00.000Z");
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

    expect(screen.queryByAltText("Cover image")).not.toBeInTheDocument();
    expect(screen.getByAltText("Related card crop")).toHaveAttribute(
      "src",
      "https://cdn.sanity.io/related-card.jpg"
    );
    expect(container.querySelectorAll("img")).toHaveLength(2);
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
    expect(articleHeading.className).toContain("text-[2.15rem]");
    expect(articleHeading.className).toContain("tablet:text-[3.6rem]");
    expect(screen.getByText(/written by olga/i)).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/blog");
    expect(byline.className).toContain("font-body");
    expect(screen.getByText(/from olga's archive/i)).toBeInTheDocument();
    expect(screen.getAllByText(/on this page/i)).toHaveLength(1);
    expect(screen.getByText(/jump to section/i)).toBeInTheDocument();
    expect(screen.getAllByText(/choose the right format/i)).toHaveLength(2);
    expect(screen.getByText(/portable text body/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /start with postal medovik/i })).toBeInTheDocument();
    expect(screen.getByText(/useful if the cake has to travel/i)).toBeInTheDocument();
    expect(
      screen.getByText(/postal medovik is prepared as a vacuum-packed parcel for uk post when you want slices, biscuits, or standard-design honey cake that can travel neatly/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/the practical details that matter first/i)).toBeInTheDocument();
    expect(screen.getByText(/how long does it stay fresh/i)).toBeInTheDocument();
    expect(screen.getByText(/more notes if you are still weighing it up/i)).toBeInTheDocument();
    expect(
      screen.getByText(/browse the custom cakes range for the celebration options that are better suited/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/birthday cakes by post/i)).toBeInTheDocument();
    expect(screen.getByText(/last updated 5 april 2025/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shop cakes by post/i })).toHaveAttribute(
      "href",
      "/cakes-by-post"
    );
    expect(screen.getAllByRole("link", { name: /see custom cakes/i })[0]).toHaveAttribute(
      "href",
      "/cakes"
    );
    expect(screen.getByRole("link", { name: /see this cake by post/i })).toHaveAttribute(
      "href",
      "/cakes-by-post/postal-medovik"
    );
    expect(screen.getAllByRole("link", { name: /birthday cakes by post/i })).toHaveLength(1);
    expect(screen.getByAltText("Cover image")).toHaveAttribute(
      "src",
      "https://cdn.sanity.io/article-cover.jpg"
    );
    expect(screen.getByAltText("Related card crop")).toHaveAttribute(
      "src",
      "https://cdn.sanity.io/related-card.jpg"
    );
    expect(screen.queryByAltText("Related product image")).not.toBeInTheDocument();
    expect(screen.queryByAltText("Related cover crop")).not.toBeInTheDocument();
    expect(dek.className).toContain("font-body");
    expect(dek.className).toContain("text-[17px]");
    expect(dek.className).toContain("tablet:text-[23px]");

    expect(mobileToc.className).toContain("small-laptop:hidden");
    expect(mobileToc.className).toContain("rounded-[20px]");
    expect(mobileToc.className).toContain("shadow-[0_6px_16px_rgba(97,39,0,0.04)]");
    expect(mobileToc.className).not.toContain("border-primary-200");
    expect(mobileToc).not.toHaveAttribute("open");
    expect(desktopToc.className).toContain("small-laptop:block");

    const article = container.querySelector("article");
    expect(
      mobileToc.compareDocumentPosition(article as HTMLElement) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();

    const heroSection = articleHeading.closest("section");
    expect(heroSection?.className).toContain("overflow-visible");
    expect(heroSection?.className).toContain("space-y-4");
    expect(heroSection?.className).toContain("tablet:space-y-5");

    const articleShell = screen.getByText(/portable text body/i).closest("article");
    expect(articleShell?.className).not.toContain("border-primary-200/80");
    expect(articleShell?.className).toContain("shadow-[0_14px_30px_rgba(97,39,0,0.05)]");

    const relatedLink = screen.getByRole("link", { name: /birthday cakes by post/i });
    expect(relatedLink.className).toContain("hover:bg-primary-50/25");

    const relatedSection = screen
      .getByRole("heading", { name: /more notes if you are still weighing it up/i })
      .closest("section");
    expect(relatedSection?.className).toContain("border-t");
    expect(relatedSection?.className).toContain("space-y-4");
    expect(relatedSection?.className).toContain("pt-5");

    const commerceSection = screen
      .getByRole("heading", { name: /start with postal medovik/i })
      .closest("section");
    expect(commerceSection?.className).toContain("bg-base-100");
    expect(commerceSection?.className).toContain("tablet:grid-cols-[200px_minmax(0,1.45fr)]");
    expect(commerceSection?.className).not.toContain("border-primary-200/80");
    expect(commerceSection?.className).not.toContain(
      "bg-[linear-gradient(135deg,var(--color-base-100),var(--color-primary-50),var(--color-secondary)/0.18)]"
    );
    expect(
      screen.getByRole("link", { name: /see this cake by post/i }).className
    ).toContain("w-full");
    expect(
      screen.getAllByRole("link", { name: /see custom cakes/i })[0].className
    ).toContain("w-full");

    const faqSection = screen
      .getByRole("heading", { name: /the practical details that matter first/i })
      .closest("section");
    expect(faqSection?.className).toContain("bg-base-100");
    expect(faqSection?.className).not.toContain("border-base-300");
    expect(
      screen.getByText(/up to seven days when stored correctly/i).className
    ).toContain("leading-7");

    const faqAnswer = screen.getByText(/up to seven days when stored correctly/i);
    const faqItem = faqAnswer.closest("details");
    expect(faqItem?.className).toContain("not-first:border-t");
    expect(faqItem?.className).not.toContain("rounded-[20px] border border-base-300");

    const closingSection = screen
      .getByRole("heading", { name: /choose the format that suits the journey/i })
      .closest("section");
    expect(closingSection?.className).toContain("rounded-[28px]");
    expect(closingSection?.className).toContain("tablet:rounded-[36px]");
    expect(closingSection?.className).toContain("bg-[linear-gradient(135deg,var(--color-base-100),var(--color-primary-50),var(--color-secondary)/0.12)]");
    expect(closingSection?.className).toContain("tablet:bg-[linear-gradient(135deg,var(--color-base-100),var(--color-primary-50),var(--color-secondary)/0.18)]");
    expect(
      screen.getByRole("link", { name: /shop cakes by post/i }).className
    ).toContain("w-full");
    expect(
      screen.getAllByRole("link", { name: /see custom cakes/i })[1].className
    ).toContain("w-full");

    const main = container.querySelector("main");
    expect(main?.className).toContain("[font-family:var(--font-inter)]");

    const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
    expect(scripts[0]?.textContent).toContain('"dateModified":"2025-04-05T09:00:00.000Z"');
    expect(scripts[0]?.textContent).toContain('"url":"https://olgishcakes.co.uk/about"');
  });

  it("switches the article commerce cta label for custom cake products", async () => {
    mockGetArticleBySlug.mockResolvedValue({
      ...baseArticle,
      primaryProduct: {
        _id: "cake-1",
        _type: "cake",
        name: "Tall custom cake",
        slug: "tall-custom-cake",
        isPostableToUk: false,
        image: {
          asset: {
            url: "https://cdn.sanity.io/custom-cake.jpg",
          },
          alt: "Tall custom cake",
        },
      },
    });

    const view = await BlogArticlePage({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    render(view);

    expect(screen.getByText(/better for local delivery or collection/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /tall custom cake is the kind of cake olga suggests when the order needs a proper celebration finish, local delivery, or collection rather than parcel-post packing/i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /see this custom cake/i })).toHaveAttribute(
      "href",
      "/cakes/tall-custom-cake"
    );
    expect(screen.queryByRole("link", { name: /see this cake by post/i })).not.toBeInTheDocument();
  });

  it("treats a cake as by-post on the article page when policy allows GB mail delivery", async () => {
    mockGetArticleBySlug.mockResolvedValue({
      ...baseArticle,
      primaryProduct: {
        _id: "cake-2",
        _type: "cake",
        name: "Postal loaf cake",
        slug: "postal-loaf-cake",
        isPostableToUk: true,
        image: {
          asset: {
            url: "https://cdn.sanity.io/postal-loaf-cake.jpg",
          },
          alt: "Postal loaf cake",
        },
      },
    });

    const view = await BlogArticlePage({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    render(view);

    expect(screen.getByText(/useful if the cake has to travel/i)).toBeInTheDocument();
    expect(
      screen.getByText(/postal loaf cake is prepared as a vacuum-packed parcel for uk post when you want slices, biscuits, or standard-design honey cake that can travel neatly/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /see this cake by post/i })).toHaveAttribute(
      "href",
      "/cakes/postal-loaf-cake"
    );
    expect(screen.queryByRole("link", { name: /see this custom cake/i })).not.toBeInTheDocument();
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

  it("keeps update labels absent when the article payload carries no update date", async () => {
    mockGetArticleBySlug.mockResolvedValue({
      ...baseArticle,
      editorialUpdatedAt: undefined,
    });

    const view = await BlogArticlePage({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    render(view);

    expect(screen.queryByText(/last updated/i)).not.toBeInTheDocument();
  });

  it("omits freshness signals when the update is on the same day as publication", async () => {
    mockGetArticleBySlug.mockResolvedValue({
      ...baseArticle,
      editorialUpdatedAt: "2025-04-01T12:00:00.000Z",
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    expect(metadata.openGraph?.modifiedTime).toBeUndefined();

    const view = await BlogArticlePage({
      params: Promise.resolve({ slug: "how-to-order-cake-by-post" }),
    });

    const { container } = render(view);

    expect(screen.queryByText(/last updated/i)).not.toBeInTheDocument();

    const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
    expect(scripts[0]?.textContent).not.toContain('"dateModified"');
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
