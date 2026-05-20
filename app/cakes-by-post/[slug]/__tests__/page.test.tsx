/**
 * @jest-environment jsdom
 */
import { generateMetadata } from '../page'
import { getGiftHamperBySlug } from '@/app/utils/fetchGiftHampers'
import { normalizeCmsTitle } from '@/lib/metadata'
import { urlFor } from '@/sanity/lib/image'
import { blocksToText } from '@/types/cake'

jest.mock('next/cache', () => ({
  unstable_cache: jest.fn((fn) => fn)
}))

jest.mock('@/app/utils/fetchGiftHampers', () => ({
  getAllGiftHampers: jest.fn(),
  getGiftHamperBySlug: jest.fn()
}))

jest.mock('@/lib/metadata', () => ({
  normalizeCmsTitle: jest.fn((value: string) => value)
}))

jest.mock('@/sanity/lib/image', () => ({
  urlFor: jest.fn()
}))

jest.mock('@/types/cake', () => ({
  blocksToText: jest.fn(() => 'Postal hamper description')
}))

const mockedGetGiftHamperBySlug =
  getGiftHamperBySlug as jest.MockedFunction<typeof getGiftHamperBySlug>
const mockedNormalizeCmsTitle =
  normalizeCmsTitle as jest.MockedFunction<typeof normalizeCmsTitle>
const mockedUrlFor = urlFor as jest.MockedFunction<typeof urlFor>
const mockedBlocksToText = blocksToText as jest.MockedFunction<typeof blocksToText>

function createImageBuilder(url: string): ReturnType<typeof urlFor> {
  return {
    width: jest.fn(() => ({
      height: jest.fn(() => ({
        url: jest.fn(() => url)
      }))
    }))
  } as unknown as ReturnType<typeof urlFor>
}

describe('CakesByPostProductPage metadata', () => {
  const baseHamper = {
    _id: 'hamper-1',
    name: 'Postal Medovik',
    slug: { current: 'postal-medovik' },
    shortDescription: [],
    images: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedNormalizeCmsTitle.mockImplementation((value) => value)
    mockedBlocksToText.mockReturnValue('Postal hamper description')
  })

  it('uses the dynamic hamper OG endpoint when no Sanity image is available', async () => {
    mockedGetGiftHamperBySlug.mockResolvedValue(baseHamper)

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'postal-medovik' })
    })

    expect(metadata.openGraph?.images).toEqual([
      { url: '/api/og/hampers/postal-medovik' }
    ])
    expect(metadata.twitter?.images).toEqual(['/api/og/hampers/postal-medovik'])
    expect(mockedUrlFor).not.toHaveBeenCalled()
  })

  it('uses the Sanity image URL when a hamper image asset is present', async () => {
    const mainImage = {
      asset: { _ref: 'image-hamper-main' },
      isMain: true
    }

    mockedGetGiftHamperBySlug.mockResolvedValue({
      ...baseHamper,
      images: [mainImage]
    })
    mockedUrlFor.mockReturnValue(
      createImageBuilder('https://cdn.sanity.io/images/test-project/test-dataset/postal-medovik.jpg')
    )

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'postal-medovik' })
    })

    expect(mockedUrlFor).toHaveBeenCalledWith(mainImage)
    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://cdn.sanity.io/images/test-project/test-dataset/postal-medovik.jpg' }
    ])
    expect(metadata.twitter?.images).toEqual([
      'https://cdn.sanity.io/images/test-project/test-dataset/postal-medovik.jpg'
    ])
  })

  it('returns the existing not-found metadata when the hamper is missing', async () => {
    mockedGetGiftHamperBySlug.mockResolvedValue(null)

    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'missing-hamper' })
    })

    expect(metadata).toEqual({
      title: 'Gift hamper not found',
      description: 'The requested hamper could not be found.'
    })
  })
})
