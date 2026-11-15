import type { HolidayId } from '../holidays/holiday-ids.js';
import type { BrandPalette } from './types.js';

type Accessory = (palette: BrandPalette) => string;

export const WINTER_ACCESSORIES: Partial<Record<HolidayId, Accessory>> = {
  navidad: () => `<g transform="translate(56 -8) rotate(7 24 28)">
    <path d="M2 30 Q16 -4 42 10 L34 32 Z" fill="#b3261e"/>
    <path d="M-2 29 Q18 24 37 32 L33 39 Q15 32 -1 35 Z" fill="#fff4e0"/>
    <circle cx="43" cy="10" r="7" fill="#fff4e0"/>
  </g>`,
  halloween: (p) => `<g transform="translate(76 2)">
    <ellipse cx="27" cy="25" rx="22" ry="18" fill="#f57c00"/>
    <path d="M10 18 L18 12 L22 21 L30 13 L38 22 L45 15" fill="none" stroke="#3b1d00" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M17 31 Q27 39 38 30" fill="none" stroke="#3b1d00" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M5 25 L0 22 M49 24 L54 20" stroke="#4caf50" stroke-width="3" stroke-linecap="round"/>
    <circle cx="18" cy="26" r="3" fill="#ffe082"/>
    <circle cx="37" cy="26" r="3" fill="${p.accent}"/>
  </g>`,
  'reyes-magos': (p) => `<g transform="translate(76 -2)">
    <path d="M2 28 L10 8 L22 22 L30 4 L40 22 L50 8 L56 28 Z" fill="${p.accent}" stroke="#7a5a00" stroke-width="2"/>
    <circle cx="10" cy="6" r="3" fill="#e53935"/><circle cx="30" cy="2" r="3" fill="#43a047"/><circle cx="50" cy="6" r="3" fill="#1e88e5"/>
  </g>`,
  'dia-inocentes': (p) => `<g transform="translate(72 0)">
    <path d="M4 34 Q12 4 28 10 Q34 22 46 8 Q60 4 62 34 Q34 48 4 34 Z" fill="${p.accent}"/>
    <circle cx="10" cy="35" r="4" fill="#e53935"/><circle cx="34" cy="38" r="4" fill="#43a047"/><circle cx="58" cy="35" r="4" fill="#1e88e5"/>
    <path d="M20 18 Q30 25 44 17" fill="none" stroke="#fff4e0" stroke-width="2" stroke-linecap="round"/>
  </g>`,
  'ano-bisiesto': (p) => `<g transform="translate(80 0)">
    <rect x="0" y="6" width="44" height="38" rx="6" fill="${p.surface}" stroke="${p.accent}" stroke-width="2.5"/>
    <path d="M0 18 H44" stroke="${p.accent}" stroke-width="2.5"/>
    <text x="22" y="36" text-anchor="middle" font-family="system-ui,sans-serif" font-size="18" font-weight="800" fill="${p.accent}">29</text>
  </g>`,
  'vacaciones-invierno': (p) => `<g transform="translate(84 2)" stroke="${p.accent}" stroke-width="3" stroke-linecap="round">
    <path d="M20 2 V40 M2 21 H38 M7 8 L33 34 M33 8 L7 34"/>
    <circle cx="20" cy="21" r="4" fill="#b3e5fc" stroke="none"/>
  </g>`,
};
