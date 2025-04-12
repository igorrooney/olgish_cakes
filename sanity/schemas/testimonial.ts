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
      validation: (Rule: any) => Rule.min(1).max(5),
    },
    {
      name: "date",
      title: "Review Date",
      type: "date",
      description: "Date when the review was given",
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
  },
};
