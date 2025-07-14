import { createClient } from "@sanity/client";
import type { SanityDocument } from "@sanity/types";
import dotenv from "dotenv";
import path from "path";
import { ensureUniqueKeys, validateRichTextKeys } from "../lib/rich-text-utils";

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
  apiVersion: "2024-03-31",
  token,
  useCdn: false,
});

async function fixRichTextKeys() {
  console.log("Fetching cakes with rich text data...");

  try {
    // Fetch all cakes
    const cakes = await sanityClient.fetch<SanityDocument[]>('*[_type == "cake"]');

    if (!cakes || cakes.length === 0) {
      console.log("No cakes found in the database.");
      return;
    }

    console.log(`Found ${cakes.length} cakes to check`);

    const transactions: any[] = [];
    let fixedCount = 0;

    for (const cake of cakes) {
      const cakeData = cake as any;
      let needsUpdate = false;
      const updates: any = {};

      // Check shortDescription
      if (cakeData.shortDescription && Array.isArray(cakeData.shortDescription)) {
        if (!validateRichTextKeys(cakeData.shortDescription)) {
          console.log(`Fixing duplicate keys in shortDescription for cake: ${cakeData.name}`);
          updates.shortDescription = ensureUniqueKeys(cakeData.shortDescription);
          needsUpdate = true;
          fixedCount++;
        }
      }

      // Check description
      if (cakeData.description && Array.isArray(cakeData.description)) {
        if (!validateRichTextKeys(cakeData.description)) {
          console.log(`Fixing duplicate keys in description for cake: ${cakeData.name}`);
          updates.description = ensureUniqueKeys(cakeData.description);
          needsUpdate = true;
          fixedCount++;
        }
      }

      if (needsUpdate) {
        transactions.push({
          patch: {
            id: cake._id,
            set: updates,
          },
        });
      }
    }

    if (transactions.length > 0) {
      console.log(`Applying ${transactions.length} updates...`);
      await sanityClient.transaction(transactions).commit();
      console.log(`Successfully fixed ${fixedCount} rich text fields with duplicate keys!`);
    } else {
      console.log("No duplicate keys found. All rich text data is valid.");
    }
  } catch (error) {
    console.error("Error fixing rich text keys:", error);
    process.exit(1);
  }
}

fixRichTextKeys();
