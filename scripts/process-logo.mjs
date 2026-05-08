/**
 * Removes near-black background from the TNT Tours logo PNG (sum RGB ≤ 50).
 * Run: node scripts/process-logo.mjs
 */
import sharp from "sharp";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const input = join(__dirname, "assets/tnt-tours-logo-source.png");
const output = join(__dirname, "../public/tnt-tours-logo.png");

const { data, info } = await sharp(readFileSync(input))
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
if (channels !== 4) throw new Error(`Expected RGBA, got ${channels} channels`);

for (let i = 0; i < data.length; i += 4) {
  const s = data[i] + data[i + 1] + data[i + 2];
  if (s <= 50) data[i + 3] = 0;
}

await sharp(data, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(output);

console.log("Wrote", output);
