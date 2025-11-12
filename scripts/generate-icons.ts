import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";

// Set Sharp's pixel limit to handle large SVGs
sharp.cache(false);
sharp.concurrency(1);

// Set environment variable for Sharp pixel limit
process.env.SHARP_PIXEL_LIMIT = "268402689";

interface GeneratedIconSpec {
  outputPath: string;
  size: number;
  background?: string | null;
  marginRatio?: number;
}

function sanitizeSvgToMonochrome(svgContent: string): string {
  let output = svgContent;
  // Replace explicit fills/strokes with currentColor for Safari pinned tabs
  output = output.replace(/fill\s*=\s*"#[0-9a-fA-F]{3,8}"/g, 'fill="currentColor"');
  output = output.replace(/stroke\s*=\s*"#[0-9a-fA-F]{3,8}"/g, 'stroke="currentColor"');
  // Default to currentColor if no fill is present
  if (!/fill=/i.test(output)) {
    output = output.replace(/<svg(\s|>)/i, '<svg fill="currentColor"$1');
  }
  return output;
}

async function writePinnedTabSvg(inputSvgPath: string, outputPath: string) {
  const raw = await fs.readFile(inputSvgPath, "utf8");
  const monochrome = sanitizeSvgToMonochrome(raw);
  await fs.writeFile(outputPath, monochrome, "utf8");
}

async function renderPngFromSvg(
  inputSvgPath: string,
  size: number,
  options: { background?: string | null; marginRatio?: number }
): Promise<Buffer> {
  const { background = null, marginRatio = 0 } = options;
  
  // Use much lower density for large SVGs to avoid pixel limit issues
  const density = size > 128 ? 96 : 192;
  
  if (marginRatio === 0 && !background) {
    return sharp(inputSvgPath, { 
      density,
      limitInputPixels: 268402689 // 16384 x 16384
    })
      .resize({ width: size, height: size, fit: "contain" })
      .png()
      .toBuffer();
  }

  const innerSize = Math.round(size * (1 - 2 * marginRatio));
  const offset = Math.round(size * marginRatio);
  const renderedSvgPng = await sharp(inputSvgPath, { 
    density,
    limitInputPixels: 268402689 // 16384 x 16384
  })
    .resize({ width: innerSize, height: innerSize, fit: "contain" })
    .png()
    .toBuffer();

  const composed = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: renderedSvgPng, left: offset, top: offset }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  return composed;
}

async function generateAllIcons() {
  const brandBlue = "#2E3192";
  const projectRoot = process.cwd();
  const inputSvgPath = path.resolve(projectRoot, "app", "icon.svg");
  const publicDir = path.resolve(projectRoot, "public");
  const appDir = path.resolve(projectRoot, "app");

  await fs.access(inputSvgPath);
  await fs.mkdir(publicDir, { recursive: true });

  const faviconSpecs: GeneratedIconSpec[] = [
    { outputPath: path.join(publicDir, "favicon-16x16.png"), size: 16 },
    { outputPath: path.join(publicDir, "favicon-32x32.png"), size: 32 },
    { outputPath: path.join(publicDir, "favicon-48x48.png"), size: 48 },
  ];

  const androidSpecs: GeneratedIconSpec[] = [
    { outputPath: path.join(publicDir, "android-chrome-192x192.png"), size: 192 },
    { outputPath: path.join(publicDir, "android-chrome-512x512.png"), size: 512 },
  ];

  const maskableSpecs: GeneratedIconSpec[] = [
    {
      outputPath: path.join(publicDir, "maskable-192x192.png"),
      size: 192,
      background: brandBlue,
      marginRatio: 0.12,
    },
    {
      outputPath: path.join(publicDir, "maskable-512x512.png"),
      size: 512,
      background: brandBlue,
      marginRatio: 0.12,
    },
  ];

  // Generate small PNG favicons (transparent)
  for (const spec of faviconSpecs) {
    const buffer = await renderPngFromSvg(inputSvgPath, spec.size, {
      background: null,
      marginRatio: 0,
    });
    await fs.writeFile(spec.outputPath, buffer);
     
    console.log(`Generated ${spec.outputPath}`);
  }

  // Generate Android icons (transparent)
  for (const spec of androidSpecs) {
    const buffer = await renderPngFromSvg(inputSvgPath, spec.size, {
      background: null,
      marginRatio: 0,
    });
    await fs.writeFile(spec.outputPath, buffer);
     
    console.log(`Generated ${spec.outputPath}`);
  }

  // Generate maskable icons (brand background with safe padding)
  for (const spec of maskableSpecs) {
    const buffer = await renderPngFromSvg(inputSvgPath, spec.size, {
      background: spec.background ?? null,
      marginRatio: spec.marginRatio ?? 0,
    });
    await fs.writeFile(spec.outputPath, buffer);
     
    console.log(`Generated ${spec.outputPath}`);
  }

  // Generate Apple touch icon (use brand background and padding similar to maskable)
  const appleIconBuffer = await renderPngFromSvg(inputSvgPath, 180, {
    background: brandBlue,
    marginRatio: 0.12,
  });
  await fs.writeFile(path.join(appDir, "apple-icon.png"), appleIconBuffer);
   
  console.log(`Generated ${path.join(appDir, "apple-icon.png")}`);

  // Generate Windows tile icon (150x150)
  const winTile150 = await renderPngFromSvg(inputSvgPath, 150, {
    background: brandBlue,
    marginRatio: 0.12,
  });
  await fs.writeFile(path.join(publicDir, "mstile-150x150.png"), winTile150);
   
  console.log(`Generated ${path.join(publicDir, "mstile-150x150.png")}`);

  // Generate Safari pinned tab SVG (monochrome)
  await writePinnedTabSvg(inputSvgPath, path.join(publicDir, "safari-pinned-tab.svg"));
   
  console.log(`Generated ${path.join(publicDir, "safari-pinned-tab.svg")}`);
}

generateAllIcons().catch(err => {
   
  console.error(err);
  process.exit(1);
});
