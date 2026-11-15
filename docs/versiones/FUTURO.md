# Próxima versión — v0.9.0 · Fase 7: Ludo, Escaleras y Póker

**Estado:** pendiente de inicio
**Depende de:** v0.8.0 (Fase 6 entregada)
**Objetivo:** ampliar la mesa de club con Ludo, Escaleras y Serpientes y Póker
jugables, y cerrar el empaquetado Android `.aab` sin romper el 100 % offline,
los límites de 200 líneas ni la calidad visual de la v0.8.0.

## Punto de retorno

1. Leer `AGENTS.md`, esta nota, `docs/versiones/indice.md` y la nota
   `v0.8.0-fase6-estudio-visual.md`.
2. Ejecutar `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build` y
   `pnpm test`.
3. Confirmar la línea base: **319 pruebas**, 57 archivos, ajedrez validado con
   perft 1–3 (20, 400 y 8902), sin archivos de más de 200 líneas.
4. Revisar `packages/core/src/games/chess/`, `apps/client/src/play/board-chess.tsx`,
   `apps/client/src/play/board-showcase.tsx`, `apps/client/src/play/sala-panel.tsx`
   y `docs/arquitectura.md`.
5. Continuar con el primer objetivo pendiente.

## Entregables de la Fase 7

### Ludo Superstar

- [ ] Motor `games/ludo/` con 2–4 jugadores, cuatro fichas por jugador, dado
  determinista, salida con seis, capturas, casillas seguras y corona final.
- [ ] Tablero DOM 2.5D de 15×15 con identidad verde, roja, amarilla y azul,
  dados grandes con destellos y movimiento de cámara.
- [ ] Bots de tres niveles y prueba golden replay con semilla.

### Escaleras y Serpientes

- [ ] Motor `games/escaleras/` con tablero 10×10, serpientes, escaleras, dado,
  turnos y final exacto.
- [ ] Tablero de selva 2.5D con casillas extruidas, lianas y escaleras de madera.
- [ ] Prueba golden replay y simulación de 1.000 partidas.

### Póker de club

- [ ] Variante de póker sin apuestas con fichas virtuales, manos, botes y banca.
- [ ] Mesa ovalada reutilizada, cartas inglesas a todo color y panel de acciones
  `PASAR`, `SUBIR`, `VER`, `RETIRARSE`.
- [ ] Bots y prueba de que nunca se apuesta dinero real.

### Android y monetización

- [ ] Integrar AdMob con UMP/GDPR y Billing para la compra única VIP.
- [ ] Generar iconos adaptativos, splash y proyecto Android.
- [ ] Firmar `mesa-viva-ultimate-v0.9.0.aab` con keystore local y publicarlo como
  artefacto de CI sin secretos.
- [ ] Verificar `app-ads.txt` y pista interna.

### Rendimiento y accesibilidad

- [ ] Medir 60–120 FPS en móvil, tablet y TV; documentar el benchmark.
- [ ] Presupuesto de bundle por ruta y carga diferida de PixiJS.
- [ ] Auditoría Lighthouse de accesibilidad, SEO y PWA.

## Criterios de aceptación

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test` en verde.
- Ludo, Escaleras y Póker jugables con bots y golden replay.
- Ningún archivo supera 200 líneas; `core` sigue puro y determinista.
- La PWA sigue cargando sin red y avisa de cada nueva versión.
- Nota `v0.9.0-fase7-ludo-poker-android.md`, índice actualizado y esta nota
  reescrita para la Fase 8.

## Alcance que NO entra en esta fase

- Apuestas, dinero real o canje de Fichas de Mesa.
- Servidores dedicados: el anfitrión sigue siendo autoritativo.
- Voceo grabado con actores o música licenciada.
- Publicación pública en Google Play: solo pista interna y revisión.

## Riesgos conocidos

- Ludo exige una máquina de estados cuidadosa para no bloquear turnos; se
  cubrirá con simulación masiva y golden replay.
- El tablero DOM de 15×15 debe mantenerse fluido en móviles de gama media.
- AdMob y Billing no pueden probarse en CI sin cuenta; se usarán adaptadores
  falsos y pruebas de contrato.
- El `.aab` firmado requiere un keystore local; nunca se subirá al repositorio.
