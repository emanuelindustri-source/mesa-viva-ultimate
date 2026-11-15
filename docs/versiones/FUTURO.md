# Próxima versión — v0.5.0 · Fase 4: Motor Sensorial

**Estado:** pendiente de inicio
**Depende de:** v0.4.0 (Fase 3 entregada)
**Objetivo:** construir `@mesa-viva/sensory-engine` sobre Web Audio API para
audio espacial HRTF, música adaptativa de ocho stems, háptica nativa/web y mezcla
con la festividad activa, consumiendo los eventos de `core` y del motor 2.5D sin
duplicar reglas.

## Punto de retorno

1. Leer `AGENTS.md`, esta nota y `docs/versiones/indice.md`.
2. Ejecutar `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build` y
   `pnpm test:coverage`.
3. Confirmar que la Fase 3 sigue en verde (203 pruebas, 97,20% líneas).
4. Revisar `packages/sensory-engine/`, `docs/arquitectura.md` y los hooks de
   `TableStage` (`onShake`, `onFaceDown`, `celebrate`).
5. Continuar con el primer objetivo pendiente de la lista siguiente.

## Entregables de la Fase 4

- [ ] `AudioContext` perezoso con desbloqueo por gesto y cierre sin fugas.
- [ ] Buses de música, efectos, ambiente y UI con compresor/limitador maestro.
- [ ] PannerNode HRTF atado a los asientos y cartas de `TableStage`.
- [ ] Música adaptativa de ocho stems sincronizados, sin archivos externos.
- [ ] Transiciones por tensión, turno, fase y festividad con crossfade corto.
- [ ] Catálogo de efectos procedurales u originales, sin música con derechos.
- [ ] Voice pooling y límite de voces simultáneas en móviles de gama media.
- [ ] Háptica web (`navigator.vibrate`) y puente estructural Capacitor.
- [ ] Modo silencioso, respeto de movimiento reducido y preferencia del usuario.
- [ ] Agitar = dados/baraja; boca abajo = silenciar; sin bloquear la partida.
- [ ] Mezcla con `festiveTheme.musicId` y acentos por festividad.
- [ ] Pruebas deterministas con `OfflineAudioContext` y mocks ligeros.
- [ ] Benchmark de latencia, voces y memoria; paquete total < 10 MB.

## Criterios de aceptación

- `pnpm lint`, `pnpm typecheck`, `pnpm build` y `pnpm test:coverage` en verde.
- 203 pruebas de la Fase 3 más las nuevas, sin requerir audio físico en CI.
- Ningún archivo supera 200 líneas y `sensory-engine` no importa DOM en pruebas.
- Arranque silencioso y sin errores si el navegador bloquea audio o háptica.
- Latencia de disparo objetivo < 50 ms en escritorio de gama media.
- La música no satura: limitador activo y pruebas de picos.
- Todo audio es original/procedural; cero licencias de terceros.
- Nota `v0.5.0-fase4-motor-sensorial.md` y esta nota reescrita para la Fase 5.

## Alcance que NO entra en esta fase

- App jugable `/play/`, lobby online y monetización (Fase 5).
- Expansión del catálogo de juegos de mesa (Fase 6).
- Empaquetado Android firmado y publicación en Google Play (Fase 6).
- Voces grabadas, actores o música licenciada.
- Audio 3D de personajes completos o motores externos.

## Riesgos conocidos

- Las políticas de autoplay exigen un gesto; la UI deberá mostrar "activar sonido".
- HRTF consume CPU; se limitará el número de fuentes espaciales y se degradará a
  estéreo si el presupuesto de audio se agota.
- Android puede perder el foco de audio al cambiar de app; hay que pausar y
  reanudar sin reiniciar la partida.
- Los stems deben compartir reloj y tempo para no desincronizarse.
- La háptica no existe en todos los navegadores; nunca debe ser requisito.
- La generación procedural debe ser determinista para pruebas, aunque la mezcla
  final dependa del dispositivo.
