import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";
import type {
  MarketSchedule,
  MarketSchedulePreview,
  UpcomingEvent,
  MarketScheduleFilters,
} from "@/app/types/marketSchedule";

// GROQ query for basic market schedule data
const MARKET_SCHEDULE_QUERY = groq`
  *[_type == "marketSchedule" && active == true] | order(date asc) {
    _id,
    title,
    location,
    googleMapsUrl,
    date,
    startTime,
    endTime,
    description,
    specialOffers,
    contactInfo,
    featured,
    active,
    weatherDependent,
    image {
      asset-> {
        _ref,
        _type,
        url
      },
      alt,
      hotspot,
      crop
    }
  }
`;

// GROQ query for featured events
const FEATURED_SCHEDULE_QUERY = groq`
  *[_type == "marketSchedule" && active == true && featured == true] | order(date asc) {
    _id,
    title,
    location,
    googleMapsUrl,
    date,
    startTime,
    endTime,
    description,
    specialOffers,
    contactInfo,
    featured,
    active,
    weatherDependent,
    image {
      asset-> {
        _ref,
        _type,
        url
      },
      alt,
      hotspot,
      crop
    }
  }
`;

// GROQ query for upcoming events (next 30 days)
const UPCOMING_SCHEDULE_QUERY = groq`
  *[_type == "marketSchedule" && active == true && date >= $today && date <= $futureDate] | order(date asc) {
    _id,
    title,
    location,
    date,
    startTime,
    endTime,
    featured,
    active,
    description,
    specialOffers
  }
`;

/**
 * Fetch all active market schedule events
 */
export async function getMarketSchedule(): Promise<MarketSchedule[]> {
  try {
    const schedule = await client.fetch<MarketSchedule[]>(
      MARKET_SCHEDULE_QUERY,
      {},
      {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      }
    );
    return schedule || [];
  } catch (error) {
    console.error("Error fetching market schedule:", error);
    return [];
  }
}

/**
 * Fetch featured market events for home page
 */
export async function getFeaturedMarketEvents(limit: number = 3): Promise<MarketSchedule[]> {
  try {
    const events = await client.fetch<MarketSchedule[]>(
      `${FEATURED_SCHEDULE_QUERY}[0...${limit}]`,
      {},
      {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      }
    );
    return events || [];
  } catch (error) {
    console.error("Error fetching featured market events:", error);
    return [];
  }
}

/**
 * Fetch upcoming events (next 30 days)
 */
export async function getUpcomingEvents(limit: number = 5): Promise<UpcomingEvent[]> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const events = await client.fetch<MarketSchedulePreview[]>(
      `${UPCOMING_SCHEDULE_QUERY}[0...${limit}]`,
      { today, futureDate },
      {
        next: { revalidate: 300 }, // Revalidate every 5 minutes
      }
    );

    return (events || []).map(event => enhanceEventWithDateInfo(event));
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return [];
  }
}

/**
 * Search market events with filters
 */
export async function searchMarketEvents(
  filters: MarketScheduleFilters = {}
): Promise<MarketSchedule[]> {
  try {
    let query = '*[_type == "marketSchedule" && active == true';
    const params: Record<string, any> = {};

    if (filters.featured) {
      query += " && featured == true";
    }

    if (filters.upcoming) {
      const today = new Date().toISOString().split("T")[0];
      query += " && date >= $today";
      params.today = today;
    }

    if (filters.dateFrom) {
      query += " && date >= $dateFrom";
      params.dateFrom = filters.dateFrom;
    }

    if (filters.dateTo) {
      query += " && date <= $dateTo";
      params.dateTo = filters.dateTo;
    }

    if (filters.location) {
      query += " && location match $location";
      params.location = `*${filters.location}*`;
    }

    query += "] | order(date asc) {";
    query += MARKET_SCHEDULE_QUERY.split("] {")[1];

    const events = await client.fetch<MarketSchedule[]>(query, params, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
    });

    return events || [];
  } catch (error) {
    console.error("Error searching market events:", error);
    return [];
  }
}

/**
 * Enhance event data with additional date information
 */
function enhanceEventWithDateInfo(event: MarketSchedulePreview): UpcomingEvent {
  const eventDate = new Date(event.date);
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const eventDateString = eventDate.toISOString().split("T")[0];

  // Calculate days until event
  const timeDiff = eventDate.getTime() - today.getTime();
  const daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // Check if event is today
  const isToday = eventDateString === todayString;

  // Check if event is this week
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const isThisWeek = eventDate >= weekStart && eventDate <= weekEnd;

  // Format date for display (British format)
  const formattedDate = eventDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Format time for display
  const formattedTime = `${event.startTime} - ${event.endTime}`;

  return {
    ...event,
    isToday,
    isThisWeek,
    daysUntil,
    formattedDate,
    formattedTime,
  };
}

/**
 * Get next upcoming event for quick display
 */
export async function getNextUpcomingEvent(): Promise<UpcomingEvent | null> {
  try {
    const events = await getUpcomingEvents(1);
    return events.length > 0 ? events[0] : null;
  } catch (error) {
    console.error("Error fetching next upcoming event:", error);
    return null;
  }
}
