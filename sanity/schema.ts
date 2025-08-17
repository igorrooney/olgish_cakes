import { type SchemaTypeDefinition } from "sanity";
import cake from "./schemas/cake";
import giftHamper from "./schemas/giftHamper";
import testimonial from "./schemas/testimonial";
import faq from "./schemas/faq";
import marketSchedule from "./schemas/marketSchedule";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [cake, giftHamper, testimonial, faq, marketSchedule],
};
