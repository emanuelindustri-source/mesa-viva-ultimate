import { holidayAccessory } from './accessories.js';
import { brandPalette } from './palette.js';
import type { GameEmblemOptions } from './types.js';

const LIGHT_INK = '#fff4e0';

function card(x: number, y: number, rotate: number, fill: string, ink: string, label: string): string {
  return `<g transform="rotate(${rotate} ${x + 23} ${y + 34})">
    <rect x="${x}" y="${y}" width="46" height="68" rx="7" fill="${fill}" stroke="${ink}" stroke-width="2"/>
    <text x="${x + 23}" y="${y + 44}" text-anchor="middle" font-family="Georgia,serif" font-size="27" font-weight="700" fill="${ink}">${label}</text>
  </g>`;
}

function pips(cx: number, cy: number, value: number, color: string): string {
  const spots = value === 0 ? [] : value === 1 ? [[0, 0]] : value === 2 ? [[-10, -18], [10, 18]] : value === 3 ? [[-10, -18], [0, 0], [10, 18]] : [[-10, -18], [10, -18], [-10, 18], [10, 18]];
  return spots.map(([dx = 0, dy = 0]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="5" fill="${color}"/>`).join('');
}

function emblem(gameId: string, p: ReturnType<typeof brandPalette>): string {
  if (gameId === 'caida') {
    return `<g transform="translate(20 32)">${card(0, 8, -18, p.surface, p.ink, 'A')}${card(28, 2, 0, '#b3261e', LIGHT_INK, '7')}${card(56, 8, 18, p.surface, p.ink, 'S')}
      <circle cx="46" cy="34" r="10" fill="${p.accent}" stroke="#7a5a00" stroke-width="2"/><text x="46" y="40" text-anchor="middle" font-size="13" fill="#3a2a00">$</text></g>`;
  }
  if (gameId === 'domino') {
    return `<g transform="translate(30 30)">
      <rect x="0" y="4" width="30" height="60" rx="6" fill="${p.surface}" stroke="${p.ink}" stroke-width="2" transform="rotate(-14 15 34)"/>
      <path d="M4 34 H26" stroke="${p.ink}" stroke-width="2" transform="rotate(-14 15 34)"/>${pips(15, 18, 4, p.primary)}${pips(15, 48, 6, '#b3261e')}
      <rect x="38" y="4" width="30" height="60" rx="6" fill="${p.surface}" stroke="${p.ink}" stroke-width="2" transform="rotate(12 53 34)"/>
      <path d="M42 34 H64" stroke="${p.ink}" stroke-width="2" transform="rotate(12 53 34)"/>${pips(53, 18, 3, p.primary)}${pips(53, 48, 5, '#b3261e')}
    </g>`;
  }
  if (gameId === 'blackjack') {
    return `<g transform="translate(27 30)">${card(4, 4, 8, p.surface, p.ink, 'A')}<text x="51" y="66" text-anchor="middle" font-family="system-ui,sans-serif" font-size="32" font-weight="900" fill="${p.accent}">21</text>
      <circle cx="26" cy="78" r="16" fill="#b3261e" stroke="${p.accent}" stroke-width="3"/><circle cx="26" cy="78" r="8" fill="none" stroke="${p.accent}" stroke-width="2"/>
    </g>`;
  }
  if (gameId === 'colores') {
    return `<g transform="translate(64 66)">
      <path d="M0 0 L-34 -30 A44 44 0 0 1 0 -44 Z" fill="#e53935"/>
      <path d="M0 0 L0 -44 A44 44 0 0 1 34 -30 Z" fill="#fdd835"/>
      <path d="M0 0 L34 -30 A44 44 0 0 1 34 30 Z" fill="#43a047"/>
      <path d="M0 0 L34 30 A44 44 0 0 1 -34 30 Z" fill="#1e88e5"/>
      <circle r="12" fill="${p.background}" stroke="${p.ink}" stroke-width="2"/>
    </g>`;
  }
  if (gameId === 'poker') {
    return `<g transform="translate(30 30)">${card(0, 0, -10, p.surface, p.ink, 'A')}${card(26, 4, 12, p.surface, p.ink, 'K')}
      <text x="46" y="104" text-anchor="middle" font-size="24" fill="#e53935">♥ ♠ ♣ ♦</text></g>`;
  }
  if (gameId === 'ajedrez') {
    return `<g transform="translate(64 66)" fill="${p.accent}" stroke="${p.ink}" stroke-width="2">
      <path d="M-12 38 H12 L8 22 H-8 Z M-9 22 H9 L6 10 H-6 Z M-4 10 H4 V-16 H12 V-24 H-12 V-16 H-4 Z"/>
      <circle cx="0" cy="-28" r="6"/><path d="M-16 42 H16" stroke-width="4"/>
    </g>`;
  }
  return `<g transform="translate(64 68)"><text text-anchor="middle" font-family="Segoe UI,system-ui,sans-serif" font-size="46" font-weight="800" fill="${p.accent}">M</text></g>`;
}

/** Emblema único por juego con el mismo lenguaje visual del logo de Mesa Viva. */
export function generateGameEmblem(options: GameEmblemOptions): string {
  const p = brandPalette(options);
  const size = Math.max(24, Math.floor(options.size ?? 128));
  const title = options.title ?? `Mesa Viva · ${options.gameId}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128" role="img" aria-label="${title}">
    <defs><linearGradient id="emblem-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.surface}"/><stop offset="1" stop-color="${p.background}"/></linearGradient></defs>
    <rect x="2" y="2" width="124" height="124" rx="30" fill="url(#emblem-bg)" stroke="${p.accent}" stroke-width="2"/>
    ${emblem(options.gameId, p)}
    ${holidayAccessory(options.holidayId ?? 'dia-normal', p)}
    <title>${title}</title>
  </svg>`;
}

export function gameEmblemDataUri(options: GameEmblemOptions): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(generateGameEmblem(options))}`;
}
