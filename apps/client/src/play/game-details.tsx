import type { BlackjackView, CaidaView, ColorsView, DominoView } from '@mesa-viva/core';
import { ColorCardFace, DominoTileFace, PlayingCardFace, SpanishCardFace } from './game-cards.js';
import type { GameKey } from './game-defs.js';
import type { GameSession } from './game-session.js';

function SeatStrip({ players }: { players: readonly { id: string; name: string; score: number; handCount: number; isTurn: boolean }[] }) {
  return (
    <div class="asientos">
      {players.map((player) => (
        <div class={`asiento ${player.isTurn ? 'asiento--turno' : ''}`} key={player.id}>
          <span class="asiento__avatar" aria-hidden="true">{player.name.slice(0, 2).toUpperCase()}</span>
          <span><strong>{player.name}</strong><small>{player.score} pts · {player.handCount} cartas</small></span>
        </div>
      ))}
    </div>
  );
}

function Log({ log }: { log: readonly string[] }) {
  return <div class="registro" aria-live="polite">{log.slice(-4).map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}</div>;
}

export function GameDetailsView({ gameKey, view, viewerId }: { gameKey: GameKey; view: unknown; viewerId: string }) {
  if (gameKey === 'caida') {
    const data = view as CaidaView;
    const me = data.players.find((player) => player.id === viewerId);
    return (
      <>
        <SeatStrip players={data.players.map((player) => ({ ...player, isTurn: player.id === data.turnPlayer }))} />
        <fieldset class="mesa-cartas" aria-label="Cartas sobre la mesa">{data.table.map((card) => <SpanishCardFace card={card} key={card.id} />)}</fieldset>
        <div class={`mi-mano ${data.turnPlayer === viewerId ? 'mi-mano--activa' : ''}`}>
          <span class="mi-mano__titulo">Tu mano · {me?.canto?.label ?? 'sin canto'}</span>
          <div class="mi-mano__cartas">{(me?.hand ?? []).map((card) => <SpanishCardFace card={card} key={card.id} />)}</div>
        </div>
        <Log log={data.log} />
      </>
    );
  }
  if (gameKey === 'domino') {
    const data = view as DominoView;
    const me = data.players.find((player) => player.id === viewerId);
    return (
      <>
        <SeatStrip players={data.players.map((player) => ({ ...player, isTurn: player.id === data.turnPlayer }))} />
        <fieldset class="tablero-dominio" aria-label="Tablero de dominó">
          {data.board.length === 0 ? <p class="vacio">La mesa espera la primera ficha.</p> : data.board.map((placement) => <DominoTileFace tile={placement.tile} vertical={placement.flipped} key={placement.tile.id} />)}
        </fieldset>
        <div class={`mi-mano ${data.turnPlayer === viewerId ? 'mi-mano--activa' : ''}`}>
          <span class="mi-mano__titulo">Tu mano · {me?.totalPips ?? 0} pips</span>
          <div class="mi-mano__cartas">{(me?.hand ?? []).map((tile) => <DominoTileFace tile={tile} small key={tile.id} />)}</div>
        </div>
        <Log log={data.log} />
      </>
    );
  }
  if (gameKey === 'blackjack') {
    const data = view as BlackjackView;
    const me = data.players.find((player) => player.id === viewerId);
    return (
      <>
        <div class="crupier">
          <span class="mi-mano__titulo">Crupier · {data.dealer.total}{data.dealer.hidden ? '+' : ''}</span>
          <div class="mi-mano__cartas">{data.dealer.cards.map((card) => <PlayingCardFace card={card} key={card.id} />)}</div>
        </div>
        <SeatStrip players={data.players.map((player) => ({ id: player.id, name: player.name, score: player.bankroll, handCount: player.hand?.cards.length ?? 0, isTurn: player.id === data.turnPlayer }))} />
        <div class={`mi-mano ${data.turnPlayer === viewerId ? 'mi-mano--activa' : ''}`}>
          <span class="mi-mano__titulo">Tu mano · {me?.hand?.total ?? 0} · apuesta {me?.hand?.bet ?? 0}</span>
          <div class="mi-mano__cartas">{(me?.hand?.cards ?? []).map((card) => <PlayingCardFace card={card} key={card.id} />)}</div>
        </div>
        <p class="vacio">Fase: {data.phase} · ronda {data.round}/{data.maxRounds}</p>
      </>
    );
  }
  const data = view as ColorsView;
  const me = data.players.find((player) => player.id === viewerId);
  return (
    <>
      <SeatStrip players={data.players.map((player) => ({ ...player, isTurn: player.id === data.turnPlayer }))} />
      <div class="mesa-colores">
        {data.topCard === null ? <p class="vacio">Sin descarte</p> : <ColorCardFace card={data.topCard} />}
        <span class="pastilla">Color: {data.currentColor}</span>
        <span class="pastilla">{data.direction === 1 ? '→' : '←'} {data.drawCount} en mazo</span>
      </div>
      <div class={`mi-mano ${data.turnPlayer === viewerId ? 'mi-mano--activa' : ''}`}>
        <span class="mi-mano__titulo">Tu mano · {me?.handCount ?? 0} cartas</span>
        <div class="mi-mano__cartas">{(me?.hand ?? []).map((card) => <ColorCardFace card={card} key={card.id} />)}</div>
      </div>
      <Log log={data.log} />
    </>
  );
}

export function GameDetails({ session }: { session: GameSession }) {
  return <GameDetailsView gameKey={session.game.key} view={session.view} viewerId={session.viewerId} />;
}
