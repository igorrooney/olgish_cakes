import { client } from "@/sanity/lib/client";
import { MetadataRoute } from "next";

async function getProducts() {
  const [cakes, giftHampers] = await Promise.all([
    client.fetch(`*[_type == "cake"] {
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
    }`),
    client.fetch(`*[_type == "giftHamper"] {
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
    }`)
  ]);

  return { cakes, giftHampers };
}

export default async function sitemapProducts(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://olgishcakes.co.uk";
  const { cakes, giftHampers } = await getProducts();

  // Cake product pages with high priority for Google Merchant Center
  const cakeRoutes = cakes.map((cake: any) => ({
    url: `${baseUrl}/cakes/${cake.slug.current}`,
    lastModified: new Date(cake._updatedAt),
    changeFrequency: "daily" as const, // High frequency for product pages
    priority: 0.95, // Very high priority for products
  }));

  // Gift hamper product pages with high priority
  const giftHamperRoutes = giftHampers.map((hamper: any) => ({
    url: `${baseUrl}/gift-hampers/${hamper.slug.current}`,
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
      url: `${baseUrl}/gift-hampers`,
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
