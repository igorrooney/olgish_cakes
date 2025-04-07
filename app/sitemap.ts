import { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";

async function getCakes() {
  const query = `*[_type == "cake"] {
    slug,
    _updatedAt
  }`;
  return client.fetch(query);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://olgishcakes.com"; // Replace with your actual domain
  const cakes = await getCakes();

  const cakeRoutes = cakes.map((cake: { slug: { current: string }; _updatedAt: string }) => ({
    url: `${baseUrl}/cakes/${cake.slug.current}`,
    lastModified: new Date(cake._updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/cakes`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ];

  return [...routes, ...cakeRoutes];
}
