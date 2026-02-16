import { cachedSanityFetch, getCacheConfig } from "@/lib/sanity-cache";
import { MetadataRoute } from "next";

interface SitemapCake {
  slug: { current: string }
  _updatedAt: string
}

interface SitemapGiftHamper {
  _id: string
  slug?: { current: string }
  _updatedAt: string
}

async function getProducts() {
  const config = getCacheConfig('sitemaps')
  const [cakes, giftHampers] = await Promise.all([
    cachedSanityFetch<SitemapCake[]>(`*[_type == "cake"] {
      _id,
      name,
      slug,
      _updatedAt,
      pricing,
      mainImage,
      designs,
      category,
      shortDescription,
      description,
      seo {
        priority,
        changefreq
      }
    }`, {}, config),
    cachedSanityFetch<SitemapGiftHamper[]>(`*[_type == "giftHamper"] {
      _id,
      name,
      slug,
      _updatedAt,
      price,
      images,
      category,
      shortDescription,
      description,
      seo {
        priority,
        changefreq
      }
    }`, {}, config)
  ]);

  return { cakes, giftHampers };
}

export default async function sitemapProducts(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://olgishcakes.co.uk";
  const { cakes, giftHampers } = await getProducts();

  // Cake product pages with high priority for Google Merchant Center
  const cakeRoutes = cakes.map((cake) => ({
    url: `${baseUrl}/cakes/${cake.slug.current}`,
    lastModified: new Date(cake._updatedAt),
    changeFrequency: "daily" as const, // High frequency for product pages
    priority: 0.95, // Very high priority for products
  }));

  // Gift hamper product pages with high priority
  const giftHamperRoutes = giftHampers.map((hamper) => ({
    url: `${baseUrl}/cakes-by-post/${hamper.slug?.current || hamper._id}`,
    lastModified: new Date(hamper._updatedAt),
    changeFrequency: "daily" as const, // High frequency for product pages
    priority: 0.95, // Very high priority for products
  }));

  // Product category pages
  const categoryPages = [
    {
      url: `${baseUrl}/cakes`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cakes-by-post`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/order`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.95,
    },
  ];

  // Combine all product-related pages
  const allProductPages = [...categoryPages, ...cakeRoutes, ...giftHamperRoutes];

  return allProductPages;
}
