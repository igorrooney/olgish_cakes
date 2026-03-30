import { createFieldHelpFieldComponent, type FieldHelpContent } from './FieldHelpField'

export const articleHelpFieldPaths = [
  'title',
  'slug',
  'summary',
  'dek',
  'coverImage',
  'coverImage.alt',
  'cardImage',
  'cardImage.alt',
  'body',
  'bodyImage.alt',
  'bodyImage.caption',
  'topic',
  'primaryProduct',
  'relatedProducts',
  'publishedAt',
  'editorialUpdatedAt',
  'refreshEditorialUpdatedAt',
  'faqItems',
  'faqItems.question',
  'faqItems.answer',
  'seo',
  'seo.metaTitle',
  'seo.metaDescription',
  'seo.keywords',
  'seo.canonicalUrl',
  'seo.priority',
  'seo.changefreq',
] as const

export type ArticleHelpFieldPath = (typeof articleHelpFieldPaths)[number]

export const articleFieldHelpContent = {
  title: {
    title: 'Title',
    whatItIs: 'This is the main headline of the article.',
    whatToEnter: 'Write a clear, natural title that tells the reader exactly what the article is about.',
    whyItMatters: 'People see this first. It also helps with page titles and article cards if you do not add separate SEO wording.',
    whereUsed: [
      'The main heading on the article page',
      'Blog archive cards',
      'Page metadata when no separate SEO title is set',
    ],
    examples: [
      'Cake by post in the UK: what actually travels well',
      'How to choose a birthday cake that can be sent by post',
    ],
  },
  slug: {
    title: 'Slug',
    whatItIs: 'This is the short URL part that comes after /blog/.',
    whatToEnter: 'Use simple lowercase words with hyphens. Keep it short and closely matched to the topic.',
    whyItMatters: 'It becomes the article link people share and Google reads.',
    whereUsed: [
      'The article URL',
      'Internal links across the site',
      'Canonical and metadata links',
    ],
    examples: [
      'cake-by-post-uk-guide',
      'best-cakes-you-can-send-by-post-uk',
    ],
  },
  summary: {
    title: 'Summary',
    whatItIs: 'This is the short preview text for the article.',
    whatToEnter: 'Write 1 or 2 plain sentences that explain the value of the article without repeating the title.',
    whyItMatters: 'It helps people decide whether to open the article from the archive page.',
    whereUsed: [
      'Blog archive cards',
      'Short article previews',
    ],
    examples: [
      'A practical guide to which cakes post well, what to avoid, and how delivery affects the final result.',
      'Straight answers on flavour, packaging, timing, and the difference between postal cakes and local bespoke orders.',
    ],
  },
  dek: {
    title: 'Dek',
    whatItIs: 'This is the short introduction shown under the article title.',
    whatToEnter: 'Write a warm, human summary that sets up the article and gives the reader a reason to keep reading.',
    whyItMatters: 'It shapes the first impression on the article page and is also used in page descriptions when no SEO description is set.',
    whereUsed: [
      'Directly under the article title',
      'Page and social descriptions when no separate SEO description is set',
      'Article structured data description',
    ],
    examples: [
      'If you are choosing a cake to send across the UK, this guide explains what travels safely and what is better kept for local delivery.',
      'Here is the honest version: some cakes are ideal by post, some are risky, and the difference matters before you place an order.',
    ],
  },
  coverImage: {
    title: 'Cover Image',
    whatItIs: 'This is the main image for the article.',
    whatToEnter: 'Upload the best main photo that represents the article clearly.',
    whyItMatters: 'It sets the tone of the article and is used as the main visual in several places.',
    whereUsed: [
      'The large image near the top of the article page',
      'Metadata and sharing image fallback',
      'Related article visuals when no card image is set',
    ],
    examples: [
      'A clean hero photo of the cake or hamper the article is talking about',
      'A close-up that clearly shows the product, texture, or packaging',
    ],
  },
  'coverImage.alt': {
    title: 'Cover Image Alt Text',
    whatItIs: 'This is the written description of the cover image.',
    whatToEnter: 'Describe what is actually visible in the picture, in plain words, as if you were explaining it to someone who cannot see it.',
    whyItMatters: 'It supports accessibility and helps search engines understand the image properly.',
    whereUsed: [
      'The main article image',
      'Metadata image alt fallback',
    ],
    examples: [
      'Honey cake wrapped for postal delivery with a sliced piece on a white plate',
      'Gift hamper with medovik cake, tea, and packaging shown on a kitchen table',
    ],
  },
  cardImage: {
    title: 'Card Image',
    whatItIs: 'This is an optional image just for article cards.',
    whatToEnter: 'Use this only if the main cover image does not crop well in archive cards.',
    whyItMatters: 'It gives you better control over how the article looks in the blog listing.',
    whereUsed: [
      'Blog archive cards',
      'Related article cards',
    ],
    examples: [
      'A tighter crop that keeps the cake centred in a smaller card',
      'A simpler version of the main photo with less empty space',
    ],
  },
  'cardImage.alt': {
    title: 'Card Image Alt Text',
    whatItIs: 'This is the written description of the card image crop.',
    whatToEnter: 'Describe the version of the image that appears in the card, not the article topic in general.',
    whyItMatters: 'The card image can be a different crop, so the description should match what the reader would actually see.',
    whereUsed: [
      'Blog archive cards',
      'Related article cards',
    ],
    examples: [
      'Close crop of a layered honey cake with frosting detail',
      'Postal cake box opened to show the decorated cake inside',
    ],
  },
  body: {
    title: 'Body',
    whatItIs: 'This is the main content of the article.',
    whatToEnter: 'Add the full article text, headings, lists, quotes, and images in the order you want people to read them.',
    whyItMatters: 'This is the actual article people come to read. It is the main source of value for readers and search traffic.',
    whereUsed: [
      'The main article content area',
      'Reading time and table of contents generation',
    ],
    examples: [
      'Use H2 headings for clear sections such as what travels well, what to avoid, and ordering tips.',
      'Add a short image caption only when it helps explain the photo.',
    ],
  },
  'bodyImage.alt': {
    title: 'Inline Image Alt Text',
    whatItIs: 'This is the written description for an image placed inside the article body.',
    whatToEnter: 'Describe exactly what the inline image shows and why it matters in that part of the article.',
    whyItMatters: 'It helps readers using screen readers and keeps image meaning clear.',
    whereUsed: [
      'Images placed inside the article body',
    ],
    examples: [
      'Boxed postal cake opened to show internal padding and cake placement',
      'Slice of pistachio medovik showing texture and cream layers',
    ],
  },
  'bodyImage.caption': {
    title: 'Inline Image Caption',
    whatItIs: 'This is the small note shown with an image inside the article.',
    whatToEnter: 'Add a caption only if it gives useful context, such as what the reader should notice in the photo.',
    whyItMatters: 'A good caption can add clarity, but unnecessary captions create clutter.',
    whereUsed: [
      'Images placed inside the article body',
    ],
    examples: [
      'This packaging style is used for cakes that travel better by post.',
      'A cleaner outer finish usually holds up better than tall fragile decorations.',
    ],
  },
  topic: {
    title: 'Topic',
    whatItIs: 'This is the category the article belongs to.',
    whatToEnter: 'Pick the topic that best matches the main subject of the article.',
    whyItMatters: 'It groups similar articles together and helps readers filter the archive.',
    whereUsed: [
      'Topic badge on the article page',
      'Blog archive filters',
      'Article grouping and related content',
    ],
    examples: [
      'Cake by post',
      'Birthday cakes',
    ],
  },
  primaryProduct: {
    title: 'Primary Product',
    whatItIs: 'This is the main product you want to feature in the article.',
    whatToEnter: 'Choose one cake or hamper that is the best match for the article topic.',
    whyItMatters: 'It gives the article a clear product recommendation and can add a product section on the page.',
    whereUsed: [
      'Featured product section on the article page',
      'Metadata image fallback if article images are missing',
    ],
    examples: [
      'A postal honey cake if the article is about cakes that travel well',
      'A gift hamper if the article is about sending a present by post',
    ],
  },
  relatedProducts: {
    title: 'Related Products',
    whatItIs: 'These are extra products connected to the article.',
    whatToEnter: 'Add up to four relevant products that support the topic naturally.',
    whyItMatters: 'It helps connect useful editorial content with the products people may want next.',
    whereUsed: [
      'Article product recommendations',
      'Fallback featured product if no primary product is set',
    ],
    examples: [
      'A postal cake, a gift hamper, and a seasonal cake that fit the same buying need',
      'Products that solve the next question a reader is likely to have',
    ],
  },
  publishedAt: {
    title: 'Published At',
    whatItIs: 'This is the article publication date and time.',
    whatToEnter: 'Set the date and time when the article should count as published.',
    whyItMatters: 'The article stays out of the live site until this time is reached.',
    whereUsed: [
      'Published date shown on the article page',
      'Blog archive ordering',
      'Metadata and structured data',
    ],
    examples: [
      '2026-04-02 09:00 for a morning publish',
      'A future date if you want the article to go live later',
    ],
  },
  editorialUpdatedAt: {
    title: 'Editorial Updated At',
    whatItIs: 'This is the reader-facing last updated date.',
    whatToEnter: 'You do not type in this field. It is set automatically when you publish with the refresh option turned on.',
    whyItMatters: 'It tells readers when the article was meaningfully updated, not just technically edited.',
    whereUsed: [
      'Last updated date on the article page',
      'Modified date in metadata and structured data',
    ],
    examples: [
      'After rewriting guidance because delivery policy changed',
      'After updating product recommendations in a way readers should notice',
    ],
  },
  refreshEditorialUpdatedAt: {
    title: 'Refresh Editorial Updated Date On Next Publish',
    whatItIs: 'This is a simple on or off switch for the next publish.',
    whatToEnter: 'Turn it on only when your changes are important enough that readers should see a new updated date.',
    whyItMatters: 'It prevents the article from showing a fresh updated date for tiny edits that do not matter to readers.',
    whereUsed: [
      'Controls the editorial updated date on publish',
      'Affects the visible last updated label and metadata modified date',
    ],
    examples: [
      'Turn it on after changing delivery advice, timings, or key recommendations',
      'Leave it off after fixing a typo or small wording tweak',
    ],
  },
  faqItems: {
    title: 'FAQ Items',
    whatItIs: 'These are question and answer pairs shown near the end of the article.',
    whatToEnter: 'Add only questions that are genuinely answered in a clear, useful way.',
    whyItMatters: 'Good FAQs help readers quickly find practical answers and can support search understanding when they match the page content.',
    whereUsed: [
      'FAQ section on the article page',
      'FAQ structured data when visible questions and answers are present',
    ],
    examples: [
      'Can you really send a cake by post in the UK?',
      'Which cake styles are better for delivery than for local bespoke orders?',
    ],
  },
  'faqItems.question': {
    title: 'FAQ Question',
    whatItIs: 'This is the question the reader may ask.',
    whatToEnter: 'Write one clear, natural question in the same words a customer might use.',
    whyItMatters: 'A specific question makes the FAQ easier to scan and more useful.',
    whereUsed: [
      'FAQ section heading for each item',
      'FAQ structured data question text',
    ],
    examples: [
      'Which cakes travel best by post?',
      'How far in advance should I order a postal cake?',
    ],
  },
  'faqItems.answer': {
    title: 'FAQ Answer',
    whatItIs: 'This is the answer to the FAQ question.',
    whatToEnter: 'Give a direct answer first, then add only the detail needed to be helpful.',
    whyItMatters: 'Readers usually want a fast answer here, not a full article again.',
    whereUsed: [
      'FAQ section content on the article page',
      'FAQ structured data answer text',
    ],
    examples: [
      'Yes, but the cake style matters. Firmer layered cakes usually travel better than tall soft sponge designs.',
      'Order as early as you can, especially for weekends or gift dates, so there is time for baking and dispatch.',
    ],
  },
  seo: {
    title: 'SEO',
    whatItIs: 'These are optional search settings for the article.',
    whatToEnter: 'Only fill these in when you need more control over how the page appears in search, social sharing, or the sitemap. If the normal article title and intro already read well, it is often better to leave some of these blank.',
    whyItMatters: 'These settings help shape the technical version of the page, but they do not replace useful content. Think of them as fine-tuning, not the main job.',
    whereUsed: [
      'Page metadata',
      'Search and social sharing output',
      'Sitemap hints',
    ],
    examples: [
      'Add a custom meta title if the article title is strong for readers but too long for search snippets',
      'Leave fields blank when the defaults already read well',
    ],
  },
  'seo.metaTitle': {
    title: 'Meta Title',
    whatItIs: 'This is the search-facing page title.',
    whatToEnter: 'Write a clear title for search results. It can be slightly different from the on-page article title if that makes it clearer, shorter, or more specific for searchers.',
    whyItMatters: 'This often becomes the title shown in the browser tab and can be used in search snippets. It should still sound human, not stuffed with keywords.',
    whereUsed: [
      'Browser tab title',
      'Search and social metadata',
    ],
    examples: [
      'Cake by post UK guide | Olgish Cakes',
      'Best cakes to send by post in the UK | Olgish Cakes',
    ],
  },
  'seo.metaDescription': {
    title: 'Meta Description',
    whatItIs: 'This is the short search summary of the page.',
    whatToEnter: 'Write a natural sentence or two that tells the reader what they will get from the article and why it is useful.',
    whyItMatters: 'Google may rewrite it, so do not obsess over exact wording. Its main job is to help the right person decide to click.',
    whereUsed: [
      'Search metadata',
      'Social sharing description',
    ],
    examples: [
      'A practical guide to choosing cakes that travel well by post across the UK, with honest advice on timing, packaging, and style.',
      'Find out which cakes are safest to send by post and when a local bespoke cake is the better option.',
    ],
  },
  'seo.keywords': {
    title: 'Keywords',
    whatItIs: 'These are optional topic phrases linked to the article.',
    whatToEnter: 'Add a few realistic search phrases that match the article closely. Use them as internal editorial notes, not as a list of every possible keyword variation.',
    whyItMatters: 'These do not magically improve rankings. They are mainly useful for keeping the topic focus clear inside your content workflow.',
    whereUsed: [
      'Page metadata keywords',
      'Article structured data keywords',
    ],
    examples: [
      'cake by post uk',
      'best cakes to send by post',
    ],
  },
  'seo.canonicalUrl': {
    title: 'Canonical URL',
    whatItIs: 'This tells search engines which URL should be treated as the main version of the page.',
    whatToEnter: 'Usually leave this blank. Only add a full URL when you deliberately want search engines to treat another page as the main version of the content.',
    whyItMatters: 'This field is powerful and easy to misuse. If you point it at the wrong page, you can accidentally tell Google to ignore this article in favour of another URL.',
    whereUsed: [
      'Canonical metadata output',
      'Article structured data main page URL',
    ],
    examples: [
      'Leave blank for a normal article',
      'Use a full URL only if there is a very specific duplicate-page reason',
    ],
  },
  'seo.priority': {
    title: 'Sitemap Priority',
    whatItIs: 'This is a sitemap hint about how important the page is compared with others.',
    whatToEnter: 'Choose a value only if you have a clear reason. Higher values are for your strongest, most important evergreen pages. Lower values are for supporting pages. If you are unsure, leave it on the normal default choice for the kind of article you are publishing.',
    whyItMatters: 'This does not boost rankings by itself. It is only a sitemap hint that helps describe relative importance across your own site.',
    whereUsed: [
      'XML sitemap output',
    ],
    examples: [
      '1.0 is for your most important pages only, and most articles should not use it',
      '0.8 suits a strong evergreen guide you want to keep promoting',
      '0.6 suits a useful supporting article that is not a core landing page',
    ],
  },
  'seo.changefreq': {
    title: 'Sitemap Change Frequency',
    whatItIs: 'This is a sitemap hint about how often the page is likely to change.',
    whatToEnter: 'Pick the option that honestly matches how often you expect to make meaningful updates to the article. Choose based on reality, not on how often you want Google to visit.',
    whyItMatters: 'This does not force Google to come back on that schedule. It simply tells search engines what sort of update rhythm the page usually has.',
    whereUsed: [
      'XML sitemap output',
    ],
    examples: [
      'Use daily only if the article genuinely changes very often, which is rare for blog articles',
      'Use weekly for an article you expect to refresh regularly with new advice or new product examples',
      'Use monthly for a stable evergreen article that may still get occasional editorial updates',
    ],
  },
} satisfies Record<ArticleHelpFieldPath, FieldHelpContent>

const articleFieldHelpComponentsByPath = articleHelpFieldPaths.reduce(
  (componentsByPath, fieldPath) => {
    componentsByPath[fieldPath] = createFieldHelpFieldComponent(articleFieldHelpContent[fieldPath])

    return componentsByPath
  },
  {} as Record<ArticleHelpFieldPath, ReturnType<typeof createFieldHelpFieldComponent>>
)

export function articleFieldHelpComponents(fieldPath: ArticleHelpFieldPath) {
  return {
    components: {
      field: articleFieldHelpComponentsByPath[fieldPath],
    },
  }
}
