import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";

async function generateMaskableIcons() {
  const brandBlue = "#005BBB";
  const inputSvgPath = path.resolve("app", "icon.svg");
  const outputDir = path.resolve("public");
  const sizes = [192, 512];
  const marginRatio = 0.12; // 12% padding on each side for maskable safe area

  try {
    await fs.access(inputSvgPath);
  } catch {
    throw new Error(`Source SVG not found at ${inputSvgPath}`);
  }

  await fs.mkdir(outputDir, { recursive: true });

  for (const size of sizes) {
    const innerSize = Math.round(size * (1 - 2 * marginRatio));
    const offset = Math.round(size * marginRatio);

    const renderedSvgPng = await sharp(inputSvgPath, { density: 384 })
      .resize({
        width: innerSize,
        height: innerSize,
        fit: "contain",
        withoutEnlargement: true,
      })
      .png()
      .toBuffer();

    const composed = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: brandBlue,
      },
    })
      .composite([
        {
          input: renderedSvgPng,
          left: offset,
          top: offset,
        },
      ])
      .png({ compressionLevel: 9 })
      .toBuffer();

    const outPath = path.join(outputDir, `maskable-${size}x${size}.png`);
    await fs.writeFile(outPath, composed);
    // eslint-disable-next-line no-console
    console.log(`Generated ${outPath}`);
  }
}

generateMaskableIcons().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
