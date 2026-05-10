import { createClient } from "@sanity/client";
import type { SanityDocument } from "@sanity/types";
import dotenv from "dotenv";
import path from "path";
import { ensureUniqueKeys, validateRichTextKeys, type RichTextBlock } from "../lib/rich-text-utils";

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

type CakeWithRichText = SanityDocument & {
  name?: string;
  shortDescription?: RichTextBlock[];
  description?: RichTextBlock[];
};

type CakeRichTextUpdates = Partial<Pick<CakeWithRichText, "shortDescription" | "description">>;

type RichTextPatchTransaction = {
  patch: {
    id: string;
    set: CakeRichTextUpdates;
  };
};

async function fixRichTextKeys() {
  console.log("Fetching cakes with rich text data...");

  try {
    // Fetch all cakes
    const cakes = await sanityClient.fetch<CakeWithRichText[]>('*[_type == "cake"]');

    if (!cakes || cakes.length === 0) {
      console.log("No cakes found in the database.");
      return;
    }

    console.log(`Found ${cakes.length} cakes to check`);

    const transactions: RichTextPatchTransaction[] = [];
    let fixedCount = 0;

    for (const cake of cakes) {
      let needsUpdate = false;
      const updates: CakeRichTextUpdates = {};

      // Check shortDescription
      if (cake.shortDescription && Array.isArray(cake.shortDescription)) {
        if (!validateRichTextKeys(cake.shortDescription)) {
          console.log(`Fixing duplicate keys in shortDescription for cake: ${cake.name}`);
          updates.shortDescription = ensureUniqueKeys(cake.shortDescription);
          needsUpdate = true;
          fixedCount++;
        }
      }

      // Check description
      if (cake.description && Array.isArray(cake.description)) {
        if (!validateRichTextKeys(cake.description)) {
          console.log(`Fixing duplicate keys in description for cake: ${cake.name}`);
          updates.description = ensureUniqueKeys(cake.description);
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
