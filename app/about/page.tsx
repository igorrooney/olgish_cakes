import { Metadata } from "next";
import Script from "next/script";
import {
  generateLocalBusinessSchema,
  generateOrganizationSchema,
  generatePageMetadata,
  generateWebPageSchema,
  generatePersonSchema,
} from "../utils/seo";
import AboutContent from "./AboutContent";

// Preload critical resources
export const dynamic = "force-static";
export const revalidate = 3600; // Revalidate every hour

// Enhanced SEO metadata for About page
export const metadata: Metadata = generatePageMetadata({
  title:
    "About Olgish Cakes - Professional Ukrainian Baker in Leeds | Traditional Ukrainian Cakes & Desserts",
  description:
    "Meet Olga Ieromenko, professional Ukrainian baker in Leeds. Specializing in authentic Ukrainian cakes including honey cake (Medovik), Kyiv cake with cashew nuts, Sacher Torte with apricot jam, and Napoleon cake with fresh cream. Level 2 & 3 Patisserie qualified. Custom cakes, wedding cakes, birthday cakes, seasonal specialties. Same-day delivery across Yorkshire.",
  keywords: [
    "Ukrainian baker Leeds",
    "professional cake maker Leeds",
    "Olga Ieromenko baker",
    "authentic Ukrainian cakes",
    "traditional Ukrainian desserts",
    "Kyiv cake specialist Leeds",
    "custom wedding cakes Yorkshire",
    "birthday cake delivery Leeds",
    "Ukrainian bakery near me",
    "professional patisserie Leeds",
    "Level 3 Patisserie qualified",
    "Ukrainian honey cake",
    "Ukrainian cherry cake",
    "Ukrainian poppy seed roll",
    "custom celebration cakes Leeds",
    "seasonal Ukrainian cakes",
    "authentic Ukrainian honey cake",
    "traditional Medovik recipe",
    "honey cake delivery Yorkshire",
  ],
  image: "/olgish-cakes-about-olga-owner-baker.jpeg",
  url: "/about",
  type: "profile",
  author: "Olga Ieromenko",
  section: "About Us",
  tags: [
    "Ukrainian Baker",
    "Professional Patisserie",
    "Honey Cake",
    "Traditional Baking",
    "Leeds Bakery",
  ],
});

