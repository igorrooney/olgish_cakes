import path from 'node:path'
import sharp from 'sharp'

describe('delivery social card', () => {
  it('ships a correctly sized PNG social card', async () => {
    const socialCardPath = path.join(
      process.cwd(),
      'public',
      'images',
      'delivery',
      'delivery-social-card.png'
    )
    const metadata = await sharp(socialCardPath).metadata()

    expect(metadata.format).toBe('png')
    expect(metadata.width).toBe(1200)
    expect(metadata.height).toBe(630)
  })
})
