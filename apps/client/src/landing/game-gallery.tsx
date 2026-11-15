import { ChevronRight, Users } from 'lucide-react';
import { useState } from 'preact/hooks';
import { GAME_SHOWCASE } from '../content/games.js';
import { GameEmblem } from '../ui/brand-mark.js';
import { useAppTheme } from '../ui/use-theme.js';

export function GameGallery() {
  const [selected, setSelected] = useState(GAME_SHOWCASE[0]?.key ?? 'caida');
  const { theme, holidayId } = useAppTheme();
  const game = GAME_SHOWCASE.find((item) => item.key === selected) ?? GAME_SHOWCASE[0];
  if (game === undefined) return null;
  return (
    <div class="galeria">
      <div class="galeria__lista" role="tablist" aria-label="Juegos disponibles">
        {GAME_SHOWCASE.map((item) => (
          <button
            class={`galeria__item ${selected === item.key ? 'galeria__item--activo' : ''}`}
            key={item.key}
            type="button"
            role="tab"
            aria-selected={selected === item.key}
            onClick={() => setSelected(item.key)}
          >
            <GameEmblem gameId={item.key} holidayId={holidayId} mode={theme.mode} size={54} />
            <span><strong>{item.name}</strong><small>{item.hook}</small></span>
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        ))}
      </div>
      <article class="galeria__detalle">
        <div class="galeria__cabecera">
          <GameEmblem gameId={game.key} holidayId={holidayId} mode={theme.mode} size={92} />
          <div>
            <span class="pastilla">{game.family}</span>
            <h3>{game.name}</h3>
            <p class="galeria__meta"><Users size={15} aria-hidden="true" /> {game.players}</p>
          </div>
        </div>
        <p>{game.description}</p>
        <ol class="galeria__reglas">
          {game.rules.map((rule) => <li key={rule}>{rule}</li>)}
        </ol>
        <a class="enlace" href="../play/">Abrir esta mesa →</a>
      </article>
    </div>
  );
}
