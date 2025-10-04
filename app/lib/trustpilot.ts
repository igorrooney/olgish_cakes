interface TrustpilotReview {
  id: string;
  consumer: {
    displayName: string;
    displayLocation?: string;
  };
  stars: number;
  title: string;
  text: string;
  createdAt: string;
}

interface TrustpilotResponse {
  reviews: TrustpilotReview[];
  links: {
    next?: string;
  };
}

const TRUSTPILOT_API_KEY = process.env.NEXT_PUBLIC_TRUSTPILOT_API_KEY;
const TRUSTPILOT_BUSINESS_UNIT_ID = process.env.NEXT_PUBLIC_TRUSTPILOT_BUSINESS_UNIT_ID;
const TRUSTPILOT_API_HOST = "https://api.trustpilot.com/v1";

export async function fetchTrustpilotReviews(productName: string) {
  // If Trustpilot is not configured, return null immediately
  if (!TRUSTPILOT_API_KEY || !TRUSTPILOT_BUSINESS_UNIT_ID ||
      TRUSTPILOT_API_KEY === 'your_api_key_here' ||
      TRUSTPILOT_BUSINESS_UNIT_ID === 'your_business_unit_id_here') {
    return null;
  }

  try {
    const response = await fetch(
      `${TRUSTPILOT_API_HOST}/business-units/${TRUSTPILOT_BUSINESS_UNIT_ID}/reviews?perPage=3&tag=${encodeURIComponent(productName)}`,
      {
        headers: {
          ApiKey: TRUSTPILOT_API_KEY,
          Accept: "application/json",
        },
        next: {
          revalidate: 3600, // Cache for 1 hour
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Trustpilot API error: ${response.statusText}`);
    }

    const data: TrustpilotResponse = await response.json();

    return data.reviews.map(review => ({
      id: review.id,
      author: review.consumer.displayName,
      rating: review.stars,
      title: review.title,
      content: review.text,
      date: review.createdAt,
      location: review.consumer.displayLocation,
    }));
  } catch (error) {
    console.error("Error fetching Trustpilot reviews:", error);
    return null;
  }
}
