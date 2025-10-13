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
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-03-31",
  token,
  useCdn: false,
});

async function cleanupCakes() {
  try {
    // First, fetch all cakes
    const cakes = await sanityClient.fetch<SanityDocument[]>('*[_type == "cake"]');

    // Delete all cakes
    const transactions = cakes.map((cake: SanityDocument) => ({
      delete: {
        id: cake._id,
      },
    }));

    await sanityClient.transaction(transactions).commit();
    console.log("Successfully cleaned up all cakes!");
  } catch (error) {
    console.error("Error cleaning up cakes:", error);
    process.exit(1);
  }
}

cleanupCakes();
