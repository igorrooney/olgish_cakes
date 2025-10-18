import type { Metadata } from "next";
import { Box, Container, Typography, Grid, Paper, Chip, Button } from "@mui/material";
import Link from "next/link";
import Script from "next/script";
import { Breadcrumbs } from "../components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Nut Free Cakes Leeds | Allergen-Safe Birthday & Wedding Cakes",
  description:
    "★★★★★ Safe nut-free cakes in Leeds from £25. Birthday, wedding & celebration cakes. Dedicated nut-free environment. 127+ 5-star reviews. Order today!",
  keywords:
    "nut free cakes Leeds, nut-free cakes Leeds, nut free cake near me, allergen-safe cakes Leeds, allergy-friendly cakes Leeds, Ukrainian nut-free cakes, nut-free honey cake, nut-free desserts Leeds, nut allergy cakes, safe birthday cakes Leeds",
  openGraph: {
    title: "Nut Free Cakes Leeds | Allergen-Safe Birthday & Wedding Cakes",
    description:
      "★★★★★ Safe nut-free cakes in Leeds from £25. Birthday, wedding & celebration cakes. Dedicated nut-free environment. 127+ 5-star reviews. Order today!",
    url: "https://olgishcakes.co.uk/nut-free-cakes-leeds",
    images: ["https://olgishcakes.co.uk/images/nut-free-cakes-leeds.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nut Free Cakes Leeds | Allergen-Safe Birthday & Wedding Cakes",
    description:
      "★★★★★ Safe nut-free cakes in Leeds from £25. Birthday, wedding & celebration cakes. Dedicated nut-free environment. 127+ 5-star reviews. Order today!",
    images: ["https://olgishcakes.co.uk/images/nut-free-cakes-leeds.jpg"],
  },
  alternates: {
    canonical: "https://olgishcakes.co.uk/nut-free-cakes-leeds",
  },
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Are your nut-free cakes truly nut-free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, all my nut-free cakes are made in a dedicated nut-free environment. I take nut allergies very seriously and ensure all ingredients, equipment, and preparation areas are completely free from nuts and nut traces. I source ingredients from verified nut-free suppliers and maintain strict allergen control procedures."
      }
    },
    {
      "@type": "Question",
      name: "What nut-free cake flavors do you offer in Leeds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "I offer a variety of nut-free cakes including traditional Ukrainian honey cake (Medovik), vanilla cakes, chocolate cakes, and custom flavored cakes. All are made with premium ingredients in a nut-free environment. Popular options include nut-free birthday cakes, nut-free wedding cakes, and nut-free celebration cakes from £25."
      }
    },
    {
      "@type": "Question",
      name: "How do you prevent cross-contamination with nuts?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "I maintain a strict nut-free policy in my Leeds bakery. All equipment is thoroughly cleaned and sanitized, ingredients are sourced from nut-free suppliers, and I never work with nuts in the same kitchen. Each nut-free cake is prepared with dedicated tools and equipment to ensure zero cross-contamination risk."
      }
    },
    {
      "@type": "Question",
      name: "Can you make nut-free wedding cakes in Leeds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolutely! I create beautiful nut-free wedding cakes for Leeds celebrations. From elegant tiered cakes to modern designs, all can be made completely nut-free without compromising on taste or appearance. Prices start from £150 for nut-free wedding cakes."
      }
    },
    {
      "@type": "Question",
      name: "Do you deliver nut-free cakes across Leeds?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, I deliver nut-free cakes across Leeds and surrounding areas including Bradford, Wakefield, Huddersfield, and York. Same-day delivery available when ordered before 10am. Delivery fee £15-20 depending on location."
      }
    }
  ]
};

