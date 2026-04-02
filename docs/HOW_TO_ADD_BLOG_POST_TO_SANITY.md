# How to Add a Blog Article in Sanity

Use this workflow for every new article.

Do not paste a full AI draft straight into Sanity.
Start with the markdown brief, then write the article.
Run the GSC planner first when you are working from a fresh Search Console export:

`pnpm articles:plan:gsc -- --file "C:\Users\igorr\Downloads\olgishcakes.co.uk-Performance-on-Search-2026-03-30.xlsx"`

## 1. Open Sanity Studio

Create a new `Article` document.

## 2. Start with the markdown brief

Use [SEARCH_CONSOLE_ARTICLE_BRIEFS.md](/c:/Users/igorr/olgish_cakes/docs/blog/SEARCH_CONSOLE_ARTICLE_BRIEFS.md) as the planning document before you touch the public article fields.

Each article should have:

- primary query
- query cluster
- search intent
- reader problem
- Olga angle
- product tie-in
- internal links
- FAQ candidates
- evidence checklist
- assets needed
- AI usage notes

## 3. Choose article positioning in Sanity

- Pick the correct `Topic`
- Set one `Primary Product` only if it genuinely fits
- Add up to four `Related Products` only if they help the reader

If the keyword is mainly local or transactional, stop and check whether it belongs on a landing page instead of the blog.

## 4. Write the public article fields

Complete these fields in order:

1. `Title`
2. `Summary`
3. `Dek`
4. `Cover Image` and alt text
5. `Card Image` if needed
6. `Body`
7. `FAQ Items`
8. `SEO`

## 5. Run the required voice QA

Before publishing, check all four passes:

- Factual pass:
  Every claim must be supportable from real products, current delivery rules, or the live canonical pages.
- Olga voice pass:
  Keep at least one clear first-person judgement and at least two bakery-specific details.
- Anti-AI pass:
  Remove generic filler, repeated openings, repeated CTA language, and title/dek/meta duplication.
- Read-aloud pass:
  Read the article aloud and rewrite anything that sounds over-smoothed or interchangeable with another bakery.

## 6. Publish carefully

- Set `Published At`
- Only refresh `Editorial Updated At` if readers would care about the change
- Publish when the article is factually accurate and commercially honest

## Notes

- Search Console helps choose topics, not write the article for you.
- Use only claims you can support with real products, delivery rules, and bakery process.
- For nut-free or allergen-related content, accuracy matters more than volume.
- Keep `/cakes-by-post` and `/wedding-cakes` as canonical commercial pages. Use the blog to support them or replace retired informational pages, not to compete with them.
