import { createFieldHelpFieldComponent, type FieldHelpContent } from './FieldHelpField'

export const articleTopicHelpFieldPaths = [
  'title',
  'slug',
  'description',
  'order',
] as const

export type ArticleTopicHelpFieldPath = (typeof articleTopicHelpFieldPaths)[number]

export const articleTopicFieldHelpContent = {
  title: {
    title: 'Title',
    whatItIs: 'This is the name of the topic group.',
    whatToEnter: 'Write a short, clear topic name that matches the kind of articles that belong in this group.',
    whyItMatters: 'This label is shown to readers, so it should be simple and easy to understand.',
    whereUsed: [
      'Topic badges on article pages',
      'Blog archive topic filters',
      'Article grouping across the blog',
    ],
    examples: [
      'Cake by post',
      'Birthday cakes',
      'Gift ideas',
    ],
  },
  slug: {
    title: 'Slug',
    whatItIs: 'This is the short URL-friendly version of the topic name.',
    whatToEnter: 'Use lowercase words with hyphens. Keep it simple and closely matched to the topic title.',
    whyItMatters: 'This helps the site use the topic consistently in filters and links.',
    whereUsed: [
      'Blog topic filter links',
      'Internal topic matching in article pages and archive pages',
    ],
    examples: [
      'cake-by-post',
      'birthday-cakes',
      'gift-ideas',
    ],
  },
  description: {
    title: 'Description',
    whatItIs: 'This is a short internal summary of what the topic covers.',
    whatToEnter: 'Write one brief sentence explaining what belongs in this topic.',
    whyItMatters: 'It helps keep topic names clear and makes the topic easier to understand when managing content.',
    whereUsed: [
      'Topic preview inside Sanity',
      'Editorial reference for content managers',
    ],
    examples: [
      'Articles about cakes that can be sent safely across the UK.',
      'Guides that help customers choose cakes for birthdays and celebrations.',
    ],
  },
  order: {
    title: 'Display Order',
    whatItIs: 'This controls the position of the topic in the blog filter list.',
    whatToEnter: 'Use a whole number. Lower numbers appear first.',
    whyItMatters: 'It lets you choose which topics are shown first to readers instead of relying on alphabetical order.',
    whereUsed: [
      'Blog archive topic filters',
      'Topic ordering in the content system',
    ],
    examples: [
      '0 for the main topic you want shown first',
      '1 for the next most important topic',
      'Leave larger numbers for less important topics',
    ],
  },
} satisfies Record<ArticleTopicHelpFieldPath, FieldHelpContent>

const articleTopicFieldHelpComponentsByPath = articleTopicHelpFieldPaths.reduce(
  (componentsByPath, fieldPath) => {
    componentsByPath[fieldPath] = createFieldHelpFieldComponent(articleTopicFieldHelpContent[fieldPath])

    return componentsByPath
  },
  {} as Record<ArticleTopicHelpFieldPath, ReturnType<typeof createFieldHelpFieldComponent>>
)

export function articleTopicFieldHelpComponents(fieldPath: ArticleTopicHelpFieldPath) {
  return {
    components: {
      field: articleTopicFieldHelpComponentsByPath[fieldPath],
    },
  }
}
