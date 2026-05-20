import { defineMigration, at, setIfMissing } from 'sanity/migrate'

export default defineMigration({
  title: 'Backfill testimonial ratings',
  documentTypes: ['testimonial'],
  migrate: {
    document() {
      return at('rating', setIfMissing(5))
    }
  }
})
