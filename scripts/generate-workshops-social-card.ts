import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { designTokens } from '../lib/design-system'

const outputWidth = 1200
const outputHeight = 630
const outputDirectory = path.join(process.cwd(), 'public', 'images', 'workshops')
const outputPath = path.join(outputDirectory, 'workshops-social-card.png')
const cakeImagePath = path.join(outputDirectory, 'workshop-decorating.png')
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
    <circle cx="1145" cy="55" r="210" fill="${colors.secondary.main}" opacity="0.2" />
    <circle cx="86" cy="592" r="190" fill="${colors.ukrainian.honey}" opacity="0.16" />
    <rect x="52" y="48" width="1096" height="534" rx="42" fill="${colors.background.paper}" stroke="${colors.primary.main}" stroke-opacity="0.12" stroke-width="2" />
    <rect x="88" y="180" width="10" height="250" rx="5" fill="${colors.secondary.main}" />
    <text x="128" y="206" fill="${colors.primary.dark}" font-family="${typography.fontFamily.display}" font-size="51" font-weight="400">
      <tspan x="128" dy="0">Mobile cake decorating</tspan>
      <tspan x="128" dy="62">workshops at</tspan>
      <tspan x="128" dy="62">your venue</tspan>
    </text>
    <text x="130" y="402" fill="${colors.primary.main}" font-family="${typography.fontFamily.primary}" font-size="29" font-weight="700" letter-spacing="1.2">
      Workshops across the UK
    </text>
    <text x="130" y="458" fill="${colors.text.secondary}" font-family="${typography.fontFamily.primary}" font-size="23">
      Groups of 4+  •  From £25 per person
    </text>
  </svg>
`)

const roundedCakeMask = Buffer.from(`
  <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="400" rx="36" fill="#ffffff" />
  </svg>
`)

async function generateWorkshopsSocialCard() {
  await mkdir(outputDirectory, { recursive: true })

  const cakeImage = await sharp(cakeImagePath)
    .resize(400, 400, { fit: 'cover' })
    .composite([{ input: roundedCakeMask, blend: 'dest-in' }])
    .png()
    .toBuffer()

  const logoImage = await sharp(logoImagePath)
    .resize({ width: 94, height: 94, fit: 'contain' })
    .png()
    .toBuffer()

  await sharp(background)
    .composite([
      {
        input: logoImage,
        left: 118,
        top: 70,
      },
      {
        input: cakeImage,
        left: 720,
        top: 115,
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

generateWorkshopsSocialCard().catch(error => {
  console.error('Failed to generate workshops social card', error)
  process.exitCode = 1
})
