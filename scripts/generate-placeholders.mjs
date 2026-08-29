// Run once with: node scripts/generate-placeholders.mjs
// Output is committed. Regenerate only if a slot's dimensions change.
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/assets/images';
mkdirSync(OUT, { recursive: true });

const tile = (w, h, shade) =>
  sharp({
    create: { width: w, height: h, channels: 3, background: { r: shade, g: shade, b: shade } },
  });

await tile(1920, 1080, 32).jpeg({ quality: 82 }).toFile(`${OUT}/hero-bg.jpg`);

for (let i = 1; i <= 6; i += 1) {
  await tile(600, 200, 210 - i * 8)
    .png()
    .toFile(`${OUT}/portfolio-0${i}.png`);
}

for (let i = 1; i <= 2; i += 1) {
  await tile(800, 800, 120 + i * 30)
    .jpeg({ quality: 82 })
    .toFile(`${OUT}/team-0${i}.jpg`);
}

console.log('placeholders written to', OUT);
