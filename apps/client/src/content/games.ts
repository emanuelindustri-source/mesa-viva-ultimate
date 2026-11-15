export interface GameShowcase {
  readonly key: string;
  readonly name: string;
  readonly family: 'cartas' | 'tablero';
  readonly players: string;
  readonly hook: string;
  readonly description: string;
  readonly rules: readonly string[];
}

export const GAME_SHOWCASE: readonly GameShowcase[] = [
  {
    key: 'caida', name: 'Caída Venezolana', family: 'cartas', players: '2–4 jugadores',
    hook: 'Cantos, caídas y mesa limpia.',
    description: 'La tradición venezolana de entregar la mesa, cantar la mano y capturar con memoria y nervio.',
    rules: ['Se reparten tres cartas por jugador y cuatro sobre la mesa.', 'Cada canto válido suma y cambia el pulso de la ronda.', 'Captura la mesa o entrega la carta correcta; gana quien llega a 24.'],
  },
  {
    key: 'domino', name: 'Dominó Venezolano', family: 'tablero', players: '2 o 4 jugadores',
    hook: 'Tranca, parejas y doble seis.',
    description: 'Fichas de madera, salidas, pases y equipos alternos. La mesa cruje cuando el doble cae.',
    rules: ['Reparte siete fichas y busca el doble más alto para salir.', 'Encadena por cualquiera de los dos extremos; si no puedes, roba o pasa.', 'Gana la pareja o jugador que llegue a 100 puntos, con tranca incluida.'],
  },
  {
    key: 'blackjack', name: 'Blackjack 21', family: 'cartas', players: '1–4 jugadores',
    hook: '21, doblar y plantar.',
    description: 'Apuesta, pide, plántate o dobla contra el crupier. Blackjack natural paga 3:2.',
    rules: ['Cada jugador apuesta y recibe dos cartas; el crupier muestra una.', 'Pide hasta acercarte a 21 sin pasarte. Doblar duplica la apuesta y entrega una sola carta.', 'El crupier se planta en 17. Gana la mano más cercana a 21.'],
  },
  {
    key: 'colores', name: 'Cartas de Colores', family: 'cartas', players: '2–4 jugadores',
    hook: 'Salta, reversa y comodines.',
    description: 'Una baraja original de colores y símbolos con estelas neón, robos y cambios de dirección.',
    rules: ['Empareja color o símbolo con la carta superior del descarte.', 'Salta, reversa, roba dos y comodines cambian el ritmo de la mesa.', 'Grita “¡Última!” al quedarte con una carta y llega a 500 puntos.'],
  },
  {
    key: 'ajedrez', name: 'Ajedrez de Club', family: 'tablero', players: '2 jugadores',
    hook: 'Jaque mate, enroque y coronación.',
    description: 'Un tablero de nogal con piezas de volumen, reglas completas y bots de tres niveles.',
    rules: ['Las blancas mueven primero; el objetivo es dar jaque mate al rey rival.', 'El enroque, la captura al paso y la coronación están disponibles.', 'Tablas por ahogado, 50 movimientos o material insuficiente.'],
  },
];
