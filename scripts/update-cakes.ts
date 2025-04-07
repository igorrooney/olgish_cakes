import { createClient as createSanityClient } from "@sanity/client";
import dotenv from "dotenv";
import path from "path";

interface SanityDocument {
  _id: string;
  _type: string;
}

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing required environment variables. Please check your .env.local file.");
  process.exit(1);
}

const sanityClient = createSanityClient({
  projectId,
  dataset,
  apiVersion: "2024-03-31",
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

    // Update each cake with new fields or modifications
    const transactions = cakes.map((cake: SanityDocument) => ({
      patch: {
        id: cake._id,
        set: {
          updatedAt: new Date().toISOString(),
        },
      },
    }));

    await sanityClient.transaction(transactions).commit();
    console.log("Successfully updated all cakes!");
  } catch (error) {
    console.error("Error updating cakes:", error);
    process.exit(1);
  }
}

updateCakes();
