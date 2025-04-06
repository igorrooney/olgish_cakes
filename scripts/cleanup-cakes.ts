import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, "../.env.local") });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error("Missing required environment variables. Please check your .env.local file.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-03-31",
  token,
  useCdn: false,
});

async function cleanupCakes() {
  console.log("Deleting all existing cakes...");

  try {
    // Fetch all cake documents
    const cakes = await client.fetch(`*[_type == "cake"]._id`);

    if (!cakes || cakes.length === 0) {
      console.log("No cakes found to delete.");
      return;
    }

    console.log(`Found ${cakes.length} cakes to delete`);

    // Delete all cakes
    await client.delete({
      query: `*[_type == "cake"]`,
    });

    console.log("Successfully deleted all cakes!");
  } catch (error) {
    console.error("Error deleting cakes:", error);
    process.exit(1);
  }
}

cleanupCakes();
