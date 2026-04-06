/**
 * @jest-environment node
 */
import nextConfig from '../../next.config'

describe('next.config redirects', () => {
  it('keeps legacy by-post URLs redirected to /cakes-by-post', async () => {
    if (!nextConfig.redirects) {
      throw new Error('Expected nextConfig.redirects to be defined')
    }

    const redirects = await nextConfig.redirects()

    expect(redirects).toEqual(expect.arrayContaining([
      {
        source: '/gift-hampers/:slug',
        destination: '/cakes-by-post/:slug',
        permanent: true
      },
      {
        source: '/cake-by-post-service',
        destination: '/cakes-by-post',
        permanent: true
      },
      {
        source: '/cake-postal-delivery',
        destination: '/cakes-by-post',
        permanent: true
      }
    ]))
  })

  it('keeps only the unmatched retired long-tail landing pages out of permanent broad redirects', async () => {
    if (!nextConfig.redirects) {
      throw new Error('Expected nextConfig.redirects to be defined')
    }

    const redirects = await nextConfig.redirects()

    expect(redirects).toEqual(expect.arrayContaining([
      {
        source: '/honey-cake-near-me',
        destination: '/blog/medovik-honey-cake-near-me-guide',
        permanent: true
      },
      {
        source: '/ukrainian-cake',
        destination: '/blog/ukrainian-cakes-guide',
        permanent: true
      },
      {
        source: '/cake-delivery-leeds',
        destination: '/blog/cake-delivery-leeds-guide',
        permanent: true
      },
      {
        source: '/nut-free-cakes-leeds',
        destination: '/blog/nut-free-cakes-leeds-guide',
        permanent: true
      },
      {
        source: '/cake-preservation',
        destination: '/blog/cake-storage-and-preservation-guide',
        permanent: true
      },
      {
        source: '/cake-size-guide',
        destination: '/blog/cake-size-and-portions-guide',
        permanent: true
      }
    ]))
    expect(redirects).not.toEqual(expect.arrayContaining([
      {
        source: '/traditional-ukrainian-cakes',
        destination: '/cakes',
        permanent: true
      },
      {
        source: '/corporate-cakes-leeds',
        destination: '/cakes',
        permanent: true
      }
    ]))
  })

  it('does not redirect canonical cake category routes into filtered catalog URLs', async () => {
    if (!nextConfig.redirects) {
      throw new Error('Expected nextConfig.redirects to be defined')
    }

    const redirects = await nextConfig.redirects()

    expect(redirects).not.toEqual(expect.arrayContaining([
      {
        source: '/wedding-cakes',
        destination: '/cakes?collections=c-wedding-cakes',
        permanent: true
      },
      {
        source: '/birthday-cakes',
        destination: '/cakes?collections=c-birthday-cakes',
        permanent: true
      },
      {
        source: '/anniversary-cakes-leeds',
        destination: '/cakes?collections=c-anniversary-cakes',
        permanent: true
      },
      {
        source: '/baby-shower-cakes',
        destination: '/cakes?collections=c-baby-shower-cakes',
        permanent: true
      }
    ]))
  })

  it('redirects the retired custom cake enquiry page to the get custom quote page', async () => {
    if (!nextConfig.redirects) {
      throw new Error('Expected nextConfig.redirects to be defined')
    }

    const redirects = await nextConfig.redirects()

    expect(redirects).toEqual(expect.arrayContaining([
      {
        source: '/custom-cake-enquiry',
        destination: '/get-custom-quote',
        permanent: true
      }
    ]))
  })

  it('keeps /wedding-cakes live while redirecting retired wedding variants to the main cakes catalog', async () => {
    if (!nextConfig.redirects) {
      throw new Error('Expected nextConfig.redirects to be defined')
    }

    const redirects = await nextConfig.redirects()

    expect(redirects).toEqual(expect.arrayContaining([
      {
        source: '/wakefield-wedding-cakes',
        destination: '/cakes',
        permanent: true
      },
      {
        source: '/vegan-wedding-cakes-leeds',
        destination: '/cakes',
        permanent: true
      },
      {
        source: '/gluten-friendly-wedding-cakes-leeds',
        destination: '/cakes',
        permanent: true
      }
    ]))

    expect(redirects).not.toEqual(expect.arrayContaining([
      {
        source: '/wedding-cakes',
        destination: '/blog/wedding-cake-flavours-guide',
        permanent: true
      }
    ]))
  })

  it('redirects the retired public route surface to the approved canonical destinations', async () => {
    if (!nextConfig.redirects) {
      throw new Error('Expected nextConfig.redirects to be defined')
    }

    const redirects = await nextConfig.redirects()

    expect(redirects).toEqual(expect.arrayContaining([
      { source: '/market-schedule', destination: '/', permanent: true },
      { source: '/reviews-awards', destination: '/', permanent: true },
      { source: '/allergen-information', destination: '/allergens', permanent: true },
      { source: '/faq', destination: '/faqs', permanent: true },
      { source: '/custom-cake-design', destination: '/custom-cakes', permanent: true },
      { source: '/delivery-areas', destination: '/delivery', permanent: true },
      { source: '/return-policy', destination: '/delivery', permanent: true },
      { source: '/buy-cake', destination: '/cakes', permanent: true },
      { source: '/cake-gallery', destination: '/cakes', permanent: true },
      { source: '/cake-in-leeds', destination: '/cakes', permanent: true },
      { source: '/search', destination: '/cakes', permanent: true },
      { source: '/order', destination: '/get-custom-quote', permanent: true },
      { source: '/order/leeds', destination: '/get-custom-quote', permanent: true },
      { source: '/cake-pricing', destination: '/get-custom-quote', permanent: true },
      { source: '/gift-hampers', destination: '/cakes-by-post', permanent: true },
      { source: '/honey-cake', destination: '/cakes/honey-cake', permanent: true },
      { source: '/best-cakes-for-birthdays', destination: '/blog', permanent: true },
      { source: '/cake-care-storage', destination: '/blog', permanent: true },
      { source: '/ukrainian-bakery-leeds', destination: '/blog', permanent: true },
      { source: '/charity-events', destination: '/cakes', permanent: true }
    ]))
  })

  it('keeps the retired honey cake landing page pointed at the live honey cake product', async () => {
    if (!nextConfig.redirects) {
      throw new Error('Expected nextConfig.redirects to be defined')
    }

    const redirects = await nextConfig.redirects()

    expect(redirects).toEqual(expect.arrayContaining([
      {
        source: '/honey-cake',
        destination: '/cakes/honey-cake',
        permanent: true
      }
    ]))
    expect(redirects).not.toEqual(expect.arrayContaining([
      {
        source: '/honey-cake',
        destination: '/blog',
        permanent: true
      }
    ]))
  })

  it('redirects the old Learn articles path to the canonical blog archive', async () => {
    if (!nextConfig.redirects) {
      throw new Error('Expected nextConfig.redirects to be defined')
    }

    const redirects = await nextConfig.redirects()

    expect(redirects).toEqual(expect.arrayContaining([
      {
        source: '/learn/articles',
        destination: '/blog',
        permanent: true
      }
    ]))
  })
})
