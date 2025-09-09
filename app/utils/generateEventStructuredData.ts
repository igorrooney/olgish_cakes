import type { MarketSchedule, MarketScheduleStructuredData } from "@/app/types/marketSchedule";

/**
 * Generate JSON-LD structured data for a market event
 */
export function generateEventStructuredData(event: MarketSchedule): MarketScheduleStructuredData {
  const eventDate = new Date(event.date);
  const startDateTime = new Date(`${event.date}T${event.startTime}:00`).toISOString();
  const endDateTime = new Date(`${event.date}T${event.endTime}:00`).toISOString();

  // Create a safe slug for the event URL from the title
  const eventSlug = event.title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const eventId = `https://olgishcakes.co.uk/events/${eventSlug}`;

  const structuredData: MarketScheduleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": eventId,
    name: event.title,
    description:
      event.description ||
      `Join Olgish Cakes at ${event.location} for authentic Ukrainian cakes and traditional honey cake.`,
    startDate: startDateTime,
    endDate: endDateTime,
    location: {
      "@type": "Place",
      name: event.location,
      url: `https://www.google.com/maps/search/${encodeURIComponent(event.location)}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Leeds",
        addressRegion: "West Yorkshire",
        postalCode: "LS17",
        addressCountry: "GB",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      email: "hello@olgishcakes.co.uk",
      telephone: "+44 786 721 8194",
    },
    // Set performer to the bakery by default to satisfy Event rich results
    performer: {
      "@type": "Organization",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
    },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: eventId,
  };

  // Add Google Maps URL as location URL
  structuredData.location.url = event.googleMapsUrl;

  // Try to extract coordinates from Google Maps URL for geo data
  const coordMatch = event.googleMapsUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    structuredData.location.geo = {
      "@type": "GeoCoordinates",
      latitude: parseFloat(coordMatch[1]),
      longitude: parseFloat(coordMatch[2]),
    };
  }

  // Add image if available
  if (event.image?.asset?.url) {
    structuredData.image = event.image.asset.url;
  }

  // Add offers information
  if (event.specialOffers && event.specialOffers.length > 0) {
    structuredData.offers = {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      price: "0", // Free market attendance
      priceCurrency: "GBP",
    };
  }

  // Add contact information if available
  if (event.contactInfo) {
    if (event.contactInfo.email) {
      structuredData.organizer.email = event.contactInfo.email;
    }
    if (event.contactInfo.phone) {
      structuredData.organizer.telephone = event.contactInfo.phone;
    }
  }

  return structuredData;
}

/**
 * Generate JSON-LD structured data for multiple events (ItemList)
 */
export function generateEventsListStructuredData(events: MarketSchedule[]) {
  const upcomingEvents = events.filter(event => {
    // Check if event has required fields
    if (!event.title || !event.date || !event.location || !event.startTime || !event.endTime) {
      console.warn("Skipping event with missing required fields:", event._id);
      return false;
    }

    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today && event.active;
  });

  if (upcomingEvents.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://olgishcakes.co.uk/#upcoming-events",
    name: "Upcoming Market Events - Olgish Cakes",
    description:
      "Find Olgish Cakes at these upcoming farmers markets and local events in Leeds and Yorkshire",
    numberOfItems: upcomingEvents.length,
    url: "https://olgishcakes.co.uk",
    itemListElement: upcomingEvents.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: generateEventStructuredData(event),
    })),
    mainEntity: {
      "@type": "Organization",
      "@id": "https://olgishcakes.co.uk/#organization",
      name: "Olgish Cakes",
      url: "https://olgishcakes.co.uk",
      description: "Authentic Ukrainian bakery specializing in traditional honey cakes",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Leeds",
        addressRegion: "West Yorkshire",
        postalCode: "LS17",
        addressCountry: "GB",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+44 786 721 8194",
        email: "hello@olgishcakes.co.uk",
        contactType: "customer service",
      },
      sameAs: ["https://www.instagram.com/olgish_cakes", "https://www.facebook.com/olgishcakes"],
    },
  };
}

/**
 * Generate additional SEO metadata for events
 */
export function generateEventSEOMetadata(events: MarketSchedule[]) {
  const upcomingEvents = events.filter(event => {
    // Check if event has required fields
    if (!event.title || !event.date || !event.location) {
      return false;
    }

    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today && event.active;
  });

  if (upcomingEvents.length === 0) {
    return {};
  }

  const nextEvent = upcomingEvents[0];
  const eventDate = new Date(nextEvent.date);
  const formattedDate = eventDate.toLocaleDateString("en-GB");

  // Generate event-specific keywords
  const eventKeywords = [
    "farmers market Leeds",
    "Ukrainian cakes market",
    "honey cake farmers market",
    "local market Leeds",
    "artisan food market",
    "traditional Ukrainian desserts market",
    `${nextEvent.location} market`,
    "weekend market Leeds",
    "handmade cakes market",
    "authentic Ukrainian bakery market",
    "medovik farmers market",
    "local food vendor Leeds",
    "market stall Ukrainian cakes",
    "traditional baking market",
    "heritage food market Leeds",
  ];

  return {
    additionalKeywords: eventKeywords,
    eventDescription: `Find Olgish Cakes at ${nextEvent.location} on ${formattedDate}. Taste authentic Ukrainian honey cakes and traditional desserts at our market stall.`,
    eventTitle: `${nextEvent.title} - Authentic Ukrainian Cakes | ${formattedDate}`,
    nextEventDate: formattedDate,
    nextEventLocation: nextEvent.location,
    totalUpcomingEvents: upcomingEvents.length,
  };
}
