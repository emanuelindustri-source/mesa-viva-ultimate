import type { HolidayId } from '../holidays/holiday-ids.js';
import type { BrandPalette } from './types.js';

type Accessory = (palette: BrandPalette) => string;

export const SPRING_ACCESSORIES: Partial<Record<HolidayId, Accessory>> = {
  carnaval: (p) => `<g transform="translate(74 0)">
    <path d="M0 24 Q14 4 32 14 Q30 36 12 40 Q-2 38 0 24 Z" fill="${p.accent}"/>
    <path d="M34 14 Q50 2 62 22 Q48 34 32 36 Q30 22 34 14 Z" fill="${p.primary}"/>
    <path d="M12 18 Q20 24 28 18 M38 18 Q46 24 54 18" fill="none" stroke="#241a2f" stroke-width="3" stroke-linecap="round"/>
    <path d="M32 20 Q34 30 30 38" fill="none" stroke="#fff4e0" stroke-width="2"/>
  </g>`,
  'semana-santa': (p) => `<g transform="translate(80 0)" stroke="${p.primary}" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M22 4 Q8 22 18 40 M22 4 Q34 18 28 36"/>
    <path d="M4 44 Q22 32 48 42"/>
    <path d="M8 26 Q18 20 26 26 M36 22 Q42 26 44 32" stroke="${p.accent}"/>
  </g>`,
  'san-valentin': (p) => `<g transform="translate(86 2)">
    <path d="M24 42 C-4 22 4 0 22 10 C30 14 34 14 42 10 C60 0 68 22 40 42 L32 48 Z" fill="${p.primary}" stroke="#ffd1dc" stroke-width="2"/>
    <path d="M14 7 Q24 3 28 12" fill="none" stroke="#fff4e0" stroke-width="3" stroke-linecap="round"/>
  </g>`,
  'san-patricio': (p) => `<g transform="translate(84 0)" fill="${p.primary}">
    <circle cx="22" cy="18" r="9"/><circle cx="34" cy="18" r="9"/><circle cx="28" cy="28" r="9"/>
    <path d="M28 34 Q30 44 34 50" stroke="#2e7d32" stroke-width="3" fill="none"/>
  </g>`,
  'dia-madre': (p) => `<g transform="translate(84 0)">
    <circle cx="18" cy="16" r="9" fill="#f48fb1"/><circle cx="32" cy="16" r="9" fill="#f48fb1"/>
    <circle cx="18" cy="30" r="9" fill="#f8bbd0"/><circle cx="32" cy="30" r="9" fill="#f8bbd0"/>
    <circle cx="25" cy="23" r="6" fill="${p.accent}"/>
    <path d="M25 32 Q26 42 31 50" stroke="#388e3c" stroke-width="3" fill="none"/>
  </g>`,
  'dia-padre': (p) => `<g transform="translate(86 0)">
    <path d="M14 2 L24 10 L34 2 L40 8 L32 16 L30 48 L18 48 L16 16 L8 8 Z" fill="${p.primary}" stroke="${p.accent}" stroke-width="2"/>
    <path d="M18 20 L25 28 L30 20" fill="none" stroke="${p.accent}" stroke-width="2"/>
  </g>`,
  'dia-nino': (p) => `<g transform="translate(86 0)">
    <ellipse cx="24" cy="22" rx="18" ry="22" fill="${p.accent}"/>
    <path d="M24 44 Q28 52 36 54" stroke="#fff4e0" stroke-width="2" fill="none"/>
    <ellipse cx="18" cy="17" rx="4" ry="7" fill="#fff4e0" opacity="0.55"/>
  </g>`,
  'dia-hijo': (p) => `<g transform="translate(80 0)">
    <path d="M8 30 L34 4 L58 24 L30 50 Z" fill="${p.accent}" stroke="#fff4e0" stroke-width="2"/>
    <path d="M30 50 Q22 58 16 66" stroke="#fff4e0" stroke-width="2" fill="none"/>
    <path d="M16 66 L8 70 M16 66 L22 72" stroke="${p.primary}" stroke-width="2"/>
  </g>`,
};
