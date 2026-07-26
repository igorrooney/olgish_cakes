import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { designTokens } from '../lib/design-system'

const outputWidth = 1200
const outputHeight = 630
const outputDirectory = path.join(process.cwd(), 'public', 'images', 'delivery')
const outputPath = path.join(outputDirectory, 'delivery-social-card.png')
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
    <circle cx="1120" cy="40" r="230" fill="${colors.secondary.main}" opacity="0.2" />
    <circle cx="80" cy="620" r="210" fill="${colors.ukrainian.honey}" opacity="0.16" />
    <rect x="52" y="48" width="1096" height="534" rx="42" fill="${colors.background.paper}" stroke="${colors.primary.main}" stroke-opacity="0.14" stroke-width="2" />
    <rect x="88" y="184" width="10" height="230" rx="5" fill="${colors.secondary.main}" />
    <text x="128" y="238" fill="${colors.primary.dark}" font-family="${typography.fontFamily.display}" font-size="64" font-weight="400">
      <tspan x="128" dy="0">Delivery &amp;</tspan>
      <tspan x="128" dy="78">returns</tspan>
    </text>
    <text x="130" y="424" fill="${colors.primary.main}" font-family="${typography.fontFamily.primary}" font-size="29" font-weight="700">
      Cakes by post across the UK
    </text>
    <text x="130" y="477" fill="${colors.text.secondary}" font-family="${typography.fontFamily.primary}" font-size="24">
      Leeds collection and local delivery
    </text>
    <g transform="translate(815 185)">
      <rect width="230" height="190" rx="30" fill="${colors.background.subtle}" stroke="${colors.primary.main}" stroke-opacity="0.2" stroke-width="2" />
      <path d="M58 83h114v70H58z" fill="${colors.secondary.main}" opacity="0.68" />
      <path d="M58 83l57-38 57 38-57 36z" fill="${colors.ukrainian.honey}" opacity="0.82" />
      <path d="M115 45v108" stroke="${colors.primary.dark}" stroke-width="8" stroke-linecap="round" opacity="0.82" />
      <path d="M58 83l57 36 57-36" fill="none" stroke="${colors.primary.dark}" stroke-width="7" stroke-linejoin="round" opacity="0.82" />
    </g>
  </svg>
`)

async function generateDeliverySocialCard() {
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

  if (metadata.format !== 'png' || metadata.width !== outputWidth || metadata.height !== outputHeight) {
    throw new Error(
      `Unexpected delivery social card output: ${metadata.format} ${metadata.width}x${metadata.height}`
    )
  }
}

generateDeliverySocialCard().catch((error: unknown) => {
  console.error('Failed to generate delivery social card', error)
  process.exitCode = 1
})
