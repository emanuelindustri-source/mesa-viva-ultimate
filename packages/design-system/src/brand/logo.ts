import type { HolidayId } from '../holidays/holiday-ids.js';
import { holidayAccessory } from './accessories.js';
import { brandPalette, contrastInk } from './palette.js';
import type { BrandOptions } from './types.js';

function escapeTitle(title: string): string {
  return title.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

function defs(palette: ReturnType<typeof brandPalette>, id: string): string {
  return `<defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.surface}"/><stop offset="1" stop-color="${palette.background}"/>
    </linearGradient>
    <linearGradient id="gold-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f4d06f"/><stop offset="0.55" stop-color="${palette.accent}"/><stop offset="1" stop-color="#8a6410"/>
    </linearGradient>
    <linearGradient id="felt-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${palette.primary}"/><stop offset="1" stop-color="#0d3b32"/>
    </linearGradient>
  </defs>`;
}

function mark(palette: ReturnType<typeof brandPalette>, id: string): string {
  return `<ellipse cx="64" cy="85" rx="48" ry="24" fill="url(#felt-${id})"/>
    <ellipse cx="64" cy="85" rx="38" ry="17" fill="none" stroke="${palette.accent}" stroke-width="1.5" opacity="0.55"/>
    <g transform="rotate(-10 52 58)">
      <rect x="27" y="30" width="38" height="54" rx="6" fill="${palette.surface}" stroke="${palette.ink}" stroke-width="2"/>
      <path d="M31 38 H61 M31 56 H61 M31 74 H61" stroke="${palette.primary}" stroke-width="2" opacity="0.35"/>
      <path d="M46 44 L56 58 L46 72 L36 58 Z" fill="url(#gold-${id})"/>
    </g>
    <g transform="rotate(9 82 52)">
      <rect x="60" y="24" width="38" height="54" rx="6" fill="#b3261e" stroke="#5f130f" stroke-width="2"/>
      <path d="M68 32 H90 M68 50 H90 M68 68 H90" stroke="#fff4e0" stroke-width="2" opacity="0.7"/>
      <path d="M79 38 C73 48 77 58 79 62 C81 58 85 48 79 38 Z" fill="#fff4e0" opacity="0.9"/>
    </g>
    <g transform="translate(94 64) rotate(8)">
      <rect width="18" height="18" rx="4" fill="${palette.ink}"/>
      <circle cx="5" cy="5" r="1.6" fill="${palette.surface}"/><circle cx="13" cy="5" r="1.6" fill="${palette.surface}"/>
      <circle cx="9" cy="9" r="1.6" fill="${palette.surface}"/><circle cx="5" cy="13" r="1.6" fill="${palette.surface}"/>
      <circle cx="13" cy="13" r="1.6" fill="${palette.surface}"/>
    </g>
    <path d="M18 28 L21 37 L30 40 L21 43 L18 52 L15 43 L6 40 L15 37 Z" fill="#fff4e0" opacity="0.9"/>`;
}

/** Logo mutante de Mesa Viva: la mesa, las cartas y el accesorio de la festividad. */
export function generateLogo(options: BrandOptions = {}): string {
  const palette = brandPalette(options);
  const id = (options.holidayId ?? 'dia-normal').replaceAll(/[^a-z0-9-]/gi, '');
  const size = Math.max(16, Math.floor(options.size ?? 128));
  const title = options.title ?? `Mesa Viva · ${options.holidayId ?? 'Día Normal'}`;
  const content = options.monochrome === true
    ? `<rect x="8" y="8" width="112" height="112" rx="28" fill="none" stroke="#fff" stroke-width="6"/>
       <path d="M34 46 H62 V86 H34 Z M66 36 H88 V86 H66 Z" fill="#fff"/>
       <path d="M18 28 L21 37 L30 40 L21 43 L18 52 L15 43 L6 40 L15 37 Z" fill="#fff"/>`
    : `${defs(palette, id)}<rect x="2" y="2" width="124" height="124" rx="30" fill="url(#bg-${id})" stroke="${palette.accent}" stroke-width="2"/>${mark(palette, id)}${holidayAccessory(options.holidayId ?? 'dia-normal', palette)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128" role="img" aria-label="${escapeTitle(title)}">${content}<title>${escapeTitle(title)}</title></svg>`;
}

export function generateFavicon(options: BrandOptions = {}): string {
  return generateLogo({ ...options, size: 64 });
}

export function generatePwaIcon(
  size: number,
  options: BrandOptions & { maskable?: boolean; monochrome?: boolean } = {},
): string {
  const palette = brandPalette(options);
  const inner = generateLogo({ ...options, size: 128, monochrome: options.monochrome ?? false });
  const body = inner.replace(/^<svg[^>]*>|<\/svg>$/g, '');
  const scale = options.maskable === true ? 0.74 : 1;
  const offset = (128 - 128 * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128" role="img" aria-label="Mesa Viva">
    <rect width="128" height="128" fill="${options.maskable === true ? palette.background : 'transparent'}"/>
    <g transform="translate(${offset} ${offset}) scale(${scale})">${body}</g>
  </svg>`;
}

export function generateSplash(
  width = 1170,
  height = 2532,
  options: BrandOptions & { tagline?: string } = {},
): string {
  const palette = brandPalette(options);
  const logo = generateLogo({ ...options, size: 220 });
  const logoBody = logo.replace(/^<svg[^>]*>|<\/svg>$/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Mesa Viva">
    <defs><radialGradient id="splash-glow" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="${palette.primary}" stop-opacity="0.35"/><stop offset="1" stop-color="${palette.background}" stop-opacity="0"/></radialGradient></defs>
    <rect width="${width}" height="${height}" fill="${palette.background}"/><rect width="${width}" height="${height}" fill="url(#splash-glow)"/>
    <g transform="translate(${(width - 220) / 2} ${height * 0.3})">${logoBody}</g>
    <text x="50%" y="${height * 0.52}" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="64" font-weight="700" fill="${palette.ink}">Mesa Viva</text>
    <text x="50%" y="${height * 0.56}" text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="26" fill="${palette.muted}">${options.tagline ?? 'La fiesta se juega en tu mesa'}</text>
  </svg>`;
}

export function generateGithubBanner(options: BrandOptions = {}): string {
  const palette = brandPalette(options);
  const logo = generateLogo({ ...options, size: 210 });
  const logoBody = logo.replace(/^<svg[^>]*>|<\/svg>$/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="320" viewBox="0 0 1280 320" role="img" aria-label="Mesa Viva Ultimate">
    <defs><linearGradient id="banner-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${palette.background}"/><stop offset="1" stop-color="${palette.surface}"/></linearGradient>
    <radialGradient id="banner-glow" cx="15%" cy="20%" r="60%"><stop offset="0" stop-color="${palette.accent}" stop-opacity="0.28"/><stop offset="1" stop-color="${palette.background}" stop-opacity="0"/></radialGradient></defs>
    <rect width="1280" height="320" fill="url(#banner-bg)"/><rect width="1280" height="320" fill="url(#banner-glow)"/>
    <g transform="translate(58 55) scale(1.15)">${logoBody}</g>
    <text x="360" y="142" font-family="Segoe UI,system-ui,sans-serif" font-size="70" font-weight="800" fill="${palette.ink}">Mesa Viva</text>
    <text x="362" y="190" font-family="Segoe UI,system-ui,sans-serif" font-size="27" fill="${palette.accent}">Portal, app jugable y sonido multicanal</text>
    <text x="362" y="232" font-family="Segoe UI,system-ui,sans-serif" font-size="21" fill="${palette.muted}">Caída · Dominó · Blackjack · Cartas de Colores</text>
    <text x="1180" y="290" text-anchor="end" font-family="Segoe UI,system-ui,sans-serif" font-size="18" fill="${contrastInk(palette.background)}" opacity="0.7">100% offline · 11 idiomas · 19 festividades</text>
  </svg>`;
}

export function generateHolidayLogo(holidayId: HolidayId, options: BrandOptions = {}): string {
  return generateLogo({ ...options, holidayId });
}
