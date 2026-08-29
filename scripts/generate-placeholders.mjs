// Run once by hand: node scripts/generate-placeholders.mjs
// Output is committed. Regenerate only if a slot's dimensions change.
//
// These are structured rather than flat on purpose. A solid tile loads and
// proves nothing: it cannot show that an image is present, how object-cover
// crops at a different viewport, or what the hero overlay does to a photograph.
// Everything here is grayscale, matching the site's palette rule.
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const OUT = 'public/assets/images';
mkdirSync(OUT, { recursive: true });

const svg = (w, h, body) =>
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`);

// Hero: broad diagonal bands plus a horizon, so the crop is readable at any
// viewport and the ink overlay has something to sit on top of.
const heroBody = `
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#6e6e6e"/><stop offset="100%" stop-color="#232323"/>
  </linearGradient></defs>
  <rect width="1920" height="1080" fill="url(#g)"/>
  <rect y="640" width="1920" height="440" fill="#1a1a1a" opacity="0.55"/>
  <g fill="#ffffff" opacity="0.06">
    <polygon points="0,1080 720,0 1000,0 280,1080"/>
    <polygon points="900,1080 1620,0 1760,0 1040,1080"/>
  </g>
  <g stroke="#ffffff" stroke-opacity="0.12" stroke-width="2">
    <line x1="0" y1="640" x2="1920" y2="640"/>
  </g>`;

await sharp(svg(1920, 1080, heroBody))
  .jpeg({ quality: 82 })
  .toFile(`${OUT}/hero-bg.jpg`);

// A bordered frame with a diagonal cross is the universal "image goes here"
// idiom, and it makes an empty or mis-sized slot obvious at a glance.
const slot = (w, h, fill, stroke) => `
  <rect width="${w}" height="${h}" fill="${fill}"/>
  <g stroke="${stroke}" stroke-width="2" fill="none">
    <rect x="1" y="1" width="${w - 2}" height="${h - 2}"/>
    <line x1="0" y1="0" x2="${w}" y2="${h}"/>
    <line x1="${w}" y1="0" x2="0" y2="${h}"/>
  </g>`;

for (let i = 1; i <= 6; i += 1) {
  const shade = 236 - i * 10;
  const hex = shade.toString(16).padStart(2, '0').repeat(3);
  await sharp(svg(600, 200, slot(600, 200, `#${hex}`, '#9a9a9a')))
    .png()
    .toFile(`${OUT}/portfolio-0${i}.png`);
}

for (let i = 1; i <= 2; i += 1) {
  const shade = 150 + i * 30;
  const hex = shade.toString(16).padStart(2, '0').repeat(3);
  await sharp(svg(800, 800, slot(800, 800, `#${hex}`, '#6e6e6e')))
    .jpeg({ quality: 82 })
    .toFile(`${OUT}/team-0${i}.jpg`);
}

console.log('placeholders written to', OUT);
