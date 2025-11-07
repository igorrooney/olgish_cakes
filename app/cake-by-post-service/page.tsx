import { Metadata } from "next";
import { CakeByPostContent } from "@/app/gift-hampers/[slug]/CakeByPostContent";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cake by Post UK | Letterbox Cake Delivery Across Britain",
  description: "★★★★★ Cake by post UK - send delicious Ukrainian honey cake anywhere in Britain. Letterbox delivery across England, Scotland, Wales. Order cake by post today!",
  keywords: "cake by post uk, cake by post, cakes by post uk, send cake by post uk, order cake by post uk, letterbox cake uk, cake delivery uk, postal cake uk, uk cake by post, cakes delivered by post uk, honey cake by post uk, birthday cake by post uk, cake gift uk",
  openGraph: {
    title: "Cake by Post UK | Letterbox Cake Delivery Across Britain",
    description: "★★★★★ Cake by post UK - send delicious Ukrainian honey cake anywhere in Britain. Letterbox delivery across England, Scotland, Wales. Order today!",
    url: "https://olgishcakes.co.uk/cake-by-post-service",
    siteName: "Olgish Cakes",
    images: [
      {
        url: "https://olgishcakes.co.uk/images/cake-by-post-service.jpg",
        width: 1200,
        height: 630,
        alt: "Cake by Post Service - Letterbox Cake Delivery UK - Olgish Cakes",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cake by Post UK | Letterbox Cake Delivery Across Britain",
    description: "★★★★★ Cake by post UK - send delicious Ukrainian honey cake anywhere in Britain. Letterbox delivery across England, Scotland, Wales.",
    images: ["https://olgishcakes.co.uk/images/cake-by-post-service.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/cake-by-post-service",
  },
};

// Mock hamper data for the content component
const mockHamper = {
  _id: "cake-by-post-service",
  _createdAt: "2024-01-01T00:00:00Z",
  name: "Cake by Post",
  slug: { current: "cake-by-post-service" },
  description: [],
  shortDescription: [],
  price: 7,
  images: [],
  category: "Cake by Post",
  ingredients: ["Honey", "Flour", "Sugar", "Condensed milk", "Butter"],
  allergens: ["Gluten (wheat)", "Eggs", "Milk"],
};

export default function CakeByPostServicePage() {
  return (
    <main className="min-h-screen">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "@id": "https://olgishcakes.co.uk/cake-by-post-service#service",
            name: "Cake by Post Service",
            description: "Traditional Ukrainian honey cake by post. Letterbox-friendly pack of 2 slices, vacuum-packed for freshness. Perfect for surprising loved ones with delicious cake delivery anywhere in the UK.",
            provider: {
              "@type": "Organization",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Leeds",
                addressRegion: "West Yorkshire",
                addressCountry: "GB",
              },
            },
            serviceType: "Cake Delivery by Post UK",
            areaServed: {
              "@type": "Country",
              name: "United Kingdom",
              identifier: "GB"
            },
            availableChannel: {
              "@type": "ServiceChannel",
              serviceUrl: "https://olgishcakes.co.uk/gift-hampers/cake-by-post",
              serviceName: "Online Ordering",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Cake by Post Products",
              itemListElement: {
                "@type": "Product",
                name: "Traditional Ukrainian Honey Cake by Post",
                description: "Letterbox-friendly pack of 2 slices, vacuum-packed for freshness",
                offers: {
                  "@type": "Offer",
                  price: "7.00",
                  priceCurrency: "GBP",
                  availability: "https://schema.org/InStock",
                  seller: {
                    "@type": "Organization",
                    name: "Olgish Cakes",
                  },
                  hasMerchantReturnPolicy: {
                    "@type": "MerchantReturnPolicy",
                    applicableCountry: "GB",
                    returnFees: "https://schema.org/FreeReturn",
                    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                    merchantReturnDays: 14,
                    returnMethod: "https://schema.org/ReturnByMail",
                  },
                },
              },
            },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://olgishcakes.co.uk" },
                { "@type": "ListItem", position: 2, name: "Cake by Post Service", item: "https://olgishcakes.co.uk/cake-by-post-service" },
              ],
            },
          }),
        }}
      />

      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "What is cake by post?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Cake by post is a convenient way to send delicious cakes through the mail. Our letterbox-friendly packaging ensures your cake arrives fresh and ready to enjoy, perfect for surprising loved ones anywhere in the UK."
                }
              },
              {
                "@type": "Question",
                name: "How long does cake by post stay fresh?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "My cakes are vacuum-packed and specially designed for postal delivery. They stay fresh for up to 7 days when stored properly. I recommend consuming within 3-4 days for the best taste experience."
                }
              },
              {
                "@type": "Question",
                name: "Do you deliver cake by post to all UK addresses?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, I deliver my cake by post service to all UK mainland addresses. I offer free standard delivery on all orders. For guaranteed delivery on a specific day, please contact me directly."
                }
              },
              {
                "@type": "Question",
                name: "What types of cake can be sent by post?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "I specialize in traditional Ukrainian honey cake (honey cake) that's perfect for postal delivery. My cakes are cut into letterbox-friendly slices and vacuum-packed to maintain freshness during transit."
                }
              },
              {
                "@type": "Question",
                name: "How do I order cake by post?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Simply select the 'Cake by Post' option, add to cart, and proceed to checkout. Include the recipient's address and any special delivery instructions. I'll pack and ship your cake within 2-3 working days."
                }
              }
            ]
          }),
        }}
      />

      <CakeByPostContent hamper={mockHamper} />
    </main>
  );
}
