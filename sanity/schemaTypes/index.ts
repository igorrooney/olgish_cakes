import { type SchemaTypeDefinition } from 'sanity'
import { cakes } from './cakes'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [cakes],
}
