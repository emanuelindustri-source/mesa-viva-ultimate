import { blendHex, type Theme } from '@mesa-viva/design-system';

export type GlossTier = 'oro' | 'plata' | 'bronce' | 'satinado';

export interface RankGloss {
  readonly tier: GlossTier;
  readonly highlight: string;
  readonly base: string;
  readonly metalness: number;
  readonly sheenAlpha: number;
  readonly strokeAlpha: number;
}

const HIGH_RANKS = new Set(['A', 'K', 'Q', 'J']);
const MID_RANKS = new Set(['10', '9', '8']);

/** Brillo metálico determinista según el rango de la carta. */
export function glossForRank(rank: string, theme: Theme): RankGloss {
  const normalized = rank.trim().toUpperCase();
  const isHigh = HIGH_RANKS.has(normalized);
  const isMid = MID_RANKS.has(normalized);
  const tier: GlossTier = isHigh ? 'oro' : isMid ? 'plata' : 'satinado';
  const base = theme.mode === 'dark' ? theme.scheme['surface-container-high'] : theme.scheme.surface;
  const highlight = isHigh
    ? blendHex(theme.scheme.tertiary, '#fff4c2', 0.55)
    : isMid
      ? blendHex(theme.scheme.secondary, '#f4f7fb', 0.5)
      : blendHex(theme.scheme['outline-variant'], theme.scheme.surface, 0.6);
  return {
    tier,
    highlight,
    base,
    metalness: isHigh ? 0.92 : isMid ? 0.58 : 0.24,
    sheenAlpha: isHigh ? 0.5 : isMid ? 0.32 : 0.14,
    strokeAlpha: isHigh ? 0.8 : 0.45,
  };
}

/** Medalla de asiento según rango competitivo. */
export function seatFrameForRank(rank: string): GlossTier {
  const normalized = rank.trim().toLowerCase();
  if (normalized.includes('maestro') || normalized.includes('diamante')) return 'oro';
  if (normalized.includes('competitivo') || normalized.includes('oro')) return 'plata';
  if (normalized.includes('novato') || normalized.includes('plata')) return 'bronce';
  return 'satinado';
}
