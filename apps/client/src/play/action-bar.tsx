import type { BlackjackAction, CaidaView, ColorsView, DominoAction, DominoView } from '@mesa-viva/core';
import { Coins, Sparkles } from 'lucide-react';
import type { ActionOption } from './action-labels.js';
import { CardArt } from './card-art.js';
import type { GameSession } from './game-session.js';

interface ActionBarProps {
  readonly session: GameSession;
  readonly actions: readonly ActionOption[];
  readonly phase: string;
  readonly onAct: (option: ActionOption) => void;
  readonly onCanto: (playerId: string, label: string) => void;
}

const CANTO_LABEL: Readonly<Record<string, string>> = {
  ronda: '¡Cantar Ronda!',
  patrulla: '¡Patrulla!',
  vigia: '¡Vigía!',
  registro: '¡Registro!',
  casilla: '¡Casilla!',
  registrico: '¡Registrico!',
  trivilin: '¡Trivilín!',
};

function CaidaBar({ session, actions, phase, onAct, onCanto }: ActionBarProps) {
  const view = session.view as CaidaView;
  const cantos = view.players.flatMap((player) =>
    player.canto === null || player.canto.kind === 'caida' ? [] : [{ player, canto: player.canto }],
  );
  const next = actions.find((option) => (option.action as { type?: string }).type === 'next-round');
  return (
    <div class="barra-accion__contenido">
      {cantos.map(({ player, canto }) => (
        <button class="pildora-canto" key={`${player.id}-${canto.kind}`} type="button" onClick={() => onCanto(player.id, CANTO_LABEL[canto.kind] ?? canto.label)}>
          <Sparkles size={16} /> {CANTO_LABEL[canto.kind] ?? canto.label}
          <small>+{canto.value}</small>
        </button>
      ))}
      {phase === 'round-over' && next !== undefined && (
        <button class="boton-accion boton-accion--oro" type="button" onClick={() => onAct(next)}>Siguiente Mano</button>
      )}
      {cantos.length === 0 && phase !== 'round-over' && <span class="barra-accion__pista">Arrastra o toca una carta de tu mano</span>}
    </div>
  );
}

function BlackjackBar({ actions, phase, onAct }: ActionBarProps) {
  if (phase === 'settled') {
    const next = actions.find((option) => (option.action as BlackjackAction).type === 'next-round');
    return <div class="barra-accion__contenido">{next !== undefined && <button class="boton-accion boton-accion--oro" type="button" onClick={() => onAct(next)}>Siguiente Mano</button>}</div>;
  }
  const bets = actions.filter((option) => (option.action as BlackjackAction).type === 'bet');
  if (bets.length > 0) {
    const wanted = [10, 20, 50, 100, 500];
    const picks = wanted.map((amount) => bets.find((option) => (option.action as BlackjackAction & { amount: number }).amount === amount)).filter((option): option is ActionOption => option !== undefined);
    return (
      <div class="barra-accion__contenido barra-accion__contenido--fichas">
        {picks.map((option) => {
          const amount = (option.action as BlackjackAction & { amount: number }).amount;
          return (
            <button class={`ficha-apuesta ficha-apuesta--${amount >= 100 ? 'oro' : amount >= 50 ? 'rojo' : amount >= 20 ? 'azul' : 'verde'}`} key={option.id} type="button" onClick={() => onAct(option)}>
              <Coins size={20} /><strong>{amount}</strong>
            </button>
          );
        })}
        {picks.length === 0 && bets.slice(0, 4).map((option) => (
          <button class="ficha-apuesta ficha-apuesta--oro" key={option.id} type="button" onClick={() => onAct(option)}><Coins size={20} /><strong>{option.label.replace(/\D+/g, '')}</strong></button>
        ))}
      </div>
    );
  }
  return (
    <div class="barra-accion__contenido">
      {actions.map((option) => {
        const type = (option.action as BlackjackAction).type;
        if (type === 'hit') return <button class="boton-accion boton-accion--verde" key={option.id} type="button" onClick={() => onAct(option)}>PEDIR</button>;
        if (type === 'stand') return <button class="boton-accion boton-accion--rojo" key={option.id} type="button" onClick={() => onAct(option)}>PLANTARSE</button>;
        if (type === 'double') return <button class="boton-accion boton-accion--oro" key={option.id} type="button" onClick={() => onAct(option)}>DOBLAR</button>;
        return <button class="boton-accion" key={option.id} type="button" onClick={() => onAct(option)}>{option.label}</button>;
      })}
    </div>
  );
}

function DominoBar({ session, actions, onAct }: ActionBarProps) {
  const view = session.view as DominoView;
  const plays = actions.filter((option) => (option.action as DominoAction).type === 'play');
  const support = actions.filter((option) => (option.action as DominoAction).type !== 'play');
  const hand = view.players.find((player) => player.id === session.viewerId)?.hand ?? [];
  return (
    <div class="barra-accion__contenido barra-accion__contenido--fichas">
      {plays.map((option) => {
        const tileId = (option.action as DominoAction & { tileId: string }).tileId;
        const tile = hand.find((item) => item.id === tileId);
        const side = (option.action as DominoAction & { side: string | null }).side;
        return (
          <button class="ficha-mano" key={option.id} type="button" onClick={() => onAct(option)} title={option.label}>
            {tile !== undefined && <CardArt deck="domino" rank={String(tile.a)} suit={String(tile.b)} className="arte-carta--ficha" />}
            <span>{side === 'left' ? '◀' : side === 'right' ? '▶' : '★'}</span>
          </button>
        );
      })}
      {support.map((option) => <button class="boton-accion boton-accion--oro" key={option.id} type="button" onClick={() => onAct(option)}>{option.label}</button>)}
    </div>
  );
}

function ColorsBar({ session, actions, onAct }: ActionBarProps) {
  const view = session.view as ColorsView;
  const support = actions.filter((option) => (option.action as { type?: string }).type !== 'play');
  return (
    <div class="barra-accion__contenido">
      {support.map((option) => <button class="boton-accion boton-accion--oro" key={option.id} type="button" onClick={() => onAct(option)}>{option.label}</button>)}
      {(support.length === 0 || view.phase === 'playing') && <span class="barra-accion__pista">Toca o arrastra una carta al pozo · Color: {view.currentColor}</span>}
    </div>
  );
}

/** Barra inferior ergonómica: solo aparece cuando hay una decisión que tomar. */
export function ActionBar(props: ActionBarProps) {
  const game = props.session.game.key;
  const empty = props.actions.length === 0 && game !== 'caida';
  if (empty) return null;
  const content = props.session.result !== null ? null
    : game === 'caida' ? <CaidaBar {...props} />
      : game === 'blackjack' ? <BlackjackBar {...props} />
        : game === 'domino' ? <DominoBar {...props} />
          : <ColorsBar {...props} />;
  if (content === null) return null;
  return <div class="barra-accion" role="toolbar" aria-label="Acciones de la mesa">{content}</div>;
}
