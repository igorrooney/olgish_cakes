import { createClient, SanityClient } from "next-sanity";
import { client as baseClient } from "./client";
import { ReactNode, ReactElement } from "react";

// Create a client with live preview configuration
const previewClient = createClient({
  ...baseClient.config(),
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: "previewDrafts",
});

// Helper function to fetch data with preview support
export async function sanityFetch<T>({
  query,
  params = {},
  isDraftMode = false,
}: {
  query: string;
  params?: Record<string, unknown>;
  isDraftMode?: boolean;
}): Promise<T> {
  const client = isDraftMode ? previewClient : baseClient;
  return client.fetch<T>(query, params);
}

// Live preview component
export function SanityLive({ children }: { children: ReactNode }): ReactElement {
  return <>{children}</>;
}
