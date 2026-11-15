import type { ColorsCard } from '@mesa-viva/core';

interface SpanishCardLike { readonly rank: number; readonly suit: string; }
interface PlayingCardLike { readonly rank: string; readonly suit: string; }
interface DominoTileLike { readonly id: string; readonly a: number; readonly b: number; }

const SPANISH_SUIT_ICON: Readonly<Record<string, string>> = { oro: '●', copa: '♣', espada: '⚔', basto: '♠' };
const PLAYING_SUIT_ICON: Readonly<Record<string, string>> = { hearts: '♥', diamonds: '♦', clubs: '♣', spades: '♠', '♥': '♥', '♦': '♦', '♣': '♣', '♠': '♠' };
const COLOR_HEX: Readonly<Record<string, string>> = { rojo: '#e53935', azul: '#1e88e5', verde: '#43a047', amarillo: '#fdd835', negro: '#263238' };

function rankLabel(rank: number | string): string {
  if (rank === 1) return 'A';
  if (rank === 10) return 'S';
  if (rank === 11) return 'C';
  if (rank === 12) return 'R';
  return String(rank);
}

export function SpanishCardFace({ card, small = false }: { card: SpanishCardLike; small?: boolean }) {
  return (
    <span class={`carta carta--espanola carta--${card.suit} ${small ? 'carta--mini' : ''}`} title={`${rankLabel(card.rank)} de ${card.suit}`}>
      <strong>{rankLabel(card.rank)}</strong>
      <span aria-hidden="true">{SPANISH_SUIT_ICON[card.suit] ?? '•'}</span>
    </span>
  );
}

export function PlayingCardFace({ card, hidden = false, small = false }: { card: PlayingCardLike; hidden?: boolean; small?: boolean }) {
  const red = card.suit === 'hearts' || card.suit === 'diamonds' || card.suit === '♥' || card.suit === '♦';
  return (
    <span class={`carta carta--inglesa ${red ? 'carta--roja' : ''} ${hidden ? 'carta--oculta' : ''} ${small ? 'carta--mini' : ''}`} title={hidden ? 'Carta oculta' : `${card.rank} de ${card.suit}`}>
      {hidden ? <span class="carta__dorso" aria-hidden="true">✦</span> : <><strong>{card.rank}</strong><span aria-hidden="true">{PLAYING_SUIT_ICON[card.suit] ?? '•'}</span></>}
    </span>
  );
}

export function ColorCardFace({ card, small = false }: { card: ColorsCard; small?: boolean }) {
  const color = COLOR_HEX[card.color] ?? '#263238';
  const symbol = typeof card.symbol === 'number' ? String(card.symbol) : card.symbol === 'roba2' ? '+2' : card.symbol === 'roba4' ? '+4' : card.symbol === 'salta' ? '⊘' : card.symbol === 'reversa' ? '↻' : '✦';
  return (
    <span class={`carta carta--color ${small ? 'carta--mini' : ''}`} style={{ '--carta-color': color }} title={`${String(card.symbol)} ${card.color}`}>
      <strong>{symbol}</strong>
      <span class="carta__brillo" aria-hidden="true" />
    </span>
  );
}

function pipPositions(value: number): readonly [number, number][] {
  if (value <= 0) return [];
  const positions: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[30, 28], [70, 72]],
    3: [[30, 25], [50, 50], [70, 75]],
    4: [[30, 28], [70, 28], [30, 72], [70, 72]],
    5: [[30, 25], [70, 25], [50, 50], [30, 75], [70, 75]],
    6: [[30, 22], [70, 22], [30, 50], [70, 50], [30, 78], [70, 78]],
  };
  return positions[Math.min(6, value)] ?? [[50, 50]];
}

export function DominoTileFace({ tile, small = false, vertical = false }: { tile: DominoTileLike; small?: boolean; vertical?: boolean }) {
  return (
    <span class={`ficha-dominio ${vertical ? 'ficha-dominio--vertical' : ''} ${small ? 'ficha-dominio--mini' : ''}`} title={`${tile.a}–${tile.b}`}>
      <span class="ficha-dominio__lado">
        {pipPositions(tile.a).map(([x, y], index) => <i key={`a${index}`} style={{ left: `${x}%`, top: `${y}%` }} />)}
      </span>
      <span class="ficha-dominio__linea" />
      <span class="ficha-dominio__lado">
        {pipPositions(tile.b).map(([x, y], index) => <i key={`b${index}`} style={{ left: `${x}%`, top: `${y}%` }} />)}
      </span>
    </span>
  );
}
