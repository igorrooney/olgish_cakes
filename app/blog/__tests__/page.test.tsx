/**
 * @jest-environment jsdom
 */

import type { ImgHTMLAttributes } from "react";
import { render, screen, within } from "@testing-library/react";
import BlogPage, { generateMetadata } from "../page";
import { notFound } from "next/navigation";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  cache: (fn: unknown) => fn,
}));

jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    alt = "",
    fill,
    loader,
    src,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    fetchPriority?: string;
    loader?: ({ src, width, quality }: { src: string; width: number; quality?: number }) => string;
  }) => {
    const resolvedSrc =
      typeof src === "string" && typeof loader === "function"
        ? loader({ src, width: 1200 })
        : src;

    return <img alt={alt} src={resolvedSrc} {...props} />
  },
}));

jest.mock("../ArticleTopicFilter", () => ({
  ArticleTopicFilter: ({ activeTopic }: { activeTopic?: string }) => (
    <div>{activeTopic ? `Active topic: ${activeTopic}` : "Active topic: all"}</div>
  ),
}));

const mockGetArticleTopics = jest.fn();
const mockGetPaginatedArchiveArticles = jest.fn();

jest.mock("@/lib/articles", () => ({
  BLOG_ARCHIVE_PAGE_SIZE: 12,
  formatArticleDate: () => "1 April 2025",
  getArticleCardImageUrl: (article: {
    coverImage?: { asset?: { url?: string } };
    cardImage?: { asset?: { url?: string } };
  }) => {
    return article.cardImage?.asset?.url || article.coverImage?.asset?.url;
  },
  getArticleHref: (slug: string) => `/blog/${slug}`,
  getSanityCdnImageLoader:
    ({ width, height, fit, quality }: { width?: number; height?: number; fit?: string; quality?: number }) =>
    ({ src, width: requestedWidth }: { src: string; width: number }) => {
      const transformedUrl = new URL(src);

      transformedUrl.searchParams.set("w", String(requestedWidth));

      if (typeof width === "number" && typeof height === "number") {
        transformedUrl.searchParams.set("h", String(Math.round((requestedWidth / width) * height)));
      }

      if (fit) {
        transformedUrl.searchParams.set("fit", fit);
      }

      if (typeof quality === "number") {
        transformedUrl.searchParams.set("q", String(quality));
      }

      transformedUrl.searchParams.set("auto", "format");

      return transformedUrl.toString();
    },
  getArticleVisibleImageUrl: (article: {
    coverImage?: { asset?: { url?: string } };
    cardImage?: { asset?: { url?: string } };
  }) => {
    return article.coverImage?.asset?.url || article.cardImage?.asset?.url;
  },
  getArticlePaginationTokens: (currentPage: number, totalPages: number) =>
    Array.from({ length: totalPages }, (_, index) => index + 1).filter(
      page => Math.abs(page - currentPage) <= totalPages
    ),
  getArticleTopicTitle: (article: { topic?: { title?: string } }) =>
    article.topic?.title || "Articles",
  getArticleTopics: (...args: unknown[]) => mockGetArticleTopics(...args),
  getBlogArchiveHref: ({ topic, page = 1 }: { topic?: string; page?: number }) => {
    const searchParams = new URLSearchParams();

    if (topic) {
      searchParams.set("topic", topic);
    }

    if (page > 1) {
      searchParams.set("page", String(page));
    }

    const queryString = searchParams.toString();

    return queryString.length > 0 ? `/blog?${queryString}` : "/blog";
  },
  getPaginatedArchiveArticles: (...args: unknown[]) => mockGetPaginatedArchiveArticles(...args),
  isArticleProductPostableToUk: (product?: { isPostableToUk?: boolean }) => product?.isPostableToUk === true,
  getProductHref: (product: { _type: string; slug: string }) =>
    product._type === "giftHamper" ? `/cakes-by-post/${product.slug}` : `/cakes/${product.slug}`,
  isBlogArchivePageOutOfRange: (page: number, totalPages: number) => {
    if (totalPages === 0) {
      return page !== 1;
    }

    return page > totalPages;
  },
  resolveBlogArchiveSearchParams: (searchParams: Record<string, string | string[] | undefined>) => {
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
      return { topic, page: 1 };
    }

    if (!/^[1-9]\d*$/.test(rawPage.trim())) {
      return null;
    }

    return {
      topic,
      page: Number(rawPage),
    };
  },
  toJsonLdScript: (value: unknown) => JSON.stringify(value),
}));

