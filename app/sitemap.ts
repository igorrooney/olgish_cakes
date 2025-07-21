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
  const baseUrl = "https://olgishcakes.co.uk";
  const cakes = await getCakes();

  const cakeRoutes = cakes.map((cake: { slug: { current: string }; _updatedAt: string }) => ({
    url: `${baseUrl}/cakes/${cake.slug.current}`,
    lastModified: new Date(cake._updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Core pages
  const corePages = [
    "",
    "/about",
    "/cakes",
    "/contact",
    "/blog",
    "/testimonials",
    "/reviews-awards",
    "/faq",
    "/privacy",
    "/terms",
    "/cookies",
    "/sitemap",
  ];

  // Location-based pages
  const locationPages = [
    "/cakes-leeds",
    "/cakes-bradford",
    "/cakes-halifax",
    "/cakes-huddersfield",
    "/cakes-ilkley",
    "/cakes-otley",
    "/cakes-skipton",
    "/cakes-wakefield",
    "/cakes-york",
    "/cakes-pudsey",
  ];

  // Event-specific pages
  const eventPages = [
    "/wedding-cakes",
    "/birthday-cakes",
    "/celebration-cakes",
    "/anniversary-cakes-leeds",
    "/graduation-cakes-leeds",
    "/retirement-cakes-leeds",
    "/corporate-cakes-leeds",
    "/christmas-cakes-leeds",
    "/easter-cakes-leeds",
    "/valentines-cakes-leeds",
    "/halloween-cakes-leeds",
    "/mother-day-cakes-leeds",
    "/father-day-cakes-leeds",
  ];

  // Dietary restriction pages
  const dietaryPages = [
    "/vegan-cakes-leeds",
    "/dairy-free-cakes-leeds",
    "/gluten-friendly-ukrainian-cakes",
    "/nut-free-cakes-leeds",
    "/egg-free-cakes-leeds",
    "/vegan-wedding-cakes-leeds",
    "/gluten-friendly-wedding-cakes-leeds",
  ];

  // Educational content pages
  const educationalPages = [
    "/honey-cake-history",
    "/honey-cake-vs-kyiv-cake",
    "/traditional-ukrainian-cakes",
    "/ukrainian-bakery-leeds",
    "/ukrainian-baking-classes",
    "/ukrainian-cake-recipes",
    "/ukrainian-culture-baking",
    "/how-to-make-honey-cake",
    "/ukrainian-baking-traditions",
    "/ukrainian-celebrations",
    "/ukrainian-wedding-traditions",
    "/ukrainian-christmas-traditions",
  ];

  // Guide and comparison pages
  const guidePages = [
    "/cake-care-storage",
    "/cake-delivery",
    "/cake-flavors",
    "/cake-gallery",
    "/cake-pricing",
    "/cake-sizes-guide",
    "/cake-tasting-sessions",
    "/how-to-order",
    "/delivery-areas",
    "/best-cakes-for-weddings",
    "/best-cakes-for-birthdays",
    "/cake-size-guide",
    "/cake-flavor-guide",
    "/ukrainian-cake-vs-british-cake",
  ];

  // Service enhancement pages
  const servicePages = [
    "/custom-cake-design",
    "/seasonal-cakes",
    "/gift-cards",
    "/cake-decorating-services",
    "/cake-photography",
    "/cake-preservation",
    "/cake-shipping",
  ];

  // Community and social proof pages
  const communityPages = [
    "/allergen-information",
    "/customer-stories",
    "/wedding-cake-gallery",
    "/birthday-cake-gallery",
    "/ukrainian-community-leeds",
    "/charity-events",
  ];

  // All pages combined
  const allPages = [
    ...corePages,
    ...locationPages,
    ...eventPages,
    ...dietaryPages,
    ...educationalPages,
    ...guidePages,
    ...servicePages,
    ...communityPages,
  ];

  return allPages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: page === "" ? "daily" : "weekly",
    priority: page === "" ? 1 : page.startsWith("/cakes") ? 0.9 : 0.8,
  }));
}
