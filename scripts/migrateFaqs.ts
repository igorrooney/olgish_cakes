import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Validate environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId) {
  console.error("Error: NEXT_PUBLIC_SANITY_PROJECT_ID is not set in .env.local");
  process.exit(1);
}

if (!token) {
  console.error("Error: SANITY_API_TOKEN is not set in .env.local");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: "2024-01-01",
  useCdn: false,
});

const faqs = [
  {
    question: "What makes Ukrainian cakes unique?",
    answer:
      "Ukrainian cakes are known for their rich, layered textures and unique flavor combinations. Our cakes incorporate traditional Ukrainian techniques and ingredients, such as honey, sour cream, and seasonal fruits, while maintaining a modern presentation. Each creation is a perfect blend of Ukrainian heritage and contemporary patisserie art.",
    order: 0,
  },
  {
    question: "How far in advance should I place my order?",
    answer:
      "For standard orders, we recommend 2-3 weeks notice. For wedding cakes or complex designs, please allow 4-6 weeks. We understand that special occasions can arise unexpectedly, so we do our best to accommodate last-minute orders when possible. Contact us directly for urgent requests.",
    order: 1,
  },
  {
    question: "What are your delivery options?",
    answer:
      "We offer professional delivery within Leeds and surrounding areas. Our delivery service includes careful transportation and setup of your cake. Delivery fees are calculated based on location and cake size. We also offer collection from our Leeds bakery. For wedding cakes, we provide a premium delivery and setup service to ensure perfect presentation.",
    order: 2,
  },
  {
    question: "Do you offer traditional Ukrainian cake flavors?",
    answer:
      "Yes, we specialize in authentic Ukrainian flavors such as Medovik (honey cake), Kyiv cake, and Napoleon. We also offer modern interpretations of these classics, along with seasonal specialties. Each cake can be customized to your preferences while maintaining the authentic Ukrainian taste profile.",
    order: 3,
  },
  {
    question: "How do you handle dietary requirements?",
    answer:
      "We accommodate various dietary needs including gluten-friendly, dairy-free, vegan, and nut-free options. Our Ukrainian recipes can be adapted while maintaining their authentic taste. Please inform us of any allergies or dietary restrictions when placing your order, and we'll ensure your cake meets all requirements.",
    order: 4,
  },
  {
    question: "What is your process for custom cake orders?",
    answer:
      "Our custom cake process begins with a consultation (in-person, phone, or online) to discuss your vision. We'll explore design options, flavors, and any special requirements. After finalizing the details, we require a 50% deposit to secure your order. The balance is due before delivery or collection. We provide regular updates and photos during the creation process.",
    order: 5,
  },
  {
    question: "Do you offer wedding cake consultations?",
    answer:
      "Yes, we provide comprehensive wedding cake consultations that include tasting sessions with our signature Ukrainian flavors. Our consultations cover design, portion sizes, delivery logistics, and setup. We work closely with couples to create a cake that reflects their style while incorporating Ukrainian traditions.",
    order: 6,
  },
  {
    question: "What is your cancellation and refund policy?",
    answer:
      "For cancellations made more than 14 days before the event, we offer a full refund of your deposit. Between 7-14 days, 50% of the deposit is refundable. Within 7 days, the deposit is non-refundable. We understand that circumstances change, and we'll work with you to reschedule when possible.",
    order: 7,
  },
  {
    question: "Do you offer corporate and event catering?",
    answer:
      "Yes, we provide bespoke catering services for corporate events, parties, and special occasions. Our Ukrainian-style dessert tables and cake displays are particularly popular for cultural events and celebrations. We can create custom packages to suit your event's needs and budget.",
    order: 8,
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept bank transfers, credit/debit cards, and cash payments. For orders over £200, we require a 50% deposit. The balance is due 7 days before delivery or collection. We can provide detailed invoices for corporate clients and event planners.",
    order: 9,
  },
];

async function migrateFaqs() {
  try {
    console.log("Starting FAQ migration...");
    console.log(`Using project ID: ${projectId}`);
    console.log(`Using dataset: ${dataset}`);

    // Create FAQs one by one to handle potential errors for each item
    for (const faq of faqs) {
      try {
        await client.create({
          _type: "faq",
          ...faq,
        });
        console.log(`✅ Successfully created FAQ: ${faq.question}`);
      } catch (error) {
        console.error(`❌ Error creating FAQ "${faq.question}":`, error);
      }
    }

    console.log("FAQ migration completed!");
  } catch (error) {
    console.error("Error during FAQ migration:", error);
    process.exit(1);
  }
}

migrateFaqs();
