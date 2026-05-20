import { defineMigration, at, unset } from 'sanity/migrate'

export default defineMigration({
  title: 'Remove showOnHomepage from collection documents',
  migrate: {
    document(doc) {
      if (doc._type !== 'collection') {
        return
      }

      if (!Object.prototype.hasOwnProperty.call(doc, 'showOnHomepage')) {
        return
      }

      return [at('showOnHomepage', unset())]
    }
  }
})
