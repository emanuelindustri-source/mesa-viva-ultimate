# Próxima versión — v0.8.0 · Fase 6: Catálogo Mundial y Android `.aab`

**Estado:** pendiente de inicio
**Depende de:** v0.7.0 (Fase 5 entregada)
**Objetivo:** convertir la mesa en un catálogo mundial jugable y publicar la app
Android firmada, manteniendo el 100 % offline, los límites de 200 líneas y la
calidad visual ya establecida.

## Punto de retorno

1. Leer `AGENTS.md`, esta nota, `docs/versiones/indice.md` y la nota
   `v0.7.0-fase5-portal-online.md`.
2. Ejecutar `pnpm install`, `pnpm lint`, `pnpm typecheck`, `pnpm build` y
   `pnpm test:coverage`.
3. Confirmar la línea base: **306 pruebas**, 95,87 % líneas, 82,71 % ramas,
   precache PWA de 3.826,45 KiB y paquete total de 3,76 MB bajo el límite de 10 MB.
4. Revisar `apps/client/src/play/`, `packages/core/src/games/`,
   `apps/client/vite.config.ts`, `apps/client/scripts/generate-brand-assets.mjs`
   y `docs/arquitectura.md`.
5. Continuar con el primer objetivo pendiente.

## Entregables de la Fase 6

### Catálogo y reglas

- [ ] Ampliar `packages/core/src/games/` a un catálogo mundial de 30 juegos con
      familias, variantes regionales, número de jugadores y modos.
- [ ] Cada juego entra con `IGameModule`, bots de tres niveles, vista por jugador,
      adaptador 2.5D, emblema procedural y prueba golden replay con semilla.
- [ ] Enciclopedia de reglas navegable, con glosario y claves de traducción.
- [ ] Emparejamiento de salas por juego y rotación de mesa sin salir del salón.

### Experiencia y accesibilidad

- [ ] Traducción completa de los 11 idiomas para todo el contenido jugable.
- [ ] Foco D-pad completo en Smart TV, regiones vivas, cartas descritas y
      contraste AAA en las 20 combinaciones festividad × apariencia.
- [ ] Reanudación de partida local desde el guardado firmado y migración de
      perfiles antiguos.
- [ ] Espectadores, reconexión de asientos y bots de reemplazo en salas online.
- [ ] TURN configurable por variable de entorno para redes móviles restrictivas.

### Android y monetización real

- [ ] Integrar `@capacitor-community/admob` con UMP/GDPR, banners,
      intersticiales con el límite de tres minutos ya probado y recompensados.
- [ ] Integrar Google Play Billing para la compra única VIP y restaurar compras.
- [ ] Generar el proyecto Android, iconos adaptativos Material You y splash.
- [ ] Compilar y firmar `mesa-viva-ultimate-v0.8.0.aab` sin guardar claves en el
      repositorio; documentar el keystore como secreto local.
- [ ] Publicar pista interna en Google Play y verificar `app-ads.txt`.

### Rendimiento y observabilidad

- [ ] Medir 60–120 FPS en móvil, tablet y TV; documentar el benchmark.
- [ ] Conectar Firebase Analytics/Crashlytics al `TelemetryService` cuando exista
      consentimiento; sin endpoint, la cola sigue 100 % local.
- [ ] Presupuesto de bundle por ruta y carga diferida de PixiJS, QR y PeerJS.
- [ ] Auditoría Lighthouse de accesibilidad, SEO y PWA.

## Criterios de aceptación

- `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test` y
  `pnpm test:coverage` en verde.
- Catálogo de 30 juegos con al menos una partida golden por juego.
- Ningún archivo supera 200 líneas; `core` sigue puro y determinista.
- La app Android instala, juega offline y muestra el consentimiento UMP.
- El `.aab` firmado se genera localmente y se publica como artefacto de CI sin
  exponer secretos.
- La PWA sigue cargando sin red y avisa de cada nueva versión.
- Nota `v0.8.0-fase6-catalogo-android.md`, índice actualizado y esta nota
  reescrita para la Fase 7.

## Alcance que NO entra en esta fase

- Apuestas, dinero real o canje de Fichas de Mesa.
- Servidores dedicados de juego: el anfitrión sigue siendo autoritativo.
- Voceo grabado con actores o música licenciada.
- Publicación pública en Google Play: solo pista interna y revisión.

## Riesgos conocidos

- WebRTC sin TURN falla en algunas redes 4G/5G; se añadirá configuración y
  prueba de caída a bots.
- La traducción completa exige revisar plurales y longitud en hindi, japonés y
  chino; se validará con las capturas de los seis formatos.
- AdMob y Billing no pueden probarse en CI sin cuenta; se usarán adaptadores
  falsos y pruebas de contrato.
- El `.aab` firmado requiere un keystore local; nunca se subirá al repositorio.
