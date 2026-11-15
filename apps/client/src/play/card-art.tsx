import { buildColorCard, buildDominoTile, buildEnglishCard, buildSpanishCard, buildWildCard, type COLOR_CARD_SYMBOLS, type EnglishRank, type EnglishSuit, type SpanishSuit } from '@mesa-viva/design-system';

type ColorSymbol = (typeof COLOR_CARD_SYMBOLS)[number];
const cache = new Map<string, string>();

function englishMarkup(rank: string, suit: string): string {
  const palo = (['hearts', 'diamonds', 'clubs', 'spades'] as const).find((item) => suit.toLowerCase().includes(item)) ?? 'spades';
  const key = `en:${palo}:${rank}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const markup = buildEnglishCard(palo as EnglishSuit, rank as EnglishRank).markup;
  cache.set(key, markup);
  return markup;
}

function spanishMarkup(rank: string, suit: string): string {
  const normalized = suit.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const palo: SpanishSuit = normalized.startsWith('oro') ? 'oros'
    : normalized.startsWith('copa') ? 'copas'
      : normalized.startsWith('espada') ? 'espadas' : 'bastos';
  const numeric = Number.parseInt(rank, 10);
  const safeRank = Number.isFinite(numeric) && numeric >= 1 && numeric <= 12 ? numeric : 1;
  const key = `es:${palo}:${safeRank}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const markup = buildSpanishCard(palo, safeRank).markup;
  cache.set(key, markup);
  return markup;
}

function colorMarkup(rank: string, suit: string): string {
  const color = (['rojo', 'azul', 'verde', 'amarillo'] as const).find((item) => suit.toLowerCase().includes(item)) ?? 'rojo';
  const lower = rank.toLowerCase();
  const key = `co:${color}:${lower}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  let markup: string;
  if (lower.includes('roba cuatro') || lower === 'roba4' || lower === '+4') {
    markup = buildWildCard('roba4').markup;
  } else if (lower.includes('comod')) {
    markup = buildWildCard('comodin').markup;
  } else {
    const symbol: ColorSymbol = /^\d$/.test(rank) ? rank as ColorSymbol
      : lower.includes('roba') ? 'roba2'
        : lower.includes('rev') ? 'reversa'
          : lower.includes('salta') ? 'salta' : '0';
    markup = buildColorCard(color, symbol).markup;
  }
  cache.set(key, markup);
  return markup;
}

function dominoMarkup(rank: string, suit: string): string {
  const a = Math.max(0, Math.min(12, Number.parseInt(rank, 10) || 0));
  const b = Math.max(0, Math.min(12, Number.parseInt(suit, 10) || 0));
  const key = `do:${Math.min(a, b)}:${Math.max(a, b)}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;
  const markup = buildDominoTile(Math.min(a, b), Math.max(a, b)).markup;
  cache.set(key, markup);
  return markup;
}

export function cardMarkup(deck: 'espanola' | 'inglesa' | 'colores' | 'domino', rank: string, suit: string): string {
  if (deck === 'espanola') return spanishMarkup(rank, suit);
  if (deck === 'inglesa') return englishMarkup(rank, suit);
  if (deck === 'colores') return colorMarkup(rank, suit);
  return dominoMarkup(rank, suit);
}

export function CardArt({ deck, rank, suit, className = '' }: { deck: 'espanola' | 'inglesa' | 'colores' | 'domino'; rank: string; suit: string; className?: string }) {
  const markup = cardMarkup(deck, rank, suit);
  return <span class={`arte-carta ${className}`} aria-hidden="true" dangerouslySetInnerHTML={{ __html: markup }} />;
}