const topics = [
  {
    _id: "topic-1",
    title: "Cake by post",
    slug: "cake-by-post",
    description: "Advice for choosing and sending cakes by post.",
  },
  {
    _id: "topic-2",
    title: "Custom cakes",
    slug: "custom-cakes",
    description: "Custom cake ordering guidance.",
  },
  {
    _id: "topic-3",
    title: "Seasonal",
    slug: "seasonal",
    description: "Seasonal cake ideas.",
  },
];

const latestArticle = {
  _id: "article-1",
  title: "Latest article",
  slug: "latest-article",
  summary: "Latest summary",
  dek: "Latest dek",
  publishedAt: "2025-04-02T09:00:00.000Z",
  topic: topics[0],
  coverImage: {
    asset: {
      url: "https://cdn.sanity.io/images/project/production/latest.jpg",
    },
    alt: "Latest",
  },
  primaryProduct: {
    _id: "hamper-1",
    _type: "giftHamper",
    name: "Postal Medovik",
    slug: "postal-medovik",
    isPostableToUk: true,
    image: {
      asset: {
        url: "https://cdn.sanity.io/images/project/production/hamper.jpg",
      },
      alt: "Postal Medovik",
    },
  },
};

const olderArticle = {
  _id: "article-2",
  title: "Older article",
  slug: "older-article",
  summary: "Older summary",
  dek: "Older dek",
  publishedAt: "2025-04-01T09:00:00.000Z",
  topic: topics[1],
  primaryProduct: {
    _id: "cake-1",
    _type: "cake",
    name: "Tall custom cake",
    slug: "tall-custom-cake",
    isPostableToUk: false,
    image: {
      asset: {
        url: "https://cdn.sanity.io/images/project/production/custom-cake.jpg",
      },
      alt: "Custom cake travel image",
    },
  },
};

const secondaryArticle = {
  _id: "article-3",
  title: "Custom cake planning",
  slug: "custom-cake-planning",
  summary: "Custom cake summary",
  dek: "Custom dek",
  publishedAt: "2025-03-10T09:00:00.000Z",
  topic: topics[1],
  primaryProduct: {
    _id: "cake-1",
    _type: "cake",
    name: "Tall custom cake",
    slug: "tall-custom-cake",
    isPostableToUk: false,
    image: {
      asset: {
        url: "https://cdn.sanity.io/images/project/production/custom-cake.jpg",
      },
      alt: "Custom cake travel image",
    },
  },
};

const imageSupportingArticle = {
  _id: "article-4",
  title: "Postal cake packing tips",
  slug: "postal-cake-packing-tips",
  summary: "Packing summary",
  dek: "Packing dek",
  publishedAt: "2025-03-05T09:00:00.000Z",
  topic: topics[0],
  cardImage: {
    asset: {
      url: "https://cdn.sanity.io/images/project/production/packing-card.jpg",
    },
    alt: "Packed cake slices card crop",
  },
  coverImage: {
    asset: {
      url: "https://cdn.sanity.io/images/project/production/packing-cover.jpg",
    },
    alt: "Packed cake slices cover crop",
  },
};

const pageTwoArticle = {
  _id: "article-13",
  title: "Page two article",
  slug: "page-two-article",
  summary: "Page two summary",
  dek: "Page two dek",
  publishedAt: "2025-02-10T09:00:00.000Z",
  topic: topics[0],
};

