import {
  CakesOrderInput,
  GiftHampersOrderInput
} from '../components/CollectionsOrderInput'

interface ValidationRule {
  unique: () => ValidationRule
}

export default {
  name: 'productsDisplayOrder',
  title: 'Products Display Order',
  type: 'document',
  fields: [
    {
      name: 'cakesOrder',
      title: 'Cakes Order',
      type: 'array',
      description: 'All cakes are loaded automatically. New ones appear at the top; drag and drop to set website order.',
      components: {
        input: CakesOrderInput
      },
      options: {
        sortable: true,
        disableActions: ['add', 'addAfter', 'addBefore', 'copy', 'duplicate', 'remove']
      },
      of: [
        {
          type: 'reference',
          to: [{ type: 'cake' }],
          options: {
            disableNew: true
          }
        }
      ],
      validation: (Rule: ValidationRule) => Rule.unique()
    },
    {
      name: 'giftHampersOrder',
      title: 'Gift Hampers Order',
      type: 'array',
      description: 'All gift hampers are loaded automatically. New ones appear at the top; drag and drop to set website order.',
      components: {
        input: GiftHampersOrderInput
      },
      options: {
        sortable: true,
        disableActions: ['add', 'addAfter', 'addBefore', 'copy', 'duplicate', 'remove']
      },
      of: [
        {
          type: 'reference',
          to: [{ type: 'giftHamper' }],
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
        title: 'Products Display Order',
        subtitle: 'Use drag and drop to arrange cakes and gift hampers'
      }
    }
  }
}
