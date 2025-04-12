import type { Metadata } from "next";
import { Container, Typography, Box, Button } from "@mui/material";
import { StructuredData } from "../components/StructuredData";
import { FAQItems } from "./FAQItems";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ | Olgish Cakes - Frequently Asked Questions",
  description:
    "Find answers to common questions about our Ukrainian-style cakes, ordering process, delivery options, and more at Olgish Cakes in Leeds.",
};

const faqItems = [
  {
    question: "What makes Ukrainian cakes unique?",
    answer:
      "Ukrainian cakes are known for their rich, layered textures and unique flavor combinations. Our cakes incorporate traditional Ukrainian techniques and ingredients, such as honey, sour cream, and seasonal fruits, while maintaining a modern presentation. Each creation is a perfect blend of Ukrainian heritage and contemporary patisserie art.",
  },
  {
    question: "How far in advance should I place my order?",
    answer:
      "For standard orders, we recommend 2-3 weeks notice. For wedding cakes or complex designs, please allow 4-6 weeks. We understand that special occasions can arise unexpectedly, so we do our best to accommodate last-minute orders when possible. Contact us directly for urgent requests.",
  },
  {
    question: "What are your delivery options?",
    answer:
      "We offer professional delivery within Leeds and surrounding areas. Our delivery service includes careful transportation and setup of your cake. Delivery fees are calculated based on location and cake size. We also offer collection from our Leeds bakery. For wedding cakes, we provide a premium delivery and setup service to ensure perfect presentation.",
  },
  {
    question: "Do you offer traditional Ukrainian cake flavors?",
    answer:
      "Yes, we specialize in authentic Ukrainian flavors such as Medovik (honey cake), Kyiv cake, and Napoleon. We also offer modern interpretations of these classics, along with seasonal specialties. Each cake can be customized to your preferences while maintaining the authentic Ukrainian taste profile.",
  },
  {
    question: "How do you handle dietary requirements?",
    answer:
      "We accommodate various dietary needs including gluten-free, dairy-free, vegan, and nut-free options. Our Ukrainian recipes can be adapted while maintaining their authentic taste. Please inform us of any allergies or dietary restrictions when placing your order, and we'll ensure your cake meets all requirements.",
  },
  {
    question: "What is your process for custom cake orders?",
    answer:
      "Our custom cake process begins with a consultation (in-person, phone, or online) to discuss your vision. We'll explore design options, flavors, and any special requirements. After finalizing the details, we require a 50% deposit to secure your order. The balance is due before delivery or collection. We provide regular updates and photos during the creation process.",
  },
  {
    question: "Do you offer wedding cake consultations?",
    answer:
      "Yes, we provide comprehensive wedding cake consultations that include tasting sessions with our signature Ukrainian flavors. Our consultations cover design, portion sizes, delivery logistics, and setup. We work closely with couples to create a cake that reflects their style while incorporating Ukrainian traditions.",
  },
  {
    question: "What is your cancellation and refund policy?",
    answer:
      "For cancellations made more than 14 days before the event, we offer a full refund of your deposit. Between 7-14 days, 50% of the deposit is refundable. Within 7 days, the deposit is non-refundable. We understand that circumstances change, and we'll work with you to reschedule when possible.",
  },
  {
    question: "Do you offer corporate and event catering?",
    answer:
      "Yes, we provide bespoke catering services for corporate events, parties, and special occasions. Our Ukrainian-style dessert tables and cake displays are particularly popular for cultural events and celebrations. We can create custom packages to suit your event's needs and budget.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bank transfers, credit/debit cards, and cash payments. For orders over £200, we require a 50% deposit. The balance is due 7 days before delivery or collection. We can provide detailed invoices for corporate clients and event planners.",
  },
];

export default function FAQPage() {
  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom, #FFF5E6 0%, #FFFFFF 100%)",
        minHeight: "100vh",
        py: 8,
      }}
    >
      <Container maxWidth="lg">
        <StructuredData />

        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontFamily: "var(--font-playfair-display)",
              fontWeight: 700,
              mb: 2,
              color: "primary.main",
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              mb: 4,
              fontFamily: "var(--font-playfair-display)",
            }}
          >
            Everything you need to know about our Ukrainian-style cakes
          </Typography>
        </Box>

        <FAQItems items={faqItems} />

        <Box sx={{ mt: 8, textAlign: "center" }}>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              color: "text.secondary",
              fontSize: "1.1rem",
            }}
          >
            Have a specific question about our Ukrainian-style cakes?
          </Typography>
          <Button
            component={Link}
            href="/contact"
            variant="contained"
            color="primary"
            size="large"
            sx={{
              px: 6,
              py: 1.5,
              borderRadius: "8px",
              textTransform: "none",
              fontSize: "1.1rem",
              fontWeight: 500,
              boxShadow: "0 4px 15px rgba(0, 91, 187, 0.2)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(0, 91, 187, 0.3)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Contact Us
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
