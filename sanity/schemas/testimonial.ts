import { createElement } from "react";
import type { ReactNode } from "react";

interface ValidationRule {
  min: (value: number) => ValidationRule;
  max: (value: number) => ValidationRule;
}

interface TestimonialPreviewSelection {
  title?: string;
  subtitle?: string;
  media?: unknown;
}

const fallbackPreviewMedia: ReactNode = createElement("img", {
  src: "/images/placeholder-cake.jpg",
  alt: "Cake placeholder",
  style: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
});

export default {
  name: "testimonial",
  title: "Testimonials",
  type: "document",
  fields: [
    {
      name: "customerName",
      title: "Customer Name",
      type: "string",
      description: "Name or initials of the customer",
    },
    {
      name: "cakeType",
      title: "Cake Type",
      type: "string",
      description: "Type of cake ordered",
    },
    {
      name: "rating",
      title: "Rating",
      type: "number",
      description: "Rating from 1 to 5",
      initialValue: 5,
      validation: (Rule: ValidationRule) => Rule.min(1).max(5),
    },
    {
      name: "date",
      title: "Review Date",
      type: "date",
      description: "Date when the review was given",
    },
    {
      name: "title",
      title: "Review Title",
      type: "string",
      description: "Optional short headline for the testimonial",
    },
    {
      name: "text",
      title: "Review Text",
      type: "text",
      description: "The testimonial content",
    },
    {
      name: "cakeImage",
      title: "Cake Image",
      type: "image",
      description: "Image of the cake being reviewed",
      options: {
        hotspot: true,
      },
    },
    {
      name: "source",
      title: "Review Source",
      type: "string",
      options: {
        list: [
          { title: "Instagram", value: "instagram" },
          { title: "Facebook", value: "facebook" },
          { title: "Google", value: "google" },
          { title: "Trustpilot", value: "trustpilot" },
          { title: "Direct", value: "direct" },
        ],
      },
    },
  ],
  preview: {
    select: {
      title: "customerName",
      subtitle: "cakeType",
      media: "cakeImage",
    },
    prepare({ title, subtitle, media }: TestimonialPreviewSelection) {
      return {
        title: title || "Customer review",
        subtitle: subtitle || "Cake testimonial",
        media: (media as ReactNode) || fallbackPreviewMedia,
      };
    },
  },
};
