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
})
