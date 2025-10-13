import { Metadata } from "next";
import { Box, Container, Typography } from "@/lib/mui-optimization";
import { getMarketSchedule } from "@/app/utils/fetchMarketSchedule";
import MarketSchedule from "@/app/components/MarketSchedule";
// Temporarily render a static shell to isolate a client chunk issue on this route
import { Breadcrumbs } from "@/app/components/Breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const events = await getMarketSchedule();
  const nextEvent = events.find(e => new Date(e.date) >= new Date());
  const title = nextEvent
    ? `Ukrainian Cakes at ${nextEvent.location} • Market Schedule`
    : "Local Market Schedule | Olgish Cakes Leeds";
  const description = nextEvent
    ? `Meet Olgish Cakes at ${nextEvent.location} on ${new Date(nextEvent.date).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}. Try Medovik, Kyiv cake and more.`
    : "Find Olgish Cakes at local markets in Leeds and Yorkshire. View upcoming dates, locations, and times.";
  const ogImage = nextEvent?.image?.asset?.url || "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png";
  return {
    title,
    description,
    alternates: { canonical: "https://olgishcakes.co.uk/market-schedule" },
    openGraph: { title, description, url: "https://olgishcakes.co.uk/market-schedule", images: [{ url: ogImage }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function MarketSchedulePage() {
  const events = await getMarketSchedule();

  return (
    <main className="min-h-screen">
      <Box
        sx={{
          background: "linear-gradient(135deg, #FFF5E6 0%, #FFFFFF 50%, #FFF5E6 100%)",
          minHeight: "40vh",
          py: { xs: 4, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Local Market Schedule" }]} />
          </Box>

          {/* Page Title + Intro */}
          <Box sx={{ textAlign: "center", mb: { xs: 4, md: 6 } }}>
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
              Local Market Schedule
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                color: "text.secondary",
                maxWidth: "800px",
                mx: "auto",
                mb: 2,
                lineHeight: 1.6,
              }}
            >
              Find upcoming farmers’ markets and events where you can try and buy our authentic
              Ukrainian cakes across Leeds and Yorkshire.
            </Typography>
          </Box>
        </Container>
      </Box>

      <MarketSchedule events={events} title="Find Us at Local Markets!" showAllLink={false} />

      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          <Typography variant="h2" component="h2" sx={{ textAlign: "center", mb: 4 }}>
            Markets We Attend
          </Typography>
          <div className="flex flex-wrap gap-3 justify-center">
            {[...new Set(events.map(e => e.location))].slice(0, 16).map(loc => (
              <span key={loc} className="px-4 py-2 rounded-full border text-sm text-gray-700">
                {loc}
              </span>
            ))}
          </div>
        </Box>
      </Container>

      <Container maxWidth="lg">
        <Box sx={{ py: 8 }}>
          <Typography variant="h2" component="h2" sx={{ textAlign: "center", mb: 4 }}>
            How to Get Cakes at the Market
          </Typography>
          <ol className="max-w-2xl mx-auto list-decimal pl-5 space-y-2 text-gray-700">
            <li>Find the nearest upcoming market above</li>
            <li>Send us a message to reserve your cake (optional)</li>
            <li>Visit our stall and pay by card or cash</li>
            <li>Enjoy authentic Ukrainian cakes</li>
          </ol>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                name: "How to buy Olgish Cakes at local markets",
                description: "Reserve in advance or visit our stall at your local market and pay on-site.",
                step: [
                  { "@type": "HowToStep", name: "Find a market", text: "Check our market schedule." },
                  { "@type": "HowToStep", name: "Reserve (optional)", text: "Message us to reserve a cake." },
                  { "@type": "HowToStep", name: "Visit & pay", text: "Pay by card or cash at the stall." },
                  { "@type": "HowToStep", name: "Enjoy", text: "Enjoy authentic Ukrainian cakes." },
                ],
              }),
            }}
          />
        </Box>
      </Container>

      {/* FAQ with JSON-LD */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4">Local Market FAQs</h2>
        <div className="space-y-4 max-w-3xl">
          <details>
            <summary className="font-medium">Do you accept card payments at markets?</summary>
            <p className="text-gray-700 mt-2">Yes, we accept card, cash, and contactless payments at our stall.</p>
          </details>
          <details>
            <summary className="font-medium">Can I pre-order for market pickup?</summary>
            <p className="text-gray-700 mt-2">Yes. Contact us to arrange a pickup so your cake is reserved.</p>
          </details>
          <details>
            <summary className="font-medium">What products are usually available?</summary>
            <p className="text-gray-700 mt-2">Our signature honey cake (Medovik), Kyiv cake, mini slices, and seasonal specials.</p>
          </details>
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "Do you accept card payments at markets?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes, we accept card, cash, and contactless payments at our stall.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Can I pre-order for market pickup?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. Contact us to arrange a pickup so your cake is reserved.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What products are usually available?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Our signature honey cake (Medovik), Kyiv cake, mini slices, and seasonal specials.",
                  },
                },
              ],
            }),
          }}
        />
      </section>
    </main>
  );
}