export default function NutFreeCakesLeedsPage() {
  return (
    <>
      <Script
        id="nut-free-cakes-leeds-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Nut-Free Cakes Leeds",
            description: "Professional nut-free cake service in Leeds. Safe for severe nut allergies with dedicated nut-free environment. Birthday cakes, wedding cakes, and celebration cakes from £25.",
            provider: {
              "@type": "Bakery",
              name: "Olgish Cakes",
              url: "https://olgishcakes.co.uk",
              telephone: "+44 786 721 8194",
              email: "hello@olgishcakes.co.uk",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Allerton Grange",
                addressLocality: "Leeds",
                postalCode: "LS17",
                addressRegion: "West Yorkshire",
                addressCountry: "GB",
              },
            },
            serviceType: "Nut-Free Cake Design and Delivery",
            areaServed: [
              { "@type": "City", name: "Leeds" },
              { "@type": "City", name: "Bradford" },
              { "@type": "City", name: "Wakefield" },
              { "@type": "City", name: "Huddersfield" }
            ],
            offers: {
              "@type": "Offer",
              price: "35",
              priceCurrency: "GBP",
              availability: "https://schema.org/InStock"
            },
            url: "https://olgishcakes.co.uk/nut-free-cakes-leeds",
          }),
        }}
      />
      <Script
        id="nut-free-cakes-faq-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqData),
        }}
      />

      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)",
          minHeight: "100vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Nut-Free Cakes Leeds" }]} />
          </Box>

          {/* Hero Section */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 8 } }}>
            <Typography
              variant="h1"
              component="h1"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2.5rem", md: "3.5rem" },
                fontWeight: 700,
                color: "primary.main",
                mb: 3,
                lineHeight: 1.2,
              }}
            >
              Nut Free Cakes Leeds from £25
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                mb: 4,
                lineHeight: 1.6,
              }}
            >
              Delicious nut-free cakes made in a dedicated allergen-safe environment. Perfect for birthdays,
              weddings, and celebrations. Safe for severe nut allergies with zero cross-contamination risk.
            </Typography>
            <Chip
              label="100% Nut-Free Environment Guaranteed"
              sx={{
                backgroundColor: "primary.main",
                color: "white",
                fontSize: "1.1rem",
                px: 3,
                py: 1,
                mb: 4,
              }}
            />
          </Box>

          {/* Why Choose Our Nut-Free Cakes */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Why Choose Our Nut-Free Cakes in Leeds?
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              Finding truly nut-free cakes in Leeds can be challenging, especially when you have severe nut allergies. At Olgish Cakes, I understand how important it is to have complete confidence in the safety of your cake. That's why I maintain a dedicated nut-free environment where ALL cakes are made without any nuts or nut products. I never work with nuts in my Leeds bakery, ensuring zero risk of cross-contamination for every single cake I create.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              My nut-free cakes aren't just safe - they're absolutely delicious. Using traditional Ukrainian recipes adapted for nut allergies, I create cakes that taste incredible while being completely allergen-safe. From nut-free birthday cakes to nut-free wedding cakes, every creation uses premium ingredients sourced from verified nut-free suppliers. Families in Leeds trust my nut-free cakes because they know their loved ones with nut allergies can enjoy celebrations without worry. Prices start from just £35, making allergen-safe cakes accessible for everyone.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              What sets my nut-free cakes apart in Leeds? I take allergen control extremely seriously. Every ingredient is carefully checked, all equipment is thoroughly sanitized, and I maintain detailed records of every supplier and ingredient used. Parents of children with nut allergies often tell me my cakes give them peace of mind - knowing their child can safely enjoy birthday cake like everyone else. Whether you need a nut-free cake for a child's party, a wedding, or any celebration in Leeds, I ensure it's both safe and spectacular.
            </Typography>
          </Box>

          {/* Safety Measures */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Our Nut-Free Safety Measures
            </Typography>
            <Grid container spacing={4}>
              {[
                {
                  title: "100% Nut-Free Kitchen",
                  description: "My Leeds bakery has never had nuts or nut products. Every cake is made in a completely nut-free environment with zero cross-contamination risk.",
                  icon: "🛡️",
                },
                {
                  title: "Verified Suppliers",
                  description: "All ingredients come from verified nut-free suppliers. I check every label and maintain records of all supplier certifications.",
                  icon: "✓",
                },
                {
                  title: "Dedicated Equipment",
                  description: "All baking equipment, utensils, and preparation surfaces are used exclusively for nut-free cake production.",
                  icon: "🔧",
                },
                {
                  title: "Allergen Training",
                  description: "I'm trained in allergen management and follow strict protocols to ensure every nut-free cake is completely safe.",
                  icon: "📚",
                },
              ].map((measure, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: "center",
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="h3" sx={{ mb: 2, fontSize: "3rem" }}>
                      {measure.icon}
                    </Typography>
                    <Typography
                      variant="h3"
                      component="h3"
                      sx={{ mb: 2, fontWeight: 600, color: "primary.main", fontSize: "1.3rem" }}
                    >
                      {measure.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {measure.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Types of Nut-Free Cakes */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Nut-Free Cake Options in Leeds
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              My most popular nut-free cake in Leeds is the traditional Ukrainian honey cake (Medovik) - completely adapted to be nut-free while maintaining all its delicious flavor. This sophisticated cake features delicate honey-soaked layers with rich cream filling, perfect for adult celebrations and milestone birthdays. At £35 for a cake serving 8-10 people, it's an affordable option for nut-free celebrations. I also make nut-free vanilla cakes, nut-free chocolate cakes, and custom flavored nut-free cakes for any celebration.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              For children with nut allergies, I create fun themed nut-free birthday cakes that look amazing and taste incredible. Popular themes include nut-free unicorn cakes, nut-free dinosaur cakes, nut-free princess cakes, and nut-free superhero cakes. Parents in Leeds love these because their children can have a spectacular birthday cake without any allergy concerns. Every decoration, frosting, and ingredient is carefully selected to be completely nut-free.
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8, fontSize: "1.1rem" }}>
              I also specialize in nut-free wedding cakes for Leeds couples. From elegant tiered designs to modern minimalist styles, every nut-free wedding cake is created with the same attention to detail as traditional wedding cakes. Your guests with nut allergies can enjoy the wedding cake safely, and no one will know it's nut-free because the taste and appearance are absolutely stunning. Nut-free wedding cakes start from £150.
            </Typography>
          </Box>

          {/* FAQ Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h2" sx={{ fontFamily: "var(--font-playfair-display)", fontSize: { xs: "2rem", md: "2.5rem" }, fontWeight: 600, color: "primary.main", mb: 4, textAlign: "center" }}>
              Nut-Free Cakes FAQs
            </Typography>
            <Grid container spacing={3}>
              {faqData.mainEntity.map((faq, index) => (
                <Grid item xs={12} key={index}>
                  <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h3" component="h3" sx={{ fontWeight: 600, mb: 2, color: "primary.main", fontSize: "1.3rem" }}>
                      {faq.name}
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                      {faq.acceptedAnswer.text}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Delivery Information */}
          <Box sx={{ mb: 6 }}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 3,
                background: "linear-gradient(135deg, #005BBB 0%, #FFD700 100%)",
                color: "white",
              }}
            >
              <Typography variant="h3" sx={{ mb: 3, textAlign: "center", fontWeight: 600 }}>
                Nut-Free Cake Delivery in Leeds
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Delivery Coverage:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Leeds (all areas)
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Bradford
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Wakefield
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Huddersfield
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • York
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • Across Yorkshire
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Pricing & Details:
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Birthday Cakes: From £35
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Wedding Cakes: From £150
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
                    • Delivery: £15-20
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    • Same-Day Available (order by 10am)
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* CTA Section */}
          <Box sx={{ textAlign: "center", py: 6 }}>
            <Typography
              variant="h3"
              component="h3"
              sx={{
                fontFamily: "var(--font-playfair-display)",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 600,
                color: "primary.main",
                mb: 3,
              }}
            >
              Ready to Order Your Nut-Free Cake?
            </Typography>
            <Typography variant="h4" component="h4" sx={{ mb: 4, color: "text.secondary" }}>
              Contact me today for a safe, delicious nut-free cake in Leeds
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                component={Link}
                href="/contact"
                variant="contained"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                Order Nut-Free Cake
              </Button>
              <Button
                component={Link}
                href="/allergen-information"
                variant="outlined"
                color="primary"
                size="large"
                sx={{ px: 4, py: 2 }}
              >
                View Allergen Information
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
}
