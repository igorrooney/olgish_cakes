import { createClient } from "@sanity/client";
import type { SanityDocument } from "@sanity/types";
import dotenv from "dotenv";
import path from "path";
import { stringToRichText } from "../lib/rich-text-utils";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing required environment variables. Please check your .env.local file.");
  process.exit(1);
}

const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-03-31",
  token,
  useCdn: false,
});

// Original prices from seed data
const cakePrices: Record<string, number> = {
  "kyiv-cake": 45,
  "honey-cake-medovik": 40,
  "napoleon-cake": 42,
  "poppy-seed-roll": 35,
  "cherry-cake": 38,
};

// Short descriptions for existing cakes
const cakeShortDescriptions: Record<string, string> = {
  "kyiv-cake": "Legendary Ukrainian dessert with crispy meringue and hazelnuts",
  "honey-cake-medovik": "Traditional honey cake with melt-in-your-mouth texture",
  "napoleon-cake": "Ukrainian Napoleon with flaky pastry and vanilla custard",
  "poppy-seed-roll": "Soft yeast dough with sweetened poppy seed filling",
  "cherry-cake": "Soft sponge cake with sweet-tart cherry filling",
};

async function updateCakes() {
  console.log("Fetching existing cakes...");

  try {
    // First, fetch all cakes
    const cakes = await sanityClient.fetch<SanityDocument[]>('*[_type == "cake"]');

    if (!cakes || cakes.length === 0) {
      console.log("No cakes found in the database.");
      return;
    }

    console.log(`Found ${cakes.length} cakes to update`);

    // Update each cake with shortDescription field
    const transactions = cakes.map((cake: SanityDocument) => {
      const slug = (cake as any).slug?.current;
      const shortDescription = cakeShortDescriptions[slug] || "";

      return {
        patch: {
          id: cake._id,
          set: {
            shortDescription: stringToRichText(shortDescription),
          },
        },
      };
    });

    await sanityClient.transaction(transactions).commit();
    console.log("Successfully updated all cakes with short descriptions!");
  } catch (error) {
    console.error("Error updating cakes:", error);
    process.exit(1);
  }
}

updateCakes();
