export interface MarketSchedule {
  _id: string;
  title: string;
  location: string;
  googleMapsUrl: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  specialOffers?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  featured: boolean;
  active: boolean;
  weatherDependent: boolean;
  image?: {
    asset: {
      _ref: string;
      _type: "reference";
      url?: string;
    };
    alt: string;
    hotspot?: {
      x: number;
      y: number;
      height: number;
      width: number;
    };
    crop?: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
  };
}

export interface MarketSchedulePreview {
  _id: string;
  title: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  featured: boolean;
  active: boolean;
}

export interface UpcomingEvent extends MarketSchedulePreview {
  isToday: boolean;
  isThisWeek: boolean;
  daysUntil: number;
  formattedDate: string;
  formattedTime: string;
}

export interface MarketScheduleFilters {
  featured?: boolean;
  active?: boolean;
  upcoming?: boolean;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
}

export interface MarketScheduleQueryParams {
  filters?: MarketScheduleFilters;
  limit?: number;
  offset?: number;
  sortBy?: "date" | "featured" | "created";
  sortOrder?: "asc" | "desc";
}

export interface MarketScheduleStructuredData {
  "@context": "https://schema.org";
  "@type": "Event";
  "@id": string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: {
    "@type": "Place";
    name: string;
    url: string;
    address?: {
      "@type": "PostalAddress";
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: string;
    };
    geo?: {
      "@type": "GeoCoordinates";
      latitude: number;
      longitude: number;
    };
  };
  organizer: {
    "@type": "Organization";
    name: string;
    url: string;
    email?: string;
    telephone?: string;
  };
  performer?: {
    "@type": "Organization" | "Person";
    name: string;
    url?: string;
  };
  offers?: {
    "@type": "Offer";
    availability: string;
    validFrom?: string;
    url?: string;
    price?: string;
    priceCurrency?: string;
  };
  image?: string;
  url: string;
  eventStatus:
    | "https://schema.org/EventScheduled"
    | "https://schema.org/EventCancelled"
    | "https://schema.org/EventPostponed";
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode";
  isAccessibleForFree?: boolean;
  aggregateRating?: {
    "@type": "AggregateRating";
    ratingValue: string;
    reviewCount: string;
    bestRating?: string;
    worstRating?: string;
  };
}
