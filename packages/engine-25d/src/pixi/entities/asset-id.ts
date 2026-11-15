import type { CardDeck } from '../../state/snapshot.js';

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ENGLISH_SUITS: Readonly<Record<string, string>> = {
  corazones: 'hearts',
  diamantes: 'diamonds',
  treboles: 'clubs',
  picas: 'spades',
};

const SPANISH_SUITS: Readonly<Record<string, string>> = {
  oro: 'oros',
  copa: 'copas',
  espada: 'espadas',
  basto: 'bastos',
};

/** Ids estables compartidos con el atlas vectorial de la Fase 2. */
export function cardAssetId(deck: CardDeck, rank: string, suit: string): string {
  if (deck === 'espanola') {
    return `carta-espanola-${normalize(SPANISH_SUITS[suit] ?? suit)}-${normalize(rank)}`;
  }
  if (deck === 'inglesa') {
    return `carta-inglesa-${normalize(ENGLISH_SUITS[suit] ?? suit)}-${normalize(rank)}`;
  }
  return `carta-color-${normalize(suit)}-${normalize(rank)}`;
}

export function tileAssetId(a: number, b: number): string {
  const low = Math.min(a, b);
  const high = Math.max(a, b);
  return `ficha-domino-${low}-${high}`;
}

export function boardAssetId(kind: string): string {
  return `tablero-${normalize(kind)}`;
}
