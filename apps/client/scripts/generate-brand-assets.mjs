import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GAME_CATALOG } from '@mesa-viva/core';
import {
  BrandAssetGenerator,
  HOLIDAY_IDS,
} from '@mesa-viva/design-system';
import sharp from 'sharp';

const root = process.cwd();
const workspace = resolve(root, '../..');
const publicDir = resolve(root, 'public');
const brandDir = resolve(publicDir, 'brand');
const iconsDir = resolve(publicDir, 'icons');
const androidDir = resolve(publicDir, 'android');
const splashDir = resolve(publicDir, 'splash');
for (const dir of [publicDir, brandDir, iconsDir, androidDir, splashDir, resolve(workspace, 'docs/assets')]) mkdirSync(dir, { recursive: true });

const logo = BrandAssetGenerator.logo({ mode: 'dark' });
writeFileSync(resolve(publicDir, 'favicon.svg'), BrandAssetGenerator.favicon({ mode: 'dark' }));
writeFileSync(resolve(brandDir, 'logo.svg'), logo);
writeFileSync(resolve(brandDir, 'logo-monochrome.svg'), BrandAssetGenerator.monochromeIcon(512));
writeFileSync(resolve(publicDir, 'brand/github-banner.svg'), BrandAssetGenerator.githubBanner({ mode: 'dark' }));
writeFileSync(resolve(workspace, 'docs/assets/github-banner.svg'), BrandAssetGenerator.githubBanner({ mode: 'dark' }));

for (const holidayId of HOLIDAY_IDS) {
  writeFileSync(resolve(brandDir, `holiday-${holidayId}.svg`), BrandAssetGenerator.holidayLogo(holidayId));
}
const GAME_KEYS = { 'caida-venezolana': 'caida', 'domino-venezolano': 'domino', 'blackjack-21': 'blackjack', 'cartas-de-colores': 'colores' };
for (const game of GAME_CATALOG) {
  const key = GAME_KEYS[game.id] ?? game.id;
  writeFileSync(resolve(brandDir, `game-${key}.svg`), BrandAssetGenerator.gameEmblem({ gameId: key }));
}
for (const gameId of ['poker', 'ajedrez']) {
  writeFileSync(resolve(brandDir, `game-${gameId}.svg`), BrandAssetGenerator.gameEmblem({ gameId }));
}
writeFileSync(resolve(androidDir, 'ic_launcher_foreground.svg'), BrandAssetGenerator.logo({ mode: 'dark', monochrome: false }));
writeFileSync(resolve(androidDir, 'ic_launcher_monochrome.svg'), BrandAssetGenerator.monochromeIcon(432));
writeFileSync(resolve(androidDir, 'ic_launcher_background.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="432" height="432"><title>Fondo de Mesa Viva</title><rect width="432" height="432" fill="#12100e"/></svg>');

async function png(svg, file, width, height = width) {
  await sharp(Buffer.from(svg)).resize(width, height).png().toFile(file);
}

await png(logo, resolve(iconsDir, 'icon-192.png'), 192);
await png(logo, resolve(iconsDir, 'icon-512.png'), 512);
await png(BrandAssetGenerator.pwaIcon(512, { maskable: true }), resolve(iconsDir, 'maskable-512.png'), 512);
await png(BrandAssetGenerator.monochromeIcon(512), resolve(iconsDir, 'monochrome-512.png'), 512);
await png(logo, resolve(iconsDir, 'apple-touch-icon.png'), 180);
await png(logo, resolve(publicDir, 'favicon-32.png'), 32);
await png(logo, resolve(publicDir, 'favicon-16.png'), 16);
for (const size of [48, 72, 96, 144, 192, 512]) {
  await png(BrandAssetGenerator.pwaIcon(size, { maskable: true }), resolve(androidDir, `ic_launcher-${size}.png`), size);
}
await png(BrandAssetGenerator.pwaIcon(512, { maskable: true }), resolve(androidDir, 'ic_launcher-playstore-512.png'), 512);
await png(BrandAssetGenerator.splash(1080, 1920), resolve(splashDir, 'splash-1080x1920.png'), 1080, 1920);
await png(BrandAssetGenerator.splash(1920, 1080), resolve(splashDir, 'splash-1920x1080.png'), 1920, 1080);

try {
  const cli = resolve(root, 'node_modules/@vite-pwa/assets-generator/bin/pwa-assets-generator.mjs');
  execFileSync(process.execPath, [cli, '--root', root, '--preset', 'minimal-2023', 'public/brand/logo.svg'], { cwd: root, stdio: 'ignore' });
} catch {
  // La generación propia ya cubre todos los iconos si el preset no está disponible.
}
console.log('Brand assets generados en public/ y docs/assets/');
