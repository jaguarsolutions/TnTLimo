/**
 * Resize JPEGs from temp_pics for web (max width 1920, quality 85).
 * Run from project root: node scripts/optimize-site-images.mjs
 */
import sharp from "sharp";
import { mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const srcDir = join(root, "temp_pics");
const outDir = join(root, "public/images/site");

const jobs = [
  ["alonso-reyes-Wff-dK05DVg-unsplash.jpg", "hero-los-angeles-twilight.jpg"],
  ["meg-von-haartman-dmHp6Np9Gmk-unsplash.jpg", "walk-of-fame-disney-star.jpg"],
  ["nils-huenerfuerst-rMG_acMmyk0-unsplash.jpg", "griffith-observatory-sunset-aerial.jpg"],
  ["meg-von-haartman-vVk_fExTY0A-unsplash.jpg", "beverly-hills-sign.jpg"],
  ["santaMonica.jpg", "santa-monica-palms-sunset.jpg"],
  ["waltDisneyConcertHall.jpg", "walt-disney-concert-hall.jpg"],
  ["Universal.jpg", "universal-studios-globe.jpg"],
  ["hollywoodsign.jpg", "hollywood-sign-hills.jpg"],
  ["GriffithObsevatory.jpg", "griffith-observatory-day.jpg"],
];

/** Original tour photos — `temp_pics/update/` (see siteImages.ts). */
const updateDir = join(srcDir, "update");
const updateJobs = [
  ["IMG_0005.jpeg", "crypto-com-arena-exterior.jpg"],
  ["IMG_0006.jpeg", "crypto-com-arena-star-plaza.jpg"],
  ["IMG_0061.jpeg", "griffith-observatory-approach.jpg"],
  ["IMG_0065.jpeg", "tcl-chinese-theatre-hollywood.jpg"],
  ["IMG_0069.jpeg", "hard-rock-cafe-hollywood.jpg"],
  ["IMG_0498.jpeg", "hollywood-la-la-land-terminator.jpg"],
  ["IMG_0500.jpeg", "classic-hollywood-elvis-cadillac.jpg"],
  ["IMG_0505.jpeg", "the-grove-vintage-truck.jpg"],
  ["IMG_7011.jpeg", "walk-of-fame-oliver-stone-star.jpg"],
  ["IMG_7029.jpeg", "santa-monica-yacht-harbor-sign.jpg"],
];

await mkdir(outDir, { recursive: true });

async function processBatch(batch, dir) {
  for (const [file, destName] of batch) {
    const input = join(dir, file);
    const output = join(outDir, destName);
    await sharp(input)
      .resize(1920, null, { withoutEnlargement: true, fit: "inside" })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(output);
    console.log("Wrote", destName);
  }
}

await processBatch(jobs, srcDir);
await processBatch(updateJobs, updateDir);
