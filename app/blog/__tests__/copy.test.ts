import {
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
  it('keeps archive fallback copy aligned with the real by-post options', () => {
    expect(getArchiveCommerceCopy()).toEqual({
      eyebrow: 'Need something that can travel?',
      heading: 'Shop the options that travel best',
      body: 'If you need something to travel, start with standard honey cake by post, cake slices in gift hampers, or caramel biscuits. For a whole celebration cake further afield, ask about UK delivery by agreement.',
      bullets: [
        'Standard honey cake by post is prepared for travel and vacuum-packed before dispatch',
        'Gift hampers and compact slice gifts work well when you want a posted cake surprise without sending a full centrepiece',
        'Tall, chilled, or highly decorated cakes are usually better as local delivery, collection, or UK delivery by agreement'
      ]
    })
  })

  it('keeps article fallback copy distinct from generic postal-cake claims', () => {
    expect(getArticleCommerceCopy()).toEqual({
      eyebrow: 'Useful if the cake has to travel',
      heading: 'Start with the format that fits the journey',
      body: 'If the order has to go across the UK, start with the by-post options first. If the cake needs height, fresh fillings, or a polished celebration finish, ask about local delivery, collection, or UK delivery by agreement instead.'
    })
  })

  it('keeps the closing cta explicit about by-post products versus delivery by agreement', () => {
    expect(getArticleClosingCtaCopy()).toEqual({
      eyebrow: 'Need the practical answer?',
      heading: 'Choose the format that suits the journey',
      intro: 'If the parcel has to go across the UK, start with standard honey cake by post, cake slices in gift hampers, or caramel biscuits. If the order depends on height, chilled fillings, or a detailed design brief, send an enquiry about local delivery, collection, or UK delivery by agreement.'
    })
  })
})
