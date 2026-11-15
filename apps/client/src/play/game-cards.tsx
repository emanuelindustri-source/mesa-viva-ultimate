import type { ColorsCard } from '@mesa-viva/core';
import { CardArt } from './card-art.js';

interface SpanishCardLike { readonly rank: number; readonly suit: string; }
interface PlayingCardLike { readonly rank: string; readonly suit: string; }
interface DominoTileLike { readonly id: string; readonly a: number; readonly b: number; }

const SPANISH_SUIT: Readonly<Record<string, string>> = { oro: 'oros', copa: 'copas', espada: 'espadas', basto: 'bastos' };
const ENGLISH_SUIT: Readonly<Record<string, string>> = { hearts: 'hearts', diamonds: 'diamonds', clubs: 'clubs', spades: 'spades', '♥': 'hearts', '♦': 'diamonds', '♣': 'clubs', '♠': 'spades' };

export function SpanishCardFace({ card, small = false }: { card: SpanishCardLike; small?: boolean }) {
  return <CardArt deck="espanola" rank={String(card.rank)} suit={SPANISH_SUIT[card.suit] ?? card.suit} className={small ? 'arte-carta--mini' : 'arte-carta--mano'} />;
}

export function PlayingCardFace({ card, hidden = false, small = false }: { card: PlayingCardLike; hidden?: boolean; small?: boolean }) {
  if (hidden) return <span class={`carta-dorso-art ${small ? 'arte-carta--mini' : 'arte-carta--mano'}`} role="img" aria-label="Carta oculta" />;
  return <CardArt deck="inglesa" rank={card.rank} suit={ENGLISH_SUIT[card.suit] ?? card.suit} className={`arte-carta--mano ${small ? 'arte-carta--mini' : ''}`} />;
}

export function ColorCardFace({ card, small = false }: { card: ColorsCard; small?: boolean }) {
  return <CardArt deck="colores" rank={String(card.symbol)} suit={card.color} className={small ? 'arte-carta--mini' : 'arte-carta--mano'} />;
}

export function DominoTileFace({ tile, small = false, vertical = false }: { tile: DominoTileLike; small?: boolean; vertical?: boolean }) {
  return (
    <span class={`ficha-dominio ${vertical ? 'ficha-dominio--vertical' : ''} ${small ? 'ficha-dominio--mini' : ''}`} title={`${tile.a}–${tile.b}`}>
      <CardArt deck="domino" rank={String(tile.a)} suit={String(tile.b)} className="arte-carta--ficha" />
    </span>
  );
}
