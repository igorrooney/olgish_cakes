import {
  getArchiveHeroContent,
  getArchiveCommerceCopy,
  getArchiveSectionCopy,
  getArticleClosingCtaCopy,
  getArticleCommerceCopy
} from '../copy'

describe('getArchiveSectionCopy', () => {
  it('returns the recent-post labels for the first archive page', () => {
    expect(getArchiveSectionCopy(1)).toEqual({
      eyebrow: 'More from Olga',
      heading: 'Latest articles'
    })
  })

  it('returns archive labels for paginated archive pages', () => {
    expect(getArchiveSectionCopy(3)).toEqual({
      eyebrow: 'Archive pages',
      heading: 'Page 3'
    })
  })
})

describe('blog commerce copy', () => {
  it('keeps a visible intro on the main archive page only', () => {
    expect(getArchiveHeroContent()).toEqual({
      eyebrow: "Olga's notes",
      heading: 'Cake by post advice, delivery help, and gift ideas',
      intro:
        'These articles answer the questions Olga gets most often: what travels well, what is sensible to post, and when a custom order would be the better fit.'
    })

    expect(getArchiveHeroContent({
      title: 'Cake by post',
      slug: 'cake-by-post',
      description: 'Advice for choosing and sending cakes by post.'
    })).toEqual({
      eyebrow: 'Cake by post notes',
      heading: 'Cake by post advice for real UK deliveries',
      intro: 'Advice for choosing and sending cakes by post.'
    })
  })

  it('keeps archive fallback copy aligned with the real by-post options', () => {
    expect(getArchiveCommerceCopy()).toEqual({
      eyebrow: 'Need something that can travel?',
      heading: 'Shop the options that travel best',
      body: 'If you need something to travel, start with the cakes by post range for honey cake slices, caramel biscuits, or standard-design honey cake vacuum-packed for parcel post. For full celebration cakes, ask about local delivery, collection, or UK delivery by agreement.',
      bullets: [
        'The cakes by post range is prepared for post, with bakes vacuum-packed and dispatched as parcels',
        'Honey cake slices, caramel biscuits, and standard-design honey cake work well when you want a posted surprise without sending a full celebration cake',
        'Tall, chilled, or highly decorated cakes are better kept to local delivery, collection, or UK delivery by agreement'
      ],
      primaryCta: {
        href: '/cakes-by-post',
        label: 'Shop cakes by post'
      },
      secondaryCta: {
        href: '/cakes',
        label: 'See custom cakes'
      }
    })
  })

  it('switches archive copy to the custom cakes hub for custom-cakes topics', () => {
    expect(getArchiveCommerceCopy({ activeTopicSlug: 'custom-cakes' })).toEqual({
      eyebrow: 'Planning something more detailed?',
      heading: 'Browse the custom cakes first',
      body: 'If the cake depends on height, fresh fillings, or a proper design brief, start with the custom cakes range. That is the easiest way to compare celebration styles before deciding what should stay local and what might travel by agreement.',
      bullets: [
        'Custom cakes are the right starting point for birthdays, tiered cakes, and designs that need more than standard by-post packing',
        'Collection and local delivery suit celebration cakes better when the finish matters as much as the flavour',
        'If the order has to post across the UK, the cakes by post range is still the safer option for reliable travel'
      ],
      primaryCta: {
        href: '/cakes',
        label: 'Browse custom cakes'
      },
      secondaryCta: {
        href: '/cakes-by-post',
        label: 'Shop cakes by post'
      }
    })
  })

  it('keeps article fallback copy distinct from generic postal-cake claims', () => {
    expect(getArticleCommerceCopy()).toEqual({
      eyebrow: 'Useful if the cake has to travel',
      heading: 'Start with the format that fits the journey',
      body: 'If the order has to go across the UK, start with the cakes by post options first. Those cover standard-design honey cake, honey cake slices, and caramel biscuits vacuum-packed for parcel delivery. If the cake needs height, fresh fillings, or a polished celebration finish, ask about local delivery, collection, or UK delivery by agreement instead.'
    })
  })

  it('keeps custom cake article copy aligned with local-delivery style products', () => {
    expect(
      getArticleCommerceCopy({
        _id: 'cake-1',
        _type: 'cake',
        name: 'Tall custom cake',
        slug: 'tall-custom-cake',
        isPostableToUk: false
      })
    ).toEqual({
      eyebrow: 'Better for local delivery or collection',
      heading: 'Start with Tall custom cake',
      body: 'Tall custom cake is the kind of cake Olga suggests when the order needs a proper celebration finish, local delivery, or collection rather than parcel-post packing.'
    })
  })

  it('treats a GB-mail cake as by-post when delivery policy allows UK posting', () => {
    expect(
      getArchiveCommerceCopy({
        product: {
          _id: 'cake-2',
          _type: 'cake',
          name: 'Postal loaf cake',
          slug: 'postal-loaf-cake',
          isPostableToUk: true
        }
      })
    ).toEqual({
      eyebrow: 'Need something that can travel?',
      heading: 'Shop Postal loaf cake',
      body: 'Postal loaf cake is prepared as a vacuum-packed parcel for UK post when you need slices, biscuits, or standard-design honey cake that can travel neatly.',
      bullets: [
        'The cakes by post range is prepared for post, with bakes vacuum-packed and dispatched as parcels',
        'Honey cake slices, caramel biscuits, and standard-design honey cake work well when you want a posted surprise without sending a full celebration cake',
        'Tall, chilled, or highly decorated cakes are better kept to local delivery, collection, or UK delivery by agreement'
      ],
      primaryCta: {
        href: '/cakes/postal-loaf-cake',
        label: 'See this cake by post'
      },
      secondaryCta: {
        href: '/cakes',
        label: 'See custom cakes'
      }
    })
  })

  it('treats a GB-mail cake as by-post on article commerce copy when delivery policy allows posting', () => {
    expect(
      getArticleCommerceCopy({
        _id: 'cake-2',
        _type: 'cake',
        name: 'Postal loaf cake',
        slug: 'postal-loaf-cake',
        isPostableToUk: true
      })
    ).toEqual({
      eyebrow: 'Useful if the cake has to travel',
      heading: 'Start with Postal loaf cake',
      body: 'Postal loaf cake is prepared as a vacuum-packed parcel for UK post when you want slices, biscuits, or standard-design honey cake that can travel neatly.'
    })
  })

  it('keeps the closing cta explicit about by-post products versus delivery by agreement', () => {
    expect(getArticleClosingCtaCopy()).toEqual({
      eyebrow: 'Need the practical answer?',
      heading: 'Choose the format that suits the journey',
      intro: 'If the parcel has to go across the UK, start with the cakes by post range for standard-design honey cake, honey cake slices, or caramel biscuits vacuum-packed for post. If the order depends on height, chilled fillings, or a detailed design brief, browse the custom cakes range for the celebration options that are better suited to local delivery, collection, or UK delivery by agreement.'
    })
  })
})
