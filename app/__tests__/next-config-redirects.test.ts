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
        source: '/gift-hampers',
        destination: '/cakes-by-post',
        permanent: true
      },
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
        destination: '/honey-cake',
        permanent: true
      },
      {
        source: '/traditional-ukrainian-cakes',
        destination: '/cakes',
        permanent: true
      }
    ]))
    expect(redirects).not.toEqual(expect.arrayContaining([
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
})
