# Search Console Led Article Briefs

This file is the editorial source of truth for blog planning.

Use Google Search Console to decide what deserves an article.
Do not use Search Console as the article itself.

Generate the latest clustered planning report with:

`pnpm articles:plan:gsc -- --file "C:\Users\igorr\Downloads\olgishcakes.co.uk-Performance-on-Search-2026-03-30.xlsx"`

## Working Rules

- Start with non-branded queries and related query clusters.
- Prefer topics with strong impressions, weak CTR, and average positions roughly between 5 and 20.
- Keep `/cakes-by-post` and `/wedding-cakes` as canonical commercial pages.
- Do not force clearly transactional or broad commercial queries into blog posts when a live canonical page should own them.
- Every article must have one clear reader problem, one Olga-specific angle, and one natural product tie-in.
- AI can help with clustering and outline options, but final copy must be written or heavily rewritten by a human.
- Before publish, remove generic filler and make sure at least one section could only be written by this bakery.

## Topic Priorities From Search Console

### Strong article opportunities

- `cake by post`, `letterbox cakes`, `honey cake order online`
- `honey cake near me`, `medovik near me`, `medovik cake near me`, `ukrainian honey cake near me`
- `ukrainian cakes`, `ukrainian bakery`, `ukrainian desserts near me`
- `napoleon cake`, `kyiv cake buy`, `kyiv cake where to buy`, `kyiv cake near me`

### Handle carefully

- `nut free cake`, `nut free cakes`, `nut free cakes near me`
  These need precise wording. Do not publish claims that go beyond the bakery’s real ingredient handling and cross-contact position.

### Better suited to landing or service pages unless the article answers a real information need

- `cake delivery leeds`
- `same day cake delivery leeds`
- `birthday cakes wakefield`
- `cake delivery huddersfield`

## Sanity Workflow

For each new `article` document in Sanity:

1. Fill in the matching markdown brief in this file first.
2. Choose `topic`, `primaryProduct`, and `relatedProducts` only after the brief is clear.
3. Write the public fields second:
   - `title`
   - `summary`
   - `dek`
   - `body`
   - `faqItems`
   - `seo`
4. Run four editorial checks before publishing:
   - factual pass
   - Olga voice pass
   - anti-AI pass
   - read-aloud pass

## Article Brief 1

### Title direction

`Cake by post in the UK: what actually travels well`

### Primary query

`cake by post`

### Query cluster

- `cake by post`
- `letterbox cakes`
- `honey cake order online`

### Search intent

Commercial investigation

### Reader problem

The reader wants to send cake across the UK and needs honest guidance on which cakes actually travel well, what is risky, and when a local custom cake is the better choice.

### Olga angle

Olga should take a clear position: she would rather recommend a cake that travels reliably than promise a decorative style that looks exciting but arrives badly.

### Product tie-in

- Primary product: postal Medovik or the most reliable cake-by-post range already live in Sanity
- Related products: other UK-postal items and one local bespoke route only as a contrast

### Internal links

- `/cakes-by-post`
- `/cakes/honey-cake-medovik`
- `/order`
- `/cakes`

### FAQ candidates

- Can you really send a cake by post in the UK?
- Which cakes travel best by post?
- When is a local custom cake better than a postal cake?
- How much notice do I need for cake by post?

### Evidence checklist

- Which current products are available across the UK by post
- Packaging reality and dispatch timing
- Which finishes or structures Olga avoids for postal orders
- Shelf-life and freshness notes that are true for current products

### Assets needed

- Packed postal cake ready for dispatch
- Product shot of the postal Medovik range
- Optional close-up showing a cake that travels cleanly

### Drafting notes

- Open with the honest answer, not a long intro
- Use H2s around decisions buyers make
- Compare postal cake vs local bespoke order in plain English
- CTA should be soft and useful, not aggressive

## Article Brief 2

### Title direction

`Medovik and honey cake delivery: what to expect when ordering in the UK`

### Primary query

`honey cake near me`

### Query cluster

- `honey cake near me`
- `ukrainian honey cake near me`
- `medovik near me`
- `medovik cake near me`

### Search intent

Commercial investigation

### Reader problem

The reader already wants Medovik or honey cake but needs help understanding flavour, texture, delivery expectations, and whether Olga’s version is right for the occasion.

### Olga angle

