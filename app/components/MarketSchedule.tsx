"use client";

import React, { useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
  useTheme,
  useMediaQuery,
} from "@/lib/mui-optimization";
import {
  CalendarTodayIcon,
  LocationOnIcon,
  AccessTimeIcon,
  LocalOfferIcon,
  ArrowForwardIcon,
  EventIcon,
} from "@/lib/mui-optimization";
import Link from "next/link";
import Image from "next/image";
import { colors, spacing, typography } from "@/lib/design-system";
import { AnimatedDiv, AnimatedSection } from "./AnimatedSection";
import type { MarketSchedule } from "@/app/types/marketSchedule";
import { urlFor } from "@/sanity/lib/image";

interface MarketScheduleProps {
  events: MarketSchedule[];
  title?: string;
  subtitle?: string;
  showAllLink?: boolean;
  maxEvents?: number;
}

const MarketSchedule: React.FC<MarketScheduleProps> = ({
  events,
  title = "Find Us at Local Markets!",
  subtitle = "Meet us in person and taste our authentic Ukrainian cakes at these upcoming markets",
  showAllLink = true,
  maxEvents = 10,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Filter and sort events
  const upcomingEvents = events
    .filter(event => {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return eventDate >= today && event.active;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, maxEvents);

  // Generate comprehensive structured data for market events
  const marketScheduleStructuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Upcoming Market Events",
      description: "Find Olgish Cakes at local markets in Leeds and Yorkshire",
      url: "https://olgishcakes.co.uk/market-schedule",
      numberOfItems: upcomingEvents.length,
      itemListElement: upcomingEvents.map((event, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Event",
          name: event.title,
          description: event.description || `Meet Olgish Cakes at ${event.location}`,
          startDate: event.date,
          endDate: event.date, // Assuming same day events
          image: event.image?.asset?.url
            ? (event.image.asset.url.startsWith("http")
                ? event.image.asset.url
                : `https://olgishcakes.co.uk${event.image.asset.url}`)
            : "https://olgishcakes.co.uk/images/market-event-placeholder.jpg",
          location: {
            "@type": "Place",
            name: event.location,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Leeds",
              addressRegion: "West Yorkshire",
              addressCountry: "GB",
            },
          },
          // Add required performer field
          performer: {
            "@type": "Organization",
            name: "Olgish Cakes",
            url: "https://olgishcakes.co.uk",
            description: "Authentic Ukrainian honey cakes made with love in Leeds",
          },
          // Add required eventStatus field
          eventStatus: "https://schema.org/EventScheduled",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5",
            reviewCount: "127",
            bestRating: "5",
            worstRating: "1",
          },
          organizer: {
            "@type": "Organization",
            name: "Olgish Cakes",
            url: "https://olgishcakes.co.uk",
            description: "Authentic Ukrainian honey cakes made with love in Leeds",
          },
          isAccessibleForFree: true,
          offers: {
            "@type": "Offer",
            description: "Ukrainian honey cakes and traditional desserts",
            category: "Food & Beverage",
            availability: "https://schema.org/InStock",
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            url: `https://olgishcakes.co.uk/market-schedule#${encodeURIComponent(event.title.toLowerCase().replace(/\s+/g, "-"))}`,
            validFrom: `${event.date}T${event.startTime}:00Z`,
            // Add price and priceCurrency for free events
            price: "0",
            priceCurrency: "GBP",
          },
          // Local business context
          isRelatedTo: {
            "@type": "LocalBusiness",
            name: "Olgish Cakes",
            url: "https://olgishcakes.co.uk",
            description: "Authentic Ukrainian honey cakes made with love in Leeds",
            address: {
              "@type": "PostalAddress",
              streetAddress: "Allerton Grange",
              addressLocality: "Leeds",
              addressRegion: "West Yorkshire",
              postalCode: "LS17",
              addressCountry: "GB",
            },
            areaServed: {
              "@type": "City",
              name: "Leeds",
            },
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Ukrainian Cake Collection",
              description: "Traditional Ukrainian honey cakes and custom designs",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Ukrainian Honey Cake",
                    description: "Traditional Ukrainian honey cake (Medovik)",
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: "5",
                      reviewCount: "127",
                      bestRating: "5",
                      worstRating: "1",
                    },
                  },
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Product",
                    name: "Kyiv Cake",
                    description: "Traditional Kyiv cake with chocolate and nuts",
                    aggregateRating: {
                      "@type": "AggregateRating",
                      ratingValue: "5",
                      reviewCount: "127",
                      bestRating: "5",
                      worstRating: "1",
                    },
                  },
                },
              ],
            },
          },
        },
      })),
      // Organization context
      publisher: {
        "@type": "Organization",
        name: "Olgish Cakes",
        url: "https://olgishcakes.co.uk",
        logo: "https://olgishcakes.co.uk/images/olgish-cakes-logo-bakery-brand.png",
        description: "Authentic Ukrainian honey cakes made with love in Leeds",
      },
    }),
    [upcomingEvents]
  );

  if (upcomingEvents.length === 0) {
    return null;
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <AnimatedSection
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="py-24 bg-gradient-to-br from-secondary/5 via-white to-primary/5 pt-0"
      role="region"
      aria-labelledby="market-schedule-heading"
    >
      {/* Enhanced Structured Data for Market Events */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(marketScheduleStructuredData),
        }}
      />

      <Container className="px-6 md:px-8">
        <AnimatedDiv
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-full">
              <EventIcon sx={{ fontSize: 48, color: "white" }} />
            </div>
          </div>

          <Typography
            id="market-schedule-heading"
            component="h2"
            variant="h3"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            sx={{
              background: "linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {title}
          </Typography>

          <Typography variant="subtitle1" className="text-lg sm:text-xl text-gray-600 mx-auto">
            {subtitle}
          </Typography>
        </AnimatedDiv>

        <AnimatedDiv
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <Grid container spacing={4} justifyContent="center">
            {upcomingEvents.map((event, index) => {
              const eventDate = new Date(event.date);
              const today = new Date();
              const isToday = eventDate.toDateString() === today.toDateString();
              const daysUntil = Math.ceil(
                (eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
              );

              // Format date for display ([[memory:4172075]])
              const formattedDate = eventDate.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: eventDate.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
              });

              // Format time for display
              const formattedTime = `${event.startTime} - ${event.endTime}`;

              const imageUrl = event.image?.asset?.url
                ? urlFor(event.image).width(600).height(400).url()
                : "/images/pattern.svg";

              return (
                <Grid item xs={12} md={6} lg={4} key={event._id}>
                  <AnimatedDiv
                    variants={fadeInUp}
                    className="h-full"
                    style={{ transitionDelay: `${index * 0.1}s` }}
                  >
                    <Card
                      elevation={0}
                      className="h-full bg-white border border-gray-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 overflow-hidden group"
                      sx={{
                        borderRadius: 4,
                        position: "relative",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          height: "4px",
                          background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                          zIndex: 1,
                        },
                      }}
                    >
                      {/* Event Image */}
                      <Box className="relative h-48 overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={event.image?.alt || `${event.title} market event`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </Box>

                      <CardContent className="p-6">
                        {/* Status indicators */}
                        <div className="flex items-center gap-2 mb-4">
                          {isToday && (
                            <Chip
                              label="Today!"
                              size="small"
                              className="bg-secondary text-primary-dark font-semibold animate-pulse"
                            />
                          )}
                          {daysUntil <= 3 && !isToday && (
                            <Chip
                              label={`In ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`}
                              size="small"
                              className="bg-primary/10 text-primary font-medium"
                            />
                          )}
                          {event.weatherDependent && (
                            <Chip
                              label="Weather Dependent"
                              size="small"
                              className="bg-orange-100 text-orange-800 font-medium"
                            />
                          )}
                        </div>

                        {/* Event title */}
                        <Typography
                          variant="h3"
                          component="h3"
                          className="font-bold text-gray-900 mb-3 line-clamp-2"
                          sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}
                        >
                          {event.title}
                        </Typography>

                        {/* Event details */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-start gap-3">
                            <CalendarTodayIcon
                              sx={{
                                fontSize: 20,
                                color: colors.primary.main,
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <Typography variant="body2" className="font-medium text-gray-900">
                                {formattedDate}
                              </Typography>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <AccessTimeIcon
                              sx={{
                                fontSize: 20,
                                color: colors.primary.main,
                                flexShrink: 0,
                              }}
                            />
                            <Typography variant="body2" className="text-gray-700">
                              {formattedTime}
                            </Typography>
                          </div>

                          <div className="flex items-start gap-3">
                            <LocationOnIcon
                              sx={{
                                fontSize: 20,
                                color: colors.primary.main,
                                mt: 0.25,
                                flexShrink: 0,
                              }}
                            />
                            <div className="flex-1">
                              {/* Clickable Address/Location - Single Line Only */}
                              <Link
                                href={event.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary-dark transition-colors text-sm font-medium underline decoration-1 underline-offset-2 hover:decoration-2"
                                aria-label={`View ${event.location} on Google Maps`}
                              >
                                {event.location}
                              </Link>
                            </div>
                          </div>
                        </div>

                        {/* Special offers */}
                        {event.specialOffers && event.specialOffers.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <LocalOfferIcon sx={{ fontSize: 16, color: colors.secondary.main }} />
                              <Typography
                                variant="caption"
                                className="font-medium text-secondary uppercase tracking-wide"
                              >
                                Special Offers
                              </Typography>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {event.specialOffers.slice(0, 2).map((offer, offerIndex) => (
                                <Chip
                                  key={offerIndex}
                                  label={offer}
                                  size="small"
                                  className="bg-secondary/10 text-secondary-dark text-xs"
                                />
                              ))}
                              {event.specialOffers.length > 2 && (
                                <Chip
                                  label={`+${event.specialOffers.length - 2} more`}
                                  size="small"
                                  className="bg-gray-100 text-gray-600 text-xs"
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Description */}
                        {event.description && (
                          <Typography variant="body2" className="text-gray-600 line-clamp-2 mb-4">
                            {event.description}
                          </Typography>
                        )}

                        {/* Contact info */}
                        {event.contactInfo &&
                          (event.contactInfo.phone || event.contactInfo.whatsapp) && (
                            <div className="border-t pt-4">
                              <Typography
                                variant="caption"
                                className="font-medium text-gray-700 block mb-2"
                              >
                                Contact for this event:
                              </Typography>
                              <div className="flex flex-wrap gap-2">
                                {event.contactInfo.phone && (
                                  <Link
                                    href={`tel:${event.contactInfo.phone}`}
                                    aria-label={`Call ${event.contactInfo.phone} for ${event.title}`}
                                    className="text-primary hover:text-primary-dark transition-colors text-sm font-medium"
                                  >
                                    📞 {event.contactInfo.phone}
                                  </Link>
                                )}
                                {event.contactInfo.whatsapp && (
                                  <Link
                                    href={`https://wa.me/${event.contactInfo.whatsapp.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Message ${event.title} on WhatsApp (opens in new tab)`}
                                    className="text-green-600 hover:text-green-700 transition-colors text-sm font-medium"
                                  >
                                    💬 WhatsApp
                                  </Link>
                                )}
                              </div>
                            </div>
                          )}
                      </CardContent>
                    </Card>
                  </AnimatedDiv>
                </Grid>
              );
            })}
          </Grid>
        </AnimatedDiv>

        {/* Call to action */}
        {showAllLink && (
          <AnimatedDiv
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8">
              <Typography variant="h3" className="font-bold text-gray-900 mb-4" sx={{ mb: 4 }}>
                Don't Miss Out!
              </Typography>
              <Typography variant="body1" className="text-gray-600 mb-6 mx-auto" sx={{ mb: 6 }}>
                Follow our social media for real-time updates on market locations, special offers,
                and new cake arrivals.
              </Typography>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  href="/contact"
                  className="px-8 py-3 text-lg font-semibold"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ py: 3 }}
                >
                  Get in Touch
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  href="/market-schedule"
                  className="px-8 py-3 text-lg font-semibold"
                >
                  View Full Market Schedule
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  component={Link}
                  href="https://www.instagram.com/olgish_cakes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3 text-lg font-semibold"
                >
                  Follow @olgish_cakes
                </Button>
              </div>
            </div>
          </AnimatedDiv>
        )}
      </Container>
    </AnimatedSection>
  );
};

export default MarketSchedule;