describe("BlogPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetArticleTopics.mockResolvedValue(topics);
  });

  it("renders the newest article as the lead story and keeps older posts in the archive grid", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [latestArticle, olderArticle, secondaryArticle, imageSupportingArticle],
      totalCount: 15,
      totalPages: 2,
      currentPage: 1,
      pageSize: 12,
    });

    const view = await BlogPage({
      searchParams: Promise.resolve({}),
    });

    const { container } = render(view);

    const archiveHeading = screen.getByRole("heading", {
      name: /cake by post advice, delivery help, and gift ideas/i,
    });
    const summary = screen.getByText("Custom cake summary");
    const secondaryCard = screen.getByRole("link", { name: /custom cake planning/i });

    expect(archiveHeading).toBeInTheDocument();
    expect(archiveHeading.className).toContain("font-moreSugar");
    expect(archiveHeading.className).not.toContain("font-body");
    expect(archiveHeading.className).toContain("rotate-0");
    expect(archiveHeading.className).toContain("tablet:rotate-[-2.4deg]");
    expect(archiveHeading.className).not.toContain("max-w-[11ch]");
    expect(screen.queryByText("Olga's notes")).not.toBeInTheDocument();
    expect(
      screen.getByText(/these articles answer the questions olga gets most often/i)
    ).toBeInTheDocument();
    const leadHeading = screen.getByRole("heading", { name: /^latest article$/i });

    expect(leadHeading).toBeInTheDocument();
    expect(archiveHeading.className).not.toContain("text-[38px]");
    expect(leadHeading.className).toContain("text-[1.9rem]");
    expect(leadHeading.className).toContain("tablet:text-[2.8rem]");
    expect(screen.getByText(/more from olga/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /latest articles/i,
      })
    ).toBeInTheDocument();
    const supportingSection = screen
      .getByRole("heading", {
        name: /latest articles/i,
      })
      .closest("section");

    expect(supportingSection).not.toBeNull();
    expect(supportingSection?.className).toContain("border-t");
    expect(supportingSection?.className).toContain("border-base-300");
    expect(supportingSection?.className).toContain("pt-6");
    expect(screen.queryByText(/what you will get here/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /custom cake planning/i })).toHaveLength(1);
    expect(secondaryCard).toHaveAttribute(
      "href",
      "/blog/custom-cake-planning?from=%2Fblog"
    );
    expect(within(secondaryCard).queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/active topic: all/i)).toBeInTheDocument();
    expect(screen.queryByText("Browse by topic")).not.toBeInTheDocument();
    expect(screen.queryByText("All topics")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("href", "/blog?page=2");
    expect(screen.queryByText(/start here/i)).not.toBeInTheDocument();
    expect(screen.getByText(/shop postal medovik/i)).toBeInTheDocument();
    expect(
      screen.getByText(/postal medovik is prepared as a vacuum-packed parcel for uk post when you need slices, biscuits, or standard-design honey cake that can travel neatly/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /see this cake by post/i })).toHaveAttribute(
      "href",
      "/cakes-by-post/postal-medovik"
    );
    expect(screen.queryByText(/bakery notes from leeds/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/olgish journal/i)).not.toBeInTheDocument();
    expect(screen.queryByAltText("Custom cake travel image")).not.toBeInTheDocument();
    expect(screen.queryByText(/read article/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/featured story/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/latest story/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /older article/i })).toHaveAttribute(
      "href",
      "/blog/older-article?from=%2Fblog"
    );
    expect(summary.className).toContain("font-body");

    const leadImage = screen.getByAltText("Latest");
    const supportingImage = screen.getByAltText("Packed cake slices card crop");
    const commerceImage = screen.getByAltText("Postal Medovik");
    expect(leadImage).toHaveAttribute("loading", "lazy");
    expect(leadImage).not.toHaveAttribute("fetchpriority");
    expect(leadImage).toHaveAttribute("sizes", "(min-width: 1280px) 600px, (min-width: 1024px) 48vw, calc(100vw - 4rem)");
    expect(leadImage.getAttribute("src")).toContain("w=1200");
    expect(leadImage.getAttribute("src")).toContain("h=900");
    expect(leadImage.getAttribute("src")).toContain("fit=crop");
    expect(leadImage.getAttribute("src")).toContain("auto=format");
    expect(supportingImage).toHaveAttribute(
      "sizes",
      "(min-width: 1280px) 360px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, calc(100vw - 3rem)"
    );
    expect(supportingImage.getAttribute("src")).toContain("packing-card.jpg");
    expect(supportingImage.getAttribute("src")).not.toContain("packing-cover.jpg");
    expect(supportingImage.getAttribute("src")).toContain("w=720");
    expect(supportingImage.getAttribute("src")).toContain("h=540");
    expect(commerceImage).toHaveAttribute(
      "sizes",
      "(min-width: 1280px) 360px, (min-width: 1024px) 34vw, calc(100vw - 3rem)"
    );
    expect(commerceImage.getAttribute("src")).toContain("h=900");

    const commerceSection = screen.getByText(/shop postal medovik/i).closest("section");
    expect(commerceSection).not.toBeNull();
    expect(commerceSection?.className).toContain("grid");
    expect(commerceSection?.className).toContain(
      "small-laptop:grid-cols-[minmax(280px,360px)_minmax(0,1fr)]"
    );

    const main = container.querySelector("main");
    expect(main?.className).toContain("[font-family:var(--font-inter)]");
  });

  it("renders page 2 as a grid-only archive and offsets item list positions", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [pageTwoArticle],
      totalCount: 13,
      totalPages: 2,
      currentPage: 2,
      pageSize: 12,
    });

    const view = await BlogPage({
      searchParams: Promise.resolve({ topic: "cake-by-post", page: "2" }),
    });

    const { container } = render(view);

    expect(screen.queryByText(/featured story/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/no notes in this topic yet/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/there are no published notes in this topic yet/i)
    ).not.toBeInTheDocument();
    expect(screen.getByText(/active topic: cake-by-post/i)).toBeInTheDocument();
    expect(screen.queryByText("Browse by topic")).not.toBeInTheDocument();
    expect(screen.getByText("Archive pages")).toBeInTheDocument();
    expect(screen.queryByText("Cake by post notes")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Page 2",
      })
    ).toBeInTheDocument();
    const paginatedArchiveSection = screen
      .getByRole("heading", {
        name: "Page 2",
      })
      .closest("section");

    expect(paginatedArchiveSection).not.toBeNull();
    expect(paginatedArchiveSection?.className).toContain("border-t");
    expect(paginatedArchiveSection?.className).toContain("border-base-300");
    expect(paginatedArchiveSection?.className).toContain("pt-6");
    expect(screen.getByRole("link", { name: /page two article/i })).toHaveAttribute(
      "href",
      "/blog/page-two-article?from=%2Fblog%3Ftopic%3Dcake-by-post%26page%3D2"
    );
    expect(
      within(screen.getByRole("link", { name: /page two article/i })).queryByRole("img")
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /previous/i })).toHaveAttribute(
      "href",
      "/blog?topic=cake-by-post"
    );
    expect(screen.getByRole("link", { name: /previous/i }).className).toContain("min-h-11");

    const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
    expect(scripts[0]?.textContent).toContain('"position":13');
  });

  it("keeps custom-cakes archive commerce copy aligned with the custom cakes hub", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [olderArticle, secondaryArticle],
      totalCount: 2,
      totalPages: 1,
      currentPage: 1,
      pageSize: 12,
    });

    const view = await BlogPage({
      searchParams: Promise.resolve({ topic: "custom-cakes" }),
    });

    render(view);

    expect(screen.getByText(/active topic: custom-cakes/i)).toBeInTheDocument();
    expect(screen.getByText(/browse the custom cakes first/i)).toBeInTheDocument();
    expect(
      screen.getByText(/start with the custom cakes range\. that is the easiest way to compare celebration styles/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /browse custom cakes/i })).toHaveAttribute(
      "href",
      "/cakes"
    );
    expect(screen.getByRole("link", { name: /shop cakes by post/i })).toHaveAttribute(
      "href",
      "/cakes-by-post"
    );
    expect(screen.queryByText(/shop the options that travel best/i)).not.toBeInTheDocument();
    expect(screen.queryByAltText("Custom cake travel image")).not.toBeInTheDocument();
  });

  it("uses by-post archive commerce copy for a cake when the delivery policy allows GB mail delivery", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [
        {
          ...olderArticle,
          primaryProduct: {
            ...olderArticle.primaryProduct,
            name: "Postal loaf cake",
            slug: "postal-loaf-cake",
            isPostableToUk: true,
          },
        },
      ],
      totalCount: 1,
      totalPages: 1,
      currentPage: 1,
      pageSize: 12,
    });

    const view = await BlogPage({
      searchParams: Promise.resolve({ topic: "cake-by-post" }),
    });

    render(view);

    expect(screen.getByText(/shop postal loaf cake/i)).toBeInTheDocument();
    expect(
      screen.getByText(/postal loaf cake is prepared as a vacuum-packed parcel for uk post when you need slices, biscuits, or standard-design honey cake that can travel neatly/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /see this cake by post/i })).toHaveAttribute(
      "href",
      "/cakes/postal-loaf-cake"
    );
    expect(screen.getByAltText("Custom cake travel image")).toBeInTheDocument();
  });

  it("generates search-descriptive metadata for the main archive page", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [latestArticle],
      totalCount: 1,
      totalPages: 1,
      currentPage: 1,
      pageSize: 12,
    });

    const metadata = await generateMetadata({
      searchParams: Promise.resolve({}),
    });

    expect(metadata.title).toBe("Cake by post advice, delivery help, and gift ideas");
    expect(metadata.description).toBe(
      "Notes from Olga on sending cake across the UK, choosing cakes that post well, and knowing when a custom order makes more sense."
    );
    expect(metadata.alternates?.canonical).toBe("https://olgishcakes.co.uk/blog");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
        alt: "Olgish Cakes bakery notes and articles",
      },
    ]);
    expect(metadata.twitter?.images).toEqual([
      "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
    ]);
  });

  it("renders the empty state when a valid topic has no published articles", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 12,
    });

    const view = await BlogPage({
      searchParams: Promise.resolve({ topic: "seasonal" }),
    });

    render(view);

    expect(screen.getByText(/no notes in this topic yet/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no published notes in this topic yet/i)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /shop cakes by post/i })[0]).toHaveAttribute(
      "href",
      "/cakes-by-post"
    );
    expect(screen.getAllByRole("link", { name: /see custom cakes/i })[0]).toHaveAttribute(
      "href",
      "/cakes"
    );
  });

  it("calls notFound when the search params contain repeated page values", async () => {
    await expect(
      BlogPage({
        searchParams: Promise.resolve({ page: ["2", "3"] }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });

  it("calls notFound when the topic does not exist", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: 1,
      pageSize: 12,
    });

    await expect(
      BlogPage({
        searchParams: Promise.resolve({ topic: "missing-topic" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });

  it("calls notFound when the requested page is out of range", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [],
      totalCount: 14,
      totalPages: 2,
      currentPage: 3,
      pageSize: 12,
    });

    await expect(
      BlogPage({
        searchParams: Promise.resolve({ page: "3" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });

  it("generates self-canonical metadata for filtered paginated archive URLs", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [pageTwoArticle],
      totalCount: 13,
      totalPages: 2,
      currentPage: 2,
      pageSize: 12,
    });

    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ page: "2", topic: "cake-by-post" }),
    });

    expect(metadata.title).toBe("Cake by post advice | Page 2");
    expect(metadata.description).toBe(
      "Advice for choosing and sending cakes by post. Notes from Olga on delivery, gifting, and choosing the right format in the UK. Page 2."
    );
    expect(metadata.alternates?.canonical).toBe(
      "https://olgishcakes.co.uk/blog?topic=cake-by-post&page=2"
    );
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
        alt: "Olgish Cakes bakery notes and articles",
      },
    ]);
    expect(metadata.twitter?.images).toEqual([
      "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
    ]);
  });

  it("omits page=1 from canonical metadata URLs", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [latestArticle],
      totalCount: 1,
      totalPages: 1,
      currentPage: 1,
      pageSize: 12,
    });

    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ topic: "cake-by-post", page: "1" }),
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://olgishcakes.co.uk/blog?topic=cake-by-post"
    );
  });

  it("falls back to generic cakes-by-post copy when the archive only surfaces cake products", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [olderArticle, secondaryArticle],
      totalCount: 2,
      totalPages: 1,
      currentPage: 1,
      pageSize: 12,
    });

    const view = await BlogPage({
      searchParams: Promise.resolve({}),
    });

    render(view);

    expect(screen.getByText(/shop the options that travel best/i)).toBeInTheDocument();
    expect(
      screen.getByText(/the cakes by post range for honey cake slices, caramel biscuits, or standard-design honey cake vacuum-packed for parcel post/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shop cakes by post/i })).toHaveAttribute(
      "href",
      "/cakes-by-post"
    );
    expect(screen.queryByAltText("Custom cake travel image")).not.toBeInTheDocument();
  });

  it("does not treat gift-hamper products as postal when delivery metadata is not GB mail", async () => {
    mockGetPaginatedArchiveArticles.mockResolvedValue({
      articles: [
        {
          ...latestArticle,
          primaryProduct: {
            ...latestArticle.primaryProduct,
            isPostableToUk: false,
          },
        },
      ],
      totalCount: 1,
      totalPages: 1,
      currentPage: 1,
      pageSize: 12,
    });

    const view = await BlogPage({
      searchParams: Promise.resolve({ topic: "cake-by-post" }),
    });

    render(view);

    expect(screen.getByText(/shop the options that travel best/i)).toBeInTheDocument();
    expect(
      screen.getByText(/the cakes by post range for honey cake slices, caramel biscuits, or standard-design honey cake vacuum-packed for parcel post/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /shop cakes by post/i })).toHaveAttribute("href", "/cakes-by-post");
    expect(screen.queryByRole("link", { name: /see this cake by post/i })).not.toBeInTheDocument();
  });
});
