"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";

interface UseSanityLiveOptions {
  query: string;
  params?: Record<string, any>;
  initialData?: any;
  enabled?: boolean;
}

export function useSanityLive<T>({
  query,
  params = {},
  initialData,
  enabled = true,
}: UseSanityLiveOptions) {
  const [data, setData] = useState<T | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const result = await client.fetch<T>(query, params);

        if (mounted) {
          setData(result);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err as Error);
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up real-time listener
    const subscription = client.listen(query, params).subscribe({
      next: update => {
        if (mounted) {
          // Refetch data when content changes
          fetchData();
        }
      },
      error: err => {
        if (mounted) {
          console.error("Sanity live update error:", err);
          setError(err);
        }
      },
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [query, JSON.stringify(params), enabled]);

  return { data, isLoading, error };
}
