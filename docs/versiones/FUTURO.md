# Próxima versión — v0.2.0 · Fase 1: Motor Core

**Estado:** pendiente de inicio
**Depende de:** v0.1.0 (Fase 0 entregada)
**Objetivo:** convertir el esqueleto en un motor de juegos real, determinista y
probado, con el primer bloque de juegos jugable de principio a fin.

## Punto de retorno

Si se retoma el proyecto después de una pausa:

1. Leer `AGENTS.md` y esta nota.
2. Ejecutar `pnpm install`, `pnpm build`, `pnpm test` y confirmar que todo pasa.
3. Revisar `docs/versiones/indice.md` para confirmar la última versión entregada.
4. Continuar en el primer objetivo pendiente de la lista siguiente.

## Entregables de la Fase 1

- [ ] `IGameModule` completo: estado, acciones legales, reducer puro, validación y
      serialización determinista.
- [ ] Registro y catálogo de juegos con metadatos y claves i18n.
- [ ] Caída Venezolana: reparto, turnos, cantos completos (Caída, Ronda, Patrulla,
      Vigía, Registro, Casilla), puntuación y fin de partida.
- [ ] Dominó Venezolano 1v1 y 2v2 con reglas de salida y pases.
- [ ] Blackjack 21 con reglas configurables.
- [ ] Cartas de Colores (estilo UNO, nombre y arte originales).
- [ ] Bots Novato, Competitivo y Maestro con conteo real de cartas.
- [ ] Economía base: XP, niveles, rangos, Fichas de Mesa, racha diaria y guardado
      firmado con HMAC.
- [ ] Pruebas "golden replay" por juego y cobertura mínima del 85% en `core`.

## Criterios de aceptación

- `pnpm lint`, `pnpm build` y `pnpm test` en verde.
- 1.000 partidas simuladas por juego terminan sin estados ilegales.
- Ningún archivo supera 200 líneas.
- CI de GitHub Actions en verde y Pages actualizado.
- Nota `v0.2.0-fase1-motor-core.md` creada y publicada en la Landing.

## Riesgos conocidos

- Las reglas regionales de la Caída varían; se documentará la variante implementada
  y se dejará preparada una configuración de variantes.
- El conteo de cartas de los bots debe ser determinista y probado con semillas fijas.
