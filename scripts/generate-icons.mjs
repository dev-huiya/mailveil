import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");

const svgBuffer = readFileSync(resolve(publicDir, "icon.svg"));

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generate() {
  mkdirSync(resolve(publicDir, "icons"), { recursive: true });

  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(resolve(publicDir, "icons", `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(resolve(publicDir, "apple-touch-icon.png"));
  console.log("Generated apple-touch-icon.png");

  // Favicon 32x32
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(resolve(publicDir, "favicon-32x32.png"));
  console.log("Generated favicon-32x32.png");

  // Favicon 16x16
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile(resolve(publicDir, "favicon-16x16.png"));
  console.log("Generated favicon-16x16.png");

  // favicon.ico (use 32x32 png as base)
  await sharp(svgBuffer)
    .resize(48, 48)
    .png()
    .toFile(resolve(publicDir, "favicon.ico"));
  console.log("Generated favicon.ico");

  console.log("\nAll icons generated successfully!");
}

generate().catch(console.error);
