// One-off generator for PWA / touch icons.
// Draws a white lowercase "f" monogram on the brand-green field.
// Run: node scripts/gen-icons.mjs
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BRAND = "#23b059";
const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public");

/** SVG for a size-512 canvas. `markScale` shrinks the glyph for maskable safe-zone. */
function svg({ maskable = false } = {}) {
  const s = maskable ? 0.8 : 1; // scale glyph around center (256,256)
  const t = `translate(256 256) scale(${s}) translate(-256 -256)`;
  // Lowercase "f": curved ear + vertical stem + crossbar. Stroked, round caps.
  const glyph = `
    <g transform="${t}" fill="none" stroke="#ffffff" stroke-width="54"
       stroke-linecap="round" stroke-linejoin="round">
      <path d="M316 178 C316 150 296 140 272 140 C244 140 232 164 232 198 L232 372" />
      <path d="M196 236 L300 236" />
    </g>`;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
       <rect width="512" height="512" fill="${BRAND}"/>${glyph}
     </svg>`
  );
}

const jobs = [
  { file: "icon-192.png", size: 192, svg: svg() },
  { file: "icon-512.png", size: 512, svg: svg() },
  { file: "icon-maskable-512.png", size: 512, svg: svg({ maskable: true }) },
  { file: "apple-touch-icon.png", size: 180, svg: svg() },
];

for (const job of jobs) {
  await sharp(job.svg)
    .resize(job.size, job.size)
    .png()
    .toFile(join(outDir, job.file));
  console.log("wrote", job.file);
}
