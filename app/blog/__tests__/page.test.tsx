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
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean; fetchPriority?: string }) => (
    <img alt={alt} {...props} />
  ),
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
  getArticleHref: (slug: string) => `/blog/${slug}`,
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
      url: "https://cdn.sanity.io/latest.jpg",
    },
    alt: "Latest",
  },
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
    image: {
      asset: {
        url: "https://cdn.sanity.io/custom-cake.jpg",
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
    image: {
      asset: {
        url: "https://cdn.sanity.io/custom-cake.jpg",
      },
      alt: "Custom cake travel image",
    },
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
      articles: [latestArticle, olderArticle, secondaryArticle],
      totalCount: 14,
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
    const archiveIntro = screen.getByText(/these articles answer the questions olga gets most often/i);
    const summary = screen.getByText("Custom cake summary");
    const secondaryCard = screen.getByRole("link", { name: /custom cake planning/i });

    expect(archiveHeading).toBeInTheDocument();
    expect(archiveHeading.className).toContain("font-oldenburg");
    expect(archiveHeading.className).not.toContain("font-body");
    expect(archiveIntro.className).toContain("font-body");
    const leadHeading = screen.getByRole("heading", { name: /^latest article$/i });

    expect(leadHeading).toBeInTheDocument();
    expect(archiveHeading.className).toContain("text-[38px]");
    expect(leadHeading.className).toContain("text-[1.95rem]");
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
    expect(supportingSection?.className).toContain("pt-8");
    expect(screen.queryByText(/what you will get here/i)).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /custom cake planning/i })).toHaveLength(1);
    expect(secondaryCard).toHaveAttribute(
      "href",
      "/blog/custom-cake-planning?from=%2Fblog"
    );
    expect(within(secondaryCard).queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/active topic: all/i)).toBeInTheDocument();
    expect(screen.getByText("Browse by topic")).toBeInTheDocument();
    expect(screen.getByText("All articles")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "2" })).toHaveAttribute("href", "/blog?page=2");
    expect(screen.queryByText(/start here/i)).not.toBeInTheDocument();
    expect(screen.getByText(/shop postal medovik/i)).toBeInTheDocument();
    expect(screen.getByText(/postal medovik is a good fit/i)).toBeInTheDocument();
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
    expect(leadImage).toHaveAttribute("loading", "eager");
    expect(leadImage.getAttribute("fetchpriority")).toBe("high");

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
    expect(screen.getByText("Browse by topic")).toBeInTheDocument();
    expect(screen.getByText(/page 2 of 2/i)).toBeInTheDocument();
    expect(screen.getByText("Archive pages")).toBeInTheDocument();
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
    expect(paginatedArchiveSection?.className).toContain("pt-8");
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
    expect(screen.getAllByRole("link", { name: /request a custom cake/i })[0]).toHaveAttribute(
      "href",
      "/get-custom-quote#quote-form"
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
});
