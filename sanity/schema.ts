import { type SchemaTypeDefinition } from "sanity";
import cake from "./schemas/cake";
import testimonial from "./schemas/testimonial";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [cake, testimonial],
};
