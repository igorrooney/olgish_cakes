import { type SchemaTypeDefinition } from "sanity";
import cake from "./schemas/cake";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [cake],
};
