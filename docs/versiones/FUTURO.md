# Próxima versión — v0.7.0 · Fase 5: Portal y Online

**Estado:** pendiente de inicio
**Depende de:** v0.6.0 (Fase 4.5 entregada)
**Objetivo:** convertir el monorepo en una aplicación jugable real: portal `/`,
experiencia `/play/` con `TableStage` y la banda sonora multicanal conectados,
PWA offline-first, salas locales y online con QR/PIN, y monetización con límites
de frecuencia.

## Punto de retorno

1. Leer `AGENTS.md`, esta nota y `docs/versiones/indice.md`.
2. Ejecutar `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build` y
   `pnpm test:coverage`.
3. Confirmar que la Fase 4.5 sigue en verde: **283 pruebas**, 96,18% líneas y
   paquete cliente de 190,45 KB JS.
4. Revisar `apps/client/src/`, `packages/engine-25d/src/pixi/app/table-stage.ts`,
   `packages/sensory-engine/src/soundtrack/` y `docs/arquitectura.md`.
5. Continuar con el primer objetivo pendiente de la lista siguiente.

## Entregables de la Fase 5

- [ ] Shell `/play/` con Preact, selector de juegos, perfiles y ajustes.
- [ ] Mesa jugable con `TableStage`, adaptadores de `core` y snapshots en vivo.
- [ ] Sesión sensorial conectada: `onShake`, `onFaceDown`, `celebrate`, layout y
      tensión enviada desde el estado real de la partida.
- [ ] Banda sonora de estudio conectada al estado real de cada juego: salida
      elegida, energía, concentración, acorde activo y SFX armónicos.
- [ ] Guardado local firmado, reanudación de partida y preferencias persistentes.
- [ ] PWA offline-first con Service Worker, precache y aviso de actualización.
- [ ] Salas locales en la misma pantalla y por Wi-Fi con PIN/QR.
- [ ] Salas online con WebRTC, señalización mínima, reconexión y bots de reemplazo.
- [ ] Chat rápido, asientos, espectadores y privacidad de manos.
- [ ] Anuncios con frecuencia limitada, nunca a mitad de jugada.
- [ ] Billing VIP de prueba, sin fichas con valor monetario ni apuestas.
- [ ] Accesibilidad: foco D-pad, regiones vivas, cartas descritas y contraste.
- [ ] Pruebas de integración de la app, golden replays y smoke de navegador.
- [ ] Presupuesto de rendimiento: 60–120 FPS y paquete total < 10 MB.

## Criterios de aceptación

- `pnpm lint`, `pnpm typecheck`, `pnpm build` y `pnpm test:coverage` en verde.
- Las 283 pruebas de la Fase 4.5 más las nuevas, sin hardware real en CI.
- Ningún archivo supera 200 líneas y `core` sigue sin DOM, red ni UI.
- El audio no arranca sin gesto; la app muestra "activar sonido" una sola vez.
- La mesa funciona con teclado, ratón, tacto y D-pad.
- Una partida se reanuda desde el guardado y produce el mismo resultado.
- La PWA carga sin red después de la primera visita.
- El paquete web final sigue por debajo de 10 MB.
- Nota `v0.7.0-fase5-portal-online.md` y esta nota reescrita para la Fase 6.

## Alcance que NO entra en esta fase

- Catálogo completo de 30 juegos y enciclopedia (Fase 6).
- Empaquetado Android firmado y publicación en Google Play (Fase 6).
- Pagos reales, apuestas o premios con valor monetario.
- Voceo grabado, actores o música licenciada.
- Infraestructura de servidores dedicados: la señalización será mínima.

## Riesgos conocidos

- WebRTC necesita STUN/TURN; sin TURN algunas redes no conectan. Habrá fallback
  a sala LAN y a bots.
- El autoplay y la háptica cambian entre navegadores; la app debe seguir jugable
  sin ambos.
- La sesión sensorial consume CPU; se reutilizarán presupuestos y degradación.
- El Service Worker puede servir versiones viejas; se mostrará aviso y se
  invalidará caché por build.
- El guardado firmado no debe romper partidas antiguas; habrá migración versionada.
