import { generateChessBoard, generateLudoBoard, generateSnakesBoard } from '@mesa-viva/design-system';

const CACHE = new Map<string, string>();
const BOARDS = [
  { id: 'ajedrez', title: 'Ajedrez de Club', status: 'Jugable', build: generateChessBoard },
  { id: 'ludo', title: 'Ludo Superstar', status: 'Identidad lista', build: generateLudoBoard },
  { id: 'escaleras', title: 'Escaleras y Serpientes', status: 'Identidad lista', build: generateSnakesBoard },
] as const;

function markupFor(id: string, build: () => { markup: string }): string {
  const cached = CACHE.get(id);
  if (cached !== undefined) return cached;
  const markup = build().markup;
  CACHE.set(id, markup);
  return markup;
}

/** Muestra la identidad 2.5D de los tableros de club. */
export function BoardShowcase() {
  return (
    <section class="play-seccion tableros-club">
      <div class="tableros-club__cabecera">
        <div>
          <p class="sobrelinea">Mesas de tablero</p>
          <h2>Madera, fieltro y volumen</h2>
        </div>
        <span class="pastilla pastilla--viva">Ajedrez jugable</span>
      </div>
      <div class="tableros-club__rejilla">
        {BOARDS.map((board) => (
          <article class="tablero-club" key={board.id}>
            <span class="tablero-club__arte" aria-hidden="true" dangerouslySetInnerHTML={{ __html: markupFor(board.id, board.build) }} />
            <div><strong>{board.title}</strong><small>{board.status}</small></div>
          </article>
        ))}
      </div>
    </section>
  );
}
