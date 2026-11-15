import type { HolidayId } from '../holidays/holiday-ids.js';
import type { BrandPalette } from './types.js';

type Accessory = (palette: BrandPalette) => string;

export const SUMMER_ACCESSORIES: Partial<Record<HolidayId, Accessory>> = {
  'dia-familia': (p) => `<g transform="translate(80 0)">
    <path d="M2 26 L24 6 L46 26 Z" fill="${p.accent}"/>
    <rect x="8" y="26" width="32" height="22" rx="4" fill="${p.surface}" stroke="${p.primary}" stroke-width="2"/>
    <path d="M24 44 C14 36 17 30 23 34 C27 30 34 35 24 44 Z" fill="#e91e63"/>
  </g>`,
  'dia-tierra': (p) => `<g transform="translate(84 0)" fill="${p.primary}">
    <path d="M4 44 Q4 10 44 4 Q44 40 4 44 Z"/>
    <path d="M4 44 Q24 30 44 4" fill="none" stroke="${p.accent}" stroke-width="2.5"/>
    <path d="M16 34 Q26 28 30 20 M12 40 Q24 38 34 30" fill="none" stroke="#dcedc8" stroke-width="1.6"/>
  </g>`,
  'dia-encuentro-dos-mundos': (p) => `<g transform="translate(80 0)">
    <circle cx="30" cy="26" r="23" fill="none" stroke="${p.accent}" stroke-width="3"/>
    <path d="M30 3 V49 M7 26 H53 M12 10 L48 42 M48 10 L12 42" stroke="${p.accent}" stroke-width="2"/>
    <circle cx="30" cy="26" r="5" fill="${p.primary}"/>
  </g>`,
  'dia-independencia': (p) => `<g transform="translate(78 0)">
    <path d="M6 2 V52" stroke="#fff4e0" stroke-width="4" stroke-linecap="round"/>
    <path d="M8 4 Q28 14 54 2 V28 Q28 40 8 30 Z" fill="${p.accent}"/>
    <circle cx="28" cy="18" r="5" fill="#1e88e5"/><circle cx="38" cy="15" r="5" fill="#e53935"/>
    <circle cx="32" cy="24" r="5" fill="#fdd835"/><circle cx="22" cy="22" r="5" fill="#fdd835"/>
  </g>`,
  'vacaciones-verano': (p) => `<g transform="translate(84 0)" stroke="${p.accent}" stroke-width="3" stroke-linecap="round">
    <circle cx="24" cy="24" r="13" fill="#ffcc33" stroke="none"/>
    <path d="M24 2 V8 M24 40 V46 M2 24 H8 M40 24 H46 M8 8 L12 12 M36 36 L40 40 M40 8 L36 12 M12 36 L8 40"/>
  </g>`,
  'dia-normal': (p) => `<g transform="translate(88 2)" fill="${p.accent}">
    <path d="M18 0 L22 12 L34 16 L22 20 L18 32 L14 20 L2 16 L14 12 Z"/>
    <path d="M38 16 L40 23 L47 25 L40 27 L38 34 L36 27 L29 25 L36 23 Z" opacity="0.7"/>
  </g>`,
};
