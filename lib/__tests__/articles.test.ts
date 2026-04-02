jest.mock("next/cache", () => ({
  unstable_cache: jest.fn(fn => fn),
}));

jest.mock("next-sanity", () => ({
  defineQuery: (query: string) => query,
}));

const mockCachedSanityFetch = jest.fn();
const mockGetCacheConfig = jest.fn((type: string) => ({ tags: [type], revalidate: false }));

jest.mock("@/lib/sanity-cache", () => ({
  cachedSanityFetch: (...args: unknown[]) => mockCachedSanityFetch(...args),
  getCacheConfig: (...args: unknown[]) => mockGetCacheConfig(...args),
}));

describe("lib/articles", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete process.env.ARTICLE_PUBLISH_REVALIDATE_SECONDS;
  });

  it("fetches archive articles through the shared article query with automatic article revalidation enabled", async () => {
    mockCachedSanityFetch.mockResolvedValue([]);

    const { getArchiveArticles } = await import("../articles");
    await getArchiveArticles();

    expect(mockGetCacheConfig).toHaveBeenCalledWith("articles");
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('_type == "article"');
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('slug.current != "test"');
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('!(slug.current match "test-*")');
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain("order(publishedAt desc, _createdAt desc)");
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('"isPostableToUk": select(');
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('"united kingdom"');
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('"u.k."');
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('editorialUpdatedAt');
    expect(mockCachedSanityFetch.mock.calls[0][0]).not.toContain('"modifiedAt": _updatedAt');
    expect(mockCachedSanityFetch.mock.calls[0][0]).not.toContain("deliverySection {");
    expect(mockCachedSanityFetch.mock.calls[0][2]).toEqual({
      tags: ["articles"],
      revalidate: 300,
    });
  });

  it("fetches a paginated article archive slice and total count with automatic revalidation enabled", async () => {
    mockCachedSanityFetch.mockResolvedValueOnce([{ _id: "article-1" }]).mockResolvedValueOnce(14);

    const { getPaginatedArchiveArticles } = await import("../articles");
    const result = await getPaginatedArchiveArticles("cake-by-post", 2);

    expect(mockGetCacheConfig).toHaveBeenCalledWith("articles");
    expect(mockCachedSanityFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("$start...$end"),
      { topic: "cake-by-post", start: 12, end: 24 },
      {
        tags: ["articles"],
        revalidate: 300,
      }
    );
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain(
      "order(publishedAt desc, _createdAt desc)[$start...$end]"
    );
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('slug.current != "test"');
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('!(slug.current match "test-*")');
    expect(mockCachedSanityFetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("count(*["),
      { topic: "cake-by-post" },
      {
        tags: ["articles"],
        revalidate: 300,
      }
    );
    expect(mockCachedSanityFetch.mock.calls[1][0]).toContain('slug.current != "test"');
    expect(mockCachedSanityFetch.mock.calls[1][0]).toContain('!(slug.current match "test-*")');
    expect(result).toEqual({
      articles: [{ _id: "article-1" }],
      totalCount: 14,
      totalPages: 2,
      currentPage: 2,
      pageSize: 12,
    });
  });

  it("fetches an article by slug through the article query", async () => {
    mockCachedSanityFetch.mockResolvedValue(null);

    const { getArticleBySlug } = await import("../articles");
    await getArticleBySlug("cake-by-post-guide");

    expect(mockGetCacheConfig).toHaveBeenCalledWith("article");
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain(
      "order(dateTime(coalesce(publishedAt, _createdAt)) desc, dateTime(_updatedAt) desc, _createdAt desc)[0]"
    );
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('slug.current != "test"');
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('!(slug.current match "test-*")');
    expect(mockCachedSanityFetch.mock.calls[0][1]).toEqual({ slug: "cake-by-post-guide" });
    expect(mockCachedSanityFetch.mock.calls[0][2]).toEqual({
      tags: ["article"],
      revalidate: 300,
    });
  });

  it("allows the article publish revalidation window to be configured through the environment", async () => {
    process.env.ARTICLE_PUBLISH_REVALIDATE_SECONDS = "120";
    mockCachedSanityFetch.mockResolvedValue([]);

    const { getArticleSlugs } = await import("../articles");
    await getArticleSlugs();

    expect(mockCachedSanityFetch.mock.calls[0][2]).toEqual({
      tags: ["articles"],
      revalidate: 120,
    });
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('slug.current != "test"');
    expect(mockCachedSanityFetch.mock.calls[0][0]).toContain('!(slug.current match "test-*")');
  });

  it("keeps test article slugs out of shared article queries and revalidation lookups", async () => {
    const {
      ARTICLE_ARCHIVE_QUERY,
      ARTICLE_BY_SLUG_QUERY,
      ARTICLE_SLUGS_QUERY,
      RECENTLY_PUBLISHED_ARTICLE_SLUGS_QUERY,
    } = await import("../queries/articles");

    expect(ARTICLE_ARCHIVE_QUERY).toContain('slug.current != "test"');
    expect(ARTICLE_ARCHIVE_QUERY).toContain('!(slug.current match "test-*")');
    expect(ARTICLE_BY_SLUG_QUERY).toContain('slug.current != "test"');
    expect(ARTICLE_BY_SLUG_QUERY).toContain('!(slug.current match "test-*")');
    expect(ARTICLE_SLUGS_QUERY).toContain('slug.current != "test"');
    expect(ARTICLE_SLUGS_QUERY).toContain('!(slug.current match "test-*")');
    expect(RECENTLY_PUBLISHED_ARTICLE_SLUGS_QUERY).toContain('slug.current != "test"');
    expect(RECENTLY_PUBLISHED_ARTICLE_SLUGS_QUERY).toContain('!(slug.current match "test-*")');
  });

  it("extracts a table of contents from h2 blocks only", async () => {
    const { extractArticleTableOfContents } = await import("../articles");

    const toc = extractArticleTableOfContents([
      {
        _type: "block",
        style: "normal",
        children: [{ _type: "span", text: "Intro paragraph" }],
      },
      {
        _type: "block",
        style: "h2",
        children: [{ _type: "span", text: "First heading" }],
      },
      {
        _type: "block",
        style: "h2",
        children: [{ _type: "span", text: "First heading" }],
      },
    ]);

    expect(toc).toEqual([
      { id: "first-heading", title: "First heading" },
      { id: "first-heading-2", title: "First heading" },
    ]);
  });

  it("treats editorialUpdatedAt as a material update only when it is later and on a different day", async () => {
    const { hasMaterialArticleUpdate } = await import("../articles");

    expect(hasMaterialArticleUpdate("2025-04-01T09:00:00.000Z")).toBe(false);
    expect(
      hasMaterialArticleUpdate("2025-04-01T09:00:00.000Z", "2025-04-01T12:00:00.000Z")
    ).toBe(false);
    expect(
      hasMaterialArticleUpdate("2025-04-01T09:00:00.000Z", "2025-04-01T09:00:00.000Z")
    ).toBe(false);
    expect(
      hasMaterialArticleUpdate("2025-04-01T09:00:00.000Z", "2025-03-31T23:59:59.000Z")
    ).toBe(false);
    expect(
      hasMaterialArticleUpdate("2025-04-01T09:00:00.000Z", "2025-04-02T08:00:00.000Z")
    ).toBe(true);
  });

  it("keeps visible editorial imagery separate from metadata fallbacks", async () => {
    const {
      getArticleCardImageUrl,
      getArticleImageUrl,
      getArticleMetadataImageUrl,
      getArticleVisibleImageUrl,
    } =
      await import("../articles");

    const article = {
      cardImage: undefined,
      coverImage: undefined,
      primaryProduct: {
        _id: "hamper-1",
        _type: "giftHamper",
        name: "Postal Medovik",
        slug: "postal-medovik",
        image: {
          asset: {
            url: "https://cdn.sanity.io/hamper.jpg",
          },
        },
      },
    };

    expect(getArticleVisibleImageUrl(article)).toBeUndefined();
    expect(getArticleCardImageUrl(article)).toBeUndefined();
    expect(getArticleMetadataImageUrl(article)).toBe("https://cdn.sanity.io/hamper.jpg");
    expect(getArticleImageUrl(article)).toBe("https://cdn.sanity.io/hamper.jpg");
  });

  it("prefers card imagery for archive cards while keeping cover imagery for hero surfaces", async () => {
    const {
      getArticleCardImageUrl,
      getArticleMetadataImageUrl,
      getArticleVisibleImageUrl,
    } = await import("../articles");

    const article = {
      cardImage: {
        asset: {
          url: "https://cdn.sanity.io/card.jpg",
        },
      },
      coverImage: {
        asset: {
          url: "https://cdn.sanity.io/cover.jpg",
        },
      },
      primaryProduct: {
        _id: "hamper-1",
        _type: "giftHamper" as const,
        name: "Postal Medovik",
        slug: "postal-medovik",
        image: {
          asset: {
            url: "https://cdn.sanity.io/hamper.jpg",
          },
        },
      },
    };

    expect(getArticleCardImageUrl(article)).toBe("https://cdn.sanity.io/card.jpg");
    expect(getArticleVisibleImageUrl(article)).toBe("https://cdn.sanity.io/cover.jpg");
    expect(getArticleMetadataImageUrl(article)).toBe("https://cdn.sanity.io/cover.jpg");
  });

  it("falls back to the cover image for archive cards when no card crop exists", async () => {
    const { getArticleCardImageUrl } = await import("../articles");

    expect(
      getArticleCardImageUrl({
        coverImage: {
          asset: {
            url: "https://cdn.sanity.io/cover.jpg",
          },
        },
      })
    ).toBe("https://cdn.sanity.io/cover.jpg");
  });

  it("builds transformed Sanity CDN image URLs and responsive loaders without touching non-Sanity assets", async () => {
    const { getSanityCdnImageLoader, getSanityCdnImageUrl, isSanityCdnImageUrl } =
      await import("../articles");

    expect(isSanityCdnImageUrl("https://cdn.sanity.io/images/project/production/image.png")).toBe(
      true
    );
    expect(isSanityCdnImageUrl("https://example.com/image.png")).toBe(false);
    expect(
      getSanityCdnImageUrl("https://cdn.sanity.io/images/project/production/image.png", {
        width: 720,
        height: 540,
        fit: "crop",
        quality: 80,
      })
    ).toBe(
      "https://cdn.sanity.io/images/project/production/image.png?w=720&h=540&fit=crop&q=80&auto=format"
    );
    expect(getSanityCdnImageUrl("https://example.com/image.png", { width: 720 })).toBe(
      "https://example.com/image.png"
    );
    expect(
      getSanityCdnImageLoader({
        width: 720,
        height: 540,
        fit: "crop",
        quality: 80,
      })({
        src: "https://cdn.sanity.io/images/project/production/image.png",
        width: 1200,
      })
    ).toBe(
      "https://cdn.sanity.io/images/project/production/image.png?w=1200&h=900&fit=crop&q=80&auto=format"
    );
    expect(
      getSanityCdnImageLoader({
        width: 720,
        height: 540,
      })({
        src: "https://example.com/image.png",
        width: 1200,
      })
    ).toBe("https://example.com/image.png");
  });

  it("treats the derived isPostableToUk flag as the single source of truth for blog product posting", async () => {
    const { isArticleProductPostableToUk } = await import("../articles");

    const postableCake = {
      _id: "cake-1",
      _type: "cake" as const,
      name: "Postal loaf cake",
      slug: "postal-loaf-cake",
      isPostableToUk: true,
    };
    const nonPostalHamper = {
      _id: "hamper-1",
      _type: "giftHamper" as const,
      name: "Paris hamper",
      slug: "paris-hamper",
      isPostableToUk: false,
    };
    const unspecifiedProduct = {
      _id: "hamper-2",
      _type: "giftHamper" as const,
      name: "Courier hamper",
      slug: "courier-hamper",
    };

    expect(isArticleProductPostableToUk(postableCake)).toBe(true);
    expect(isArticleProductPostableToUk(nonPostalHamper)).toBe(false);
    expect(isArticleProductPostableToUk(unspecifiedProduct)).toBe(false);
  });

  it("turns portable text product details into readable article CTA copy", async () => {
    const { getArticleProductDescription } = await import("../articles");

    const description = getArticleProductDescription({
      _id: "hamper-1",
      _type: "giftHamper",
      name: "Postal Medovik",
      slug: "postal-medovik",
      shortDescription: [
        {
          _type: "block",
          children: [
            {
              _type: "span",
              text: "Traditional Ukrainian honey cake Pack of 2 slices Letterbox-friendly delivery across the UK Free gift note included",
            },
          ],
        },
      ],
    });

    expect(description).toBe(
      "Traditional Ukrainian honey cake. Pack of 2 slices. Letterbox-friendly delivery across the UK. Free gift note included."
    );
  });

  it("parses valid blog archive query state and rejects repeated page values", async () => {
    const { resolveBlogArchiveSearchParams } = await import("../articles");

    expect(
      resolveBlogArchiveSearchParams({
        topic: "cake-by-post",
        page: "2",
      })
    ).toEqual({
      topic: "cake-by-post",
      page: 2,
    });

    expect(
      resolveBlogArchiveSearchParams({
        page: ["2", "3"],
      })
    ).toBeNull();
  });

  it("builds canonical blog archive hrefs with topic before page and omits page=1", async () => {
    const { getBlogArchiveHref } = await import("../articles");

    expect(getBlogArchiveHref({})).toBe("/blog");
    expect(getBlogArchiveHref({ topic: "cake-by-post", page: 1 })).toBe("/blog?topic=cake-by-post");
    expect(getBlogArchiveHref({ topic: "cake-by-post", page: 2 })).toBe(
      "/blog?topic=cake-by-post&page=2"
    );
  });

  it("creates truncated pagination tokens for larger article archives", async () => {
    const { getArticlePaginationTokens, isBlogArchivePageOutOfRange } =
      await import("../articles");

    expect(getArticlePaginationTokens(5, 10)).toEqual([
      1,
      "ellipsis-leading",
      4,
      5,
      6,
      "ellipsis-trailing",
      10,
    ]);
    expect(isBlogArchivePageOutOfRange(2, 0)).toBe(true);
    expect(isBlogArchivePageOutOfRange(1, 0)).toBe(false);
  });
});
