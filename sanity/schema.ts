import { type SchemaTypeDefinition } from "sanity";
import cake from "./schemas/cake";
import testimonial from "./schemas/testimonial";
import faq from "./schemas/faq";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [cake, testimonial, faq],
};
