"use client";

import { memo } from "react";

interface NavigationStructuredDataProps {
  navigation: Array<{
    name: string;
    href: string;
    megaMenu?: any;
    dropdown?: any;
  }>;
}

export const NavigationStructuredData = memo(function NavigationStructuredData({ navigation }: NavigationStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SiteNavigationElement",
    name: "Olgish Cakes Navigation",
    description: "Main navigation menu for Olgish Cakes Ukrainian Bakery",
    url: "https://olgishcakes.co.uk",
    mainEntity: navigation.map(item => ({
      "@type": "WebPage",
      name: item.name,
      url: `https://olgishcakes.co.uk${item.href}`,
      description: item.megaMenu
        ? `Browse ${item.name.toLowerCase()} including featured items and categories`
        : item.dropdown
          ? `Explore ${item.name.toLowerCase()} services and options`
          : `Visit ${item.name.toLowerCase()} page`,
      isPartOf: {
        "@type": "WebSite",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
      },
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://olgishcakes.co.uk",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: item.name,
            item: `https://olgishcakes.co.uk${item.href}`,
          },
        ],
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
});
