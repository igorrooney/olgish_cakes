import { cachedSanityFetch, getCacheConfig } from "@/lib/sanity-cache";
import { MetadataRoute } from "next";

type SitemapChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>

interface SanityImageDimensions {
  width?: number
  height?: number
  aspectRatio?: number
  [key: string]: unknown
}

interface SanityImageAsset {
  _id: string
  url: string
  metadata?: {
    dimensions?: SanityImageDimensions
  }
}

interface SanityImageRef {
  asset?: SanityImageAsset
  alt?: string
}

interface ImageSitemapImage {
  url: string
  title: string
  caption: string
  geoLocation: string
  license: string
  loc: string
}

interface ImageSitemapEntry {
  url: string
  lastModified: Date
  changeFrequency: SitemapChangeFrequency
  priority: number
  images: ImageSitemapImage[]
}

interface BlogImageResult {
  slug: { current: string }
  featuredImage?: SanityImageRef
  cardImage?: SanityImageRef
  title: string
  publishDate?: string
}

interface CakeImageResult {
  slug: { current: string }
  images?: SanityImageRef[]
  name: string
  _updatedAt: string
}

interface GiftHamperImageResult {
  _id?: string
  slug?: { current: string }
  images?: SanityImageRef[]
  name: string
  _updatedAt: string
}

function hasSanityImageUrl(image: SanityImageRef): image is SanityImageRef & { asset: SanityImageAsset } {
  return Boolean(image.asset?.url)
}

async function getBlogImages() {
  const query = `*[_type == "blogPost" && status == "published"] {
    slug,
    featuredImage {
      asset->{
        _id,
        url,
        metadata {
          dimensions
        }
      },
      alt
    },
    cardImage {
      asset->{
        _id,
        url,
        metadata {
          dimensions
        }
      },
      alt
    },
    title,
    publishDate
  }`;
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<BlogImageResult[]>(query, {}, config)
}

async function getCakeImages() {
  const query = `*[_type == "cake"] {
    slug,
    images[] {
      asset->{
        _id,
        url,
        metadata {
          dimensions
        }
      },
      alt
    },
    name,
    _updatedAt
  }`;
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<CakeImageResult[]>(query, {}, config)
}

async function getGiftHamperImages() {
  const query = `*[_type == "giftHamper"] {
    _id,
    slug,
    images[] {
      asset->{
        _id,
        url,
        metadata {
          dimensions
        }
      },
      alt
    },
    name,
    _updatedAt
  }`;
  const config = getCacheConfig('sitemaps')
  return cachedSanityFetch<GiftHamperImageResult[]>(query, {}, config)
}

export default async function sitemapImages(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://olgishcakes.co.uk";
  const [blogImages, cakeImages, giftHamperImages] = await Promise.all([
    getBlogImages(),
    getCakeImages(),
    getGiftHamperImages(),
  ]);

  const imageEntries: ImageSitemapEntry[] = [];

  // Blog post images
  blogImages.forEach((post) => {
    const postUrl = `${baseUrl}/blog/${post.slug.current}`;

    // Featured image
    if (post.featuredImage?.asset?.url) {
      imageEntries.push({
        url: postUrl,
        lastModified: new Date(post.publishDate || new Date()),
        changeFrequency: "monthly" as const,
        priority: 0.7,
        images: [
          {
            url: post.featuredImage.asset.url,
            title: post.title,
            caption: post.featuredImage.alt || post.title,
            geoLocation: "Leeds, West Yorkshire, UK",
            license: `${baseUrl}/terms`,
            loc: postUrl,
          }
        ]
      });
    }

    // Card image (if different from featured)
    if (post.cardImage?.asset?.url && post.cardImage.asset.url !== post.featuredImage?.asset?.url) {
      imageEntries.push({
        url: postUrl,
        lastModified: new Date(post.publishDate || new Date()),
        changeFrequency: "monthly" as const,
        priority: 0.6,
        images: [
          {
            url: post.cardImage.asset.url,
            title: `${post.title} - Card Image`,
            caption: post.cardImage.alt || `${post.title} card image`,
            geoLocation: "Leeds, West Yorkshire, UK",
            license: `${baseUrl}/terms`,
            loc: postUrl,
          }
        ]
      });
    }
  });

  // Cake images
  cakeImages.forEach((cake) => {
    const cakeUrl = `${baseUrl}/cakes/${cake.slug.current}`;

    if (cake.images && cake.images.length > 0) {
      const images = cake.images.filter(hasSanityImageUrl).map((img) => ({
        url: img.asset.url,
        title: cake.name,
        caption: img.alt || cake.name,
        geoLocation: "Leeds, West Yorkshire, UK",
        license: `${baseUrl}/terms`,
        loc: cakeUrl,
      }));

      imageEntries.push({
        url: cakeUrl,
        lastModified: new Date(cake._updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
        images
      });
    }
  });

  // Gift hamper images
  giftHamperImages.forEach((hamper) => {
    const hamperUrl = `${baseUrl}/cakes-by-post/${hamper.slug?.current || hamper._id}`;

    if (hamper.images && hamper.images.length > 0) {
      const images = hamper.images.filter(hasSanityImageUrl).map((img) => ({
        url: img.asset.url,
        title: hamper.name,
        caption: img.alt || hamper.name,
        geoLocation: "Leeds, West Yorkshire, UK",
        license: `${baseUrl}/terms`,
        loc: hamperUrl,
      }));

      imageEntries.push({
        url: hamperUrl,
        lastModified: new Date(hamper._updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images
      });
    }
  });

  // Static page images
  const staticPageImages: ImageSitemapEntry[] = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
      images: [
        {
          url: `${baseUrl}/images/olgish-cakes-logo-bakery-brand.png`,
          title: "Olgish Cakes Logo",
          caption: "Olgish Cakes - Professional Ukrainian Bakery in Leeds",
          geoLocation: "Leeds, West Yorkshire, UK",
          license: `${baseUrl}/terms`,
          loc: `${baseUrl}`,
        }
      ]
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      images: [
        {
          url: `${baseUrl}/android-chrome-192x192.png`,
          title: "Olgish Cakes Author Avatar",
          caption: "Professional Baker - Olgish Cakes",
          geoLocation: "Leeds, West Yorkshire, UK",
          license: `${baseUrl}/terms`,
          loc: `${baseUrl}/about`,
        }
      ]
    }
  ];

  // Combine all entries and sort by priority
  const allEntries = [...imageEntries, ...staticPageImages].sort(
    (a, b) => (b.priority || 0) - (a.priority || 0)
  );

  return allEntries as unknown as MetadataRoute.Sitemap;
}