export default function AboutPage() {
  // Enhanced structured data for better SEO
  const organizationSchema = generateOrganizationSchema();
  const localBusinessSchema = generateLocalBusinessSchema();
  const webPageSchema = generateWebPageSchema({
    name: "About Olgish Cakes - Professional Ukrainian Baker in Leeds",
    description:
      "Meet Olga Ieromenko, professional Ukrainian baker in Leeds specializing in authentic Ukrainian cakes including honey cake (Medovik), Kyiv cake with cashew nuts, Sacher Torte with apricot jam, and Napoleon cake with fresh cream.",
    url: "https://olgishcakes.co.uk/about",
    breadcrumb: [
      { name: "Home", url: "https://olgishcakes.co.uk" },
      { name: "About", url: "https://olgishcakes.co.uk/about" },
    ],
  });

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://olgishcakes.co.uk/#person",
    name: "Olga Ieromenko",
    jobTitle: "Professional Ukrainian Baker",
    description:
      "Professional Ukrainian baker specializing in traditional Ukrainian cakes including honey cake (Medovik), Kyiv cake, cherry cake, poppy seed roll, and authentic Ukrainian desserts in Leeds, Yorkshire.",
    url: "https://olgishcakes.co.uk/about",
    image: "https://olgishcakes.co.uk/olgish-cakes-about-olga-owner-baker.jpeg",
    telephone: "+44 786 721 8194",
    email: "hello@olgishcakes.co.uk",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Allerton Grange",
      addressLocality: "Leeds",
      addressRegion: "West Yorkshire",
      postalCode: "LS17",
      addressCountry: "GB",
    },
    worksFor: {
      "@id": "https://olgishcakes.co.uk/#organization",
    },
    knowsAbout: [
      "Ukrainian Honey Cake (Medovik)",
      "Kyiv Cake with Cashew Nuts",
      "Sacher Torte with Apricot Jam",
      "Ukrainian Napoleon Cake",
      "Traditional Ukrainian Baking",
      "Professional Patisserie",
      "Custom Cake Design",
      "Wedding Cakes",
      "Celebration Cakes",
      "Seasonal Ukrainian Cakes",
      "Ukrainian Desserts",
    ],
    alumniOf: [
      {
        "@type": "EducationalOrganization",
        name: "Leeds City College",
        description: "Level 2 and Level 3 Patisserie and Confectionery courses",
      },
    ],
    hasCredential: ["Level 2 Patisserie and Confectionery", "Level 3 Patisserie and Confectionery"],
    sameAs: [
      "https://www.facebook.com/p/Olgish-Cakes-61557043820222/?locale=en_GB",
      "https://www.instagram.com/olgish_cakes/",
    ],
  };

  return (
    <>
      {/* Performance optimization scripts */}
      <Script id="performance-optimization" strategy="afterInteractive">
        {`
          // Preload critical resources
          if ('connection' in navigator) {
            if (navigator.connection.effectiveType === 'slow-2g' || navigator.connection.effectiveType === '2g') {
              // Reduce animations for slow connections
              document.documentElement.style.setProperty('--animation-duration', '0.1s');
            }
          }
          
          // Optimize for mobile performance
          if (window.innerWidth <= 768) {
            document.documentElement.style.setProperty('--mobile-optimized', 'true');
          }
          
          // Performance monitoring
          if ('performance' in window) {
            window.addEventListener('load', () => {
              const navigation = performance.getEntriesByType('navigation')[0];
              const paint = performance.getEntriesByType('paint');
              
              console.log('Performance Metrics:', {
                fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
                lcp: paint.find(entry => entry.name === 'largest-contentful-paint')?.startTime,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                loadComplete: navigation.loadEventEnd - navigation.loadEventStart
              });
            });
          }
        `}
      </Script>

      {/* Enhanced Structured Data */}
      <script id="organization-schema" type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>

      <script id="local-business-schema" type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>

      <script id="webpage-schema" type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>

      <script id="person-schema" type="application/ld+json">
        {JSON.stringify(personSchema)}
      </script>

      {/* FAQ Schema for About page */}
      <script id="about-faq-schema" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Who is the baker behind Olgish Cakes?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Olga Ieromenko is a professionally-trained Ukrainian baker who moved to Leeds in 2022. She completed both Level 2 and Level 3 Patisserie courses at Leeds City College, specializing in traditional Ukrainian baking techniques and contemporary patisserie.",
              },
            },
            {
              "@type": "Question",
              name: "What makes Olgish Cakes unique in Leeds?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Olgish Cakes is the only Ukrainian bakery in Leeds offering authentic traditional desserts like honey cake (Medovik), Kyiv cake, and other Ukrainian specialties. We combine time-honored recipes with professional patisserie techniques.",
              },
            },
            {
              "@type": "Question",
              name: "What qualifications does Olga have?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Olga holds Level 2 and Level 3 Patisserie and Confectionery qualifications from Leeds City College, along with extensive experience in traditional Ukrainian baking techniques passed down through generations.",
              },
            },
            {
              "@type": "Question",
              name: "Do you offer delivery across Yorkshire?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes, we offer same-day delivery across Leeds, York, Bradford, Halifax, Huddersfield, Wakefield, Otley, Skipton, Ilkley, and Pudsey. We also provide nationwide shipping for special occasions.",
              },
            },
            {
              "@type": "Question",
              name: "What types of cakes do you specialize in?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "We specialize in traditional Ukrainian cakes including honey cake (Medovik), Kyiv cake, cherry cake (Vyshnevyi), poppy seed roll (Makivnyk), and Napoleon cake. We also create custom wedding cakes, birthday cakes, and celebration cakes.",
              },
            },
          ],
        })}
      </script>

      <AboutContent />
    </>
  );
}
