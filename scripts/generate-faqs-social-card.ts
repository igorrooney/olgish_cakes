import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { designTokens } from '../lib/design-system'

const outputWidth = 1200
const outputHeight = 630
const outputDirectory = path.join(process.cwd(), 'public', 'images', 'faqs')
const outputPath = path.join(outputDirectory, 'faqs-social-card.png')
const logoImagePath = path.join(
  process.cwd(),
  'public',
  'images',
  'navbar-logo-128.webp'
)

const { colors, typography } = designTokens

const background = Buffer.from(`
  <svg width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${outputWidth}" height="${outputHeight}" fill="${colors.background.default}" />
    <circle cx="1120" cy="20" r="230" fill="${colors.secondary.main}" opacity="0.22" />
    <circle cx="60" cy="620" r="215" fill="${colors.ukrainian.honey}" opacity="0.18" />
    <rect x="52" y="48" width="1096" height="534" rx="42" fill="${colors.background.paper}" stroke="${colors.primary.main}" stroke-opacity="0.14" stroke-width="2" />
    <rect x="88" y="182" width="10" height="230" rx="5" fill="${colors.secondary.main}" />
    <text x="128" y="236" fill="${colors.primary.dark}" font-family="${typography.fontFamily.display}" font-size="64" font-weight="400">
      <tspan x="128" dy="0">Cake ordering</tspan>
      <tspan x="128" dy="78">FAQs</tspan>
    </text>
    <text x="130" y="414" fill="${colors.primary.main}" font-family="${typography.fontFamily.primary}" font-size="28" font-weight="700">
      Custom cakes in Leeds
    </text>
    <text x="130" y="463" fill="${colors.text.secondary}" font-family="${typography.fontFamily.primary}" font-size="24">
      Cakes by post across the UK
    </text>
    <text x="895" y="355" text-anchor="middle" fill="${colors.primary.main}" font-family="${typography.fontFamily.display}" font-size="210" font-weight="400" opacity="0.88">?</text>
  </svg>
`)

async function generateFaqsSocialCard() {
  await mkdir(outputDirectory, { recursive: true })

  const logoImage = await sharp(logoImagePath)
    .resize({ width: 94, height: 94, fit: 'contain' })
    .png()
    .toBuffer()

  await sharp(background)
    .composite([
      {
        input: logoImage,
        left: 118,
        top: 70
      }
    ])
    .png({ compressionLevel: 9 })
    .toFile(outputPath)

  const metadata = await sharp(outputPath).metadata()

  if (metadata.width !== outputWidth || metadata.height !== outputHeight) {
    throw new Error(
      `Unexpected FAQ social card dimensions: ${metadata.width}x${metadata.height}`
    )
  }
}

generateFaqsSocialCard().catch((error: unknown) => {
  console.error('Failed to generate FAQ social card', error)
  process.exitCode = 1
})
