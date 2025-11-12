import { CalendarIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "marketSchedule",
  title: "Market Schedule",
  type: "document",
  icon: CalendarIcon,
  fields: [
    defineField({
      name: "title",
      title: "Event Title",
      type: "string",
      validation: Rule => Rule.required().min(3).max(100),
      description: "Name of the market or event (e.g., 'Meanwood Farmers Market')",
    }),

    defineField({
      name: "location",
      title: "Location",
      type: "string",
      validation: Rule => Rule.required().min(3).max(100),
      description: "Market location or venue name",
    }),
    defineField({
      name: "googleMapsUrl",
      title: "Google Maps Link",
      type: "url",
      validation: Rule => Rule.required(),
      description: "Paste the Google Maps share link here for exact location",
      placeholder: "https://maps.app.goo.gl/xyz or https://www.google.com/maps/place/...",
    }),
    defineField({
      name: "date",
      title: "Event Date",
      type: "date",
      validation: Rule => Rule.required(),
      options: {
        dateFormat: "DD/MM/YYYY",
      },
    }),
    defineField({
      name: "startTime",
      title: "Start Time",
      type: "string",
      validation: Rule =>
        Rule.required().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
          name: "time",
          invert: false,
        }),
      description: "Format: HH:MM (24-hour format)",
      placeholder: "09:00",
    }),
    defineField({
      name: "endTime",
      title: "End Time",
      type: "string",
      validation: Rule =>
        Rule.required().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
          name: "time",
          invert: false,
        }),
      description: "Format: HH:MM (24-hour format)",
      placeholder: "16:00",
    }),

    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      description: "Brief description of what visitors can expect",
    }),
    defineField({
      name: "specialOffers",
      title: "Special Offers",
      type: "array",
      of: [{ type: "string" }],
      description: "Special cakes or offers available at this event",
    }),
    defineField({
      name: "contactInfo",
      title: "Contact Information",
      type: "object",
      fields: [
        defineField({
          name: "phone",
          title: "Phone Number",
          type: "string",
          validation: Rule =>
            Rule.regex(/^\+?[\d\s\-()]+$/, {
              name: "phone",
              invert: false,
            }),
        }),
        defineField({
          name: "email",
          title: "Email",
          type: "string",
          validation: Rule => Rule.email(),
        }),
        defineField({
          name: "whatsapp",
          title: "WhatsApp Number",
          type: "string",
          validation: Rule =>
            Rule.regex(/^\+?[\d\s\-()]+$/, {
              name: "phone",
              invert: false,
            }),
        }),
      ],
    }),
    defineField({
      name: "featured",
      title: "Featured Event",
      type: "boolean",
      description: "Feature this event prominently on the home page",
      initialValue: false,
    }),
    defineField({
      name: "active",
      title: "Active",
      type: "boolean",
      description: "Show this event on the website",
      initialValue: true,
    }),
    defineField({
      name: "weatherDependent",
      title: "Weather Dependent",
      type: "boolean",
      description: "This event may be cancelled due to weather",
      initialValue: false,
    }),

    defineField({
      name: "image",
      title: "Event Image",
      type: "image",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "Important for SEO and accessibility",
          validation: Rule => Rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      location: "location",
      date: "date",
      active: "active",
      featured: "featured",
    },
    prepare({ title, location, date, active, featured }) {
      const formattedDate = date ? new Date(date).toLocaleDateString("en-GB") : "No date";
      const status = featured ? "⭐ Featured" : active ? "✅ Active" : "❌ Inactive";

      return {
        title: `${title} - ${formattedDate}`,
        subtitle: `${location} | ${status}`,
      };
    },
  },
  orderings: [
    {
      title: "Date (newest first)",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
    {
      title: "Date (oldest first)",
      name: "dateAsc",
      by: [{ field: "date", direction: "asc" }],
    },
    {
      title: "Featured first",
      name: "featured",
      by: [
        { field: "featured", direction: "desc" },
        { field: "date", direction: "asc" },
      ],
    },
  ],
});
