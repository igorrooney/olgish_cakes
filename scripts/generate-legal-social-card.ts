import path from 'node:path'
import sharp from 'sharp'
import { designTokens } from '../lib/design-system'

const outputWidth = 1200
const outputHeight = 630
const outputPath = path.join(process.cwd(), 'public', 'images', 'og-legal.jpg')
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
    <circle cx="1125" cy="10" r="250" fill="${colors.secondary.main}" opacity="0.22" />
    <circle cx="15" cy="630" r="240" fill="${colors.ukrainian.honey}" opacity="0.17" />
    <rect x="52" y="48" width="1096" height="534" rx="42" fill="${colors.background.paper}" stroke="${colors.primary.main}" stroke-opacity="0.16" stroke-width="2" />
    <rect x="88" y="190" width="10" height="220" rx="5" fill="${colors.secondary.main}" />
    <text x="128" y="244" fill="${colors.primary.dark}" font-family="${typography.fontFamily.display}" font-size="65" font-weight="400">
      <tspan x="128" dy="0">Legal information</tspan>
    </text>
    <text x="130" y="334" fill="${colors.primary.main}" font-family="${typography.fontFamily.primary}" font-size="31" font-weight="700">
      Terms | Privacy | Cookies
    </text>
    <text x="130" y="392" fill="${colors.text.secondary}" font-family="${typography.fontFamily.primary}" font-size="24">
      Clear customer policies from our Leeds bakery
    </text>
    <g transform="translate(835 185)">
      <rect width="210" height="240" rx="28" fill="${colors.background.subtle}" stroke="${colors.primary.main}" stroke-opacity="0.22" stroke-width="2" />
      <path d="M56 42h70l30 30v125H56z" fill="${colors.background.paper}" stroke="${colors.primary.dark}" stroke-width="7" stroke-linejoin="round" />
      <path d="M126 42v32h30" fill="none" stroke="${colors.primary.dark}" stroke-width="7" stroke-linejoin="round" />
      <path d="M78 105h57M78 132h57M78 159h40" stroke="${colors.secondary.main}" stroke-width="9" stroke-linecap="round" />
    </g>
  </svg>
`)

async function generateLegalSocialCard() {
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
    .jpeg({
      quality: 84,
      chromaSubsampling: '4:4:4',
      mozjpeg: true
    })
    .toFile(outputPath)

  const metadata = await sharp(outputPath).metadata()

  if (metadata.format !== 'jpeg' || metadata.width !== outputWidth || metadata.height !== outputHeight) {
    throw new Error(
      `Unexpected legal social card output: ${metadata.format} ${metadata.width}x${metadata.height}`
    )
  }
}

generateLegalSocialCard().catch((error: unknown) => {
  console.error('Failed to generate legal social card', error)
  process.exitCode = 1
})
