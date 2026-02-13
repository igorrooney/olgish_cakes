import {
  CakeCollectionsOrderInput,
  GiftHamperCollectionsOrderInput
} from '../components/CollectionsOrderInput'

interface ValidationRule {
  unique: () => ValidationRule
}

export default {
  name: 'collectionsDisplayOrder',
  title: 'Collections Display Order',
  type: 'document',
  fields: [
    {
      name: 'cakeCollectionsOrder',
      title: 'Cakes Collections Order',
      type: 'array',
      description: 'All collections are loaded automatically. New ones appear at the top; drag and drop to set website order.',
      components: {
        input: CakeCollectionsOrderInput
      },
      options: {
        sortable: true,
        disableActions: ['add', 'addAfter', 'addBefore', 'copy', 'duplicate', 'remove']
      },
      of: [
        {
          type: 'reference',
          to: [{ type: 'collection' }],
          options: {
            disableNew: true
          }
        }
      ],
      validation: (Rule: ValidationRule) => Rule.unique()
    },
    {
      name: 'giftHamperCollectionsOrder',
      title: 'Gift Hampers Collections Order',
      type: 'array',
      description: 'All collections are loaded automatically. New ones appear at the top; drag and drop to set website order.',
      components: {
        input: GiftHamperCollectionsOrderInput
      },
      options: {
        sortable: true,
        disableActions: ['add', 'addAfter', 'addBefore', 'copy', 'duplicate', 'remove']
      },
      of: [
        {
          type: 'reference',
          to: [{ type: 'giftHamperCollection' }],
          options: {
            disableNew: true
          }
        }
      ],
      validation: (Rule: ValidationRule) => Rule.unique()
    }
  ],
  preview: {
    prepare() {
      return {
        title: 'Collections Display Order',
        subtitle: 'Use drag and drop to arrange cakes and gift hamper collections'
      }
    }
  }
}