Olga should explain how her Medovik behaves in real life: balanced sweetness, layered texture, how it is packed, and which occasions it suits best.

### Product tie-in

- Primary product: `/cakes/honey-cake-medovik`
- Related products: postal range or complementary Ukrainian cakes if useful for comparison

### Internal links

- `/cakes/honey-cake-medovik`
- `/cakes-by-post`
- `/ukrainian-cake`
- `/order`

### FAQ candidates

- Is Medovik very sweet?
- Can you send Medovik by post?
- How is Medovik different from a standard sponge cake?
- Is this suitable for birthdays or gifts?

### Evidence checklist

- Olga’s real flavour description
- Delivery suitability by product format
- Portion and occasion guidance
- The difference between Medovik and Western-style sponge cakes

### Assets needed

- Clean full cake shot
- Slice shot showing layers
- Postal or packaging photo if the article covers UK delivery

### Drafting notes

- Avoid generic cake history padding
- Keep the article grounded in what the buyer gets and how it feels to eat

## Article Brief 3

### Title direction

`Napoleon cake: what it is, how it tastes, and when to order it`

### Primary query

`napoleon cake`

### Query cluster

- `napoleon cake`
- `kyiv cake buy`
- `kyiv cake where to buy`
- `kyiv cake near me`

### Search intent

Informational with commercial investigation

### Reader problem

The reader has heard of Napoleon cake or Kyiv cake but does not know what the cake is actually like, whether it is worth ordering, or which celebration it suits.

### Olga angle

Olga should describe taste and texture the way a baker would, then explain when she recommends Napoleon over richer or more decorative choices.

### Product tie-in

- Primary product: `/cakes/napoleon-cake`
- Related products: `/cakes/kyiv-cake`, `/cakes/honey-cake-medovik`

### Internal links

- `/cakes/napoleon-cake`
- `/cakes/kyiv-cake`
- `/cakes/honey-cake-medovik`
- `/cakes`

### FAQ candidates

- Is Napoleon cake the same as mille-feuille?
- Is Napoleon cake very sweet?
- When is Napoleon cake a better choice than Medovik or Kyiv cake?
- Does Napoleon cake travel well?

### Evidence checklist

- Olga’s real description of texture and sweetness
- Honest comparison with Medovik and Kyiv cake
- Occasion guidance
- Delivery or collection limitations if they exist

### Assets needed

- Full cake shot
- Slice shot showing pastry layers
- Optional comparison image with another Ukrainian cake

### Drafting notes

- Make the explainer useful to a first-time buyer
- Keep comparisons honest rather than claiming one cake is always best

## Article Brief 4

### Title direction

`How to choose a nut-free cake without making the wrong assumptions`

### Primary query

`nut free cake`

### Query cluster

- `nut free cake`
- `nut free cakes`
- `nut free cakes near me`

### Search intent

Commercial investigation

### Reader problem

The reader wants a safer choice for a nut-related requirement but may be assuming every bakery can offer the same level of separation or certainty.

### Olga angle

Olga should be careful and precise. The value of the article is honest explanation, not overselling. If there are limits, say them clearly.

### Product tie-in

- Primary path may be `/nut-free-cakes-leeds` if that page already handles the real commercial intent better
- Use a product tie-in only if the bakery can support the claim accurately

### Internal links

- `/nut-free-cakes-leeds`
- `/cakes`
- `/order`

### FAQ candidates

- What does nut-free mean in practice?
- Should I ask about ingredients and handling before ordering?
- Can every cake be adapted to nut-free requirements?

### Evidence checklist

- Olga’s real process for ingredients and handling
- What can be stated safely and what cannot
- Whether local discussion is required before order confirmation

### Assets needed

- Only use product imagery that truthfully matches what can be offered
- Do not imply guaranteed safety through visuals alone

### Drafting notes

- This article must pass a stricter accuracy review than the others
- If the topic works better as a service or policy page, deprioritise the article

## Pre-Publish Quality Gate

- The article solves one clear reader problem.
- The title, summary, dek, FAQs, and metadata are all distinct.
- The article does not conflict with a stronger money page.
- Product links feel earned by the content.
- At least one section contains Olga’s own judgement or experience.
- The article sounds natural when read aloud.
- No paragraph could be pasted onto a random bakery site without sounding out of place.
