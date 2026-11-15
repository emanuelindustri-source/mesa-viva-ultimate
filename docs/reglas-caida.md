# Reglas implementadas: Caída Venezolana (variante Mesa Viva)

Esta nota documenta la variante moderna que ejecuta el motor en la Fase 1. Se basa
en las reglas públicas venezolanas y explicita las decisiones tomadas para que la
partida sea determinista, reproducible y testeable.

## Material

- Baraja española de 40 cartas: oros, copas, espadas y bastos; ranks 1–7, 10, 11 y 12.
- De 2 a 4 jugadores.
- Objetivo: alcanzar **24 puntos** al finalizar una ronda.

## Preparación de la ronda

1. Se baraja y se reparten **3 cartas** a cada jugador.
2. El repartidor **entrega la mesa**: coloca 4 cartas y declara la secuencia
   `1, 2, 3, 4` (o `4, 3, 2, 1`, configurable).
3. Se cuentan las cartas iniciales que coinciden con la secuencia en orden estricto:
   - Si coinciden una o más, el repartidor suma esa cantidad de puntos.
   - Si no coincide ninguna, hay **mal echada** y el jugador a la derecha del
     repartidor suma **1 punto**.
4. Se declaran automáticamente los cantos de las manos (ver tabla). El motor elige
   el canto de mayor valor cuando una mano admite más de uno.
5. Comienza el jugador a la derecha del repartidor.

## Cantos

| Canto | Combinación | Puntos |
| --- | --- | --- |
| Ronda | Dos cartas iguales + una distinta | 1 para ranks 1–7; 2 para 10; 3 para 11; 4 para 12 |
| Patrulla | Tres ranks consecutivos en la baraja (1–7, 10–12) | 6 |
| Vigía | Dos iguales + una adyacente en el orden de la baraja | 7 |
| Registro | 1, 11 y 12 | 8 |
| Registrico (variante) | 1, 10 y 11 | 10 |
| Casilla chica | 1, 11 y 11 | 11 |
| Casilla grande | 1, 12 y 12 | 12 |
| Trivilín | Tres cartas iguales | 5; tres 12 ganan la partida al instante |
| Caída | Capturar la última carta jugada por un rival | Según el rank capturado (1–4) |

La **caída** no se detecta en la mano: se produce durante el juego y se explica abajo.

## Turno

1. El jugador coloca una carta de su mano.
2. Si la carta coincide en rank con alguna carta de la mesa, puede **capturar**:
   se lleva su carta y todas las cartas de la mesa desde la coincidencia hasta el
   final. Las cartas capturadas van a su pila.
3. Puntos inmediatos:
   - Capturar la **última** carta jugada es una **caída** y suma el valor del rank
     (1–7 → 1; 10 → 2; 11 → 3; 12 → 4).
   - Vaciar la mesa suma **4** (mesa limpia).
   - Si la caída además vacía la mesa, suma **5** (caída con mesa).
4. Si no captura, la carta queda en la mesa.
5. Roba una carta si su mano tiene menos de 3 y quedan cartas en el mazo.
6. Pasa el turno. La ronda termina cuando no quedan cartas en manos ni en el mazo.

## Fin de ronda y puntuación

Cada jugador cuenta sus cartas capturadas. Solo puntúan las que superan el umbral:

| Jugadores | Umbral |
| --- | --- |
| 4 | 10 cartas |
| 3 | 14 para el repartidor; 13 para los demás |
| 2 | 20 cartas |

Cada carta por encima del umbral vale **1 punto**. Los puntos de cantos, mesa y
caídas ya se sumaron durante la ronda.

## Fin de partida

- Gana quien llegue a **24 puntos** al cierre de una ronda.
- Si hay empate en el máximo, se reparte una carta del mazo de desempate a cada
  empatado; gana la carta mayor. El desempate es determinista y forma parte del
  estado de la partida.
- Un trivilín de tres 12 gana de inmediato, sin importar el marcador.

## Decisiones de la adaptación

- Los cantos se declaran automáticamente al repartir para evitar ventanas de espera
  y trampas; el motor conserva el valor y el tipo en el estado.
- Se roba hasta mantener 3 cartas, de modo que el mazo se agota de forma natural.
- No se implementan apuestas, dinero real ni la regla de "canto mata mesa"; el
  proyecto no admite juegos de azar con premios monetarios.
- La regla de re-reparto por cuatro cartas repetidas en la mesa no se aplica en
  esta variante; el reparto determinista lo hace innecesario.
- Las variantes regionales quedan parametrizables (`targetScore`, `mesaOrder`).

## Fuente principal

Reglas públicas de la Caída Venezolana recopiladas por joriangel (Steemit, 2017):
<https://steemit.com/spanish/@joriangel/juego-de-cartas-caida-explicado-venezuela>
